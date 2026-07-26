import type { DeadliftTechniqueAssessment } from "@/domain/movement/deadlift/score/types";
import type { DeadliftTechniqueComponentId } from "@/domain/movement/deadlift/score/thresholds";
import { LIFT_PHASE_LABELS } from "@/domain/movement/phases/constants";
import type {
  MovementPhaseSegment,
  MovementReport,
} from "@/domain/movement/types";
import {
  buildLiftPhaseAnalysis,
  type LiftPhaseInsight,
} from "@/domain/movement/phases/insights";

/** Cap actions so the report never dumps a wall of warnings. */
export const TECHNIQUE_REPORT_MAX_ACTIONS = 3;

export type TechniqueReportAction = {
  id: string;
  title: string;
  detail: string;
  componentId?: DeadliftTechniqueComponentId;
  priority: number;
};

export type TechniqueSuggestedDrill = {
  title: string;
  note: string;
};

export type TechniqueSuggestedExercise = {
  title: string;
  note: string;
  slug?: string;
};

export type TechniqueTimelineMarker = {
  id: string;
  label: string;
  timeSeconds: number;
  endTimeSeconds: number;
  phase: MovementPhaseSegment["phase"];
  confidence: MovementPhaseSegment["confidence"];
};

export type TechniqueComparisonSummary = {
  previousId: string;
  previousCreatedAt: Date;
  previousScore: number | null;
  currentId: string;
  currentScore: number | null;
  delta: number | null;
  previousConfidence: string | null;
  currentConfidence: string | null;
};

const COMPONENT_DRILLS: Record<
  DeadliftTechniqueComponentId,
  { drills: TechniqueSuggestedDrill[]; exercises: TechniqueSuggestedExercise[] }
> = {
  setup_consistency: {
    drills: [
      {
        title: "Empty-bar setup holds",
        note: "Set, breathe, hold 3 seconds before each pull — same foot and grip every rep.",
      },
      {
        title: "Camera-check setups",
        note: "Film 5 setups only (no pull). Match hip height frame-to-frame.",
      },
    ],
    exercises: [
      {
        title: "Romanian deadlift",
        slug: "romanian-deadlift",
        note: "Practice a repeatable hinge without floor-pull complexity.",
      },
    ],
  },
  start_position: {
    drills: [
      {
        title: "Paused start",
        note: "Pull slack, pause 1 second on the floor, then leave — no yank.",
      },
      {
        title: "Shin-to-bar contact check",
        note: "Side-view: bar over mid-foot, shins close before the bar moves.",
      },
    ],
    exercises: [
      {
        title: "Paused deadlift off the floor",
        note: "Builds patience in the start position under tension.",
      },
      {
        title: "Trap-bar deadlift",
        note: "Often easier to find a solid start for some lifters.",
      },
    ],
  },
  bracing_indicators: {
    drills: [
      {
        title: "Breath-brace before pull",
        note: "Big breath into the belt line, brace, then pull — video cannot score this; practice deliberately.",
      },
    ],
    exercises: [],
  },
  bar_proximity: {
    drills: [
      {
        title: "Drag-the-bar cue",
        note: "Light contact up the shins/thighs on light sets (side view).",
      },
      {
        title: "Pause below the knee",
        note: "Pause with the bar close, then finish — feel the implement stay in.",
      },
    ],
    exercises: [
      {
        title: "Romanian deadlift",
        slug: "romanian-deadlift",
        note: "Reinforces keeping the load close through the hinge.",
      },
    ],
  },
  hip_rise_pattern: {
    drills: [
      {
        title: "Slow first pull",
        note: "3-second pull to the knee — hips and shoulders rise together in the frame.",
      },
    ],
    exercises: [
      {
        title: "Romanian deadlift",
        slug: "romanian-deadlift",
        note: "Teaches controlled hip hinge without early shoot from the floor.",
      },
      {
        title: "Paused deadlift off the floor",
        note: "Reduces rushing the hips off the floor.",
      },
    ],
  },
  back_angle_consistency: {
    drills: [
      {
        title: "Tempo conventional pulls",
        note: "Light load, steady torso angle on side-view replay — consistency practice, not a spine diagnosis.",
      },
      {
        title: "Wall hinge pattern",
        note: "Hinge to a wall target to feel a repeatable torso set.",
      },
    ],
    exercises: [
      {
        title: "Romanian deadlift",
        slug: "romanian-deadlift",
        note: "Controlled hinge with a stable torso set.",
      },
    ],
  },
  lockout: {
    drills: [
      {
        title: "Stand tall finishes",
        note: "Light lockouts: hips through, ribs down — no lean-back chase.",
      },
    ],
    exercises: [
      {
        title: "Hip thrust",
        slug: "hip-thrust",
        note: "Supports strong hip extension without loading the floor pull.",
      },
      {
        title: "Block / rack pull",
        note: "Practice stacked finishes in a shortened range when appropriate.",
      },
    ],
  },
  rep_consistency: {
    drills: [
      {
        title: "Reset every rep",
        note: "Film 3 reset reps — same setup each time before the bar leaves.",
      },
    ],
    exercises: [
      {
        title: "Touch-and-go deadlift",
        note: "Only after reset consistency is solid — different fatigue pattern.",
      },
    ],
  },
};

/**
 * Explicit exercise ↔ technique-issue links from COMPONENT_DRILLS (slug required).
 * Used by the Exercise Relationship Graph — never invents pairs.
 */
