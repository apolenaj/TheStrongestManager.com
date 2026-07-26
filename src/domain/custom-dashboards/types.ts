import type { CommandCenterLayoutPreferences } from "@/domain/command-center";
import type { DashboardFocusId } from "@/domain/custom-dashboards/constants";

export type CustomDashboardSavedLayout = {
  version: number;
  focusId: DashboardFocusId;
  layout: CommandCenterLayoutPreferences;
  /** ISO timestamp of last explicit save or preset apply. */
  savedAt: string | null;
  /**
   * True when the athlete edited widgets after applying a preset
   * (still saved; preset is a starting point).
   */
  customizedAfterPreset: boolean;
};

export type DashboardFocusSignals = {
  primaryDiscipline: string | null;
  preferredSports: string[];
  goalCategories: string[];
};

export type DashboardFocusSuggestion = {
  focusId: DashboardFocusId;
  reason: string;
  /** True when matched from profile signals; false when fallback. */
  fromSignals: boolean;
};

export type CustomDashboardsSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  focuses: Array<{
    id: DashboardFocusId;
    label: string;
    description: string;
    aboveFold: string[];
  }>;
  storageKey: string;
  docPath: "docs/CUSTOM_DASHBOARDS.md";
  generatedAt: string;
};
