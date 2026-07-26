import type { ConversionFunnelSnapshot } from "@/domain/conversion-funnel";

function formatPct(rate: number | null, decisionReady: boolean): string {
  if (rate == null) return "—";
  const pct = `${(rate * 100).toFixed(1)}%`;
  return decisionReady ? pct : `${pct} (directional)`;
}

export function ConversionFunnelPanel({
  snapshot,
}: {
  snapshot: ConversionFunnelSnapshot;
}) {
  const { funnel } = snapshot;

  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Engine
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.engineVersion}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Cohort window
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.cohortDays}d
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Top of funnel
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {funnel.topCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Largest drop-off
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {funnel.largestDropOff
              ? `${funnel.largestDropOff.fromLabel} → ${funnel.largestDropOff.toLabel}`
              : "—"}
            {funnel.largestDropOff ? (
              <span className="ml-2 text-sm font-sans text-[var(--color-muted)]">
                −{funnel.largestDropOff.lost}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{funnel.note}</p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Funnel visualization
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Bar width is relative to homepage (top). Step conversion is vs the
          previous stage.
        </p>
        <ol className="mt-6 space-y-4">
          {funnel.stages.map((stage, index) => (
            <li key={stage.stageId} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">
                  <span className="mr-2 font-mono text-xs text-[var(--color-muted)]">
                    {index + 1}.
                  </span>
                  {stage.label}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  {stage.count.toLocaleString("en-US")}
                  <span className="ml-2 font-mono text-xs">
                    {stage.source}
                  </span>
                </p>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-border)]/40"
                role="img"
                aria-label={`${stage.label}: ${stage.count}, ${formatPct(stage.pctOfTop, funnel.decisionReady)} of top`}
              >
                <div
                  className="h-full rounded-[var(--radius-sm)] bg-[var(--color-fg)] transition-[width] duration-500 ease-out"
                  style={{ width: `${stage.barWidthPct}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted)]">
                <span>
                  Of top: {formatPct(stage.pctOfTop, funnel.decisionReady)}
                </span>
                {index > 0 ? (
                  <>
                    <span>
                      Step:{" "}
                      {formatPct(stage.pctOfPrevious, funnel.decisionReady)}
                    </span>
                    <span>
                      Drop-off: −{stage.dropOffCount ?? 0} (
                      {formatPct(stage.dropOffRate, funnel.decisionReady)})
                    </span>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Drop-offs (ranked)
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Ranked by absolute volume lost between adjacent stages. Identifies
          where to investigate — not an automatic root cause.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Rank</th>
                <th className="py-2 pr-4 font-medium">Transition</th>
                <th className="py-2 pr-4 font-medium">Lost</th>
                <th className="py-2 font-medium">Drop-off rate</th>
              </tr>
            </thead>
            <tbody>
              {funnel.dropOffs.map((d) => (
                <tr
                  key={`${d.fromStageId}-${d.toStageId}`}
                  className="border-b border-[var(--color-border)]/60"
                >
                  <td className="py-2 pr-4 font-mono text-xs">
                    #{d.rankByAbsolute}
                  </td>
                  <td className="py-2 pr-4">
                    {d.fromLabel} → {d.toLabel}
                  </td>
                  <td className="py-2 pr-4">{d.lost.toLocaleString("en-US")}</td>
                  <td className="py-2 text-[var(--color-muted)]">
                    {formatPct(d.dropOffRate, funnel.decisionReady)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Stage definitions
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Stage</th>
                <th className="py-2 pr-4 font-medium">Evidence</th>
                <th className="py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.stageDefinitions.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{s.label}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {s.id}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{s.evidence}</td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {s.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
