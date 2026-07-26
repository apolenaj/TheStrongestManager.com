export {
  COMMAND_CENTER_ENGINE_VERSION,
  COMMAND_CENTER_HONESTY,
  COMMAND_CENTER_SECTIONS,
  COMMAND_CENTER_SECTION_LABELS,
  COMMAND_CENTER_SECTION_HREFS,
  COMMAND_CENTER_FOLD,
  COMMAND_CENTER_DENSITIES,
  COMMAND_CENTER_VIEWPORT_BREAKPOINTS,
  COMMAND_CENTER_PREFS_STORAGE_KEY,
  COMMAND_CENTER_PREFS_VERSION,
} from "@/domain/command-center/constants";
export type {
  CommandCenterSectionId,
  CommandCenterFold,
  CommandCenterDensity,
} from "@/domain/command-center/constants";
export type {
  CommandCenterWidgetDef,
  CommandCenterWidgetPreference,
  CommandCenterLayoutPreferences,
  ResolvedCommandCenterWidget,
  ResolvedCommandCenterLayout,
  CommandCenterWidgetSnippet,
  CommandCenterSnapshot,
} from "@/domain/command-center/types";
export {
  COMMAND_CENTER_WIDGET_CATALOG,
  getWidgetDef,
} from "@/domain/command-center/catalog";
export {
  densityFromViewportWidth,
  defaultLayoutPreferences,
  normalizeLayoutPreferences,
  resolveCommandCenterLayout,
  defaultAboveFoldSectionIds,
  moveWidgetOrder,
  setWidgetVisible,
  setWidgetFold,
} from "@/domain/command-center/layout";
export { buildWidgetSnippets } from "@/domain/command-center/snippets";
export { buildCommandCenterSnapshot } from "@/domain/command-center/snapshot";
