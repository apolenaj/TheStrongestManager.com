import type { DatabaseScaleSnapshot } from "@/domain/database-scale";

function severityLabel(severity: string): string {
  if (severity === "ok") return "OK";
  if (severity === "watch") return "Watch";
  if (severity === "action") return "Action";
  return severity;
}

export function DatabaseScalePanel({
  snapshot,
}: {
  snapshot: DatabaseScaleSnapshot;
}) {
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
            Shipped
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.shipped}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Watch / planned
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.watch} / {snapshot.counts.planned}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Technique page size
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.pageSizes.techniqueList}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Audit findings
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Focus</th>
                <th className="py-2 pr-4 font-medium">Finding</th>
                <th className="py-2 pr-4 font-medium">Severity</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.findings.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4 text-[var(--color-muted)]">
                    {row.focus.replaceAll("_", " ")}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {row.detail}
                    </p>
                  </td>
                  <td className="py-3 pr-4">{severityLabel(row.severity)}</td>
                  <td className="py-3 capitalize">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Scaling path (no premature shard)
        </h3>
        <ol className="mt-4 space-y-4">
          {snapshot.scalingPath.map((phase) => (
            <li
              key={phase.id}
              className="border-b border-[var(--color-border)]/60 pb-4"
            >
              <p className="font-medium">
                Phase {phase.phase}: {phase.title}
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Trigger: {phase.triggers}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
                {phase.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Avoid: {phase.avoid}
              </p>
            </li>
          ))}
        </ol>
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
