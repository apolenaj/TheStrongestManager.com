/**
 * Custom Dashboards (Prompt 189).
 * Athlete chooses a focus preset, applies smart defaults, saves layout.
 * Builds on Command Center widgets — never invents scores.
 */

export const CUSTOM_DASHBOARDS_ENGINE_VERSION = "custom_dashboards.v1" as const;

export const CUSTOM_DASHBOARDS_HONESTY = [
  "Custom dashboards rearrange existing widgets — they do not invent strength, technique, recovery, nutrition, or competition scores.",
  "Smart defaults are starting layouts from your chosen focus (and optional profile signals); empty widgets stay empty.",
  "Saved layouts persist on this device until a synced prefs store exists — clearing site data resets them.",
  "Choosing Competition or Bodybuilding does not enroll you in a meet or invent a physique program.",
] as const;

export const DASHBOARD_FOCUS_IDS = [
  "strength",
  "technique",
  "recovery",
  "nutrition",
  "competition",
  "bodybuilding",
] as const;

export type DashboardFocusId = (typeof DASHBOARD_FOCUS_IDS)[number];

export const DASHBOARD_FOCUS_LABELS: Record<DashboardFocusId, string> = {
  strength: "Strength",
  technique: "Technique",
  recovery: "Recovery",
  nutrition: "Nutrition",
  competition: "Competition",
  bodybuilding: "Bodybuilding",
};

export const DASHBOARD_FOCUS_DESCRIPTIONS: Record<DashboardFocusId, string> = {
  strength:
    "Prioritize performance, training load, and technique — TODAY stays above the fold.",
  technique:
    "Surface technique next to TODAY; training and AI Coach stay easy to reach.",
  recovery:
    "Pin recovery with TODAY; keep training and nutrition visible for context.",
  nutrition:
    "Pin nutrition with TODAY; recovery and training stay nearby without inventing macros.",
  competition:
    "Emphasize goal trajectory and training for meet prep context — never auto weight-cut protocols.",
  bodybuilding:
    "Balance training, nutrition, and recovery for physique-oriented logging — no invented macros.",
};

export const CUSTOM_DASHBOARD_STORAGE_KEY =
  "tsm.custom_dashboard.v1" as const;

export const CUSTOM_DASHBOARD_PREFS_VERSION = 1 as const;

/** Fallback when no profile signal matches a focus. */
export const DASHBOARD_FOCUS_FALLBACK: DashboardFocusId = "strength";
