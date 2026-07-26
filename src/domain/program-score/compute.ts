import type {
  ProgramReviewAthleteContext,
  ProgramStructureSignals,
} from "@/domain/program-review/types";
import {
  FATIGUE_DENSE_SETS,
  PROGRAM_SCORE_ASSUMPTIONS,
  PROGRAM_SCORE_FORMULA_DESCRIPTION,
  PROGRAM_SCORE_FORMULA_ID,
  PROGRAM_SCORE_FORMULA_VERSION,
  PROGRAM_SCORE_MIN_COMPONENTS_FOR_HIGH,
  PROGRAM_SCORE_MIN_COMPONENTS_FOR_MEDIUM,
  PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE,
  PROGRAM_SCORE_MINIMUM_DATA,
  PROGRAM_SCORE_WEIGHTS,
  RECOVERY_HIGH_RPE,
  RECOVERY_HIGH_SETS,
  VOLUME_SETS_ADVANCED_MAX,
  VOLUME_SETS_BEGINNER_MAX,
  VOLUME_SETS_INTERMEDIATE_MAX,
  VOLUME_SETS_LIGHT_MIN,
  type ProgramScoreComponentId,
} from "@/domain/program-score/thresholds";
import {
  clampScore,
  componentLabel,
  nominalWeight,
  type ProgramScoreComponent,
  type ProgramScoreResult,
} from "@/domain/program-score/types";
import type { ConfidenceLevel } from "@/domain/scoring/types";

function unavailable(
  id: ProgramScoreComponentId,
  reason: string,
): ProgramScoreComponent {
  return {
    id,
    label: componentLabel(id),
    score: null,
    weight: nominalWeight(id),
    effectiveWeight: 0,
    status: "unavailable",
    unavailableReason: reason,
    confidence: "none",
    evidence: reason,
  };
}

function observed(
  id: ProgramScoreComponentId,
  score: number,
  evidence: string,
  confidence: ConfidenceLevel = "medium",
): ProgramScoreComponent {
  return {
    id,
    label: componentLabel(id),
    score: clampScore(score),
    weight: nominalWeight(id),
    effectiveWeight: 0,
    status: "observed",
    confidence,
    evidence,
  };
}

function hasLiftPattern(
  signals: ProgramStructureSignals,
  test: (name: string, pattern: string) => boolean,
): boolean {
  return signals.exerciseLines.some((e) =>
    test(e.name.toLowerCase(), e.movementPattern.toLowerCase()),
  );
}

function scoreGoalAlignment(
  signals: ProgramStructureSignals,
  context: ProgramReviewAthleteContext,
): ProgramScoreComponent {
  if (!context.goalTitle) {
    return unavailable(
      "goal_alignment",
      "No primary goal on profile — goal alignment cannot be scored.",
    );
  }
  if (signals.exerciseLines.length === 0) {
    return unavailable(
      "goal_alignment",
      "No exercises on the program — cannot judge alignment to the goal.",
    );
  }

  const goal = context.goalTitle.toLowerCase();
  const discipline = (
    context.primaryDiscipline ??
    context.goalCategory ??
    ""
  ).toLowerCase();
  const powerlifting =
    discipline.includes("powerlift") ||
    /deadlift|squat|bench|total/.test(goal);

  let score = 72;
  const notes: string[] = [`Goal “${context.goalTitle}” on file.`];

  if (powerlifting) {
    const squat = hasLiftPattern(
      signals,
      (n, p) => n.includes("squat") || p === "squat",
    );
    const bench = hasLiftPattern(
      signals,
      (n, p) => n.includes("bench") || p === "push",
    );
    const dl = hasLiftPattern(
      signals,
      (n, p) => n.includes("deadlift") || p === "hinge",
    );
    const hits = [squat, bench, dl].filter(Boolean).length;
    score = 40 + hits * 20;
    notes.push(`Competition-pattern coverage ${hits}/3 (squat/push/hinge).`);
  } else if (signals.trainingDaysPerWeek > 0) {
    score = 75;
    notes.push(
      `${signals.trainingDaysPerWeek} training day(s)/week with exercises present.`,
    );
  }

  if (
    context.daysPerWeek != null &&
    signals.trainingDaysPerWeek > context.daysPerWeek + 1
  ) {
    score -= 18;
    notes.push(
      `Schedule mismatch: program ~${signals.trainingDaysPerWeek}d vs available ${context.daysPerWeek}d.`,
    );
  }

  return observed("goal_alignment", score, notes.join(" "), "medium");
}

