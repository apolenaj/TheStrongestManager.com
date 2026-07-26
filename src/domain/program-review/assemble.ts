import {
  PROGRAM_REVIEW_DIMENSION_LABELS,
  PROGRAM_REVIEW_ENGINE_VERSION,
  PROGRAM_REVIEW_HONESTY,
  type ProgramReviewDimensionId,
} from "@/domain/program-review/constants";
import type {
  ProgramAiReviewPayload,
  ProgramReviewAthleteContext,
  ProgramReviewDimension,
  ProgramStructureSignals,
  WeeklyStressDay,
} from "@/domain/program-review/types";
import { computeProgramScore } from "@/domain/program-score";
import type { ConfidenceLevel } from "@/domain/scoring/types";

function conf(c: ConfidenceLevel): ConfidenceLevel {
  return c;
}

function parseRepMid(reps: string | null): number | null {
  if (!reps) return null;
  const m = reps.match(/(\d+)(?:\s*[-–]\s*(\d+))?/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return (a + b) / 2;
}

function patternCounts(signals: ProgramStructureSignals): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const line of signals.exerciseLines) {
    const key = line.movementPattern || "other";
    counts[key] = (counts[key] ?? 0) + (line.targetSets ?? 1);
  }
  return counts;
}

function dim(
  id: ProgramReviewDimensionId,
  status: ProgramReviewDimension["status"],
  finding: string,
  contextNote: string | null,
  confidence: ConfidenceLevel,
): ProgramReviewDimension {
  return {
    id,
    label: PROGRAM_REVIEW_DIMENSION_LABELS[id],
    status,
    finding,
    contextNote,
    confidence,
  };
}

/**
 * Assemble a full AI program review from structure + athlete context.
 * Never emits a standalone “bad program” verdict.
 */
