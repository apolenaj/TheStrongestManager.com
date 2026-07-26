export {
  analyzeStrength,
  computeStrengthScore,
} from "@/domain/scoring/strength/analyze";
export type {
  StrengthAssessment,
  StrengthLiftBreakdown,
  StrengthTrend,
} from "@/domain/scoring/strength/analyze";
export {
  estimate1rmKg,
  resolveLiftEffort,
} from "@/domain/scoring/strength/e1rm";
export type {
  ResolvedEffort,
  StrengthEvidenceLabel,
} from "@/domain/scoring/strength/e1rm";
export {
  contextScoreFromRatio,
  experienceContextLabel,
  normalizeExperienceContext,
  normalizeSportContext,
  referenceMultiple,
} from "@/domain/scoring/strength/context";
export type {
  ExperienceContext,
  SportContext,
} from "@/domain/scoring/strength/context";
