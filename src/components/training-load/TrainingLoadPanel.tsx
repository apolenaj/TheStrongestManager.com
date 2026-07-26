import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartCard,
  EmptyState,
} from "@/design-system";
import type { TrainingLoadView, WindowLoadView } from "@/services/training-load/training-load-service";
import type { MassUnit } from "@/services/units/convert";

function formatVolume(volumeKg: number, units: MassUnit): string {
  // Volume is kg·reps (tonnage). Show canonical kg basis; convert mass display for the kg part only as approximation.
  if (units === "lb") {
    const lbVol = Math.round(volumeKg * 2.2046226218);
    return `${lbVol.toLocaleString()} lb·reps`;
  }
  return `${Math.round(volumeKg).toLocaleString()} kg·reps`;
}

function IntensityLabel({ window }: { window: WindowLoadView }) {
  const { totals } = window;
  if (totals.estimatedIntensity == null) {
    return <span className="text-[var(--color-subtle)]">Not enough data</span>;
  }
  const basis =
    totals.estimatedIntensityBasis === "set_rpe"
      ? "from set RPE"
      : totals.estimatedIntensityBasis === "prescribed_percent"
        ? "from prescribed %"
        : "";
  return (
    <span>
      {totals.estimatedIntensity}
      <span className="text-[var(--color-subtle)]"> · estimated {basis}</span>
    </span>
  );
}

function MiniBars({ daily }: { daily: WindowLoadView["daily"] }) {
  if (daily.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No daily volume points in this window.
      </p>
    );
  }
  const max = Math.max(...daily.map((d) => d.volumeKg), 1);
  return (
    <div className="flex h-32 items-end gap-1">
      {daily.map((day) => {
        const height = Math.max(4, Math.round((day.volumeKg / max) * 100));
        return (
          <div
            key={day.dayKey}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
            title={`${day.dayKey}: ${Math.round(day.volumeKg)} volume · ${day.setCount} sets`}
          >
            <div
              className="w-full rounded-t-[var(--radius-sm)] bg-[var(--color-accent)]/80"
              style={{ height: `${height}%` }}
            />
            <span className="max-w-full truncate text-[9px] text-[var(--color-subtle)]">
              {day.dayKey.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WindowCard({
  window,
  units,
}: {
  window: WindowLoadView;
  units: MassUnit;
}) {
  const { totals } = window;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{window.label}</CardTitle>
          <Badge variant="neutral">{window.sessionCount} sessions</Badge>
        </div>
        <CardDescription>{window.description}</CardDescription>
      </CardHeader>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
            Sets
          </dt>
          <dd className="mt-1 font-display text-2xl tabular-nums">
            {totals.setCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
            Reps
          </dt>
          <dd className="mt-1 font-display text-2xl tabular-nums">
            {totals.repCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
            Volume
          </dt>
          <dd className="mt-1 font-display text-xl tabular-nums">
            {formatVolume(totals.volumeKg, units)}
          </dd>
          <p className="mt-1 text-xs text-[var(--color-subtle)]">
            {totals.volumeSetCount}/{totals.setCount} sets with load×reps
          </p>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
            Estimated intensity
          </dt>
          <dd className="mt-1 text-base">
            <IntensityLabel window={window} />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
            Hard sets
          </dt>
          <dd className="mt-1 font-display text-2xl tabular-nums">
            {totals.hardSetCount}
          </dd>
          <p className="mt-1 text-xs text-[var(--color-subtle)]">
            Heuristic · RPE≥8 or RIR≤2
          </p>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
            Session RPE
          </dt>
          <dd className="mt-1 font-display text-2xl tabular-nums">
            {window.avgSessionRpe != null ? window.avgSessionRpe : "—"}
          </dd>
          <p className="mt-1 text-xs text-[var(--color-subtle)]">
            {window.sessionsWithRpe}/{window.sessionCount} sessions logged
          </p>
        </div>
      </dl>

      <div className="mt-6">
        <ChartCard
          title="Daily estimated volume"
          description="Bars use logged load×reps only — gaps mean missing data, not zero fatigue."
          empty={window.daily.length === 0}
          emptyTitle="No volume in this window"
          emptyDescription="Complete sets with load and reps to build this trend."
        >
          <MiniBars daily={window.daily} />
        </ChartCard>
      </div>

      {window.exercises.length > 0 ? (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-foreground)]">
            Exercise-specific workload
          </h3>
          <ul className="space-y-2">
            {window.exercises.map((ex) => (
              <li
                key={ex.exerciseId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--color-border)] pt-2 text-sm first:border-t-0 first:pt-0"
              >
                <span className="text-[var(--color-foreground)]">
                  {ex.exerciseName}
                </span>
                <span className="text-[var(--color-muted)]">
                  {formatVolume(ex.volumeKg, units)} · {ex.setCount} sets ·{" "}
                  {ex.hardSetCount} hard
                  {ex.avgSetRpe != null ? ` · RPE ${ex.avgSetRpe}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

export function TrainingLoadPanel({ view }: { view: TrainingLoadView }) {
  if (view.empty) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="No estimated training load yet"
          description="Log completed sets with weight and reps. Trends appear for 7 days, 28 days, and your current block when data exists."
        />
        <Alert tone="info" title="How load is estimated">
          {view.disclaimers[0]}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">Estimated training load</Badge>
          <Badge variant="neutral">{view.engineVersion}</Badge>
        </div>
        <p className="max-w-2xl text-sm text-[var(--color-muted)]">
          Volume and intensity here are estimates from your log — not a
          scientifically validated fatigue score.
        </p>
      </div>

      {view.spike.flagged ? (
        <Alert tone="warning" title={view.spike.label ?? "Load spike"}>
          {view.spike.explanation}
        </Alert>
      ) : (
        <Alert tone="info" title="Load spike check">
          {view.spike.explanation}
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--color-foreground)]">
          Recovery indicators
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Last {view.recovery.windowDays} days</CardTitle>
            <CardDescription>{view.recovery.note}</CardDescription>
          </CardHeader>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Readiness
              </dt>
              <dd className="mt-1 font-display text-2xl tabular-nums">
                {view.recovery.readinessMean != null
                  ? view.recovery.readinessMean
                  : "—"}
              </dd>
              <p className="mt-1 text-xs text-[var(--color-subtle)]">
                {view.recovery.readinessCount} logs
              </p>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Sleep hours
              </dt>
              <dd className="mt-1 font-display text-2xl tabular-nums">
                {view.recovery.sleepHoursMean != null
                  ? view.recovery.sleepHoursMean
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Soreness
              </dt>
              <dd className="mt-1 font-display text-2xl tabular-nums">
                {view.recovery.sorenessMean != null
                  ? view.recovery.sorenessMean
                  : "—"}
              </dd>
            </div>
          </dl>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl text-[var(--color-foreground)]">
          Trends
        </h2>
        {view.windows.map((window) => (
          <WindowCard key={window.key} window={window} units={view.units} />
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Honesty notes
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {view.disclaimers.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
