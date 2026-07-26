import {
  BW_TREND_FLAT_KG_PER_WEEK,
  PERFORMANCE_INTELLIGENCE_ENGINE_VERSION,
} from "@/domain/performance-intelligence/constants";
import type {
  AthleteState,
  BodyweightTrendValue,
  DataConfidenceValue,
  DataFreshnessValue,
  FatigueTrendValue,
  GoalProgressValue,
  IntelligenceSource,
  PerformanceTrendValue,
  ProgramProgressValue,
  RecoveryStatusValue,
  StateField,
  TechniqueTrendValue,
  TrainingConsistencyValue,
  TrendDirection,
} from "@/domain/performance-intelligence/types";
import {
  classifyPerformanceTrend,
  estimateBodyweightTrendKgPerWeek,
  meanDelta,
  volumeTrendPct,
} from "@/domain/insights/signals";
import {
  displayableScore,
  minConfidence,
} from "@/domain/scoring/confidence";
import type { AthleteScoreSet } from "@/domain/scoring/compute";
import type { ConfidenceLevel, ScoreResult } from "@/domain/scoring/types";
import type { StrengthTrend } from "@/domain/scoring/strength";
import type { LoadSpikeAssessment } from "@/domain/training-load/compute";
import {
  bandToLegacyFreshnessLabel,
  buildFreshnessSnapshot,
} from "@/domain/data-freshness";

export type IntelligenceParts = {
  athleteProfileId: string;
  now: Date;
  scores: AthleteScoreSet;
  strengthTrend: StrengthTrend | null;
  techniqueSamples: { overallScore: number; recordedAt: Date }[];
  bodyweightPoints: { at: Date; kg: number }[];
  recoveryReadiness: { at: Date; readiness: number }[];
  recentVolumeKg: number;
  priorVolumeKg: number;
  loadSpike: LoadSpikeAssessment | null;
  goal: { title: string; category: string; targetValue: number | null } | null;
  activeProgramName: string | null;
  nutrition: {
    connected: boolean;
    hasTargets: boolean;
  };
  /** Timestamps of newest signals by kind for freshness. */
  signalTimestamps: { kind: string; at: Date }[];
};

function field<T>(args: {
  value: T | null;
  source: IntelligenceSource;
  confidence: ConfidenceLevel;
  lastUpdated: Date | null;
  missingDependencies: string[];
  summary: string;
}): StateField<T> {
  return {
    value: args.value,
    source: args.source,
    confidence: args.confidence,
    lastUpdated: args.lastUpdated,
    missingDependencies: args.missingDependencies,
    summary: args.summary,
  } as StateField<T>;
}

function scoreToSource(result: ScoreResult): IntelligenceSource {
  if (result.score == null || result.confidence === "none") {
    return "insufficient";
  }
  const raw = result.inputs.find((i) => i.source)?.source;
  if (raw === "observed" || raw === "heuristic" || raw === "reported" || raw === "recommended") {
    return raw;
  }
  return result.confidence === "low" ? "insufficient" : "heuristic";
}

function buildPerformanceTrend(
  parts: IntelligenceParts,
): StateField<PerformanceTrendValue> {
  const strength = parts.scores.strength;
  const display = displayableScore(strength);
  const trend = parts.strengthTrend;
  const direction: TrendDirection = trend?.direction ?? "unknown";
  const missing = [...strength.missingInputs];
  if (!trend) {
    missing.push("Recent vs prior lift efforts for strength trend windows");
  }

  if (display == null && !trend) {
    return field<PerformanceTrendValue>({
      value: null,
      source: "insufficient",
      confidence: "none",
      lastUpdated: strength.timestamp,
      missingDependencies: missing,
      summary:
        "Performance trend unavailable — need logged lifts across recent windows.",
    });
  }

  return field({
    value: {
      direction,
      strengthScore: display,
      percentChange: trend?.percentChange ?? null,
    },
    source: trend?.includesEstimates ? "heuristic" : scoreToSource(strength),
    confidence: trend ? (trend.includesEstimates ? "medium" : strength.confidence) : strength.confidence,
    lastUpdated: strength.timestamp,
    missingDependencies: missing,
    summary: trend
      ? trend.explanation
      : strength.explanation,
  });
}

