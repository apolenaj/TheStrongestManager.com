export {
  CALCULATOR_SUITE_ENGINE_VERSION,
  CALCULATOR_SUITE_HONESTY,
  CALCULATOR_SUITE_MIN_OVERVIEW,
  CALCULATOR_SUITE_MIN_PRODUCT_LINKS,
} from "@/domain/calculator-suite/constants";
export type {
  CalculatorId,
  CalculatorDefinition,
  CalculatorProductLink,
  CalculatorFaq,
} from "@/domain/calculator-suite/constants";

export {
  CALCULATOR_DEFINITIONS,
  getCalculatorDefinition,
  allCalculatorSlugs,
} from "@/domain/calculator-suite/catalog";

export {
  evaluateCalculatorQuality,
} from "@/domain/calculator-suite/quality";
export type {
  CalculatorQualityCheck,
  CalculatorQualityResult,
} from "@/domain/calculator-suite/quality";

export {
  buildCalculatorSuiteSnapshot,
  listIndexableCalculatorPaths,
  type CalculatorSuiteSnapshot,
} from "@/domain/calculator-suite/snapshot";

export {
  computeEstimated1rm,
  estimated1rmRefusalReason,
} from "@/domain/calculator-suite/formulas/estimated-1rm";
export {
  computePlateLoading,
  plateCalculatorRefusalReason,
  DEFAULT_BAR_KG,
  DEFAULT_PLATE_DENOMINATIONS_KG,
} from "@/domain/calculator-suite/formulas/plates";
export {
  computeDots,
  dotsRefusalReason,
  DOTS_CITATION,
  DOTS_COEFFICIENTS,
  DOTS_BODYWEIGHT_CLAMP_KG,
} from "@/domain/calculator-suite/formulas/dots";
export type { DotsSex } from "@/domain/calculator-suite/formulas/dots";
export {
  computeVolume,
  computeSetTonnageKg,
} from "@/domain/calculator-suite/formulas/volume";
export {
  computeAttemptPlan,
  attemptPlannerRefusalReason,
} from "@/domain/calculator-suite/formulas/attempt-planner";
export {
  computeTrainingMax,
  trainingMaxRefusalReason,
  DEFAULT_TRAINING_MAX_FRACTION,
} from "@/domain/calculator-suite/formulas/training-max";
