export {
  runTechniqueFeedbackEngine,
  type RunTechniqueFeedbackInput,
} from "@/domain/technique/feedback/engine";
export {
  DEADLIFT_FEEDBACK_RULES,
  ruleForComponent,
} from "@/domain/technique/feedback/rules";
export {
  FEEDBACK_ISSUE_SCORE_MAX,
  FEEDBACK_MAX_RECOMMENDATIONS,
  FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
  FEEDBACK_SIGNIFICANT_SCORE_MAX,
} from "@/domain/technique/feedback/thresholds";
export type {
  ExperienceLevel,
  FeedbackRecommendationKind,
  TechniqueFeedbackAthleteContext,
  TechniqueFeedbackRecommendation,
  TechniqueFeedbackResult,
} from "@/domain/technique/feedback/types";
export { confidenceAtLeast } from "@/domain/technique/feedback/types";
