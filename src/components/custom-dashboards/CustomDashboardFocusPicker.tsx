"use client";

import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  DASHBOARD_FOCUS_DESCRIPTIONS,
  DASHBOARD_FOCUS_IDS,
  DASHBOARD_FOCUS_LABELS,
  type CustomDashboardSavedLayout,
  type DashboardFocusId,
  type DashboardFocusSuggestion,
} from "@/domain/custom-dashboards";

export function CustomDashboardFocusPicker({
  saved,
  suggestion,
  onApplyFocus,
  onSaveLayout,
}: {
  saved: CustomDashboardSavedLayout;
  suggestion: DashboardFocusSuggestion;
  onApplyFocus: (focusId: DashboardFocusId) => void;
  onSaveLayout: () => void;
}) {
  return (
    <Card className="border-[var(--color-border)]">
      <CardHeader>
        <CardTitle>Dashboard focus</CardTitle>
        <CardDescription>
          Choose Strength, Technique, Recovery, Nutrition, Competition, or
          Bodybuilding. Smart defaults rearrange widgets — they do not invent
          scores.
        </CardDescription>
      </CardHeader>
      <div className="space-y-4 px-1 pb-1">
        <p className="text-sm text-[var(--color-muted)]">
          Suggested:{" "}
          <span className="font-medium text-[var(--color-foreground)]">
            {DASHBOARD_FOCUS_LABELS[suggestion.focusId]}
          </span>
          <span className="ml-2 text-xs">— {suggestion.reason}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {DASHBOARD_FOCUS_IDS.map((id) => {
            const active = saved.focusId === id;
            return (
              <button
                key={id}
                type="button"
                title={DASHBOARD_FOCUS_DESCRIPTIONS[id]}
                onClick={() => onApplyFocus(id)}
                className={`rounded-[var(--radius-sm)] border px-3 py-2 text-sm transition-colors ${
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-foreground)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50"
                }`}
              >
                {DASHBOARD_FOCUS_LABELS[id]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={saved.customizedAfterPreset ? "warning" : "accent"}>
            {DASHBOARD_FOCUS_LABELS[saved.focusId]}
            {saved.customizedAfterPreset ? " · edited" : " · preset"}
          </Badge>
          {saved.savedAt ? (
            <span className="text-xs text-[var(--color-muted)]">
              Saved {new Date(saved.savedAt).toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-[var(--color-muted)]">Not saved yet</span>
          )}
          <Button type="button" variant="primary" size="sm" onClick={onSaveLayout}>
            Save layout
          </Button>
        </div>
      </div>
    </Card>
  );
}
