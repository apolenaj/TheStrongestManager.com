import {
  DAILY_BRIEF_ENGINE_VERSION,
  DAILY_BRIEF_HONESTY,
  DAILY_BRIEF_MAX_INSIGHTS,
} from "@/domain/daily-brief/constants";
import type {
  DailyBriefAthleteSignals,
  DailyBriefInsight,
  DailyBriefLine,
  DailyBriefTechniqueInput,
  DailyBriefWorkoutInput,
  DailyCoachingBrief,
} from "@/domain/daily-brief/types";
import type { ConfidenceLevel } from "@/domain/scoring/types";

export type BuildDailyCoachingBriefInput = {
  dateKey: string;
  workout: DailyBriefWorkoutInput;
  technique: DailyBriefTechniqueInput | null;
  signals: DailyBriefAthleteSignals;
};

function conf(level: ConfidenceLevel): ConfidenceLevel {
  return level;
}

function cameraAngleLabel(angle: string | null): string | null {
  if (!angle) return null;
  if (angle === "forty_five") return "45°";
  if (angle === "side") return "side";
  if (angle === "front") return "front";
  if (angle === "rear") return "rear";
  if (angle === "overhead") return "overhead";
  return angle;
}

/**
 * Rank candidate insights, keep at most DAILY_BRIEF_MAX_INSIGHTS.
 * Does not invent recovery or technique conclusions from thin data.
 */
