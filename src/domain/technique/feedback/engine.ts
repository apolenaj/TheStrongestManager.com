import type { DeadliftTechniqueAssessment } from "@/domain/movement/deadlift/score/types";
import type { DeadliftTechniqueComponentId } from "@/domain/movement/deadlift/score/thresholds";
import {
  FEEDBACK_ADVANCED_DOSAGE,
  FEEDBACK_BEGINNER_DOSAGE,
  FEEDBACK_INTERMEDIATE_DOSAGE,
  FEEDBACK_LOW_CONFIDENCE_MESSAGE,
  FEEDBACK_MAX_RECOMMENDATIONS,
  FEEDBACK_MIN_ASSESSMENT_CONFIDENCE_FOR_PROGRESSIONS,
  FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
  FEEDBACK_PAIN_FLAG_DOSAGE,
  FEEDBACK_SIGNIFICANT_SCORE_MAX,
} from "@/domain/technique/feedback/thresholds";
import { ruleForComponent } from "@/domain/technique/feedback/rules";
import {
  confidenceAtLeast,
  type ExperienceLevel,
  type FeedbackRuleTemplate,
  type TechniqueFeedbackAthleteContext,
  type TechniqueFeedbackRecommendation,
  type TechniqueFeedbackResult,
} from "@/domain/technique/feedback/types";

function weakestObservedComponents(
  assessment: DeadliftTechniqueAssessment,
  limit: number,
): Array<{
  componentId: DeadliftTechniqueComponentId;
  label: string;
  score: number;
  confidence: DeadliftTechniqueAssessment["confidence"];
  priority: number;
}> {
  return assessment.components
    .filter((c) => c.status === "observed" && c.score != null)
    .sort((a, b) => (a.score as number) - (b.score as number))
    .slice(0, limit)
    .map((c, index) => ({
      componentId: c.id,
      label: c.label,
      score: c.score as number,
      confidence: c.confidence,
      priority: index + 1,
    }));
}

function dosageFor(
  level: ExperienceLevel | null,
  hasPainFlags: boolean,
): string {
  if (hasPainFlags) return FEEDBACK_PAIN_FLAG_DOSAGE;
  if (level === "beginner" || level == null) return FEEDBACK_BEGINNER_DOSAGE;
  if (level === "intermediate") return FEEDBACK_INTERMEDIATE_DOSAGE;
  return FEEDBACK_ADVANCED_DOSAGE;
}

function isCompetitionOriented(ctx: TechniqueFeedbackAthleteContext): boolean {
  const goal = (ctx.goalCategory ?? "").toLowerCase();
  const discipline = (ctx.primaryDiscipline ?? "").toLowerCase();
  return (
    goal.includes("powerlift") ||
    goal.includes("strongman") ||
    goal === "strength" ||
    discipline === "powerlifting" ||
    discipline === "strongman" ||
    discipline === "weightlifting"
  );
}

function isGeneralOriented(ctx: TechniqueFeedbackAthleteContext): boolean {
  const goal = (ctx.goalCategory ?? "").toLowerCase();
  return (
    goal.includes("general") ||
    goal.includes("recomp") ||
    goal.includes("fitness") ||
    goal.includes("muscle")
  );
}

function fillWhy(
  template: string,
  vars: {
    score: number;
    confidence: string;
    issue: string;
  },
): string {
  return template
    .replaceAll("{score}", String(vars.score))
    .replaceAll("{confidence}", vars.confidence)
    .replaceAll("{issue}", vars.issue)
    .replaceAll("{significantMax}", String(FEEDBACK_SIGNIFICANT_SCORE_MAX));
}

