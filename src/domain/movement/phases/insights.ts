import type { ConfidenceLevel } from "@/domain/movement/types";
import type { MovementPhaseId } from "@/domain/movement/types";
import type {
  MovementPhaseSegment,
  MovementReport,
  ObservableMetric,
} from "@/domain/movement/types";
import {
  LIFT_PHASE_ANALYSIS_VERSION,
  LIFT_PHASE_HONESTY,
  LIFT_PHASE_LABELS,
  BENCH_PHASE_CATALOG,
  SQUAT_PHASE_CATALOG,
} from "@/domain/movement/phases/constants";

export type LiftPhaseInsight = {
  id: string;
  phase: MovementPhaseId;
  label: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  startFrame: number;
  endFrame: number;
  confidence: ConfidenceLevel;
  /** Short note about detection / what the segment represents. */
  detectionNote: string;
  metric: {
    key: string;
    label: string;
    display: string;
    confidence: ConfidenceLevel;
  } | null;
  issue: string | null;
  recommendation: string;
};

export type LiftPhaseAnalysisView = {
  version: string;
  exerciseSlug: string;
  phasesSupported: boolean;
  unavailableReason: string | null;
  catalogPhases: { id: MovementPhaseId; label: string; implemented: boolean }[];
  insights: LiftPhaseInsight[];
  honesty: readonly string[];
};

const PHASE_METRIC_PREFERENCE: Partial<
  Record<MovementPhaseId, string[]>
> = {
  setup: ["shoulder_hip_horizontal_offset", "shoulder_hip_vertical_relation"],
  initial_pull: [
    "approx_hip_y_pull_mean",
    "hip_rise_pattern",
    "torso_angle_consistency_deg",
  ],
  knee_level: ["wrist_hip_vertical_proxy", "approx_hip_y_pull_mean"],
  pull: [
    "approx_hip_y_pull_mean",
    "torso_angle_consistency_deg",
    "wrist_hip_vertical_proxy",
  ],
  lockout: ["lockout_hip_shoulder_dy"],
  descent: ["approx_hip_y_pull_mean"],
};

const PHASE_RECOMMENDATIONS: Partial<Record<MovementPhaseId, string>> = {
  setup:
    "Film a side-view setup hold: same foot and grip, brace, then leave the floor without yanking.",
  initial_pull:
    "Practice a slow first pull (2–3s to the knee) so hips and shoulders rise together in the frame.",
  knee_level:
    "Pause just below or at the knee on light sets — keep the bar close, then finish through lockout.",
  pull: "Re-film from the side with full legs visible so knee-level can be segmented; until then, tempo the first pull.",
  lockout:
    "Stand tall finishes on light lockouts: hips through, ribs down — compare block pulls if the finish stalls.",
  descent:
    "Lower under control after the finish; reset fully before the next rep if consistency matters.",
};

const PHASE_ISSUE_HINTS: Partial<Record<MovementPhaseId, string>> = {
  setup: "setup_consistency",
  initial_pull: "hip_rise_pattern",
  knee_level: "bar_proximity",
  pull: "hip_rise_pattern",
  lockout: "lockout",
};

/**
 * Build clickable phase insights from a MovementReport.
 * Empty insights when phases are unsupported or only `unknown`.
 */
export function buildLiftPhaseAnalysis(
  report: MovementReport | null | undefined,
): LiftPhaseAnalysisView {
  const honesty = LIFT_PHASE_HONESTY;
  if (!report) {
    return {
      version: LIFT_PHASE_ANALYSIS_VERSION,
      exerciseSlug: "",
      phasesSupported: false,
      unavailableReason: "Run movement analysis to detect lift phases.",
      catalogPhases: [],
      insights: [],
      honesty,
    };
  }

  const slug = report.exerciseSlug;
  const catalogPhases = catalogForExercise(slug);

  if (!report.supportedExercise) {
    return {
      version: LIFT_PHASE_ANALYSIS_VERSION,
      exerciseSlug: slug,
      phasesSupported: false,
      unavailableReason: phaseUnavailableMessage(slug),
      catalogPhases,
      insights: [],
      honesty,
    };
  }

  const usable = report.phases.filter((p) => p.phase !== "unknown");
  if (usable.length === 0) {
    return {
      version: LIFT_PHASE_ANALYSIS_VERSION,
      exerciseSlug: slug,
      phasesSupported: false,
      unavailableReason:
        report.phases[0]?.note ??
        "Phases could not be segmented confidently from this clip.",
      catalogPhases,
      insights: [],
      honesty,
    };
  }

  const insights = usable.map((segment, index) =>
    insightForSegment(segment, report, index),
  );

  return {
    version: LIFT_PHASE_ANALYSIS_VERSION,
    exerciseSlug: slug,
    phasesSupported: true,
    unavailableReason: null,
    catalogPhases,
    insights,
    honesty,
  };
}

