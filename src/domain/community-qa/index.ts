export {
  QA_CATEGORIES,
  QA_CATEGORY_LABELS,
  QA_QUESTION_STATUSES,
  QA_ANSWER_STATUSES,
  QA_ANSWER_AUTHORSHIP,
  QA_MODERATION_ACTIONS,
  QA_HONESTY,
  QA_AI_SUMMARY_LABEL,
  QA_AI_SUMMARY_DISCLAIMER,
  isQaCategory,
  isQaModerationAction,
  parseQaCategory,
} from "@/domain/community-qa/constants";
export type {
  QaCategory,
  QaQuestionStatus,
  QaAnswerStatus,
  QaAnswerAuthorship,
  QaModerationAction,
} from "@/domain/community-qa/constants";

export {
  normalizeVoteValue,
  applyVoteDelta,
  shouldShowExpertBadge,
  expertBadgeLabel,
  canAcceptAnswer,
} from "@/domain/community-qa/rules";
export type { VoteValue } from "@/domain/community-qa/rules";

export {
  buildDiscussionAiSummary,
  isHumanAnswerAuthorship,
} from "@/domain/community-qa/ai-summary";
export type {
  QaAiSummaryView,
  QaThreadForSummary,
} from "@/domain/community-qa/ai-summary";

export {
  nextQuestionStatusAfterModeration,
  nextAnswerStatusAfterModeration,
  isVisibleQuestionStatus,
  isVisibleAnswerStatus,
} from "@/domain/community-qa/moderation";