function scoreSpecificity(
  signals: ProgramStructureSignals,
  context: ProgramReviewAthleteContext,
): ProgramScoreComponent {
  if (signals.exerciseLines.length === 0) {
    return unavailable(
      "specificity",
      "No exercise lines — specificity cannot be scored.",
    );
  }

  const compounds = signals.exerciseLines.filter((e) =>
    ["squat", "hinge", "push", "pull", "olympic"].includes(e.movementPattern),
  ).length;
  const ratio = compounds / signals.exerciseLines.length;
  let score = clampScore(40 + ratio * 60);
  const notes = [
    `${compounds}/${signals.exerciseLines.length} lines use primary compound patterns (${Math.round(ratio * 100)}%).`,
  ];

  if (
    context.primaryDiscipline === "powerlifting" ||
    /powerlift/.test(context.goalCategory ?? "")
  ) {
    const hasMain = ["squat", "hinge", "push"].every((p) =>
      signals.exerciseLines.some((e) => e.movementPattern === p),
    );
    if (hasMain) {
      score = Math.max(score, 88);
      notes.push("Squat, hinge, and push patterns all present.");
    } else {
      score = Math.min(score, 62);
      notes.push("Powerlifting context missing at least one main pattern.");
    }
  }

  return observed("specificity", score, notes.join(" "), "medium");
}

function scoreProgression(
  signals: ProgramStructureSignals,
): ProgramScoreComponent {
  const hasRules = signals.progressionRuleKinds.length > 0;
  const hasIntensity =
    signals.hasRpePrescription ||
    signals.hasPercentPrescription ||
    signals.hasLoadPrescription;

  if (!hasRules && !hasIntensity) {
    return unavailable(
      "progression",
      "No progression rules and no RPE/%/load anchors — progression cannot be scored.",
    );
  }

  if (hasRules) {
    return observed(
      "progression",
      90,
      `Progression rules on file: ${[...new Set(signals.progressionRuleKinds)].join(", ")}.`,
      "high",
    );
  }

  return observed(
    "progression",
    58,
    "Intensity anchors exist (RPE/%/load) but no explicit progression rules — progression is implied, not encoded.",
    "low",
  );
}

function volumeCapForContext(
  context: ProgramReviewAthleteContext,
): number {
  if (context.experienceLevel === "beginner") return VOLUME_SETS_BEGINNER_MAX;
  if (context.experienceLevel === "advanced" || context.experienceLevel === "elite") {
    return VOLUME_SETS_ADVANCED_MAX;
  }
  if (context.recoveryCapacity === "limited") {
    return Math.min(VOLUME_SETS_INTERMEDIATE_MAX, 45);
  }
  if (context.recoveryCapacity === "high") {
    return VOLUME_SETS_ADVANCED_MAX;
  }
  return VOLUME_SETS_INTERMEDIATE_MAX;
}

function scoreVolumeSuitability(
  signals: ProgramStructureSignals,
  context: ProgramReviewAthleteContext,
): ProgramScoreComponent {
  if (signals.estimatedWeeklySets <= 0) {
    return unavailable(
      "volume_suitability",
      "No targetSets on exercises — weekly volume cannot be estimated.",
    );
  }
  if (
    !context.experienceLevel &&
    context.recoveryCapacity === "unknown"
  ) {
    return unavailable(
      "volume_suitability",
      "Need experience level or recovery capacity to judge volume suitability (avoids arbitrary scores).",
    );
  }

  const sets = signals.estimatedWeeklySets;
  const cap = volumeCapForContext(context);
  let score: number;
  const notes: string[] = [
    `~${sets} prescribed sets/week; suitability cap ${cap} from experience/recovery context.`,
  ];

  if (sets < VOLUME_SETS_LIGHT_MIN && signals.trainingDaysPerWeek >= 3) {
    score = 45;
    notes.push(
      `Below ${VOLUME_SETS_LIGHT_MIN} sets with ≥3 days — targets may be incomplete.`,
    );
  } else if (sets <= cap * 0.55) {
    score = 70;
    notes.push("Volume is on the lighter side of the contextual band.");
  } else if (sets <= cap) {
    score = 88;
    notes.push("Volume sits inside the contextual suitability band.");
  } else if (sets <= cap * 1.25) {
    score = 58;
    notes.push("Volume exceeds the contextual band moderately.");
  } else {
    score = 35;
    notes.push("Volume is well above the contextual suitability band.");
  }

  return observed("volume_suitability", score, notes.join(" "), "medium");
}

