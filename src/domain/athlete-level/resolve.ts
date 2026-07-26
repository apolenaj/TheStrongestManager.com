/**
 * Factor scoring + level resolution (Prompt 80).
 */

import {
  ATHLETE_LEVEL_FACTORS,
  LEVEL_LABELS,
  type AthleteLevelFactorId,
  type AthleteLevelId,
} from "@/domain/athlete-level/constants";

export type AthleteLevelEvidence = {
  /** Distinct calendar weeks with a completed session. */
  distinctTrainingWeeks: number;
  /** Completed training sessions (lifetime). */
  completedSessionCount: number;
  /** Academy lessons completed. */
  academyLessonsCompleted: number;
  /** Technique analyses with a real overall score. */
  scoredTechniqueCount: number;
  /** First→latest technique score delta (points). */
  techniqueScoreDelta: number;
  /** Days between first and latest completed session (0 if <2). */
  trainingHistorySpanDays: number;
  /** Logged PR events from training data (not app opens). */
  loggedPrCount: number;
  /**
   * Competitive evidence for Elite gate.
   * True only from competition prep completed or competition-verified lift — never logins.
   */
  hasCompetitiveEvidence: boolean;
  /**
   * Explicitly ignored — accepted only to prove we do not score it.
   * Callers may pass app-open days; resolveAthleteLevel must not use them.
   */
  appOpenDaysIgnored?: number;
};

export type FactorScore = {
  id: AthleteLevelFactorId;
  score: number; // 0–100
  detail: string;
};

export type AthleteLevelResult = {
  level: AthleteLevelId;
  label: string;
  composite: number;
  factors: FactorScore[];
  eliteEligible: boolean;
  eliteBlockedReason: string | null;
  summary: string;
};

function clamp100(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, Math.round(n));
}

export function scoreConsistency(evidence: AthleteLevelEvidence): FactorScore {
  // ~12 weeks ≈ 50, 24+ ≈ 100; sessions also contribute lightly
  const weekPart = (evidence.distinctTrainingWeeks / 24) * 70;
  const sessionPart = (evidence.completedSessionCount / 80) * 30;
  const score = clamp100(weekPart + sessionPart);
  return {
    id: "consistency",
    score,
    detail: `${evidence.distinctTrainingWeeks} training weeks · ${evidence.completedSessionCount} sessions`,
  };
}

export function scoreKnowledge(evidence: AthleteLevelEvidence): FactorScore {
  const score = clamp100((evidence.academyLessonsCompleted / 12) * 100);
  return {
    id: "knowledge",
    score,
    detail: `${evidence.academyLessonsCompleted} academy lessons`,
  };
}

export function scoreTechnique(evidence: AthleteLevelEvidence): FactorScore {
  const countPart = (evidence.scoredTechniqueCount / 10) * 55;
  const deltaPart = (Math.max(0, evidence.techniqueScoreDelta) / 15) * 45;
  const score = clamp100(countPart + deltaPart);
  return {
    id: "technique",
    score,
    detail: `${evidence.scoredTechniqueCount} scored analyses · Δ ${evidence.techniqueScoreDelta.toFixed(1)}`,
  };
}

export function scoreTrainingHistory(
  evidence: AthleteLevelEvidence,
): FactorScore {
  // ~180 days span + volume of sessions
  const spanPart = (evidence.trainingHistorySpanDays / 180) * 60;
  const volumePart = (evidence.completedSessionCount / 60) * 40;
  const score = clamp100(spanPart + volumePart);
  return {
    id: "training_history",
    score,
    detail: `${evidence.trainingHistorySpanDays} day span · ${evidence.completedSessionCount} sessions`,
  };
}

export function scoreProgress(evidence: AthleteLevelEvidence): FactorScore {
  const prPart = (evidence.loggedPrCount / 8) * 70;
  const techPart = (Math.max(0, evidence.techniqueScoreDelta) / 12) * 30;
  const score = clamp100(prPart + techPart);
  return {
    id: "progress",
    score,
    detail: `${evidence.loggedPrCount} logged PR event(s) · technique Δ ${evidence.techniqueScoreDelta.toFixed(1)}`,
  };
}

export function scoreAllFactors(
  evidence: AthleteLevelEvidence,
): FactorScore[] {
  return [
    scoreConsistency(evidence),
    scoreKnowledge(evidence),
    scoreTechnique(evidence),
    scoreTrainingHistory(evidence),
    scoreProgress(evidence),
  ];
}

export function compositeFromFactors(factors: FactorScore[]): number {
  if (factors.length === 0) return 0;
  const sum = factors.reduce((s, f) => s + f.score, 0);
  return Math.round(sum / factors.length);
}

/**
 * Elite requires competitive evidence + high multi-factor floors.
 * App usage signals are never sufficient.
 */
export function evaluateEliteEligibility(
  evidence: AthleteLevelEvidence,
  factors: FactorScore[],
  composite: number,
): { eligible: boolean; blockedReason: string | null } {
  void evidence.appOpenDaysIgnored; // deliberately unused

  if (!evidence.hasCompetitiveEvidence) {
    return {
      eligible: false,
      blockedReason:
        "Elite requires competitive evidence (completed competition prep or competition-verified lift) — not app usage.",
    };
  }
  if (composite < 80) {
    return {
      eligible: false,
      blockedReason: "Elite requires a composite score of at least 80.",
    };
  }
  const byId = Object.fromEntries(factors.map((f) => [f.id, f.score])) as Record<
    AthleteLevelFactorId,
    number
  >;
  for (const id of ATHLETE_LEVEL_FACTORS) {
    if ((byId[id] ?? 0) < 40) {
      return {
        eligible: false,
        blockedReason: `Elite requires balanced factors (each ≥ 40). ${id} is too low.`,
      };
    }
  }
  // Absolute strength is not a factor — already excluded by design.
  return { eligible: true, blockedReason: null };
}

/**
 * Map composite → level. Elite only when eligibility passes.
 * Competitive is high composite without requiring Elite evidence.
 */
export function levelFromComposite(
  composite: number,
  eliteEligible: boolean,
): AthleteLevelId {
  if (eliteEligible && composite >= 80) return "elite";
  if (composite >= 65) return "competitive";
  if (composite >= 45) return "advanced";
  if (composite >= 25) return "developing";
  return "foundation";
}

export function resolveAthleteLevel(
  evidence: AthleteLevelEvidence,
): AthleteLevelResult {
  const factors = scoreAllFactors(evidence);
  const composite = compositeFromFactors(factors);
  const elite = evaluateEliteEligibility(evidence, factors, composite);
  const level = levelFromComposite(composite, elite.eligible);

  return {
    level,
    label: LEVEL_LABELS[level],
    composite,
    factors,
    eliteEligible: elite.eligible,
    eliteBlockedReason: elite.blockedReason,
    summary:
      level === "elite"
        ? "Elite: high multi-factor profile plus competitive evidence."
        : elite.blockedReason && composite >= 80
          ? `${LEVEL_LABELS[level]} (composite ${composite}). Elite blocked: ${elite.blockedReason}`
          : `${LEVEL_LABELS[level]} — composite ${composite}/100 across five factors (not absolute strength alone).`,
  };
}
