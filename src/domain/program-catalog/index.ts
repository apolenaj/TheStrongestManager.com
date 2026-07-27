export {
  PROGRAM_CATALOG_ENGINE_VERSION,
  PROGRAM_CATALOG_GOALS,
  PROGRAM_CATALOG_EXPERIENCE,
  PROGRAM_CATALOG_SCHEDULES,
  PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE,
  PROGRAM_CATALOG_SEED,
  isProgramCatalogGoal,
  isProgramCatalogExperience,
  isProgramCatalogSchedule,
  seedDefinitionBySlug,
  slugsMatchingGoal,
  type ProgramCatalogGoal,
  type ProgramCatalogExperience,
  type ProgramCatalogSchedule,
  type ProgramCatalogVariant,
  type ProgramCatalogSeedDefinition,
} from "@/domain/program-catalog/catalog";

export {
  toPublicProgramProduct,
  toEntitledProgramProduct,
  type PublicProgramProduct,
  type PublicProgramDetail,
  type PublicProgramVersionSummary,
  type PublicEntitlement,
} from "@/domain/program-catalog/public";

export {
  getProgramFamilyContent,
  PROGRAM_FAMILY_CONTENT,
  type ProgramFamilyContent,
  type ProgramStructurePhase,
} from "@/domain/program-catalog/content";

export {
  formatProgramPriceGbp,
  formatRecoveryDemand,
  formatScheduleLabel,
  formatGoalLabel,
  formatMethodLabel,
} from "@/domain/program-catalog/format";
