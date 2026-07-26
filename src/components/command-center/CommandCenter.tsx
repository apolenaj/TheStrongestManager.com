"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  COMMAND_CENTER_DENSITIES,
  COMMAND_CENTER_HONESTY,
  COMMAND_CENTER_PREFS_STORAGE_KEY,
  buildWidgetSnippets,
  defaultLayoutPreferences,
  moveWidgetOrder,
  normalizeLayoutPreferences,
  resolveCommandCenterLayout,
  setWidgetFold,
  setWidgetVisible,
  type CommandCenterDensity,
  type CommandCenterLayoutPreferences,
  type CommandCenterSectionId,
  type ResolvedCommandCenterWidget,
} from "@/domain/command-center";
import {
  CUSTOM_DASHBOARD_STORAGE_KEY,
  applyFocusPreset,
  markCustomized,
  normalizeSavedLayout,
  saveCustomDashboardLayout,
  suggestDashboardFocus,
  type CustomDashboardSavedLayout,
  type DashboardFocusId,
} from "@/domain/custom-dashboards";
import { featureFlags } from "@/config/feature-flags";
import { CustomDashboardFocusPicker } from "@/components/custom-dashboards/CustomDashboardFocusPicker";
import type { DashboardView } from "@/services/dashboard/types";
import type { AthleteStateView } from "@/services/performance-intelligence";
import { AthleteStatePanel } from "@/components/performance-intelligence/AthleteStatePanel";
import { MicroLearningCard } from "@/components/micro-learning/MicroLearningCard";

function subscribeViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = () => onStoreChange();
  window.addEventListener("resize", mq);
  return () => window.removeEventListener("resize", mq);
}

function getViewportWidth() {
  if (typeof window === "undefined") return 1024;
  return window.innerWidth;
}

function getServerViewportWidth() {
  return 1024;
}

function readLegacyCommandPrefs(): CommandCenterLayoutPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COMMAND_CENTER_PREFS_STORAGE_KEY);
    if (!raw) return null;
    return normalizeLayoutPreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

function readSavedDashboard(
  suggestionFocus: DashboardFocusId,
): CustomDashboardSavedLayout {
  if (typeof window === "undefined") {
    return applyFocusPreset(suggestionFocus);
  }
  try {
    const raw = window.localStorage.getItem(CUSTOM_DASHBOARD_STORAGE_KEY);
    if (raw) return normalizeSavedLayout(JSON.parse(raw));
  } catch {
    // fall through
  }
  const legacy = readLegacyCommandPrefs();
  if (legacy) {
    return normalizeSavedLayout({
      focusId: suggestionFocus,
      layout: legacy,
      customizedAfterPreset: true,
      savedAt: null,
    });
  }
  return applyFocusPreset(suggestionFocus);
}

function persistSaved(saved: CustomDashboardSavedLayout) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CUSTOM_DASHBOARD_STORAGE_KEY,
    JSON.stringify(saved),
  );
  // Keep Command Center key in sync for compatibility when custom dashboards off later
  window.localStorage.setItem(
    COMMAND_CENTER_PREFS_STORAGE_KEY,
    JSON.stringify(saved.layout),
  );
}

const densityGap: Record<CommandCenterDensity, string> = {
  compact: "gap-3",
  comfortable: "gap-5",
  spacious: "gap-8",
};

function WidgetCard({
  widget,
  snippet,
}: {
  widget: ResolvedCommandCenterWidget;
  snippet: ReturnType<typeof buildWidgetSnippets>[CommandCenterSectionId];
}) {
  return (
    <Link
      href={widget.href}
      className="ui-interactive block h-full rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      <Card elevated className="h-full">
        <CardHeader className="mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{widget.label}</CardTitle>
            {snippet.empty ? (
              <Badge variant="neutral">No data yet</Badge>
            ) : (
              <Badge variant="accent">Live signal</Badge>
            )}
          </div>
          <CardDescription>{widget.description}</CardDescription>
        </CardHeader>
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
          {snippet.headline}
        </p>
        {snippet.detail ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            {snippet.detail}
          </p>
        ) : null}
        <p className="mt-4 text-xs font-medium tracking-wide text-[var(--color-accent)]">
          {snippet.ctaLabel} →
        </p>
      </Card>
    </Link>
  );
}