function scoreFatigueManagement(
  signals: ProgramStructureSignals,
): ProgramScoreComponent {
  if (signals.dayLoads.length === 0) {
    return unavailable(
      "fatigue_management",
      "No day-level workouts — fatigue distribution cannot be scored.",
    );
  }

  const sorted = [...signals.dayLoads].sort((a, b) => a.dayIndex - b.dayIndex);
  const dense = sorted.filter((d) => d.estimatedSets >= FATIGUE_DENSE_SETS);
  let consecutive = 0;
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1]!;
    const b = sorted[i]!;
    if (
      b.dayIndex === a.dayIndex + 1 &&
      a.estimatedSets >= FATIGUE_DENSE_SETS &&
      b.estimatedSets >= FATIGUE_DENSE_SETS
    ) {
      consecutive += 1;
    }
  }

  const restGaps = 7 - signals.trainingDaysPerWeek;
  let score = 80;
  score -= consecutive * 18;
  score -= Math.max(0, dense.length - 3) * 8;
  if (restGaps >= 2) score += 8;
  if (restGaps === 0 && signals.trainingDaysPerWeek >= 6) score -= 12;

  return observed(
    "fatigue_management",
    score,
    `${dense.length} dense day(s) (≥${FATIGUE_DENSE_SETS} sets); ${consecutive} consecutive dense pair(s); ~${restGaps} rest day(s)/week.`,
    "medium",
  );
}

function scoreExerciseBalance(
  signals: ProgramStructureSignals,
): ProgramScoreComponent {
  if (signals.exerciseLines.length === 0) {
    return unavailable(
      "exercise_balance",
      "No exercises — movement balance cannot be scored.",
    );
  }

  const counts: Record<string, number> = {};
  for (const line of signals.exerciseLines) {
    const key = line.movementPattern || "other";
    counts[key] = (counts[key] ?? 0) + (line.targetSets ?? 1);
  }
  const patterns = Object.keys(counts);
  if (patterns.length === 0) {
    return unavailable(
      "exercise_balance",
      "Movement pattern tags missing on exercises.",
    );
  }

  const push = counts.push ?? 0;
  const pull = counts.pull ?? 0;
  const squat = counts.squat ?? 0;
  const hinge = counts.hinge ?? 0;

  let score = 55 + Math.min(patterns.length, 5) * 8;
  const issues: string[] = [];
  if (push > 0 && pull === 0) {
    score -= 20;
    issues.push("push without pull");
  }
  if (pull > 0 && push === 0) {
    score -= 12;
    issues.push("pull without push");
  }
  if (squat > 0 && hinge === 0) {
    score -= 15;
    issues.push("squat without hinge");
  }
  if (hinge > 0 && squat === 0) {
    score -= 12;
    issues.push("hinge without squat");
  }
  if (push > 0 && pull > 0) {
    const ratio = Math.max(push, pull) / Math.max(1, Math.min(push, pull));
    if (ratio > 2.5) {
      score -= 10;
      issues.push("push/pull set imbalance");
    }
  }

  return observed(
    "exercise_balance",
    score,
    issues.length
      ? `Patterns: ${patterns.join(", ")}. Issues: ${issues.join("; ")}.`
      : `Balanced pattern mix: ${patterns.join(", ")}.`,
    "medium",
  );
}

function scoreRecoveryCompatibility(
  signals: ProgramStructureSignals,
  context: ProgramReviewAthleteContext,
): ProgramScoreComponent {
  if (context.recoveryCapacity === "unknown") {
    return unavailable(
      "recovery_compatibility",
      "Recovery capacity unknown — refusing an arbitrary recovery score.",
    );
  }
  if (signals.dayLoads.length === 0) {
    return unavailable(
      "recovery_compatibility",
      "No day prescriptions — recovery demand cannot be compared.",
    );
  }

  const highDays = signals.dayLoads.filter(
    (d) =>
      d.estimatedSets >= RECOVERY_HIGH_SETS ||
      (d.avgRpe != null && d.avgRpe >= RECOVERY_HIGH_RPE),
  ).length;

  let score = 75;
  const notes: string[] = [
    `Recovery capacity “${context.recoveryCapacity}”; ${highDays} higher-demand day(s).`,
  ];

  if (context.recoveryCapacity === "limited") {
    if (highDays >= 3) score = 38;
    else if (highDays === 2) score = 55;
    else score = 82;
  } else if (context.recoveryCapacity === "moderate") {
    if (highDays >= 4) score = 50;
    else if (highDays >= 3) score = 68;
    else score = 86;
  } else {
    // high
    if (highDays === 0 && signals.trainingDaysPerWeek >= 4) score = 70;
    else score = 88;
  }

  return observed("recovery_compatibility", score, notes.join(" "), "medium");
}

