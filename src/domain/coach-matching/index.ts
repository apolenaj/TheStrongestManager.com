export {
  MATCH_GOALS,
  MATCH_SPORTS,
  MATCH_EXPERIENCE_LEVELS,
  MATCH_COACHING_STYLES,
  MATCH_GOAL_LABELS,
  MATCH_SPORT_LABELS,
  MATCH_EXPERIENCE_LABELS,
  MATCH_STYLE_LABELS,
  COACH_MATCHING_HONESTY,
  SPONSORED_LABEL,
} from "@/domain/coach-matching/constants";
export type {
  MatchGoal,
  MatchSport,
  MatchExperienceLevel,
  MatchCoachingStyle,
} from "@/domain/coach-matching/constants";

export {
  scoreCoachMatch,
  rankOrganicMatches,
  rankSponsoredMatches,
  buildMatchExplanation,
} from "@/domain/coach-matching/match";
export type {
  CoachMatchPreferences,
  CoachMatchCandidate,
  MatchReason,
  CoachMatchResult,
} from "@/domain/coach-matching/match";