export function buildDailyCoachingBrief(
  input: BuildDailyCoachingBriefInput,
): DailyCoachingBrief {
  const { workout, technique, signals, dateKey } = input;
  const missingSignals: string[] = [];
  const candidates: DailyBriefInsight[] = [];

  const checkIns = signals.recoveryCheckInsLast7Days;
  if (checkIns < 3) {
    missingSignals.push(
      `More recovery check-ins (logged ${checkIns} with readiness in the last 7 days)`,
    );
  }
  if (!technique || technique.sampleCount < 2) {
    missingSignals.push("≥2 completed technique analyses for a focus trend");
  }
  if (!workout.prescriptionTitle && !workout.activeSessionId) {
    missingSignals.push("Assigned session for today");
  }

  // --- Warnings (highest value when real) ---
  if (signals.loadSpikeFlagged) {
    candidates.push({
      id: "warning-load-spike",
      kind: "warning",
      title: "Important warning",
      body: "Estimated training volume spiked vs your recent baseline.",
      why: "FatigueTrend flagged a load spike from logged volume — review intensity before pushing harder.",
      href: "/app/recovery",
      priority: 100,
      confidence: conf("medium"),
    });
  }

  if (
    checkIns >= 3 &&
    (signals.recoveryStatusLabel === "low" ||
      (signals.latestReadiness != null && signals.latestReadiness < 55))
  ) {
    candidates.push({
      id: "warning-low-readiness",
      kind: "warning",
      title: "Important warning",
      body:
        signals.latestReadiness != null
          ? `Latest readiness on file is ${signals.latestReadiness}/100 (athlete-reported).`
          : "Recovery status on file is low from your check-ins.",
      why: "Enough check-ins exist to surface readiness — any program change still needs your confirmation.",
      href: "/app/adaptations",
      priority: 95,
      confidence: conf("medium"),
    });
  }

  // --- Technique / primary focus ---
  if (
    technique?.focusLabel &&
    technique.why &&
    (technique.variationIncreasing ||
      signals.techniqueTrendDirection === "down" ||
      technique.sampleCount >= 2)
  ) {
    candidates.push({
      id: "technique-focus",
      kind: "technique_focus",
      title: "Technique focus",
      body: technique.focusLabel,
      why: technique.why,
      href: technique.latestAnalysisHref,
      priority: 88,
      confidence: technique.variationIncreasing ? conf("medium") : conf("low"),
    });
  } else if (signals.techniqueTrendDirection === "down") {
    candidates.push({
      id: "technique-trend-down",
      kind: "technique_focus",
      title: "Technique focus",
      body: "Recent technique trend is down on logged analyses.",
      why:
        signals.techniqueSampleCount >= 2
          ? `Direction is down across ${signals.techniqueSampleCount} analyses on file.`
          : "Trend flag is present; open technique for the underlying analyses.",
      href: technique?.latestAnalysisHref ?? "/app/technique",
      priority: 82,
      confidence: conf("low"),
    });
  }

  // --- Goal progress (only when meaningful) ---
  if (
    signals.goalTitle &&
    (signals.goalStatusLabel === "needs_attention" ||
      signals.goalStatusLabel === "aligned_with_strength_trend" ||
      signals.goalStatusLabel === "on_file")
  ) {
    const isPriority =
      signals.goalStatusLabel === "needs_attention" ||
      signals.goalStatusLabel === "aligned_with_strength_trend";
    candidates.push({
      id: "goal-progress",
      kind: "goal_progress",
      title: "Progress toward goal",
      body: signals.goalTitle,
      why: signals.goalSummary,
      href: "/app/progress",
      priority: isPriority ? 70 : 45,
      confidence:
        signals.goalStatusLabel === "needs_attention"
          ? conf("low")
          : conf("medium"),
    });
  } else if (!signals.goalTitle) {
    missingSignals.push("Primary goal on profile");
  }

  // --- Training as insight only when nothing higher-value exists ---
  if (workout.activeSessionId) {
    candidates.push({
      id: "training-active",
      kind: "training",
      title: "Today’s workout",
      body: "A session is already in progress.",
      why: null,
      href: `/app/training/${workout.activeSessionId}`,
      priority: 55,
      confidence: conf("high"),
    });
  } else if (workout.prescriptionTitle) {
    candidates.push({
      id: "training-scheduled",
      kind: "training",
      title: "Today’s workout",
      body: workout.prescriptionTitle,
      why: workout.prescriptionGoal,
      href: "/app/today",
      priority: 50,
      confidence: conf("high"),
    });
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const insights = candidates.slice(0, DAILY_BRIEF_MAX_INSIGHTS);

  const lines = composeLines({
    workout,
    technique,
    signals,
    checkIns,
    insights,
  });

  return {
    engineVersion: DAILY_BRIEF_ENGINE_VERSION,
    dateKey,
    headline: "Today",
    lines,
    insights,
    honesty: DAILY_BRIEF_HONESTY,
    missingSignals: [...new Set(missingSignals)],
  };
}

function composeLines(args: {
  workout: DailyBriefWorkoutInput;
  technique: DailyBriefTechniqueInput | null;
  signals: DailyBriefAthleteSignals;
  checkIns: number;
  insights: DailyBriefInsight[];
}): DailyBriefLine[] {
  const { workout, technique, signals, checkIns, insights } = args;
  const lines: DailyBriefLine[] = [];

  const techInsight = insights.find(
    (i) => i.kind === "technique_focus" || i.id === "technique-focus",
  );
  const warningInsight = insights.find((i) => i.kind === "warning");

  // Primary focus — prefer technique; else top insight; else training
  if (techInsight) {
    lines.push({
      kind: "primary_focus",
      label: "Primary focus",
      body: techInsight.body,
      href: techInsight.href,
    });
    if (techInsight.why) {
      lines.push({
        kind: "why",
        label: "Why",
        body: techInsight.why,
        href: techInsight.href,
      });
    }
  } else if (warningInsight) {
    lines.push({
      kind: "primary_focus",
      label: "Primary focus",
      body: warningInsight.body,
      href: warningInsight.href,
    });
    if (warningInsight.why) {
      lines.push({
        kind: "why",
        label: "Why",
        body: warningInsight.why,
        href: warningInsight.href,
      });
    }
  } else if (workout.prescriptionTitle || workout.activeSessionId) {
    lines.push({
      kind: "primary_focus",
      label: "Primary focus",
      body: workout.activeSessionId
        ? "Finish today’s session"
        : `Complete: ${workout.prescriptionTitle}`,
      href: workout.activeSessionId
        ? `/app/training/${workout.activeSessionId}`
        : "/app/today",
    });
  } else {
    lines.push({
      kind: "primary_focus",
      label: "Primary focus",
      body: "Build usable training signals",
      href: "/app/programs",
    });
    lines.push({
      kind: "why",
      label: "Why",
      body:
        workout.emptyReason ??
        "No session is assigned for today, so the brief cannot prioritize a lift-specific focus.",
      href: "/app/programs",
    });
  }

  // Training line
  if (workout.activeSessionId) {
    lines.push({
      kind: "training",
      label: "Training",
      body: "Session in progress — continue where you left off.",
      href: `/app/training/${workout.activeSessionId}`,
    });
  } else if (workout.prescriptionTitle) {
    const detail = [
      workout.prescriptionTitle,
      workout.programName ? `(${workout.programName})` : null,
    ]
      .filter(Boolean)
      .join(" ");
    lines.push({
      kind: "training",
      label: "Training",
      body: detail,
      href: "/app/today",
    });
  } else {
    lines.push({
      kind: "training",
      label: "Training",
      body: "Nothing scheduled for today.",
      href: "/app/programs",
    });
  }

  // Recovery — honesty first
  if (checkIns < 3) {
    lines.push({
      kind: "recovery",
      label: "Recovery",
      body: `You logged only ${checkIns} recovery check-in(s) with readiness this week — not enough data to conclude recovery status.`,
      href: "/app/recovery",
    });
  } else if (
    signals.recoveryStatusLabel === "low" ||
    (signals.latestReadiness != null && signals.latestReadiness < 55)
  ) {
    lines.push({
      kind: "recovery",
      label: "Recovery",
      body:
        signals.latestReadiness != null
          ? `Readiness ${signals.latestReadiness}/100 on file — treat load carefully.`
          : "Recovery status on file is low from check-ins.",
      href: "/app/recovery",
    });
  } else {
    lines.push({
      kind: "recovery",
      label: "Recovery",
      body: "No major issue detected from available check-ins.",
      href: "/app/recovery",
    });
  }

  // Goal — only when it made the insight cut or needs attention
  const goalInsight = insights.find((i) => i.kind === "goal_progress");
  if (goalInsight) {
    lines.push({
      kind: "goal_progress",
      label: "Progress toward goal",
      body: goalInsight.why
        ? `${goalInsight.body} — ${goalInsight.why}`
        : goalInsight.body,
      href: goalInsight.href,
    });
  }

  // Warning line if present in insights and not already primary
  if (warningInsight && techInsight) {
    lines.push({
      kind: "warning",
      label: "Important warning",
      body: warningInsight.body,
      href: warningInsight.href,
    });
  }

  // Suggested action
  lines.push({
    kind: "action",
    label: "Action",
    body: suggestAction({ workout, technique, checkIns, insights }),
    href: actionHref({ workout, technique, insights }),
  });

  return lines;
}

function suggestAction(args: {
  workout: DailyBriefWorkoutInput;
  technique: DailyBriefTechniqueInput | null;
  checkIns: number;
  insights: DailyBriefInsight[];
}): string {
  const { workout, technique, checkIns, insights } = args;

  if (workout.activeSessionId) {
    return "Continue your in-progress workout and log working sets honestly.";
  }

  if (insights.some((i) => i.id === "warning-load-spike")) {
    return "Review recovery before adding intensity — confirm any adaptation explicitly.";
  }

  if (
    technique?.focusLabel &&
    (workout.hasDeadliftToday || Boolean(workout.prescriptionTitle))
  ) {
    const angle = cameraAngleLabel(technique.cameraAngle);
    if (angle) {
      return `Record your final working set from ${angle}.`;
    }
    if (workout.techniqueCue) {
      return workout.techniqueCue;
    }
    return `Film today’s top set with the same angle as your last analysis — focus: ${technique.focusLabel}.`;
  }

  if (checkIns < 3) {
    return "Log a recovery check-in after training so Tomorrow’s brief can use readiness.";
  }

  if (workout.prescriptionTitle) {
    return workout.techniqueCue
      ? workout.techniqueCue
      : "Start today’s workout and log sets as performed.";
  }

  return "Assign or schedule a session so Today can prioritize real training.";
}

function actionHref(args: {
  workout: DailyBriefWorkoutInput;
  technique: DailyBriefTechniqueInput | null;
  insights: DailyBriefInsight[];
}): string | null {
  if (args.workout.activeSessionId) {
    return `/app/training/${args.workout.activeSessionId}`;
  }
  if (args.insights.some((i) => i.id === "warning-load-spike")) {
    return "/app/recovery";
  }
  if (args.technique?.latestAnalysisHref && args.technique.focusLabel) {
    return args.workout.prescriptionTitle
      ? "/app/today"
      : args.technique.latestAnalysisHref;
  }
  if (args.workout.prescriptionTitle) return "/app/today";
  return "/app/programs";
}

/**
 * Derive technique focus from the last two assessments’ shared components.
 * Returns null when data is insufficient — never invents variation claims.
 */
export function deriveTechniqueFocusFromAssessments(args: {
  analyses: Array<{
    id: string;
    href: string;
    cameraAngle: string | null;
    components: Array<{ id: string; label: string; score: number | null }>;
  }>;
}): DailyBriefTechniqueInput | null {
  const { analyses } = args;
  if (analyses.length === 0) {
    return {
      latestAnalysisId: null,
      latestAnalysisHref: "/app/technique",
      sampleCount: 0,
      focusLabel: null,
      why: null,
      cameraAngle: null,
      variationIncreasing: false,
    };
  }

  const latest = analyses[0]!;
  const sampleCount = analyses.length;

  if (analyses.length < 2) {
    const weak = weakestComponent(latest.components);
    return {
      latestAnalysisId: latest.id,
      latestAnalysisHref: latest.href,
      sampleCount,
      focusLabel: weak?.label ?? null,
      why: weak
        ? `Only one completed analysis is on file (${weak.label} ${weak.score}/100) — not enough to claim a trend.`
        : "Only one completed analysis is on file — not enough to claim a technique trend.",
      cameraAngle: latest.cameraAngle,
      variationIncreasing: false,
    };
  }

  const previous = analyses[1]!;
  const shared = latest.components.filter(
    (c) =>
      c.score != null &&
      previous.components.some(
        (p) => p.id === c.id && p.score != null,
      ),
  );

  let worstDelta: {
    id: string;
    label: string;
    latestScore: number;
    previousScore: number;
    delta: number;
  } | null = null;

  for (const c of shared) {
    const prev = previous.components.find((p) => p.id === c.id);
    if (!prev || c.score == null || prev.score == null) continue;
    const delta = c.score - prev.score;
    if (delta >= 0) continue;
    if (!worstDelta || delta < worstDelta.delta) {
      worstDelta = {
        id: c.id,
        label: c.label,
        latestScore: c.score,
        previousScore: prev.score,
        delta,
      };
    }
  }

  if (worstDelta && Math.abs(worstDelta.delta) >= 5) {
    const hipRelated =
      worstDelta.id.includes("hip") ||
      worstDelta.id === "setup_consistency" ||
      worstDelta.id === "start_position";
    const focusLabel = hipRelated
      ? formatHipFocusLabel(worstDelta.id, worstDelta.label)
      : worstDelta.label;
    return {
      latestAnalysisId: latest.id,
      latestAnalysisHref: latest.href,
      sampleCount,
      focusLabel,
      why: `Your last two analyses showed ${focusWhyPhrase(worstDelta)} (${worstDelta.previousScore} → ${worstDelta.latestScore}).`,
      cameraAngle: latest.cameraAngle,
      variationIncreasing: true,
    };
  }

  const weak = weakestComponent(latest.components);
  return {
    latestAnalysisId: latest.id,
    latestAnalysisHref: latest.href,
    sampleCount,
    focusLabel: weak?.label ?? null,
    why: weak
      ? `Latest analysis highlights ${weak.label} (${weak.score}/100). Last two analyses did not show a clear worsening trend.`
      : "Last two analyses are on file without a clear component worsening trend.",
    cameraAngle: latest.cameraAngle,
    variationIncreasing: false,
  };
}

function weakestComponent(
  components: Array<{ id: string; label: string; score: number | null }>,
): { id: string; label: string; score: number } | null {
  let best: { id: string; label: string; score: number } | null = null;
  for (const c of components) {
    if (c.score == null) continue;
    if (!best || c.score < best.score) {
      best = { id: c.id, label: c.label, score: c.score };
    }
  }
  return best;
}

function formatHipFocusLabel(id: string, label: string): string {
  if (id === "setup_consistency") return "Deadlift setup consistency";
  if (id === "start_position") return "Deadlift start-position consistency";
  if (id === "hip_rise_pattern") return "Deadlift hip-rise consistency";
  return label;
}

function focusWhyPhrase(delta: {
  id: string;
  label: string;
  latestScore: number;
  previousScore: number;
}): string {
  if (
    delta.id === "setup_consistency" ||
    delta.id === "start_position" ||
    delta.id.includes("hip")
  ) {
    return "increasing hip-position variation";
  }
  if (delta.id === "back_angle_consistency") {
    return "increasing torso-angle variation";
  }
  return `worsening ${delta.label.toLowerCase()}`;
}
