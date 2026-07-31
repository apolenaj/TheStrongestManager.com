/**
 * Nutrition ↔ Mealnexio shared contracts (Prompt 31).
 * Provider-neutral DTOs. Do not invent calories/macros when sync is unavailable.
 */

/** Future shared data kinds between The Strongest and Mealnexio. */
export const NUTRITION_SHARED_DATA_KINDS = [
  "calories",
  "macros",
  "bodyweight",
  "nutrition_adherence",
  "training_day_nutrition",
  "meal_timing",
] as const;

export type NutritionSharedDataKind =
  (typeof NUTRITION_SHARED_DATA_KINDS)[number];

export const NUTRITION_SHARED_DATA_LABELS: Record<
  NutritionSharedDataKind,
  string
> = {
  calories: "Calories",
  macros: "Macros (protein, carbs, fat)",
  bodyweight: "Bodyweight",
  nutrition_adherence: "Nutrition adherence",
  training_day_nutrition: "Training-day nutrition",
  meal_timing: "Meal timing",
};

/**
 * Connection / provider status.
 * `unavailable` — no real API adapter active (current default).
 * `not_configured` — sync flag/env not ready.
 * `disconnected` — API exists; athlete not linked.
 * `connected` — authenticated link; may sync securely.
 * `error` — link failed; do not show stale invented numbers.
 */
export type NutritionConnectionStatus =
  | "unavailable"
  | "not_configured"
  | "disconnected"
  | "connected"
  | "error";

export const NUTRITION_CONNECTION_STATUS_LABELS: Record<
  NutritionConnectionStatus,
  string
> = {
  unavailable: "Integration not live",
  not_configured: "Not configured",
  disconnected: "Not connected",
  connected: "Connected",
  error: "Connection error",
};

export type NutritionMacros = {
  proteinG: number;
  carbsG: number;
  fatG: number;
};

/** Daily targets from a real provider — never fabricate on the TSM side. */
export type NutritionDailyTargets = {
  date: string; // YYYY-MM-DD (provider timezone / UTC date key)
  caloriesKcal: number | null;
  macros: NutritionMacros | null;
  source: "mealnexio" | "provider";
  syncedAt: Date;
};

/** Observed daily intake summary when sync is live. */
export type NutritionDailySummary = {
  date: string;
  caloriesKcal: number | null;
  macros: NutritionMacros | null;
  adherencePct: number | null;
  mealTimingNotes: string | null;
  trainingDayTagged: boolean | null;
  source: "mealnexio" | "provider";
  syncedAt: Date;
};

export type NutritionProviderConnection = {
  athleteProfileId: string;
  providerId: string;
  status: NutritionConnectionStatus;
  externalAccountLabel: string | null;
  lastSyncAt: Date | null;
  lastError: string | null;
};

export const MEALNEXIO_SITE_URL = "https://mealnexio.com";

export const NUTRITION_HONESTY = [
  "Nutrition sync with Mealnexio is not live until a real API adapter is connected and the sync feature flag is enabled.",
  "This product never invents calories, macros, adherence, or meal timing.",
  "Bodyweight shown from your athlete profile is local logging — not a Mealnexio sync.",
] as const;