export function assembleProgramAiReview(input: {
  signals: ProgramStructureSignals;
  context: ProgramReviewAthleteContext;
}): ProgramAiReviewPayload {
  const { signals, context } = input;
  const missing: string[] = [];
  const dimensions: ProgramReviewDimension[] = [];

  if (signals.exerciseLines.length === 0) {
    missing.push("Workout exercises on program days");
  }
  if (!context.goalTitle) missing.push("Primary goal on profile");
  if (!context.experienceLevel) missing.push("Experience level");
  if (context.daysPerWeek == null) missing.push("Available training days per week");
  if (context.availableEquipment.length === 0) {
    missing.push("Available equipment list");
  }
  if (context.recoveryCapacity === "unknown") {
    missing.push("Recovery capacity signal (habits or recent readiness)");
  }

  // —— Frequency ——
  const freq = signals.trainingDaysPerWeek;
  if (freq === 0) {
    dimensions.push(
      dim(
        "frequency",
        "insufficient_data",
        "No training days with workouts are attached to this program yet.",
        context.daysPerWeek != null
          ? `Your profile lists ${context.daysPerWeek} available day(s)/week — frequency cannot be judged until days are prescribed.`
          : null,
        conf("none"),
      ),
    );
  } else if (
    context.daysPerWeek != null &&
    freq > context.daysPerWeek + 1
  ) {
    dimensions.push(
      dim(
        "frequency",
        "context_mismatch",
        `Program schedules about ${freq} training day(s)/week.`,
        `That exceeds your listed availability (${context.daysPerWeek} day(s)/week). The plan is not “bad” — it may simply not fit your schedule without edits.`,
        conf("medium"),
      ),
    );
  } else if (
    context.daysPerWeek != null &&
    freq < context.daysPerWeek - 1 &&
    context.daysPerWeek >= 4
  ) {
    dimensions.push(
      dim(
        "frequency",
        "adequate",
        `Program uses about ${freq} training day(s)/week.`,
        `You listed ${context.daysPerWeek} available days — there is room to add a session if goal volume needs it, not a requirement.`,
        conf("medium"),
      ),
    );
  } else {
    dimensions.push(
      dim(
        "frequency",
        "strong",
        `About ${freq} training day(s) per week are prescribed.`,
        context.daysPerWeek != null
          ? `Aligned with your ${context.daysPerWeek} available day(s)/week.`
          : "Schedule preference not on file — frequency judged from the program alone.",
        conf(context.daysPerWeek != null ? "high" : "low"),
      ),
    );
  }

  // —— Volume ——
  const weeklySets = signals.estimatedWeeklySets;
  if (weeklySets === 0) {
    dimensions.push(
      dim(
        "volume",
        "insufficient_data",
        "Set targets are missing on prescribed exercises — weekly volume cannot be estimated.",
        null,
        conf("none"),
      ),
    );
  } else {
    let status: ProgramReviewDimension["status"] = "adequate";
    let contextNote: string | null = null;
    if (context.recoveryCapacity === "limited" && weeklySets > 50) {
      status = "context_mismatch";
      contextNote = `Estimated ~${weeklySets} hard-ish sets/week may be high relative to limited recovery capacity — not a universal “too much” label.`;
    } else if (context.experienceLevel === "beginner" && weeklySets > 45) {
      status = "needs_attention";
      contextNote =
        "For a beginner profile, this weekly set estimate is on the high side — consider simplifying before adding load.";
    } else if (weeklySets < 12 && freq >= 3) {
      status = "needs_attention";
      contextNote =
        "Set count looks light for the training frequency — confirm targets are filled in.";
    } else {
      contextNote =
        context.recoveryCapacity !== "unknown"
          ? `Interpreted against ${context.recoveryCapacity} recovery capacity.`
          : "Recovery capacity unknown — volume band is structural only.";
    }
    dimensions.push(
      dim(
        "volume",
        status,
        `Roughly ${weeklySets} prescribed sets across a representative week (from targetSets).`,
        contextNote,
        conf(weeklySets > 0 ? "medium" : "none"),
      ),
    );
  }

  // —— Intensity ——
  if (
    !signals.hasRpePrescription &&
    !signals.hasPercentPrescription &&
    !signals.hasLoadPrescription
  ) {
    dimensions.push(
      dim(
        "intensity",
        "insufficient_data",
        "No RPE, % of max, or load targets are on file — intensity strategy is not readable.",
        "Add intensity anchors before judging how hard the program asks you to push.",
        conf("none"),
      ),
    );
  } else {
    const parts: string[] = [];
    if (signals.hasRpePrescription) parts.push("RPE");
    if (signals.hasPercentPrescription) parts.push("% of max");
    if (signals.hasLoadPrescription) parts.push("absolute load");
    const highRpeDays = signals.dayLoads.filter(
      (d) => d.avgRpe != null && d.avgRpe >= 8.5,
    ).length;
    let status: ProgramReviewDimension["status"] = "adequate";
    let contextNote: string | null = `Uses ${parts.join(" + ")} as intensity anchors.`;
    if (context.recoveryCapacity === "limited" && highRpeDays >= 3) {
      status = "context_mismatch";
      contextNote = `Several days average RPE ≥ 8.5 while recovery capacity is limited — high intensity is not inherently wrong, but may need spacing for you.`;
    } else if (highRpeDays >= 4) {
      status = "needs_attention";
      contextNote =
        "Many days sit at high average RPE — watch fatigue stacking across the week.";
    }
    dimensions.push(
      dim(
        "intensity",
        status,
        `Intensity is prescribed via ${parts.join(", ")}.`,
        contextNote,
        conf("medium"),
      ),
    );
  }

  // —— Exercise selection ——
  const advancedCount = signals.exerciseLines.filter(
    (e) => e.difficulty === "advanced",
  ).length;
  if (signals.exerciseLines.length === 0) {
    dimensions.push(
      dim(
        "exercise_selection",
        "insufficient_data",
        "No exercises are linked yet.",
        null,
        conf("none"),
      ),
    );
  } else if (
    context.experienceLevel === "beginner" &&
    advancedCount >= Math.ceil(signals.exerciseLines.length / 2)
  ) {
    dimensions.push(
      dim(
        "exercise_selection",
        "context_mismatch",
        `${advancedCount} of ${signals.exerciseLines.length} lines are tagged advanced difficulty.`,
        "Against a beginner profile, that may be more technical than needed — not a global judgment that the selection is poor.",
        conf("medium"),
      ),
    );
  } else {
    dimensions.push(
      dim(
        "exercise_selection",
        "adequate",
        `${signals.exerciseLines.length} exercise line(s) across the program graph.`,
        context.experienceLevel
          ? `Read in light of ${context.experienceLevel} experience.`
          : "Experience level missing — selection judged structurally only.",
        conf("low"),
      ),
    );
  }

  // —— Movement balance ——
  const patterns = patternCounts(signals);
  const patternKeys = Object.keys(patterns);
  if (patternKeys.length === 0) {
    dimensions.push(
      dim(
        "movement_balance",
        "insufficient_data",
        "Movement patterns unavailable without exercise catalog links.",
        null,
        conf("none"),
      ),
    );
  } else {
    const push = (patterns.push ?? 0) + (patterns.olympic ?? 0) * 0;
    const pull = patterns.pull ?? 0;
    const squat = patterns.squat ?? 0;
    const hinge = patterns.hinge ?? 0;
    const issues: string[] = [];
    if (push > 0 && pull === 0) issues.push("push without pull");
    if (squat > 0 && hinge === 0) issues.push("squat without hinge");
    if (hinge > 0 && squat === 0) issues.push("hinge without squat");
    const top = Object.entries(patterns).sort((a, b) => b[1] - a[1])[0];
    dimensions.push(
      dim(
        "movement_balance",
        issues.length ? "needs_attention" : "strong",
        issues.length
          ? `Pattern mix shows ${issues.join("; ")} (set-weighted). Dominant pattern: ${top?.[0] ?? "n/a"}.`
          : `Patterns represented: ${patternKeys.join(", ")}. Dominant: ${top?.[0]} (${top?.[1]} set-weight).`,
        "Balance is coaching judgment from catalog movementPattern tags — not a biomechanics diagnosis.",
        conf("medium"),
      ),
    );
  }

  // —— Fatigue distribution ——
  const stressed = signals.dayLoads.filter((d) => d.estimatedSets >= 12);
  const consecutiveHigh = hasConsecutiveHighDays(signals.dayLoads);
  if (signals.dayLoads.length === 0) {
    dimensions.push(
      dim(
        "fatigue_distribution",
        "insufficient_data",
        "Day-level workouts are missing — weekly fatigue distribution cannot be mapped.",
        null,
        conf("none"),
      ),
    );
  } else if (consecutiveHigh && context.recoveryCapacity === "limited") {
    dimensions.push(
      dim(
        "fatigue_distribution",
        "context_mismatch",
        "Back-to-back higher-set days appear in the week.",
        "With limited recovery capacity, stacking dense days may outpace recovery — rearrange before calling the whole program unsuitable.",
        conf("medium"),
      ),
    );
  } else if (stressed.length >= 4) {
    dimensions.push(
      dim(
        "fatigue_distribution",
        "needs_attention",
        `${stressed.length} days look denser (≥12 estimated sets).`,
        "Consider inserting an easier day rather than labelling the week “bad.”",
        conf("low"),
      ),
    );
  } else {
    dimensions.push(
      dim(
        "fatigue_distribution",
        "adequate",
        "Set density is spread across the week without an obvious all-days spike.",
        null,
        conf("low"),
      ),
    );
  }

  // —— Specificity ——
  const discipline = context.primaryDiscipline ?? context.goalCategory;
  const powerliftingFocus =
    discipline === "powerlifting" ||
    /powerlift|squat|bench|deadlift/i.test(context.goalTitle ?? "");
  const compounds = signals.exerciseLines.filter((e) =>
    /squat|hinge|push|pull/.test(e.movementPattern),
  ).length;
  if (signals.exerciseLines.length === 0) {
    dimensions.push(
      dim(
        "specificity",
        "insufficient_data",
        "Cannot judge specificity without exercises.",
        context.goalTitle
          ? `Goal on file: “${context.goalTitle}”.`
          : null,
        conf("none"),
      ),
    );
  } else if (powerliftingFocus) {
    const hasSquat = signals.exerciseLines.some((e) =>
      /squat/i.test(e.name + e.movementPattern),
    );
    const hasBench = signals.exerciseLines.some((e) =>
      /bench|push/i.test(e.name + e.movementPattern),
    );
    const hasDl = signals.exerciseLines.some((e) =>
      /deadlift|hinge/i.test(e.name + e.movementPattern),
    );
    const missingLifts = [
      !hasSquat ? "squat" : null,
      !hasBench ? "bench/press" : null,
      !hasDl ? "deadlift/hinge" : null,
    ].filter(Boolean);
    dimensions.push(
      dim(
        "specificity",
        missingLifts.length ? "context_mismatch" : "strong",
        missingLifts.length
          ? `Powerlifting-oriented goal/context is missing clear ${missingLifts.join(", ")} work in the prescription.`
          : "Competition-lift patterns appear present for a powerlifting-oriented context.",
        context.goalTitle
          ? `Framed against goal “${context.goalTitle}”.`
          : "Framed against powerlifting discipline.",
        conf("medium"),
      ),
    );
  } else {
    dimensions.push(
      dim(
        "specificity",
        "adequate",
        `${compounds} compound-pattern lines vs ${signals.exerciseLines.length} total.`,
        context.goalTitle
          ? `Goal “${context.goalTitle}” — confirm exercise choices still serve that target.`
          : "No clear sport goal — specificity stays general.",
        conf("low"),
      ),
    );
  }

  // —— Progression ——
  if (signals.progressionRuleKinds.length === 0) {
    dimensions.push(
      dim(
        "progression_strategy",
        "needs_attention",
        "No progression rules are attached to this program.",
        "Without rules, progression depends on coach/athlete judgment or adaptive suggestions you confirm later.",
        conf("medium"),
      ),
    );
  } else {
    dimensions.push(
      dim(
        "progression_strategy",
        "strong",
        `Progression rules on file: ${[...new Set(signals.progressionRuleKinds)].join(", ")}.`,
        "Rules are recommended/heuristic until logged outcomes confirm them.",
        conf("high"),
      ),
    );
  }

  // —— Recovery demands ——
  const highDays = signals.dayLoads.filter(
    (d) =>
      d.estimatedSets >= 15 ||
      (d.avgRpe != null && d.avgRpe >= 8) ||
      (d.avgPercent != null && d.avgPercent >= 85),
  ).length;
  if (signals.dayLoads.length === 0) {
    dimensions.push(
      dim(
        "recovery_demands",
        "insufficient_data",
        "Cannot estimate recovery demand without day prescriptions.",
        null,
        conf("none"),
      ),
    );
  } else if (context.recoveryCapacity === "limited" && highDays >= 3) {
    dimensions.push(
      dim(
        "recovery_demands",
        "context_mismatch",
        `${highDays} denser/higher-intensity days per week.`,
        "Against limited recovery capacity, demand may outpace recovery — adjust density before abandoning an otherwise sound structure.",
        conf("medium"),
      ),
    );
  } else if (context.recoveryCapacity === "high" && highDays <= 1) {
    dimensions.push(
      dim(
        "recovery_demands",
        "adequate",
        "Recovery demand looks moderate relative to high recovery capacity.",
        null,
        conf("low"),
      ),
    );
  } else {
    dimensions.push(
      dim(
        "recovery_demands",
        "adequate",
        `${highDays} higher-demand day(s) estimated in the week.`,
        context.recoveryCapacity !== "unknown"
          ? `Read against ${context.recoveryCapacity} recovery capacity.`
          : "Recovery capacity unknown — demand is structural only.",
        conf(context.recoveryCapacity !== "unknown" ? "medium" : "low"),
      ),
    );
  }

  // —— Equipment mismatch scan ——
  const equipIssues = findEquipmentMismatches(signals, context);
  if (equipIssues.length) {
    // fold into potential issues rather than a 10th dimension
  }

  const weeklyStressDistribution = buildStressDistribution(signals);
  const strengths = collectStrengths(dimensions);
  const potentialIssues = [
    ...collectIssues(dimensions),
    ...equipIssues,
  ].slice(0, 6);
  const recommendedImprovements = buildImprovements(
    dimensions,
    context,
    equipIssues,
  ).slice(0, 5);

  const goalAlignment = buildGoalAlignment(dimensions, context, signals);
  const overview = buildOverview(signals, context, dimensions);
  const programScore = computeProgramScore({ signals, context });

  return {
    engineVersion: PROGRAM_REVIEW_ENGINE_VERSION,
    program: {
      id: signals.programId,
      name: signals.name,
      kind: signals.kind,
      status: signals.status,
      description: signals.description,
    },
    overview,
    strengths: strengths.length
      ? strengths
      : ["Structure is on file — strengths will appear as more prescription detail is filled in."],
    potentialIssues: potentialIssues.length
      ? potentialIssues
      : [
          "No major context mismatches detected from available data — keep logging sessions to refine this review.",
        ],
    goalAlignment,
    weeklyStressDistribution,
    recommendedImprovements,
    dimensions,
    athleteContextUsed: {
      goalTitle: context.goalTitle,
      experienceLevel: context.experienceLevel,
      daysPerWeek: context.daysPerWeek,
      sessionLengthMinutes: context.sessionLengthMinutes,
      equipmentCount: context.availableEquipment.length,
      recoveryCapacityLabel: context.recoveryCapacity,
    },
    honesty: PROGRAM_REVIEW_HONESTY,
    missingInformation: [
      ...new Set([...missing, ...programScore.missingInformation]),
    ],
    programScore,
  };
}