function overallConfidence(
  observedCount: number,
  components: ProgramScoreComponent[],
): ConfidenceLevel {
  if (observedCount < PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE) return "none";
  const lowComponents = components.filter(
    (c) => c.status === "observed" && c.confidence === "low",
  ).length;
  if (observedCount >= PROGRAM_SCORE_MIN_COMPONENTS_FOR_HIGH && lowComponents === 0) {
    return "high";
  }
  if (observedCount >= PROGRAM_SCORE_MIN_COMPONENTS_FOR_MEDIUM) {
    return lowComponents >= 2 ? "low" : "medium";
  }
  return "low";
}

/**
 * Compute Training Program Score from program structure + athlete context.
 * overallScore is null when fewer than MIN observed components exist.
 */
export function computeProgramScore(input: {
  signals: ProgramStructureSignals;
  context: ProgramReviewAthleteContext;
}): ProgramScoreResult {
  const { signals, context } = input;

  const raw: ProgramScoreComponent[] = [
    scoreGoalAlignment(signals, context),
    scoreSpecificity(signals, context),
    scoreProgression(signals),
    scoreVolumeSuitability(signals, context),
    scoreFatigueManagement(signals),
    scoreExerciseBalance(signals),
    scoreRecoveryCompatibility(signals, context),
  ];

  const observed = raw.filter((c) => c.status === "observed" && c.score != null);
  const weightSum = observed.reduce((s, c) => s + c.weight, 0);

  const components = raw.map((c) => {
    if (c.status !== "observed" || c.score == null || weightSum <= 0) {
      return { ...c, effectiveWeight: 0 };
    }
    return {
      ...c,
      effectiveWeight: Math.round((c.weight / weightSum) * 1000) / 1000,
    };
  });

  const missingInformation: string[] = [];
  for (const c of components) {
    if (c.status === "unavailable" && c.unavailableReason) {
      missingInformation.push(`${c.label}: ${c.unavailableReason}`);
    }
  }
  if (!context.goalTitle) missingInformation.push("Primary goal on profile");
  if (!context.experienceLevel) missingInformation.push("Experience level");
  if (context.recoveryCapacity === "unknown") {
    missingInformation.push("Recovery capacity (habits or readiness check-ins)");
  }
  if (signals.exerciseLines.length === 0) {
    missingInformation.push("Workout exercises on program days");
  }

  const uniqueMissing = [...new Set(missingInformation)];
  const confidence = overallConfidence(observed.length, components);

  let overallScore: number | null = null;
  const notes: string[] = [
    `Observed ${observed.length}/${components.length} components.`,
    `Weights: ${Object.entries(PROGRAM_SCORE_WEIGHTS)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ")}.`,
  ];

  if (
    observed.length >= PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE &&
    weightSum > 0
  ) {
    const weighted = observed.reduce(
      (s, c) => s + (c.score as number) * (c.weight / weightSum),
      0,
    );
    overallScore = clampScore(weighted);
    notes.push(
      `overallScore = Σ(score × renormalizedWeight) = ${overallScore}.`,
    );
  } else {
    notes.push(
      `overallScore null — need ≥${PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE} observed components (have ${observed.length}).`,
    );
  }

  const explanation =
    overallScore != null
      ? `Training Program Score ${overallScore}/100 (${confidence} confidence) from ${observed.length} observed components.`
      : `Training Program Score unavailable — only ${observed.length} of ${PROGRAM_SCORE_MIN_COMPONENTS_FOR_SCORE} required components could be scored. Missing information is listed explicitly.`;

  return {
    formulaId: PROGRAM_SCORE_FORMULA_ID,
    formulaVersion: PROGRAM_SCORE_FORMULA_VERSION,
    overallScore,
    score: overallScore,
    confidence,
    components,
    subscores: components.map((c) => ({
      id: c.id,
      label: c.label,
      score: c.score,
      weight: c.weight,
      effectiveWeight: c.effectiveWeight,
      status: c.status,
    })),
    missingInformation: uniqueMissing,
    explanation,
    reasoning: {
      formulaId: PROGRAM_SCORE_FORMULA_ID,
      formulaVersion: PROGRAM_SCORE_FORMULA_VERSION,
      formulaDescription: PROGRAM_SCORE_FORMULA_DESCRIPTION,
      minimumData: PROGRAM_SCORE_MINIMUM_DATA,
      notes,
      assumptions: PROGRAM_SCORE_ASSUMPTIONS,
    },
  };
}

/** UI gate — hide numeric Program Score when confidence is none/low. */
export function displayableProgramScore(
  result: ProgramScoreResult,
): number | null {
  if (result.overallScore == null) return null;
  if (result.confidence === "none" || result.confidence === "low") return null;
  return result.overallScore;
}
