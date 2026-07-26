import Link from "next/link";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type {
  MetricDeltaRow,
  VideoComparisonResult,
} from "@/domain/video-comparison";

function DeltaTable({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: MetricDeltaRow[];
  empty: string;
}) {
  return (
    <section className="grid gap-2">
      <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="text-xs text-[var(--color-muted)]">
                <th className="py-1 pr-2 font-medium">Metric</th>
                <th className="py-1 pr-2 font-medium">Old</th>
                <th className="py-1 pr-2 font-medium">New</th>
                <th className="py-1 font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[var(--color-border)]"
                >
                  <td className="py-2 pr-2 text-[var(--color-fg)]">
                    {row.label}
                  </td>
                  <td className="py-2 pr-2 tabular-nums text-[var(--color-muted)]">
                    {row.oldValue}
                  </td>
                  <td className="py-2 pr-2 tabular-nums text-[var(--color-muted)]">
                    {row.newValue}
                  </td>
                  <td className="py-2 tabular-nums text-[var(--color-fg)]">
                    {row.delta == null
                      ? "—"
                      : row.delta > 0
                        ? `+${row.delta}`
                        : String(row.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function VideoCompareMetricsPanel({
  result,
}: {
  result: VideoComparisonResult;
}) {
  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Compare</Badge>
          <Badge variant="neutral">{result.engineVersion}</Badge>
          {result.metricsComparable ? (
            <Badge variant="success">Metrics comparable</Badge>
          ) : (
            <Badge variant="warning">Metrics gated</Badge>
          )}
        </div>
        <CardTitle className="mt-2 text-xl tracking-tight">
          Start · path · phases · metrics
        </CardTitle>
        <CardDescription>
          <Link
            href={`/app/technique/${result.oldSide.analysisId}`}
            className="text-[var(--color-accent)] hover:underline"
          >
            Old report
          </Link>
          {" · "}
          <Link
            href={`/app/technique/${result.newSide.analysisId}`}
            className="text-[var(--color-accent)] hover:underline"
          >
            New report
          </Link>
        </CardDescription>
      </CardHeader>

      {result.cameraWarning ? (
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          {result.cameraWarning}
        </p>
      ) : null}

      <div className="grid gap-6">
        <DeltaTable
          title="Start position"
          rows={result.startPositionRows}
          empty={
            result.metricsComparable
              ? "No shared start-position components on both analyses."
              : "Start-position comparison withheld (incompatible series)."
          }
        />
        <DeltaTable
          title="Movement path"
          rows={result.movementPathRows}
          empty={
            result.metricsComparable
              ? "No shared path metrics on both analyses."
              : "Path comparison withheld (incompatible series)."
          }
        />
        <section className="grid gap-2">
          <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Key phases
          </h3>
          {result.phaseRows.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              {result.metricsComparable
                ? "No phase timelines on file for these clips."
                : "Phase comparison withheld (incompatible series)."}
            </p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {result.phaseRows.map((row) => (
                <li
                  key={String(row.phase)}
                  className="border-l-2 border-[var(--color-border)] pl-3"
                >
                  <span className="font-medium text-[var(--color-fg)]">
                    {row.label}
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {" "}
                    · old {row.oldTime ?? "—"} · new {row.newTime ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <DeltaTable
          title="Technique metrics"
          rows={result.techniqueMetricRows}
          empty={
            result.metricsComparable
              ? "No other shared technique components."
              : "Technique metric comparison withheld (incompatible series)."
          }
        />
        <ul className="grid gap-1 text-xs text-[var(--color-subtle)]">
          {result.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