function hasConsecutiveHighDays(
  days: ProgramStructureSignals["dayLoads"],
): boolean {
  const sorted = [...days].sort((a, b) => a.dayIndex - b.dayIndex);
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1]!;
    const b = sorted[i]!;
    if (b.dayIndex !== a.dayIndex + 1) continue;
    if (a.estimatedSets >= 12 && b.estimatedSets >= 12) return true;
  }
  return false;
}

function findEquipmentMismatches(
  signals: ProgramStructureSignals,
  context: ProgramReviewAthleteContext,
): string[] {
  if (context.availableEquipment.length === 0) return [];
  const avail = new Set(
    context.availableEquipment.map((e) => e.toLowerCase()),
  );
  // If athlete listed full gym synonyms, skip hard mismatches
  if (
    [...avail].some((e) =>
      /full.?gym|commercial|rack|barbell/.test(e),
    )
  ) {
    return [];
  }
  const issues: string[] = [];
  for (const line of signals.exerciseLines) {
    if (line.equipment.length === 0) continue;
    const ok = line.equipment.some((eq) =>
      [...avail].some(
        (a) => eq.toLowerCase().includes(a) || a.includes(eq.toLowerCase()),
      ),
    );
    if (!ok) {
      issues.push(
        `${line.name} lists equipment (${line.equipment.join(", ")}) that may not match your available list — confirm access before blaming the program.`,
      );
    }
  }
  return [...new Set(issues)].slice(0, 3);
}

