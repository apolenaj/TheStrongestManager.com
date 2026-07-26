"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Badge, Label, Select } from "@/design-system";
import { PROGRESS_RANGES } from "@/domain/progress/ranges";
import type { ProgressAnalyticsView } from "@/services/progress/progress-analytics-service";
import { TrendChart } from "@/components/progress/TrendChart";

export function ProgressAnalytics({ view }: { view: ProgressAnalyticsView }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function updateQuery(next: { range?: string; exercise?: string }) {
    const params = new URLSearchParams();
    params.set("range", next.range ?? view.rangeId);
    const exercise = next.exercise ?? view.exerciseId;
    if (exercise) params.set("exercise", exercise);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const s = view.series;

  return (
    <div className={pending ? "space-y-8 opacity-70" : "space-y-8"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="grid w-full gap-4 sm:max-w-md sm:grid-cols-2">
          <div>
            <Label htmlFor="progress-range">Compare</Label>
            <Select
              id="progress-range"
              className="min-h-12"
              value={view.rangeId}
              onChange={(e) => updateQuery({ range: e.target.value })}
            >
              {PROGRESS_RANGES.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="progress-exercise">Exercise</Label>
            <Select
              id="progress-exercise"
              className="min-h-12"
              value={view.exerciseId ?? ""}
              onChange={(e) => updateQuery({ exercise: e.target.value })}
              disabled={view.exercises.length === 0}
            >
              {view.exercises.length === 0 ? (
                <option value="">No exercises logged</option>
              ) : (
                view.exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.label}
                  </option>
                ))
              )}
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{view.rangeLabel}</Badge>
          {view.summaries.consistencyPct != null ? (
            <Badge variant="accent">
              Consistency {view.summaries.consistencyPct}%
            </Badge>
          ) : null}
          {view.summaries.programAdherencePct != null ? (
            <Badge variant="success">
              Adherence {view.summaries.programAdherencePct}%
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6">
        <TrendChart series={s.strengthTrend} />
        <TrendChart series={s.prTimeline} />
        <TrendChart series={s.estimated1rm} />
        <TrendChart series={s.volume} />
        <TrendChart series={s.bodyweight} />
        <TrendChart series={s.techniqueTrend} />
        <TrendChart series={s.consistency} />
        <TrendChart series={s.programAdherence} />
      </div>

      <p className="text-sm text-[var(--color-muted)]">
        Charts use real logged data only. Estimated 1RM is never treated as a
        verified PR. Empty charts mean the series has no points in{" "}
        {view.rangeLabel.toLowerCase()}
        {view.exerciseId ? " for the selected exercise" : ""}.
      </p>
    </div>
  );
}