function WidgetGrid({
  widgets,
  snippets,
  density,
}: {
  widgets: ResolvedCommandCenterWidget[];
  snippets: ReturnType<typeof buildWidgetSnippets>;
  density: CommandCenterDensity;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${densityGap[density]}`}>
      {widgets.map((w) => (
        <div key={w.id} className={w.span === 2 ? "md:col-span-2" : undefined}>
          <WidgetCard widget={w} snippet={snippets[w.id]} />
        </div>
      ))}
    </div>
  );
}

function CustomizePanel({
  prefs,
  onChange,
  onClose,
  onResetPreset,
}: {
  prefs: CommandCenterLayoutPreferences;
  onChange: (next: CommandCenterLayoutPreferences) => void;
  onClose: () => void;
  onResetPreset: () => void;
}) {
  const ordered = [...prefs.widgets].sort((a, b) => a.order - b.order);

  return (
    <Card className="border-[var(--color-accent)]/25">
      <CardHeader>
        <CardTitle>Customize widgets</CardTitle>
        <CardDescription>
          Show, hide, reorder, and choose above/below fold. Use Save layout to
          stamp a save time. {COMMAND_CENTER_HONESTY[1]}
        </CardDescription>
      </CardHeader>
      <div className="space-y-4 px-1 pb-1">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-muted)]">Density</span>
          <select
            className="h-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
            value={prefs.densityOverride ?? "adaptive"}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...prefs,
                densityOverride:
                  v === "adaptive" ? null : (v as CommandCenterDensity),
              });
            }}
          >
            <option value="adaptive">Adaptive (viewport)</option>
            {COMMAND_CENTER_DENSITIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <ul className="space-y-3">
          {ordered.map((w) => (
            <li
              key={w.id}
              className="flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-sm"
            >
              <span className="min-w-[8rem] font-medium">{w.id}</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={w.visible}
                  onChange={(e) =>
                    onChange(setWidgetVisible(prefs, w.id, e.target.checked))
                  }
                />
                Visible
              </label>
              <select
                className="h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
                value={w.fold}
                onChange={(e) =>
                  onChange(
                    setWidgetFold(
                      prefs,
                      w.id,
                      e.target.value as "above" | "below",
                    ),
                  )
                }
              >
                <option value="above">Above fold</option>
                <option value="below">Below fold</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(moveWidgetOrder(prefs, w.id, "up"))}
              >
                Up
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(moveWidgetOrder(prefs, w.id, "down"))}
              >
                Down
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onResetPreset}
          >
            Re-apply focus preset
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => onChange(defaultLayoutPreferences())}
          >
            Neutral defaults
          </Button>
          <Button type="button" variant="primary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function CommandCenter({
  data,
  athleteState,
}: {
  data: DashboardView;
  athleteState: AthleteStateView | null;
}) {
  const customEnabled = featureFlags.customDashboards;
  const suggestion = useMemo(
    () =>
      suggestDashboardFocus({
        primaryDiscipline: data.discipline,
        preferredSports: data.sportFocuses.map((s) => s.id),
        goalCategories: data.goals.map((g) => g.category),
      }),
    [data.discipline, data.sportFocuses, data.goals],
  );

  const [saved, setSaved] = useState<CustomDashboardSavedLayout>(() =>
    applyFocusPreset(suggestion.focusId),
  );
  const [hydrated, setHydrated] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const width = useSyncExternalStore(
    subscribeViewport,
    getViewportWidth,
    getServerViewportWidth,
  );

  useEffect(() => {
    if (customEnabled) {
      setSaved(readSavedDashboard(suggestion.focusId));
    } else {
      const legacy = readLegacyCommandPrefs();
      setSaved(
        normalizeSavedLayout({
          focusId: suggestion.focusId,
          layout: legacy ?? defaultLayoutPreferences(),
          customizedAfterPreset: Boolean(legacy),
          savedAt: null,
        }),
      );
    }
    setHydrated(true);
    // Only hydrate once from storage; suggestion is initial seed only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount hydrate
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistSaved(saved);
  }, [saved, hydrated]);

  const prefs = saved.layout;
  const layout = useMemo(
    () => resolveCommandCenterLayout(prefs, width),
    [prefs, width],
  );
  const snippets = useMemo(() => buildWidgetSnippets(data), [data]);

  function updateLayout(next: CommandCenterLayoutPreferences) {
    setSaved((prev) => markCustomized(prev, next));
  }

  function applyFocus(focusId: DashboardFocusId) {
    setSaved(applyFocusPreset(focusId));
  }

  function handleSaveLayout() {
    setSaved((prev) => saveCustomDashboardLayout(prev));
    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 2000);
  }

  return (
    <div className={`space-y-8 ${densityGap[layout.density]}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ui-eyebrow text-[var(--color-subtle)]">
            Performance OS Command Center
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Density: {layout.density} ({layout.densitySource})
            {hydrated ? "" : " · loading layout…"}
            {saveFlash ? " · layout saved" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {customEnabled ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSaveLayout}
            >
              Save layout
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setCustomizing((v) => !v)}
          >
            {customizing ? "Close customize" : "Customize widgets"}
          </Button>
        </div>
      </div>

      {customEnabled ? (
        <CustomDashboardFocusPicker
          saved={saved}
          suggestion={suggestion}
          onApplyFocus={applyFocus}
          onSaveLayout={handleSaveLayout}
        />
      ) : null}

      {customizing ? (
        <CustomizePanel
          prefs={prefs}
          onChange={updateLayout}
          onClose={() => setCustomizing(false)}
          onResetPreset={() => applyFocus(saved.focusId)}
        />
      ) : null}

      <section aria-labelledby="cc-above-fold">
        <h2
          id="cc-above-fold"
          className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold"
        >
          Focus now
        </h2>
        {layout.aboveFold.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No widgets pinned above the fold. Customize to add one.
          </p>
        ) : (
          <WidgetGrid
            widgets={layout.aboveFold}
            snippets={snippets}
            density={layout.density}
          />
        )}
      </section>

      {athleteState ? <AthleteStatePanel view={athleteState} /> : null}

      <MicroLearningCard
        goalCategories={data.goals.map((g) => g.category)}
        primaryDiscipline={data.discipline}
      />

      <section aria-labelledby="cc-below-fold" className="scroll-mt-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2
            id="cc-below-fold"
            className="font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            Command deck
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            Scroll for the rest of your chosen focus layout
          </p>
        </div>
        {layout.belowFold.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            All visible widgets are above the fold.
          </p>
        ) : (
          <WidgetGrid
            widgets={layout.belowFold}
            snippets={snippets}
            density={layout.density}
          />
        )}
      </section>

      <p className="text-xs leading-relaxed text-[var(--color-muted)]">
        {COMMAND_CENTER_HONESTY[0]}
      </p>
    </div>
  );
}
