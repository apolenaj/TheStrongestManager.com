import type { getObservabilitySnapshot } from "@/services/observability";

type Snapshot = ReturnType<typeof getObservabilitySnapshot>;

export function ObservabilityPanel({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-4">
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
            Signals shipped
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.shipped}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Ring buffer
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.ring.size}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Errors in ring
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.ring.byLevel.error ?? 0}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Monitoring signals
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Signal</th>
                <th className="py-2 pr-4 font-medium">Emit at</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.signals.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4 text-[var(--color-muted)]">
                    {row.category.replaceAll("_", " ")}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {row.detail}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-[var(--color-muted)]">
                    {row.emitAt}
                  </td>
                  <td className="py-3 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Recent sanitized records (this process)
        </h3>
        {snapshot.recent.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            No signals in the in-memory ring yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Level</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Message</th>
                  <th className="py-2 font-medium">Correlation</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.recent.map((row) => (
                  <tr
                    key={`${row.at}-${row.message}-${row.correlationId}`}
                    className="border-b border-[var(--color-border)]/60 align-top"
                  >
                    <td className="py-2 pr-4 text-xs text-[var(--color-muted)]">
                      {new Date(row.at).toLocaleTimeString("en-US")}
                    </td>
                    <td className="py-2 pr-4">{row.level}</td>
                    <td className="py-2 pr-4 text-[var(--color-muted)]">
                      {row.category.replaceAll("_", " ")}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.message}</td>
                    <td className="py-2 font-mono text-xs text-[var(--color-muted)]">
                      {row.correlationId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
