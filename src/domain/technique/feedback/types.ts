import type { DeadliftTechniqueComponentId } from "@/domain/movement/deadlift/score/thresholds";
import type { ConfidenceLevel } from "@/domain/movement/types";

export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "elite";

export type FeedbackRecommendationKind =
  | "position_drill"
  | "exercise_variation"
  | "tempo_work"
  | "load_management"
  | "setup_cue"
  | "reassess"
  | "caution";

export type TechniqueFeedbackAthleteContext = {
  experienceLevel: ExperienceLevel | null;
  /** Goal.category from active goal (e.g. strength, powerlifting, general_fitness). */
  goalCategory: string | null;
  goalTitle: string | null;
  primaryDiscipline: string | null;
  /**
   * True when the athlete recorded movement cautions / notes.
   * Used as a soft pain/caution flag — not a medical diagnosis.
   */
  hasPainOrMovementFlags: boolean;
  /** True when onboarding pain caution was acknowledged (disclaimer). */
  painCautionAcknowledged: boolean;
};

export type TechniqueFeedbackRecommendation = {
  id: string;
  kind: FeedbackRecommendationKind;
  title: string;
  /** Why this recommendation fired (tied to observation + gates). */
  why: string;
  /** How to perform / apply it. */
  how: string;
  /** Suggested dosage adapted to level / pain flags. */
  dosage: string;
  /** When to reassess / re-film. */
  reassess: string;
  relatedComponentId: DeadliftTechniqueComponentId | null;
  relatedComponentLabel: string | null;
  exerciseSlug?: string;
  priority: number;
  caveats: string[];
};

export type TechniqueFeedbackResult = {
  recommendations: TechniqueFeedbackRecommendation[];
  /** Gates / refusals explained honestly. */
  withheldReasons: string[];
  athleteContextApplied: boolean;
};

export type FeedbackRuleTemplate = {
  id: string;
  kind: FeedbackRecommendationKind;
  title: string;
  whyTemplate: string;
  how: string;
  reassess: string;
  exerciseSlug?: string;
  /** Skip for beginners when true (e.g. deficit-style intensity). */
  advancedOnly?: boolean;
  /** Prefer when goal/discipline is competition-oriented. */
  competitionBias?: boolean;
  /** Prefer when goal is general fitness / recomp. */
  generalBias?: boolean;
  /** Never prescribe when pain/movement flags are set. */
  blockWhenPainFlags?: boolean;
  /** Only when component score ≤ significant band. */
  requiresSignificantIssue?: boolean;
};

export type FeedbackComponentRule = {
  componentId: DeadliftTechniqueComponentId;
  /** Human label for templates. */
  issueLabel: string;
  /** Max score (inclusive) to consider the component an issue. */
  maxScoreInclusive: number;
  minConfidence: ConfidenceLevel;
  templates: FeedbackRuleTemplate[];
};

export const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

export function confidenceAtLeast(
  actual: ConfidenceLevel,
  minimum: ConfidenceLevel,
): boolean {
  return CONFIDENCE_RANK[actual] >= CONFIDENCE_RANK[minimum];
}
