import {
  CUSTOM_DASHBOARDS_ENGINE_VERSION,
  CUSTOM_DASHBOARDS_HONESTY,
  CUSTOM_DASHBOARD_STORAGE_KEY,
  DASHBOARD_FOCUS_DESCRIPTIONS,
  DASHBOARD_FOCUS_IDS,
  DASHBOARD_FOCUS_LABELS,
} from "@/domain/custom-dashboards/constants";
import { aboveFoldForFocus } from "@/domain/custom-dashboards/presets";
import type { CustomDashboardsSnapshot } from "@/domain/custom-dashboards/types";

export function buildCustomDashboardsSnapshot(
  generatedAt: string = new Date().toISOString(),
): CustomDashboardsSnapshot {
  return {
    engineVersion: CUSTOM_DASHBOARDS_ENGINE_VERSION,
    honesty: CUSTOM_DASHBOARDS_HONESTY,
    focuses: DASHBOARD_FOCUS_IDS.map((id) => ({
      id,
      label: DASHBOARD_FOCUS_LABELS[id],
      description: DASHBOARD_FOCUS_DESCRIPTIONS[id],
      aboveFold: [...aboveFoldForFocus(id)],
    })),
    storageKey: CUSTOM_DASHBOARD_STORAGE_KEY,
    docPath: "docs/CUSTOM_DASHBOARDS.md",
    generatedAt,
  };
}
