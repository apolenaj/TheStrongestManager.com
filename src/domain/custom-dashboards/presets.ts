import {
  COMMAND_CENTER_WIDGET_CATALOG,
  defaultLayoutPreferences,
  type CommandCenterFold,
  type CommandCenterLayoutPreferences,
  type CommandCenterSectionId,
  type CommandCenterWidgetPreference,
} from "@/domain/command-center";
import type { DashboardFocusId } from "@/domain/custom-dashboards/constants";

type FocusLayoutSpec = {
  /** Sections pinned above the fold (always includes today first). */
  above: readonly CommandCenterSectionId[];
  /** Visible below-fold order after above. */
  below: readonly CommandCenterSectionId[];
  /** Hidden unless the athlete re-enables. */
  hidden?: readonly CommandCenterSectionId[];
};

/**
 * Smart default layouts per focus.
 * TODAY is always above fold; at most one focus widget joins it.
 */
export const DASHBOARD_FOCUS_LAYOUT_SPECS: Record<
  DashboardFocusId,
  FocusLayoutSpec
> = {
  strength: {
    above: ["today", "performance"],
    below: [
      "training",
      "technique",
      "goal_trajectory",
      "recovery",
      "ai_coach",
      "nutrition",
    ],
  },
  technique: {
    above: ["today", "technique"],
    below: [
      "training",
      "performance",
      "ai_coach",
      "recovery",
      "goal_trajectory",
      "nutrition",
    ],
  },
  recovery: {
    above: ["today", "recovery"],
    below: [
      "training",
      "nutrition",
      "performance",
      "technique",
      "ai_coach",
      "goal_trajectory",
    ],
  },
  nutrition: {
    above: ["today", "nutrition"],
    below: [
      "recovery",
      "training",
      "performance",
      "goal_trajectory",
      "ai_coach",
      "technique",
    ],
  },
  competition: {
    above: ["today", "goal_trajectory"],
    below: [
      "training",
      "technique",
      "performance",
      "recovery",
      "ai_coach",
      "nutrition",
    ],
  },
  bodybuilding: {
    above: ["today", "training"],
    below: [
      "nutrition",
      "recovery",
      "performance",
      "technique",
      "ai_coach",
      "goal_trajectory",
    ],
  },
};

function buildWidgetPrefs(spec: FocusLayoutSpec): CommandCenterWidgetPreference[] {
  const aboveSet = new Set(spec.above);
  const belowSet = new Set(spec.below);
  const hiddenSet = new Set(spec.hidden ?? []);
  const orderMap = new Map<CommandCenterSectionId, number>();

  spec.above.forEach((id, i) => orderMap.set(id, i));
  spec.below.forEach((id, i) => orderMap.set(id, 100 + i));
  (spec.hidden ?? []).forEach((id, i) => orderMap.set(id, 500 + i));

  return COMMAND_CENTER_WIDGET_CATALOG.map((def) => {
    let fold: CommandCenterFold = "below";
    let visible = true;
    if (aboveSet.has(def.id)) {
      fold = "above";
      visible = true;
    } else if (hiddenSet.has(def.id)) {
      fold = "below";
      visible = false;
    } else if (belowSet.has(def.id)) {
      fold = "below";
      visible = true;
    } else {
      // Catalog widgets not listed → below, visible (honest completeness)
      fold = "below";
      visible = true;
      if (!orderMap.has(def.id)) orderMap.set(def.id, 400);
    }

    return {
      id: def.id,
      visible,
      fold,
      order: orderMap.get(def.id) ?? def.defaultOrder,
      span: aboveSet.has(def.id) && def.id === "today" ? 2 : def.defaultSpan,
    };
  });
}

/** Smart default Command Center layout for a dashboard focus. */
export function layoutPreferencesForFocus(
  focusId: DashboardFocusId,
): CommandCenterLayoutPreferences {
  const base = defaultLayoutPreferences();
  const spec = DASHBOARD_FOCUS_LAYOUT_SPECS[focusId];
  return {
    ...base,
    densityOverride: null,
    widgets: buildWidgetPrefs(spec),
  };
}

export function aboveFoldForFocus(
  focusId: DashboardFocusId,
): readonly CommandCenterSectionId[] {
  return DASHBOARD_FOCUS_LAYOUT_SPECS[focusId].above;
}