function templateAllowed(
  template: FeedbackRuleTemplate,
  ctx: TechniqueFeedbackAthleteContext,
  componentScore: number,
): boolean {
  if (
    template.requiresSignificantIssue &&
    componentScore > FEEDBACK_SIGNIFICANT_SCORE_MAX
  ) {
    return false;
  }
  if (template.blockWhenPainFlags && ctx.hasPainOrMovementFlags) {
    return false;
  }
  if (
    template.advancedOnly &&
    (ctx.experienceLevel === "beginner" ||
      ctx.experienceLevel === "intermediate" ||
      ctx.experienceLevel == null)
  ) {
    return false;
  }
  if (template.competitionBias && !isCompetitionOriented(ctx)) {
    // Still allow if not general-only; soft preference later via sort
  }
  if (template.generalBias && isCompetitionOriented(ctx) && !isGeneralOriented(ctx)) {
    // Prefer other templates when competition-focused; don't hard-block
  }
  return true;
}

function templatePreference(
  template: FeedbackRuleTemplate,
  ctx: TechniqueFeedbackAthleteContext,
): number {
  let score = 0;
  if (template.competitionBias && isCompetitionOriented(ctx)) score += 2;
  if (template.generalBias && isGeneralOriented(ctx)) score += 2;
  if (template.kind === "setup_cue") score += 1; // always useful, low risk
  if (template.kind === "load_management" && ctx.hasPainOrMovementFlags) {
    score -= 5; // blocked elsewhere; keep low
  }
  if (ctx.experienceLevel === "beginner" && template.kind === "position_drill") {
    score += 2;
  }
  if (
    (ctx.experienceLevel === "advanced" || ctx.experienceLevel === "elite") &&
    template.kind === "exercise_variation"
  ) {
    score += 1;
  }
  return score;
}

function buildCautionRecommendation(): TechniqueFeedbackRecommendation {
  return {
    id: "caution.movement_notes",
    kind: "caution",
    title: "Respect movement cautions",
    why: "Your profile includes movement notes / cautions. Technique advice must stay conservative — this is not a diagnosis or clearance to train through pain.",
    how: "Use empty-bar or pain-free technique loads only. Skip aggressive variations (deficit, heavy paused pulls) until a qualified professional clears your plan.",
    dosage: FEEDBACK_PAIN_FLAG_DOSAGE,
    reassess:
      "Reassess after clearance from a qualified professional, or sooner if symptoms change. Re-film only when you can practice pain-free.",
    relatedComponentId: null,
    relatedComponentLabel: null,
    priority: 0,
    caveats: [
      "Not medical advice.",
      "Pain flags come from your profile notes, not from video diagnosis.",
    ],
  };
}

function buildLowConfidenceRecommendation(): TechniqueFeedbackRecommendation {
  return {
    id: "reassess.low_confidence",
    kind: "reassess",
    title: "Re-film before prescribing drills",
    why: FEEDBACK_LOW_CONFIDENCE_MESSAGE,
    how: "Use a clear side view, full body in frame, bright lighting. Run movement analysis again.",
    dosage: "No new hard technique block until confidence improves — one clean filmed set is enough.",
    reassess: "Re-analyze immediately after a better clip. Do not invent drills from low-confidence observations.",
    relatedComponentId: null,
    relatedComponentLabel: null,
    priority: 1,
    caveats: ["Prescription withheld due to confidence gates."],
  };
}

export type RunTechniqueFeedbackInput = {
  assessment: DeadliftTechniqueAssessment | null | undefined;
  athlete: TechniqueFeedbackAthleteContext | null;
};

/**
 * Rule-based technique feedback engine.
 * Does not prescribe blindly: confidence, pain flags, level, and goal gate output.
 */
