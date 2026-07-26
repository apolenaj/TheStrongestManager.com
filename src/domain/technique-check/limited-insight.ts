/**
 * Build limited free-check insight from a full movement report.
 * Never invent scores; withhold full breakdown for signup.
 */

import { LIFT_PHASE_LABELS } from "@/domain/movement/phases/constants";
import type { MovementReport } from "@/domain/movement/types";
import { prioritizeTechniqueActions } from "@/domain/technique/report-presentation";
import {
  TECHNIQUE_CHECK_LOCKED_SECTIONS,
  TECHNIQUE_CHECK_MAX_INSIGHTS,
  TECHNIQUE_CHECK_MAX_PHASE_PREVIEW,
  TECHNIQUE_CHECK_PRIVACY_COPY,
  type TechniqueCheckEvidenceLabel,
} from "@/domain/technique-check/constants";

export type LimitedInsightBullet = {
  id: string;
  title: string;
  detail: string;
  evidence: TechniqueCheckEvidenceLabel;
};

export type LimitedTechniqueInsight = {
  exerciseSlug: string;
  supportedExercise: boolean;
  summary: string;
  camera: {
    suitable: boolean;
    message: string;
    evidence: "observed";
  };
  phasePreview: Array<{
    phase: string;
    label: string;
    confidence: string;
  }>;
  bullets: LimitedInsightBullet[];
  /**
   * Score number may be shown as limited value when the scorer produced one.
   * Full component table stays locked.
   */
  score: {
    value: number | null;
    confidence: string | null;
    shown: boolean;
    lockedBreakdown: true;
  };
  lockedSections: readonly string[];
  disclaimers: string[];
  privacyNote: string;
  pipelineVersion: string;
};

function phaseLabel(phase: string): string {
  return (
    (LIFT_PHASE_LABELS as Record<string, string>)[phase] ??
    phase.replace(/_/g, " ")
  );
}

/**
 * Reduce a MovementReport to what guests may see before signup.
 */
export function buildLimitedTechniqueInsight(
  report: MovementReport,
): LimitedTechniqueInsight {
  const bullets: LimitedInsightBullet[] = [];

  bullets.push({
    id: "camera",
    title: report.cameraSuitability.suitable
      ? "Camera angle usable"
      : "Camera angle limits analysis",
    detail: report.cameraSuitability.message,
    evidence: "observed",
  });

  if (report.phases.length > 0) {
    bullets.push({
      id: "phases",
      title: `${report.phases.length} phase segment${report.phases.length === 1 ? "" : "s"} detected`,
      detail:
        "Phase boundaries come from 2D landmark motion — image-plane estimates, not force plates.",
      evidence: "estimated",
    });
  } else {
    bullets.push({
      id: "phases-missing",
      title: "Phases not segmented",
      detail:
        report.summary ||
        "Not enough visible landmarks to segment the lift confidently.",
      evidence: "observed",
    });
  }

  const actions = prioritizeTechniqueActions(report.techniqueAssessment);
  for (const action of actions.slice(0, 1)) {
    bullets.push({
      id: `cue-${action.id}`,
      title: action.title,
      detail: action.detail,
      evidence: "recommended",
    });
  }

  const trimmed = bullets.slice(0, TECHNIQUE_CHECK_MAX_INSIGHTS + 1);
  // Keep camera + up to MAX_INSIGHTS additional (phases/cue). Cap total.
  const capped = trimmed.slice(0, Math.max(2, TECHNIQUE_CHECK_MAX_INSIGHTS + 1));

  const phasePreview = report.phases
    .slice(0, TECHNIQUE_CHECK_MAX_PHASE_PREVIEW)
    .map((p) => ({
      phase: p.phase,
      label: phaseLabel(p.phase),
      confidence: p.confidence,
    }));

  const scoreValue = report.overallTechniqueScore;
  const scoreShown = scoreValue != null;

  let summary = report.summary;
  if (scoreShown) {
    summary = `Limited free check: Technique Score ${scoreValue}/100 is available from observable components. Full component breakdown unlocks after you save with an account.`;
  } else if (report.supportedExercise) {
    summary =
      report.techniqueAssessment?.keyIssue ??
      "Basic analysis ran. A Technique Score was withheld — insufficient observable components. Create an account to re-check with a better side-view clip and save reports.";
  }

  return {
    exerciseSlug: report.exerciseSlug,
    supportedExercise: report.supportedExercise,
    summary,
    camera: {
      suitable: report.cameraSuitability.suitable,
      message: report.cameraSuitability.message,
      evidence: "observed",
    },
    phasePreview,
    bullets: capped,
    score: {
      value: scoreValue,
      confidence: report.techniqueAssessment?.confidence ?? null,
      shown: scoreShown,
      lockedBreakdown: true,
    },
    lockedSections: TECHNIQUE_CHECK_LOCKED_SECTIONS,
    disclaimers: report.disclaimers.slice(0, 4),
    privacyNote: TECHNIQUE_CHECK_PRIVACY_COPY,
    pipelineVersion: report.pipelineVersion,
  };
}