function buildStressDistribution(
  signals: ProgramStructureSignals,
): WeeklyStressDay[] {
  if (signals.dayLoads.length === 0) {
    return Array.from({ length: 7 }, (_, i) => ({
      dayIndex: i + 1,
      label: `Day ${i + 1}`,
      stressBand: "unknown" as const,
      exerciseCount: 0,
      estimatedSets: 0,
      detail: "No workout linked.",
    }));
  }

  const byDay = new Map(signals.dayLoads.map((d) => [d.dayIndex, d]));
  return Array.from({ length: 7 }, (_, i) => {
    const dayIndex = i + 1;
    const d = byDay.get(dayIndex);
    if (!d || d.exerciseCount === 0) {
      return {
        dayIndex,
        label: `Day ${dayIndex}`,
        stressBand: "rest" as const,
        exerciseCount: 0,
        estimatedSets: 0,
        detail: "Rest / no prescription",
      };
    }
    let stressBand: WeeklyStressDay["stressBand"] = "moderate";
    if (d.estimatedSets >= 18 || (d.avgRpe != null && d.avgRpe >= 8.5)) {
      stressBand = "high";
    } else if (d.estimatedSets <= 8 && (d.avgRpe == null || d.avgRpe < 7)) {
      stressBand = "low";
    }
    return {
      dayIndex,
      label: d.label || `Day ${dayIndex}`,
      stressBand,
      exerciseCount: d.exerciseCount,
      estimatedSets: d.estimatedSets,
      detail: `${d.exerciseCount} exercises · ~${d.estimatedSets} sets${d.avgRpe != null ? ` · avg RPE ${d.avgRpe}` : ""}`,
    };
  });
}

