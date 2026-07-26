"use client";

import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import type { AthleteStateView } from "@/services/performance-intelligence";
import type { StateField } from "@/domain/performance-intelligence";
import { freshnessSnapshotFromAthleteState } from "@/domain/data-freshness";
import { DataFreshnessPanel } from "@/components/data-freshness/DataFreshnessPanel";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

/**
 * Presentational only — never recomputes AthleteState.
 * All values come from PerformanceIntelligenceService.
 */
export function AthleteStatePanel({ view }: { view: AthleteStateView }) {
  const { state } = view;
  const freshnessSnapshot = freshnessSnapshotFromAthleteState(state);

  const rows: { label: string; field: StateField<unknown> }[] = [
    { label: "Performance trend", field: state.performanceTrend },
    { label: "Fatigue trend", field: state.fatigueTrend },
    { label: "Technique trend", field: state.techniqueTrend },
    { label: "Bodyweight trend", field: state.bodyweightTrend },
    { label: "Training consistency", field: state.trainingConsistency },
    { label: "Program progress", field: state.programProgress },
    { label: "Recovery status", field: state.recoveryStatus },
    { label: "Goal progress", field: state.goalProgress },
    { label: "Data confidence", field: state.dataConfidence },
    { label: "Nutrition", field: state.nutritionAvailability },
  ];

  return (
    <div className="grid gap-4">
      <DataFreshnessPanel snapshot={freshnessSnapshot} />
      <Card elevated>
        <CardHeader>
          <CardTitle>Performance intelligence</CardTitle>
          <CardDescription>
            Unified athlete state from logged signals — {state.engineVersion}. UI
            does not invent missing fields.
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-3">
          {rows.map((row) => (
            <li
              key={row.label}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-[var(--color-fg)]">
                  {row.label}
                </p>
                <Badge
                  variant={
                    row.field.source === "insufficient" ? "neutral" : "accent"
                  }
                >
                  {row.field.source}
                </Badge>
                <ConfidenceBadge
                  confidence={row.field.confidence}
                  prefix={null}
                />
              </div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {row.field.summary}
              </p>
              {row.field.missingDependencies.length > 0 ? (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Missing: {row.field.missingDependencies.join("; ")}
                </p>
              ) : null}
              {row.field.lastUpdated ? (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Last updated:{" "}
                  {row.field.lastUpdated.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
