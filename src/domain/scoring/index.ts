export {
  displayableScore,
  isConfidenceDisplayable,
  DISPLAYABLE_CONFIDENCE,
  minConfidence,
  confidenceRank,
} from "@/domain/scoring/confidence";
export { SCORE_DEFINITIONS, SCORE_DEFINITION_LIST } from "@/domain/scoring/definitions";
export { computeAthleteScores } from "@/domain/scoring/compute";
export type { AthleteScoreSet } from "@/domain/scoring/compute";
export * from "@/domain/scoring/thresholds";
export {
  analyzeStrength,
  computeStrengthScore,
  estimate1rmKg,
  resolveLiftEffort,
  experienceContextLabel,
  normalizeExperienceContext,
  normalizeSportContext,
} from "@/domain/scoring/strength";
export type {
  StrengthAssessment,
  StrengthLiftBreakdown,
  StrengthTrend,
  StrengthEvidenceLabel,
  ExperienceContext,
  SportContext,
} from "@/domain/scoring/strength";
export type {
  ScoreKey,
  ConfidenceLevel,
  ScoreResult,
  ScoreDefinition,
  ScoreInputRecord,
  ScoreReasoning,
  ScoringSnapshot,
  LiftSample,
  TechniqueSample,
  RecoverySample,
  SessionSample,
  InputSourceKind,
} from "@/domain/scoring/types";