export function runTechniqueFeedbackEngine(
  input: RunTechniqueFeedbackInput,
): TechniqueFeedbackResult {
  const withheldReasons: string[] = [];
  const ctx: TechniqueFeedbackAthleteContext = input.athlete ?? {
    experienceLevel: null,
    goalCategory: null,
    goalTitle: null,
    primaryDiscipline: null,
    hasPainOrMovementFlags: false,
    painCautionAcknowledged: false,
  };

  const assessment = input.assessment;
  if (!assessment) {
    return {
      recommendations: [],
      withheldReasons: ["No technique assessment available yet."],
      athleteContextApplied: Boolean(input.athlete),
    };
  }

  if (
    !confidenceAtLeast(
      assessment.confidence,
      FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    )
  ) {
    withheldReasons.push(
      `Assessment confidence is “${assessment.confidence}” — below “${FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION}” required for drill prescription.`,
    );
    return {
      recommendations: [buildLowConfidenceRecommendation()],
      withheldReasons,
      athleteContextApplied: Boolean(input.athlete),
    };
  }

  const priorities = weakestObservedComponents(
    assessment,
    FEEDBACK_MAX_RECOMMENDATIONS,
  );
  const recommendations: TechniqueFeedbackRecommendation[] = [];

  if (ctx.hasPainOrMovementFlags) {
    recommendations.push(buildCautionRecommendation());
    withheldReasons.push(
      "Pain / movement notes present — load-management prescriptions that increase demand were blocked.",
    );
  }

  for (const action of priorities) {
    const component = assessment.components.find(
      (c) => c.id === action.componentId,
    );
    if (!component || component.status !== "observed" || component.score == null) {
      continue;
    }

    const rule = ruleForComponent(action.componentId);
    if (!rule) continue;

    if (component.score > rule.maxScoreInclusive) {
      continue;
    }

    if (!confidenceAtLeast(component.confidence, rule.minConfidence)) {
      withheldReasons.push(
        `${component.label}: component confidence “${component.confidence}” is below rule minimum “${rule.minConfidence}”.`,
      );
      continue;
    }

    const candidates = rule.templates
      .filter((t) => templateAllowed(t, ctx, component.score as number))
      .sort(
        (a, b) => templatePreference(b, ctx) - templatePreference(a, ctx),
      );

    const chosen = candidates[0];
    if (!chosen) {
      withheldReasons.push(
        `${component.label}: no templates passed athlete gates (level/pain/goal).`,
      );
      continue;
    }

    if (
      (chosen.kind === "exercise_variation" || chosen.kind === "tempo_work") &&
      !confidenceAtLeast(
        assessment.confidence,
        FEEDBACK_MIN_ASSESSMENT_CONFIDENCE_FOR_PROGRESSIONS,
      )
    ) {
      withheldReasons.push(
        `${chosen.title}: withheld — assessment confidence too low for progressions.`,
      );
      continue;
    }

    const caveats: string[] = [
      "Image-plane coaching advice — not joint force or injury diagnosis.",
    ];
    if (ctx.experienceLevel) {
      caveats.push(`Dosage adapted for ${ctx.experienceLevel} training level.`);
    } else {
      caveats.push("Training level unknown — beginner-conservative dosage used.");
    }
    if (ctx.goalCategory) {
      caveats.push(`Goal context: ${ctx.goalTitle ?? ctx.goalCategory}.`);
    }

    recommendations.push({
      id: `${chosen.id}.${component.id}`,
      kind: chosen.kind,
      title: chosen.title,
      why: fillWhy(chosen.whyTemplate, {
        score: component.score,
        confidence: component.confidence,
        issue: rule.issueLabel,
      }),
      how: chosen.how,
      dosage: dosageFor(ctx.experienceLevel, ctx.hasPainOrMovementFlags),
      reassess: chosen.reassess,
      relatedComponentId: component.id as DeadliftTechniqueComponentId,
      relatedComponentLabel: component.label,
      exerciseSlug: chosen.exerciseSlug,
      priority: action.priority,
      caveats,
    });
  }

  // Cap: prefer caution first, then by priority, unique titles.
  const seen = new Set<string>();
  const capped: TechniqueFeedbackRecommendation[] = [];
  for (const rec of recommendations.sort((a, b) => a.priority - b.priority)) {
    if (seen.has(rec.title)) continue;
    seen.add(rec.title);
    capped.push({ ...rec, priority: capped.length + 1 });
    if (capped.length >= FEEDBACK_MAX_RECOMMENDATIONS) break;
  }

  if (capped.length === 0 && withheldReasons.length === 0) {
    withheldReasons.push(
      "No component issues met score + confidence thresholds for prescription.",
    );
  }

  return {
    recommendations: capped,
    withheldReasons,
    athleteContextApplied: Boolean(input.athlete),
  };
}
