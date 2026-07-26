import {
  CHECKIN_SCALE_MAX,
  CHECKIN_SCALE_MIN,
  ISSUE_FATIGUE_HIGH,
  ISSUE_MOTIVATION_LOW,
  ISSUE_SLEEP_HOURS_LOW,
  ISSUE_SORENESS_HIGH,
  ISSUE_STRESS_HIGH,
  RECOVERY_ENGINE_VERSION,
} from "@/domain/recovery/constants";

export type RecoveryCheckInInput = {
  sleepHours: number | null;
  sleepQuality: number | null;
  stress: number | null;
  soreness: number | null;
  motivation: number | null;
  fatigue: number | null;
};

export type ReadinessComponent = {
  key: string;
  label: string;
  /** Contribution on 0–100 after polarity. */
  score: number;
  weight: number;
};

export type RecoveryReadinessEstimate = {
  /** 0–100 estimate, or null when no usable inputs. */
  score: number | null;
  confidence: "low" | "medium" | "high" | "none";
  components: ReadinessComponent[];
  /** Keys included — for persistence / audit. */
  inputKeys: string[];
  sleepIncluded: boolean;
  engineVersion: typeof RECOVERY_ENGINE_VERSION;
  explanation: string;
};

export type PotentialIssue = {
  id: string;
  severity: "info" | "watch";
  title: string;
  detail: string;
};

function clampScale(value: number): number {
  return Math.min(CHECKIN_SCALE_MAX, Math.max(CHECKIN_SCALE_MIN, value));
}

/** Map 1–10 “higher is better” to 0–100. */
function positiveScaleTo100(value: number): number {
  return ((clampScale(value) - 1) / 9) * 100;
}

/** Map 1–10 “higher is worse” to 0–100 readiness contribution. */
function negativeScaleTo100(value: number): number {
  return ((CHECKIN_SCALE_MAX - clampScale(value)) / 9) * 100;
}

/**
 * Sleep hours → rough readiness contribution.
 * Returns null when sleepHours is null (do not fabricate).
 */
export function sleepHoursToScore(sleepHours: number | null): number | null {
  if (sleepHours == null || !Number.isFinite(sleepHours) || sleepHours < 0) {
    return null;
  }
  // Peak around 7.5–8.5h; taper outside — heuristic only.
  if (sleepHours >= 7 && sleepHours <= 9) return 100;
  if (sleepHours >= 6 && sleepHours < 7) return 70;
  if (sleepHours > 9 && sleepHours <= 10) return 80;
  if (sleepHours >= 5 && sleepHours < 6) return 45;
  if (sleepHours > 10) return 60;
  return 25;
}

/**
 * Estimate Recovery Readiness from optional check-in fields.
 * Missing sleep (or any field) is omitted — never invented.
 */
export function estimateRecoveryReadiness(
  input: RecoveryCheckInInput,
): RecoveryReadinessEstimate {
  const components: ReadinessComponent[] = [];

  const sleepScore = sleepHoursToScore(input.sleepHours);
  if (sleepScore != null) {
    components.push({
      key: "sleepHours",
      label: "Sleep duration",
      score: sleepScore,
      weight: 1.2,
    });
  }

  if (input.sleepQuality != null) {
    components.push({
      key: "sleepQuality",
      label: "Sleep quality",
      score: positiveScaleTo100(input.sleepQuality),
      weight: 1.1,
    });
  }

  if (input.stress != null) {
    components.push({
      key: "stress",
      label: "Stress",
      score: negativeScaleTo100(input.stress),
      weight: 1,
    });
  }

  if (input.soreness != null) {
    components.push({
      key: "soreness",
      label: "Soreness",
      score: negativeScaleTo100(input.soreness),
      weight: 1,
    });
  }

  if (input.motivation != null) {
    components.push({
      key: "motivation",
      label: "Motivation",
      score: positiveScaleTo100(input.motivation),
      weight: 0.8,
    });
  }

  if (input.fatigue != null) {
    components.push({
      key: "fatigue",
      label: "Fatigue",
      score: negativeScaleTo100(input.fatigue),
      weight: 1.1,
    });
  }

  if (components.length === 0) {
    return {
      score: null,
      confidence: "none",
      components: [],
      inputKeys: [],
      sleepIncluded: false,
      engineVersion: RECOVERY_ENGINE_VERSION,
      explanation:
        "No check-in signals provided — Recovery Readiness cannot be estimated.",
    };
  }

  const weightSum = components.reduce((s, c) => s + c.weight, 0);
  const score =
    Math.round(
      (components.reduce((s, c) => s + c.score * c.weight, 0) / weightSum) * 10,
    ) / 10;

  const sleepIncluded = components.some(
    (c) => c.key === "sleepHours" || c.key === "sleepQuality",
  );

  let confidence: RecoveryReadinessEstimate["confidence"] = "low";
  if (components.length >= 5 && sleepIncluded) confidence = "high";
  else if (components.length >= 3) confidence = "medium";
  else confidence = "low";

  const missingSleep =
    input.sleepHours == null && input.sleepQuality == null
      ? " Sleep was not logged, so it is excluded from this estimate."
      : "";

  return {
    score,
    confidence,
    components,
    inputKeys: components.map((c) => c.key),
    sleepIncluded,
    engineVersion: RECOVERY_ENGINE_VERSION,
    explanation: `Recovery Readiness estimate ${score}/100 from ${components.length} logged signal(s) (${confidence} confidence). Not medical accuracy.${missingSleep}`,
  };
}

