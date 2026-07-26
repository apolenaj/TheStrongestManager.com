export {
  CUSTOM_DASHBOARDS_ENGINE_VERSION,
  CUSTOM_DASHBOARDS_HONESTY,
  DASHBOARD_FOCUS_IDS,
  DASHBOARD_FOCUS_LABELS,
  DASHBOARD_FOCUS_DESCRIPTIONS,
  CUSTOM_DASHBOARD_STORAGE_KEY,
  CUSTOM_DASHBOARD_PREFS_VERSION,
  DASHBOARD_FOCUS_FALLBACK,
} from "@/domain/custom-dashboards/constants";
export type { DashboardFocusId } from "@/domain/custom-dashboards/constants";
export type {
  CustomDashboardSavedLayout,
  DashboardFocusSignals,
  DashboardFocusSuggestion,
  CustomDashboardsSnapshot,
} from "@/domain/custom-dashboards/types";
export {
  DASHBOARD_FOCUS_LAYOUT_SPECS,
  layoutPreferencesForFocus,
  aboveFoldForFocus,
} from "@/domain/custom-dashboards/presets";
export {
  suggestDashboardFocus,
  isDashboardFocusId,
} from "@/domain/custom-dashboards/suggest";
export {
  createSavedLayout,
  applyFocusPreset,
  saveCustomDashboardLayout,
  markCustomized,
  normalizeSavedLayout,
} from "@/domain/custom-dashboards/save";
export { buildCustomDashboardsSnapshot } from "@/domain/custom-dashboards/snapshot";