function buildFatigueTrend(
  parts: IntelligenceParts,
): StateField<FatigueTrendValue> {
  const volPct = volumeTrendPct(parts.recentVolumeKg, parts.priorVolumeKg);
  const mid = Math.floor(parts.recoveryReadiness.length / 2);
  const readinessSorted = [...parts.recoveryReadiness].sort(
    (a, b) => a.at.getTime() - b.at.getTime(),
  );
  const priorReadiness = readinessSorted
    .slice(0, mid)
    .map((r) => r.readiness);
  const recentReadiness = readinessSorted.slice(mid).map((r) => r.readiness);
  const readinessDelta = meanDelta(recentReadiness, priorReadiness);
  const spike = parts.loadSpike?.flagged === true;

  const missing: string[] = [];
  if (parts.priorVolumeKg <= 0) {
    missing.push("Prior-window completed sets with load×reps for volume baseline");
  }
  if (parts.recentVolumeKg <= 0) {
    missing.push("Recent-window completed sets with load×reps");
  }
  if (readinessDelta == null) {
    missing.push("Multiple recovery readiness check-ins across lookback");
  }

  if (volPct == null && readinessDelta == null && !spike) {
    return field<FatigueTrendValue>({
      value: null,
      source: "insufficient",
      confidence: "none",
      lastUpdated: readinessSorted.at(-1)?.at ?? null,
      missingDependencies: missing,
      summary:
        "Fatigue trend unavailable — need logged volume and/or readiness history. Not a medical fatigue score.",
    });
  }

  let direction: TrendDirection = "unknown";
  if (spike || (volPct != null && volPct >= 20 && (readinessDelta == null || readinessDelta < 0))) {
    direction = "up";
  } else if (volPct != null && volPct <= -15 && readinessDelta != null && readinessDelta > 0) {
    direction = "down";
  } else if (volPct != null || readinessDelta != null) {
    direction = classifyPerformanceTrend(
      parts.recentVolumeKg || null,
      parts.priorVolumeKg || null,
    );
    if (direction === "up" && readinessDelta != null && readinessDelta > 2) {
      direction = "flat";
    }
  }

  const confidence: ConfidenceLevel =
    volPct != null && readinessDelta != null
      ? "medium"
      : volPct != null || readinessDelta != null
        ? "low"
        : "none";

  return field({
    value: {
      direction,
      loadSpikeFlagged: spike,
      volumeTrendPct: volPct,
      readinessDelta,
    },
    source: confidence === "none" ? "insufficient" : "heuristic",
    confidence,
    lastUpdated:
      readinessSorted.at(-1)?.at ??
      (parts.loadSpike ? parts.now : null),
    missingDependencies: missing,
    summary: spike
      ? (parts.loadSpike?.explanation ??
        "Estimated volume spike vs baseline — review recovery; not an injury prediction.")
      : "Load/recovery pressure heuristic from estimated volume and readiness — not a medical fatigue diagnosis.",
  });
}