export function detectPotentialIssues(
  input: RecoveryCheckInInput & { readinessScore: number | null },
): PotentialIssue[] {
  const issues: PotentialIssue[] = [];

  if (input.sleepHours != null && input.sleepHours < ISSUE_SLEEP_HOURS_LOW) {
    issues.push({
      id: "sleep_short",
      severity: "watch",
      title: "Short reported sleep",
      detail: `You logged ${input.sleepHours}h sleep. This is a self-report flag — not a sleep disorder diagnosis.`,
    });
  }

  if (input.sleepHours == null && input.sleepQuality == null) {
    issues.push({
      id: "sleep_missing",
      severity: "info",
      title: "Sleep not logged",
      detail:
        "Sleep fields were skipped. The readiness estimate excludes sleep rather than inventing values.",
    });
  }

  if (input.stress != null && input.stress >= ISSUE_STRESS_HIGH) {
    issues.push({
      id: "stress_high",
      severity: "watch",
      title: "High reported stress",
      detail:
        "Stress is elevated on your check-in. Consider easier training if you also feel run down — not medical advice.",
    });
  }

  if (input.soreness != null && input.soreness >= ISSUE_SORENESS_HIGH) {
    issues.push({
      id: "soreness_high",
      severity: "watch",
      title: "High reported soreness",
      detail:
        "Soreness is high. Persistent pain or injury symptoms need a qualified clinician — this app does not diagnose.",
    });
  }

  if (input.fatigue != null && input.fatigue >= ISSUE_FATIGUE_HIGH) {
    issues.push({
      id: "fatigue_high",
      severity: "watch",
      title: "High reported fatigue",
      detail:
        "Subjective fatigue is high. This is an athlete signal, not an overtraining diagnosis.",
    });
  }

  if (input.motivation != null && input.motivation <= ISSUE_MOTIVATION_LOW) {
    issues.push({
      id: "motivation_low",
      severity: "info",
      title: "Low reported motivation",
      detail:
        "Motivation is low today. Useful context for training choices — not a clinical mood assessment.",
    });
  }

  if (input.readinessScore != null && input.readinessScore < 40) {
    issues.push({
      id: "readiness_low",
      severity: "watch",
      title: "Low Recovery Readiness estimate",
      detail:
        "Your estimate is low based on logged signals. Treat it as a prompt to review load and sleep — not medical clearance language.",
    });
  }

  return issues;
}

export type TrainingRelationshipNote = {
  title: string;
  detail: string;
};

/**
 * Honest relationship notes between recent training volume and readiness.
 * Heuristic only — no causal medical claims.
 */
export function describeTrainingRelationship(input: {
  readinessScore: number | null;
  recentVolumeKg: number | null;
  priorVolumeKg: number | null;
  hardSetsRecent: number | null;
}): TrainingRelationshipNote {
  if (input.readinessScore == null) {
    return {
      title: "Training relationship",
      detail:
        "Log a check-in to compare Recovery Readiness with recent estimated training load.",
    };
  }

  if (input.recentVolumeKg == null || input.recentVolumeKg === 0) {
    return {
      title: "Training relationship",
      detail: `Readiness estimate is ${input.readinessScore}/100. No recent training volume is logged to compare.`,
    };
  }

  const volumeUp =
    input.priorVolumeKg != null &&
    input.priorVolumeKg > 0 &&
    input.recentVolumeKg > input.priorVolumeKg * 1.35;

  if (volumeUp && input.readinessScore < 50) {
    return {
      title: "Training relationship",
      detail: `Estimated training volume rose recently while Recovery Readiness is ${input.readinessScore}/100. This may warrant easier sessions — it is a pattern note, not proof of overreaching.`,
    };
  }

  if (
    input.hardSetsRecent != null &&
    input.hardSetsRecent >= 8 &&
    input.readinessScore < 55
  ) {
    return {
      title: "Training relationship",
      detail: `Several hard sets were logged recently and readiness is ${input.readinessScore}/100. Watch how you feel under load — not a fatigue diagnosis.`,
    };
  }

  if (input.readinessScore >= 70) {
    return {
      title: "Training relationship",
      detail: `Readiness estimate ${input.readinessScore}/100 alongside recent training volume. Signals look manageable on paper — still listen to how sessions feel.`,
    };
  }

  return {
    title: "Training relationship",
    detail: `Readiness estimate ${input.readinessScore}/100 with recent estimated volume logged. Use both as context for today’s plan — not medical accuracy.`,
  };
}