function catalogForExercise(
  slug: string,
): LiftPhaseAnalysisView["catalogPhases"] {
  if (slug === "deadlift") {
    return [
      { id: "setup", label: LIFT_PHASE_LABELS.setup, implemented: true },
      {
        id: "initial_pull",
        label: LIFT_PHASE_LABELS.initial_pull,
        implemented: true,
      },
      {
        id: "knee_level",
        label: LIFT_PHASE_LABELS.knee_level,
        implemented: true,
      },
      { id: "lockout", label: LIFT_PHASE_LABELS.lockout, implemented: true },
    ];
  }
  if (
    slug === "back-squat" ||
    slug === "squat" ||
    slug.includes("squat")
  ) {
    return SQUAT_PHASE_CATALOG.map((id) => ({
      id,
      label: LIFT_PHASE_LABELS[id],
      implemented: false,
    }));
  }
  if (slug.includes("bench")) {
    return BENCH_PHASE_CATALOG.map((id) => ({
      id,
      label: LIFT_PHASE_LABELS[id],
      implemented: false,
    }));
  }
  return [];
}

function phaseUnavailableMessage(slug: string): string {
  if (slug.includes("squat")) {
    return "Squat phase detection is catalogued (setup → descent → bottom → sticking region → lockout) but not enabled until segmentation is reliable. Deadlift phases are available today.";
  }
  if (slug.includes("bench")) {
    return "Bench phase detection is catalogued (setup → descent → touch → initial press → mid-range → lockout) but not enabled until segmentation is reliable. Deadlift phases are available today.";
  }
  return `Phase analysis is not available for “${slug}” yet. Supported timeline: conventional deadlift.`;
}

function insightForSegment(
  segment: MovementPhaseSegment,
  report: MovementReport,
  index: number,
): LiftPhaseInsight {
  const metric = pickMetric(segment.phase, report.metrics);
  const issue = pickIssue(segment, report);
  const recommendation =
    PHASE_RECOMMENDATIONS[segment.phase] ??
    "Re-film from the side with the full body visible, then re-run movement analysis.";

  return {
    id: `${segment.phase}-${segment.startFrame}-${index}`,
    phase: segment.phase,
    label: LIFT_PHASE_LABELS[segment.phase],
    startTimeSeconds: segment.startTimeSeconds,
    endTimeSeconds: segment.endTimeSeconds,
    startFrame: segment.startFrame,
    endFrame: segment.endFrame,
    confidence: segment.confidence,
    detectionNote: segment.note,
    metric,
    issue,
    recommendation,
  };
}

function pickMetric(
  phase: MovementPhaseId,
  metrics: ObservableMetric[],
): LiftPhaseInsight["metric"] {
  const preferred = PHASE_METRIC_PREFERENCE[phase] ?? [];
  for (const key of preferred) {
    const m = metrics.find(
      (x) => x.key === key && x.value != null && x.confidence !== "none",
    );
    if (m) {
      return {
        key: m.key,
        label: m.label,
        display: formatMetric(m),
        confidence: m.confidence,
      };
    }
  }
  // Fall back to any metric tagged with this phase
  const tagged = metrics.find(
    (x) =>
      x.phase === phase && x.value != null && x.confidence !== "none",
  );
  if (tagged) {
    return {
      key: tagged.key,
      label: tagged.label,
      display: formatMetric(tagged),
      confidence: tagged.confidence,
    };
  }
  return null;
}

function formatMetric(m: ObservableMetric): string {
  const unit = m.unit ? ` ${m.unit}` : "";
  return `${m.value}${unit}`;
}

function pickIssue(
  segment: MovementPhaseSegment,
  report: MovementReport,
): string | null {
  const componentId = PHASE_ISSUE_HINTS[segment.phase];
  const assessment = report.techniqueAssessment;
  if (componentId && assessment) {
    const component = assessment.components.find((c) => c.id === componentId);
    if (
      component &&
      component.status === "observed" &&
      component.score != null &&
      component.score <= 55
    ) {
      return `${component.label}: ${component.evidence}`;
    }
  }

  // Heuristic tied to preferred metrics
  const preferred = PHASE_METRIC_PREFERENCE[segment.phase] ?? [];
  for (const h of report.heuristics) {
    if (h.confidence === "none" || h.confidence === "low") continue;
    if (h.relatedMetricKeys.some((k) => preferred.includes(k))) {
      return h.observation;
    }
  }

  return null;
}