export function explicitTechniqueExerciseLinks(): Array<{
  techniqueIssueId: DeadliftTechniqueComponentId;
  exerciseSlug: string;
  note: string;
}> {
  const out: Array<{
    techniqueIssueId: DeadliftTechniqueComponentId;
    exerciseSlug: string;
    note: string;
  }> = [];
  for (const [issueId, pack] of Object.entries(COMPONENT_DRILLS) as Array<
    [
      DeadliftTechniqueComponentId,
      (typeof COMPONENT_DRILLS)[DeadliftTechniqueComponentId],
    ]
  >) {
    for (const exercise of pack.exercises) {
      if (!exercise.slug) continue;
      out.push({
        techniqueIssueId: issueId,
        exerciseSlug: exercise.slug,
        note: exercise.note,
      });
    }
  }
  return out;
}

/**
 * Prioritize at most 3 improvement actions from the assessment.
 * Prefers weakest observed components over a long warning list.
 */
export function prioritizeTechniqueActions(
  assessment: DeadliftTechniqueAssessment | null | undefined,
): TechniqueReportAction[] {
  if (!assessment) return [];

  const weak = assessment.components
    .filter((c) => c.status === "observed" && c.score != null)
    .sort((a, b) => (a.score as number) - (b.score as number))
    .slice(0, TECHNIQUE_REPORT_MAX_ACTIONS);

  const actions: TechniqueReportAction[] = weak.map((c, index) => ({
    id: c.id,
    title: c.label,
    detail: c.evidence,
    componentId: c.id,
    priority: index + 1,
  }));

  if (actions.length === 0 && assessment.keyIssue) {
    actions.push({
      id: "key-issue",
      title: "Main limitation",
      detail: assessment.keyIssue,
      priority: 1,
    });
  }

  return actions.slice(0, TECHNIQUE_REPORT_MAX_ACTIONS);
}

export function suggestionsForActions(
  actions: TechniqueReportAction[],
): {
  drills: TechniqueSuggestedDrill[];
  exercises: TechniqueSuggestedExercise[];
} {
  const drills: TechniqueSuggestedDrill[] = [];
  const exercises: TechniqueSuggestedExercise[] = [];
  const seenDrill = new Set<string>();
  const seenExercise = new Set<string>();

  for (const action of actions) {
    if (!action.componentId) continue;
    const pack = COMPONENT_DRILLS[action.componentId];
    for (const drill of pack.drills) {
      if (seenDrill.has(drill.title)) continue;
      seenDrill.add(drill.title);
      drills.push(drill);
    }
    for (const exercise of pack.exercises) {
      const key = exercise.slug ?? exercise.title;
      if (seenExercise.has(key)) continue;
      seenExercise.add(key);
      exercises.push(exercise);
    }
  }

  return {
    drills: drills.slice(0, TECHNIQUE_REPORT_MAX_ACTIONS),
    exercises: exercises.slice(0, TECHNIQUE_REPORT_MAX_ACTIONS),
  };
}

export function buildTimelineMarkers(
  report: MovementReport | null | undefined,
): TechniqueTimelineMarker[] {
  if (!report?.phases?.length) return [];
  return report.phases
    .filter((p) => p.phase !== "unknown")
    .map((phase, index) => ({
      id: `${phase.phase}-${phase.startFrame}-${index}`,
      label: phaseLabel(phase.phase),
      timeSeconds: phase.startTimeSeconds,
      endTimeSeconds: phase.endTimeSeconds,
      phase: phase.phase,
      confidence: phase.confidence,
    }));
}

export function buildPhaseInsights(
  report: MovementReport | null | undefined,
): LiftPhaseInsight[] {
  return buildLiftPhaseAnalysis(report).insights;
}

export { buildLiftPhaseAnalysis };

function phaseLabel(phase: MovementPhaseSegment["phase"]): string {
  return LIFT_PHASE_LABELS[phase] ?? "Phase";
}

export function buildComparisonSummary(input: {
  previous: {
    id: string;
    createdAt: Date;
    overallScore: number | null;
    confidenceBasis: string | null;
    movementReport: MovementReport | null;
  } | null;
  currentId: string;
  currentScore: number | null;
  currentConfidence: string | null;
}): TechniqueComparisonSummary | null {
  if (!input.previous) return null;
  const previousScore =
    input.previous.overallScore ??
    input.previous.movementReport?.overallTechniqueScore ??
    null;
  const previousConfidence =
    input.previous.movementReport?.techniqueAssessment?.confidence ??
    input.previous.confidenceBasis;

  const delta =
    previousScore != null && input.currentScore != null
      ? Math.round(input.currentScore - previousScore)
      : null;

  return {
    previousId: input.previous.id,
    previousCreatedAt: input.previous.createdAt,
    previousScore,
    currentId: input.currentId,
    currentScore: input.currentScore,
    delta,
    previousConfidence,
    currentConfidence: input.currentConfidence,
  };
}

/** Positive findings capped for report UX. */
export function topPositiveFindings(
  assessment: DeadliftTechniqueAssessment | null | undefined,
  limit = TECHNIQUE_REPORT_MAX_ACTIONS,
): string[] {
  if (!assessment) return [];
  if (assessment.positiveFindings.length > 0) {
    return assessment.positiveFindings.slice(0, limit);
  }
  return assessment.components
    .filter((c) => c.status === "observed" && (c.score ?? 0) >= 75)
    .sort((a, b) => (b.score as number) - (a.score as number))
    .slice(0, limit)
    .map((c) => `${c.label}: ${c.score}/100`);
}
