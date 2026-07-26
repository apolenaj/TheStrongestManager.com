export {
  ATHLETE_LEVEL_IDS,
  ATHLETE_LEVEL_FACTORS,
  LEVEL_LABELS,
  LEVEL_DESCRIPTIONS,
  FACTOR_LABELS,
  ATHLETE_LEVEL_EXCLUDED_SIGNALS,
  ATHLETE_LEVEL_HONESTY,
  isAthleteLevelId,
} from "@/domain/athlete-level/constants";
export type {
  AthleteLevelId,
  AthleteLevelFactorId,
} from "@/domain/athlete-level/constants";

export {
  SPORT_STRENGTH_CLASS_SYSTEMS,
  SPORT_STRENGTH_CLASS_BOUNDARY,
  sportStrengthClassPlaceholder,
} from "@/domain/athlete-level/sport-strength";
export type {
  SportStrengthClassSystem,
  SportStrengthClassification,
} from "@/domain/athlete-level/sport-strength";

export {
  scoreConsistency,
  scoreKnowledge,
  scoreTechnique,
  scoreTrainingHistory,
  scoreProgress,
  scoreAllFactors,
  compositeFromFactors,
  evaluateEliteEligibility,
  levelFromComposite,
  resolveAthleteLevel,
} from "@/domain/athlete-level/resolve";
export type {
  AthleteLevelEvidence,
  FactorScore,
  AthleteLevelResult,
} from "@/domain/athlete-level/resolve";