function buildTechniqueTrend(
  parts: IntelligenceParts,
): StateField<TechniqueTrendValue> {
  const tech = parts.scores.technique;
  const display = displayableScore(tech);
  const samples = [...parts.techniqueSamples].sort(
    (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime(),
  );
  const missing = [...tech.missingInputs];

  if (samples.length < 2) {
    missing.push("≥2 completed technique analyses for a direction");
  }

  let direction: TrendDirection = "unknown";
  if (samples.length >= 2) {
    const mid = Math.floor(samples.length / 2);
    const prior = samples.slice(0, mid).map((s) => s.overallScore);
    const recent = samples.slice(mid).map((s) => s.overallScore);
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    direction = classifyPerformanceTrend(avg(recent), avg(prior));
  }

  if (display == null && samples.length === 0) {
    return field<TechniqueTrendValue>({
      value: null,
      source: "insufficient",
      confidence: "none",
      lastUpdated: null,
      missingDependencies: missing,
      summary: "Technique trend unavailable — no completed analyses yet.",
    });
  }

  return field({
    value: {
      direction,
      techniqueScore: display,
      sampleCount: samples.length,
      latestScore: samples.at(-1)?.overallScore ?? null,
    },
    source: scoreToSource(tech),
    confidence: samples.length >= 2 ? tech.confidence : "low",
    lastUpdated: samples.at(-1)?.recordedAt ?? tech.timestamp,
    missingDependencies: missing,
    summary: tech.explanation,
  });
}

function buildBodyweightTrend(
  parts: IntelligenceParts,
): StateField<BodyweightTrendValue> {
  const points = parts.bodyweightPoints;
  const kgPerWeek = estimateBodyweightTrendKgPerWeek(points);
  const latest = points.length
    ? [...points].sort((a, b) => a.at.getTime() - b.at.getTime()).at(-1)!
    : null;

  const missing: string[] = [];
  if (points.length < 3) {
    missing.push("≥3 bodyweight logs spanning ≥7 days");
  }

  if (kgPerWeek == null) {
    return field({
      value: latest
        ? {
            direction: "unknown" as TrendDirection,
            kgPerWeek: null,
            latestKg: latest.kg,
          }
        : null,
      source: latest ? "reported" : "insufficient",
      confidence: latest ? "low" : "none",
      lastUpdated: latest?.at ?? null,
      missingDependencies: missing,
      summary: latest
        ? "Latest bodyweight on file — trend slope needs more spaced samples."
        : "Bodyweight trend unavailable — no bodyweight logs.",
    });
  }

  let direction: TrendDirection = "flat";
  if (kgPerWeek <= -BW_TREND_FLAT_KG_PER_WEEK) direction = "down";
  else if (kgPerWeek >= BW_TREND_FLAT_KG_PER_WEEK) direction = "up";

  return field({
    value: {
      direction,
      kgPerWeek,
      latestKg: latest?.kg ?? null,
    },
    source: "reported",
    confidence: points.length >= 5 ? "medium" : "low",
    lastUpdated: latest?.at ?? null,
    missingDependencies: missing,
    summary: `Bodyweight slope ≈ ${kgPerWeek} kg/week from logged samples (reported).`,
  });
}

function buildConsistency(
  parts: IntelligenceParts,
): StateField<TrainingConsistencyValue> {
  const result = parts.scores.consistency;
  const display = displayableScore(result);
  const completed = Number(
    result.inputs.find((i) => i.key === "completedSessions")?.value ?? 0,
  );
  const resolved = Number(
    result.inputs.find((i) => i.key === "resolvedSessions")?.value ?? 0,
  );

  if (display == null) {
    return field<TrainingConsistencyValue>({
      value: null,
      source: "insufficient",
      confidence: result.confidence,
      lastUpdated: result.timestamp,
      missingDependencies: result.missingInputs,
      summary: result.explanation,
    });
  }

  return field({
    value: {
      score: display,
      completedInWindow: completed,
      resolvedInWindow: resolved,
    },
    source: "observed",
    confidence: result.confidence,
    lastUpdated: result.timestamp,
    missingDependencies: result.missingInputs,
    summary: result.explanation,
  });
}

function buildProgramProgress(
  parts: IntelligenceParts,
): StateField<ProgramProgressValue> {
  const result = parts.scores.programming;
  const display = displayableScore(result);
  const hasActive = Boolean(parts.activeProgramName || result.inputs[0]?.value);

  if (!hasActive) {
    return field({
      value: {
        score: null,
        activeProgramName: null,
        hasActiveProgram: false,
      },
      source: "insufficient",
      confidence: "none",
      lastUpdated: result.timestamp,
      missingDependencies: ["Active program assigned"],
      summary: "No active program — program progress not computed.",
    });
  }

  return field({
    value: {
      score: display,
      activeProgramName: parts.activeProgramName,
      hasActiveProgram: true,
    },
    source: display != null ? "observed" : "insufficient",
    confidence: result.confidence,
    lastUpdated: result.timestamp,
    missingDependencies: result.missingInputs,
    summary: result.explanation,
  });
}

function buildRecoveryStatus(
  parts: IntelligenceParts,
): StateField<RecoveryStatusValue> {
  const result = parts.scores.recovery;
  const display = displayableScore(result);
  const latest = [...parts.recoveryReadiness].sort(
    (a, b) => a.at.getTime() - b.at.getTime(),
  ).at(-1);

  let statusLabel: RecoveryStatusValue["statusLabel"] = "insufficient";
  if (display != null) {
    if (display >= 70) statusLabel = "high";
    else if (display >= 50) statusLabel = "moderate";
    else statusLabel = "low";
  }

  return field({
    value:
      display == null && !latest
        ? null
        : {
            score: display,
            latestReadiness: latest?.readiness ?? null,
            statusLabel,
          },
    source: display != null ? scoreToSource(result) : latest ? "reported" : "insufficient",
    confidence: result.confidence,
    lastUpdated: latest?.at ?? result.timestamp,
    missingDependencies: result.missingInputs,
    summary:
      result.explanation +
      " Recovery status is athlete-signal based — not medical accuracy.",
  });
}

function buildGoalProgress(
  parts: IntelligenceParts,
): StateField<GoalProgressValue> {
  if (!parts.goal) {
    return field({
      value: {
        goalTitle: null,
        goalCategory: null,
        statusLabel: "no_goal",
      },
      source: "insufficient",
      confidence: "none",
      lastUpdated: null,
      missingDependencies: ["Active goal on athlete profile"],
      summary: "No active goal on file.",
    });
  }

  const trend = parts.strengthTrend?.direction;
  let statusLabel: GoalProgressValue["statusLabel"] = "on_file";
  const missing: string[] = [];

  if (parts.goal.targetValue == null) {
    missing.push("Numeric goal target (optional) for measured progress");
  }

  if (trend == null) {
    statusLabel = "insufficient_signals";
    missing.push("Strength trend signals to relate to goal");
  } else if (trend === "up" || trend === "flat") {
    statusLabel = "aligned_with_strength_trend";
  } else if (trend === "down") {
    statusLabel = "needs_attention";
  }

  return field({
    value: {
      goalTitle: parts.goal.title,
      goalCategory: parts.goal.category,
      statusLabel,
    },
    source: "reported",
    confidence: trend ? "low" : "none",
    lastUpdated: parts.now,
    missingDependencies: missing,
    summary:
      statusLabel === "aligned_with_strength_trend"
        ? `Goal “${parts.goal.title}” on file; recent strength trend is not declining.`
        : statusLabel === "needs_attention"
          ? `Goal “${parts.goal.title}” on file; recent strength trend is down — review training/recovery.`
          : `Goal “${parts.goal.title}” on file. Progress % is not invented without a measurable target.`,
  });
}

function buildDataConfidence(
  fields: StateField<unknown>[],
  now: Date,
): StateField<DataConfidenceValue> {
  const withSignal = fields.filter(
    (f) => f.value != null && f.source !== "insufficient",
  );
  const levels = withSignal.map((f) => f.confidence);
  const overall = levels.length ? minConfidence(levels) : ("none" as ConfidenceLevel);

  return field({
    value: {
      overall,
      fieldCountWithSignal: withSignal.length,
      fieldCountTotal: fields.length,
    },
    source: overall === "none" ? "insufficient" : "heuristic",
    confidence: overall,
    lastUpdated: now,
    missingDependencies:
      withSignal.length < fields.length
        ? ["More logged training, recovery, or technique signals"]
        : [],
    summary: `Data confidence ${overall} across ${withSignal.length}/${fields.length} intelligence fields with signals.`,
  });
}

function buildDataFreshness(
  parts: IntelligenceParts,
): StateField<DataFreshnessValue> {
  const snapshot = buildFreshnessSnapshot(parts.signalTimestamps, parts.now);
  const pillarValue = (p: (typeof snapshot.pillars)["technique"]) => ({
    band: p.band,
    relativeLabel: p.relativeLabel,
    displayLine: p.displayLine,
    lastAt: p.lastAt,
    ageDays: p.ageDays,
  });

  if (parts.signalTimestamps.length === 0) {
    return field({
      value: {
        newestSignalAgeHours: null,
        freshnessLabel: "unknown",
        newestSignalAt: null,
        newestSignalKind: null,
        pillars: {
          technique: pillarValue(snapshot.pillars.technique),
          recovery: pillarValue(snapshot.pillars.recovery),
          strength: pillarValue(snapshot.pillars.strength),
        },
        displayLines: snapshot.displayLines,
      },
      source: "insufficient",
      confidence: "none",
      lastUpdated: null,
      missingDependencies: [
        "Any training session, recovery check-in, technique analysis, or bodyweight log",
      ],
      summary: snapshot.displayLines.join(" "),
    });
  }

  const newest = [...parts.signalTimestamps].sort(
    (a, b) => b.at.getTime() - a.at.getTime(),
  )[0]!;
  const ageHours =
    (parts.now.getTime() - newest.at.getTime()) / (1000 * 60 * 60);
  const freshnessLabel = bandToLegacyFreshnessLabel(snapshot.overall.band);

  return field({
    value: {
      newestSignalAgeHours: Math.round(ageHours * 10) / 10,
      freshnessLabel,
      newestSignalAt: newest.at,
      newestSignalKind: newest.kind,
      pillars: {
        technique: pillarValue(snapshot.pillars.technique),
        recovery: pillarValue(snapshot.pillars.recovery),
        strength: pillarValue(snapshot.pillars.strength),
      },
      displayLines: snapshot.displayLines,
    },
    source: "observed",
    confidence: "high",
    lastUpdated: newest.at,
    missingDependencies: [],
    summary: snapshot.displayLines.join(" "),
  });
}

function buildNutrition(
  parts: IntelligenceParts,
): AthleteState["nutritionAvailability"] {
  const { connected, hasTargets } = parts.nutrition;
  if (!connected) {
    return field({
      value: {
        connected: false,
        hasTargets: false,
        label: "Nutrition sync not connected — macros not invented.",
      },
      source: "insufficient",
      confidence: "none",
      lastUpdated: null,
      missingDependencies: ["Mealnexio (or nutrition) connection when API is live"],
      summary: "Nutrition data unavailable until a real sync adapter connects.",
    });
  }

  return field({
    value: {
      connected: true,
      hasTargets,
      label: hasTargets
        ? "Nutrition connected with targets on file."
        : "Nutrition connected — targets still empty.",
    },
    source: "observed",
    confidence: hasTargets ? "medium" : "low",
    lastUpdated: parts.now,
    missingDependencies: hasTargets ? [] : ["Synced nutrition targets"],
    summary: hasTargets
      ? "Nutrition connection observed with targets."
      : "Nutrition connection observed without targets yet.",
  });
}

/**
 * Pure assembly of AthleteState from pre-gathered parts.
 * UI and route handlers must not call this with ad-hoc client math —
 * use PerformanceIntelligenceService.getAthleteState.
 */
export function assembleAthleteState(parts: IntelligenceParts): AthleteState {
  const performanceTrend = buildPerformanceTrend(parts);
  const fatigueTrend = buildFatigueTrend(parts);
  const techniqueTrend = buildTechniqueTrend(parts);
  const bodyweightTrend = buildBodyweightTrend(parts);
  const trainingConsistency = buildConsistency(parts);
  const programProgress = buildProgramProgress(parts);
  const recoveryStatus = buildRecoveryStatus(parts);
  const goalProgress = buildGoalProgress(parts);
  const nutritionAvailability = buildNutrition(parts);

  const pillarFields: StateField<unknown>[] = [
    performanceTrend,
    fatigueTrend,
    techniqueTrend,
    bodyweightTrend,
    trainingConsistency,
    programProgress,
    recoveryStatus,
    goalProgress,
  ];

  const dataConfidence = buildDataConfidence(pillarFields, parts.now);
  const dataFreshness = buildDataFreshness(parts);

  return {
    athleteProfileId: parts.athleteProfileId,
    computedAt: parts.now,
    engineVersion: PERFORMANCE_INTELLIGENCE_ENGINE_VERSION,
    performanceTrend,
    fatigueTrend,
    techniqueTrend,
    bodyweightTrend,
    trainingConsistency,
    programProgress,
    recoveryStatus,
    goalProgress,
    dataConfidence,
    dataFreshness,
    nutritionAvailability,
  };
}