function collectStrengths(dimensions: ProgramReviewDimension[]): string[] {
  return dimensions
    .filter((d) => d.status === "strong" || d.status === "adequate")
    .filter((d) => d.status === "strong" || d.id === "frequency" || d.id === "progression_strategy" || d.id === "movement_balance")
    .map((d) => `${d.label}: ${d.finding}`)
    .slice(0, 5);
}

function collectIssues(dimensions: ProgramReviewDimension[]): string[] {
  return dimensions
    .filter(
      (d) =>
        d.status === "needs_attention" ||
        d.status === "context_mismatch" ||
        d.status === "insufficient_data",
    )
    .map((d) => {
      const base = `${d.label}: ${d.finding}`;
      return d.contextNote ? `${base} (${d.contextNote})` : base;
    });
}

function buildImprovements(
  dimensions: ProgramReviewDimension[],
  context: ProgramReviewAthleteContext,
  equipIssues: string[],
): string[] {
  const out: string[] = [];
  for (const d of dimensions) {
    if (d.status === "context_mismatch" || d.status === "needs_attention") {
      if (d.id === "frequency") {
        out.push(
          "Trim or redistribute training days to match your available schedule before adding intensity.",
        );
      } else if (d.id === "volume" || d.id === "recovery_demands") {
        out.push(
          "Reduce set density on one day or insert an easier session — confirm any change explicitly.",
        );
      } else if (d.id === "progression_strategy") {
        out.push(
          "Attach a simple progression rule (e.g. add load when all sets are hit) or use Adaptations after logging.",
        );
      } else if (d.id === "intensity") {
        out.push(
          "Add RPE or % anchors so intensity is reviewable, or space high-RPE days.",
        );
      } else if (d.id === "specificity") {
        out.push(
          "Ensure competition or goal lifts appear weekly if that is your primary target.",
        );
      } else if (d.id === "movement_balance") {
        out.push(
          "Add a balancing pattern (e.g. pull if push-dominant) rather than rewriting the whole plan.",
        );
      } else if (d.id === "exercise_selection") {
        out.push(
          "Swap advanced variations for simpler regressions while skill catches up.",
        );
      } else if (d.id === "fatigue_distribution") {
        out.push(
          "Avoid stacking two high-set days back-to-back when recovery is constrained.",
        );
      }
    }
    if (d.status === "insufficient_data" && d.id === "intensity") {
      out.push("Fill in RPE, percent, or load targets on key lifts.");
    }
  }
  if (equipIssues.length) {
    out.push(
      "Verify equipment access for flagged lifts or substitute with available tools.",
    );
  }
  if (!context.goalTitle) {
    out.push("Set a primary goal on your profile so alignment can be judged.");
  }
  if (out.length === 0) {
    out.push(
      "Keep logging sessions and re-run this review after a block — confirm any structural change explicitly.",
    );
  }
  return [...new Set(out)];
}

