export {
  TRAINING_CONSISTENCY_ENGINE_VERSION,
  TRAINING_CONSISTENCY_HONESTY,
  TCI_MIN_RESOLVED_PLAN_DAYS,
  TCI_DEFAULT_WINDOW_DAYS,
  TCI_DELOAD_CONTEXT_DAYS,
  TCI_PROGRAM_CHANGE_CONTEXT_DAYS,
  TCI_INJURY_BREAK_MIN_SKIPPED_DAYS,
  TCI_CONTEXT_KINDS,
  TCI_CONTEXT_LABELS,
  TCI_DAY_OUTCOMES,
  type TciContextKind,
  type TciDayOutcome,
} from "@/domain/training-consistency-intelligence/constants";

export type {
  PlanDayExpectation,
  ConsistencyContextWindow,
  ConsistencySessionPoint,
  ConsistencyPlanDay,
  ConsistencyDayResult,
  TrainingConsistencyAnalysis,
} from "@/domain/training-consistency-intelligence/types";

export {
  canPublishTrainingConsistency,
  insufficientPlanHistoryReason,
} from "@/domain/training-consistency-intelligence/gate";

export {
  buildDeloadContexts,
  buildProgramChangeContexts,
  buildInjuryBreakContexts,
  contextsForDay,
} from "@/domain/training-consistency-intelligence/contexts";

export {
  isoWeekday,
  eachDayKey,
  buildPlanDaysFromTemplate,
  templateDayIsDeloadWeek,
  type ProgramTemplateDay,
} from "@/domain/training-consistency-intelligence/plan";

export { analyzeTrainingConsistency } from "@/domain/training-consistency-intelligence/analyze";
