import {
  normalizeLayoutPreferences,
  type CommandCenterLayoutPreferences,
} from "@/domain/command-center";
import {
  CUSTOM_DASHBOARD_PREFS_VERSION,
  DASHBOARD_FOCUS_FALLBACK,
} from "@/domain/custom-dashboards/constants";
import { layoutPreferencesForFocus } from "@/domain/custom-dashboards/presets";
import { isDashboardFocusId } from "@/domain/custom-dashboards/suggest";
import type { CustomDashboardSavedLayout } from "@/domain/custom-dashboards/types";
import type { DashboardFocusId } from "@/domain/custom-dashboards/constants";

export function createSavedLayout(input: {
  focusId: DashboardFocusId;
  layout: CommandCenterLayoutPreferences;
  customizedAfterPreset?: boolean;
  savedAt?: string | null;
}): CustomDashboardSavedLayout {
  return {
    version: CUSTOM_DASHBOARD_PREFS_VERSION,
    focusId: input.focusId,
    layout: normalizeLayoutPreferences(input.layout),
    savedAt: input.savedAt ?? new Date().toISOString(),
    customizedAfterPreset: input.customizedAfterPreset ?? false,
  };
}

/** Apply a focus preset and mark as freshly saved. */
export function applyFocusPreset(
  focusId: DashboardFocusId,
  nowIso: string = new Date().toISOString(),
): CustomDashboardSavedLayout {
  return createSavedLayout({
    focusId,
    layout: layoutPreferencesForFocus(focusId),
    customizedAfterPreset: false,
    savedAt: nowIso,
  });
}

/** Stamp an explicit save of the current layout + focus. */
export function saveCustomDashboardLayout(
  current: CustomDashboardSavedLayout,
  nowIso: string = new Date().toISOString(),
): CustomDashboardSavedLayout {
  return {
    ...current,
    version: CUSTOM_DASHBOARD_PREFS_VERSION,
    layout: normalizeLayoutPreferences(current.layout),
    savedAt: nowIso,
  };
}

export function markCustomized(
  current: CustomDashboardSavedLayout,
  layout: CommandCenterLayoutPreferences,
): CustomDashboardSavedLayout {
  return {
    ...current,
    layout: normalizeLayoutPreferences(layout),
    customizedAfterPreset: true,
  };
}

/**
 * Normalize stored JSON. Invalid focus → fallback preset.
 * Never invents widget scores — only layout structure.
 */
export function normalizeSavedLayout(raw: unknown): CustomDashboardSavedLayout {
  if (!raw || typeof raw !== "object") {
    return applyFocusPreset(DASHBOARD_FOCUS_FALLBACK);
  }
  const obj = raw as Record<string, unknown>;
  const focusId = isDashboardFocusId(obj.focusId)
    ? obj.focusId
    : DASHBOARD_FOCUS_FALLBACK;
  const layout = normalizeLayoutPreferences(obj.layout);
  return {
    version: CUSTOM_DASHBOARD_PREFS_VERSION,
    focusId,
    layout,
    savedAt: typeof obj.savedAt === "string" ? obj.savedAt : null,
    customizedAfterPreset: obj.customizedAfterPreset === true,
  };
}
