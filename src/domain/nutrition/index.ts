export {
  MEALNEXIO_SITE_URL,
  NUTRITION_CONNECTION_STATUS_LABELS,
  NUTRITION_HONESTY,
  NUTRITION_SHARED_DATA_KINDS,
  NUTRITION_SHARED_DATA_LABELS,
} from "@/domain/nutrition/types";
export type {
  NutritionConnectionStatus,
  NutritionDailySummary,
  NutritionDailyTargets,
  NutritionMacros,
  NutritionProviderConnection,
  NutritionSharedDataKind,
} from "@/domain/nutrition/types";
export {
  getActiveNutritionProvider,
  listNutritionProviders,
  registerNutritionProvider,
  resetNutritionProvidersForTests,
  unavailableMealnexioAdapter,
} from "@/domain/nutrition/provider";
export type { NutritionProviderAdapter } from "@/domain/nutrition/provider";