function buildGoalAlignment(
  dimensions: ProgramReviewDimension[],
  context: ProgramReviewAthleteContext,
  signals: ProgramStructureSignals,
): ProgramAiReviewPayload["goalAlignment"] {
  if (!context.goalTitle) {
    return {
      summary:
        "No primary goal on file — alignment cannot be confirmed or denied.",
      aligned: null,
      confidence: conf("none"),
    };
  }
  const spec = dimensions.find((d) => d.id === "specificity");
  const freq = dimensions.find((d) => d.id === "frequency");
  if (spec?.status === "context_mismatch") {
    return {
      summary: `Goal “${context.goalTitle}” may not be fully reflected in exercise specificity (${signals.name}).`,
      aligned: false,
      confidence: conf("medium"),
    };
  }
  if (freq?.status === "context_mismatch") {
    return {
      summary: `Goal “${context.goalTitle}” is on file, but schedule fit is the clearer mismatch right now.`,
      aligned: null,
      confidence: conf("low"),
    };
  }
  return {
    summary: `Program “${signals.name}” is readable against goal “${context.goalTitle}” with no hard specificity conflict from available tags.`,
    aligned: true,
    confidence: conf(spec?.confidence === "medium" ? "medium" : "low"),
  };
}

function buildOverview(
  signals: ProgramStructureSignals,
  context: ProgramReviewAthleteContext,
  dimensions: ProgramReviewDimension[],
): string {
  const mismatches = dimensions.filter((d) => d.status === "context_mismatch")
    .length;
  const gaps = dimensions.filter((d) => d.status === "insufficient_data")
    .length;
  const parts = [
    `“${signals.name}” (${signals.kind}, ${signals.status}) spans ${signals.weekCount || "?"} week(s) with about ${signals.trainingDaysPerWeek} training day(s)/week and ~${signals.estimatedWeeklySets} prescribed sets in a representative week.`,
  ];
  if (context.goalTitle) {
    parts.push(`Reviewed in context of goal “${context.goalTitle}”.`);
  }
  if (mismatches > 0) {
    parts.push(
      `${mismatches} dimension(s) look like context mismatches for you — not a blanket “bad program” label.`,
    );
  } else if (gaps > 0) {
    parts.push(
      `${gaps} dimension(s) lack enough prescription detail for a firm read.`,
    );
  } else {
    parts.push(
      "No severe context mismatches from available signals — keep refining with real session logs.",
    );
  }
  return parts.join(" ");
}

/** Estimate weekly sets from exercise lines (first week preferred). */
export function estimateSetsFromRepsTarget(
  targetSets: number | null,
  targetReps: string | null,
): number {
  const sets = targetSets ?? 0;
  void parseRepMid(targetReps);
  return sets;
}
