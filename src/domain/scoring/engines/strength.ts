/**
 * Strength Score engine — delegates to the Prompt 12 strength module.
 */
export {
  analyzeStrength,
  computeStrengthScore,
} from "@/domain/scoring/strength/analyze";
export type {
  StrengthAssessment,
  StrengthLiftBreakdown,
  StrengthTrend,
} from "@/domain/scoring/strength/analyze";
