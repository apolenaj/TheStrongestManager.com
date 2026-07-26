import {
  COMMAND_CENTER_DENSITIES,
  COMMAND_CENTER_PREFS_VERSION,
  COMMAND_CENTER_SECTIONS,
  COMMAND_CENTER_VIEWPORT_BREAKPOINTS,
  type CommandCenterDensity,
  type CommandCenterFold,
  type CommandCenterSectionId,
} from "@/domain/command-center/constants";
import { COMMAND_CENTER_WIDGET_CATALOG } from "@/domain/command-center/catalog";
import type {
  CommandCenterLayoutPreferences,
  CommandCenterWidgetPreference,
  ResolvedCommandCenterLayout,
  ResolvedCommandCenterWidget,
} from "@/domain/command-center/types";

function isSectionId(value: unknown): value is CommandCenterSectionId {
  return (
    typeof value === "string" &&
    (COMMAND_CENTER_SECTIONS as readonly string[]).includes(value)
  );
}

function isFold(value: unknown): value is CommandCenterFold {
  return value === "above" || value === "below";
}

function isDensity(value: unknown): value is CommandCenterDensity {
  return (COMMAND_CENTER_DENSITIES as readonly string[]).includes(
    value as string,
  );
}

export function densityFromViewportWidth(
  widthPx: number,
): CommandCenterDensity {
  if (widthPx <= COMMAND_CENTER_VIEWPORT_BREAKPOINTS.compactMaxPx) {
    return "compact";
  }
  if (widthPx <= COMMAND_CENTER_VIEWPORT_BREAKPOINTS.comfortableMaxPx) {
    return "comfortable";
  }
  return "spacious";
}

export function defaultLayoutPreferences(): CommandCenterLayoutPreferences {
  return {
    version: COMMAND_CENTER_PREFS_VERSION,
    densityOverride: null,
    widgets: COMMAND_CENTER_WIDGET_CATALOG.map((w) => ({
      id: w.id,
      visible: w.defaultVisible,
      fold: w.defaultFold,
      order: w.defaultOrder,
      span: w.defaultSpan,
    })),
  };
}

/**
 * Normalize partial / stored prefs against the catalog.
 * Unknown widgets dropped; missing widgets filled from defaults.
 */
export function normalizeLayoutPreferences(
  raw: unknown,
): CommandCenterLayoutPreferences {
  const defaults = defaultLayoutPreferences();
  if (!raw || typeof raw !== "object") return defaults;

  const obj = raw as Record<string, unknown>;
  const densityOverride =
    obj.densityOverride === null
      ? null
      : isDensity(obj.densityOverride)
        ? obj.densityOverride
        : null;

  const byId = new Map<CommandCenterSectionId, CommandCenterWidgetPreference>();
  if (Array.isArray(obj.widgets)) {
    for (const item of obj.widgets) {
      if (!item || typeof item !== "object") continue;
      const w = item as Record<string, unknown>;
      if (!isSectionId(w.id)) continue;
      const def = COMMAND_CENTER_WIDGET_CATALOG.find((d) => d.id === w.id)!;
      byId.set(w.id, {
        id: w.id,
        visible: typeof w.visible === "boolean" ? w.visible : def.defaultVisible,
        fold: isFold(w.fold) ? w.fold : def.defaultFold,
        order: typeof w.order === "number" ? w.order : def.defaultOrder,
        span: w.span === 2 ? 2 : 1,
      });
    }
  }

  const widgets = COMMAND_CENTER_WIDGET_CATALOG.map((def) => {
    return byId.get(def.id) ?? {
      id: def.id,
      visible: def.defaultVisible,
      fold: def.defaultFold,
      order: def.defaultOrder,
      span: def.defaultSpan,
    };
  });

  return {
    version: COMMAND_CENTER_PREFS_VERSION,
    densityOverride,
    widgets,
  };
}

export function resolveCommandCenterLayout(
  prefs: CommandCenterLayoutPreferences,
  viewportWidthPx: number,
): ResolvedCommandCenterLayout {
  const density =
    prefs.densityOverride ?? densityFromViewportWidth(viewportWidthPx);
  const densitySource: "viewport" | "user" = prefs.densityOverride
    ? "user"
    : "viewport";

  const resolved: ResolvedCommandCenterWidget[] =
    COMMAND_CENTER_WIDGET_CATALOG.map((def) => {
      const pref = prefs.widgets.find((w) => w.id === def.id);
      return {
        ...def,
        visible: pref?.visible ?? def.defaultVisible,
        fold: pref?.fold ?? def.defaultFold,
        order: pref?.order ?? def.defaultOrder,
        span: pref?.span ?? def.defaultSpan,
      };
    });

  const visible = resolved.filter((w) => w.visible);
  const hidden = resolved
    .filter((w) => !w.visible)
    .sort((a, b) => a.order - b.order);

  const sortFold = (fold: CommandCenterFold) =>
    visible
      .filter((w) => w.fold === fold)
      .sort((a, b) => a.order - b.order);

  return {
    density,
    densitySource,
    aboveFold: sortFold("above"),
    belowFold: sortFold("below"),
    hidden,
  };
}

/** Ensure at most a focused above-fold set — used when resetting to defaults. */
export function defaultAboveFoldSectionIds(): CommandCenterSectionId[] {
  return COMMAND_CENTER_WIDGET_CATALOG.filter((w) => w.defaultFold === "above").map(
    (w) => w.id,
  );
}

export function moveWidgetOrder(
  prefs: CommandCenterLayoutPreferences,
  id: CommandCenterSectionId,
  direction: "up" | "down",
): CommandCenterLayoutPreferences {
  const widgets = [...prefs.widgets].sort((a, b) => a.order - b.order);
  const index = widgets.findIndex((w) => w.id === id);
  if (index < 0) return prefs;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= widgets.length) return prefs;

  const a = widgets[index]!;
  const b = widgets[swapWith]!;
  const next = prefs.widgets.map((w) => {
    if (w.id === a.id) return { ...w, order: b.order };
    if (w.id === b.id) return { ...w, order: a.order };
    return w;
  });
  return { ...prefs, widgets: next };
}

export function setWidgetVisible(
  prefs: CommandCenterLayoutPreferences,
  id: CommandCenterSectionId,
  visible: boolean,
): CommandCenterLayoutPreferences {
  return {
    ...prefs,
    widgets: prefs.widgets.map((w) =>
      w.id === id ? { ...w, visible } : w,
    ),
  };
}

export function setWidgetFold(
  prefs: CommandCenterLayoutPreferences,
  id: CommandCenterSectionId,
  fold: CommandCenterFold,
): CommandCenterLayoutPreferences {
  return {
    ...prefs,
    widgets: prefs.widgets.map((w) => (w.id === id ? { ...w, fold } : w)),
  };
}
