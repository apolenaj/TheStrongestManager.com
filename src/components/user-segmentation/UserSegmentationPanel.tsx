import type { UserSegmentationSnapshot } from "@/domain/user-segmentation";

function formatRate(rate: number | null): string {
  if (rate == null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

export function UserSegmentationPanel({
  snapshot,
}: {
  snapshot: UserSegmentationSnapshot;
}) {
  const { cohort } = snapshot;
  const maxCount = Math.max(1, ...cohort.rows.map((r) => r.count));

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
            Athletes
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {cohort.cohortSize}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Multi-segment
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {cohort.multiSegmentCount}
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
        <p className="mt-3 text-sm text-[var(--color-muted)]">{cohort.note}</p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Unsegmented (no matching labels): {cohort.unsegmentedCount}. Engagement
          window: {snapshot.engagementWindowDays}d.
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Segment distribution
        </h3>
        <ol className="mt-6 space-y-4">
          {cohort.rows.map((row) => {
            const width =
              row.count === 0
                ? 0
                : Math.max(2, Math.round((row.count / maxCount) * 100));
            return (
              <li key={row.id} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {row.label}
                    <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">
                      {row.kind}
                    </span>
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {row.count} · {formatRate(row.rateOfCohort)} of cohort
                  </p>
                </div>
                <div
                  className="h-3 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-border)]/40"
                  role="img"
                  aria-label={`${row.label}: ${row.count} athletes`}
                >
                  <div
                    className="h-full rounded-[var(--radius-sm)] bg-[var(--color-fg)] transition-[width] duration-500 ease-out"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Segment definitions
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Segment</th>
                <th className="py-2 pr-4 font-medium">Kind</th>
                <th className="py-2 font-medium">Signal</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.segments.map((s) => (
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
                  <td className="py-3 pr-4 font-mono text-xs">{s.kind}</td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {s.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Never used
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Sensitive demographic signals are denied for segmentation.
        </p>
        <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">
          {snapshot.sensitiveDenylist.join(", ")}
        </p>
      </section>

      {snapshot.sampleAthletes.length > 0 ? (
        <section>
          <h3 className="font-[family-name:var(--font-display)] text-lg">
            Sample assignments
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 font-medium">Segments</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.sampleAthletes.map((a) => (
                  <tr
                    key={a.userId}
                    className="border-b border-[var(--color-border)]/60"
                  >
                    <td className="py-2 pr-4 font-mono text-xs">
                      {a.userId.slice(0, 10)}…
                    </td>
                    <td className="py-2 text-xs text-[var(--color-muted)]">
                      {a.segments.length > 0
                        ? a.segments.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section>
          <h3 className="font-[family-name:var(--font-display)] text-lg">
            Sample assignments
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            No non-demo athletes in the last {snapshot.cohortDays} days.
          </p>
        </section>
      )}
    </div>
  );
}
