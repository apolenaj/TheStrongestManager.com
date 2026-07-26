import type { EntitlementSystemSnapshot } from "@/domain/entitlements";

export function EntitlementSystemPanel({
  snapshot,
}: {
  snapshot: EntitlementSystemSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-3">
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
            Features
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.features.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Service
          </dt>
          <dd className="mt-1 font-mono text-sm">EntitlementService</dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Feature → plan limit map
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Feature</th>
                <th className="py-2 pr-4 font-medium">Limit key</th>
                <th className="py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.features.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.label}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {row.id}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{row.limitKey}</td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {"note" in row && row.note ? row.note : row.kind}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Plan matrix
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Plan</th>
                {snapshot.features.map((f) => (
                  <th key={f.id} className="py-2 pr-3 font-medium">
                    {f.id.replaceAll("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.matrix.map((row) => (
                <tr
                  key={row.planId}
                  className="border-b border-[var(--color-border)]/60"
                >
                  <td className="py-3 pr-4 font-medium">{row.planName}</td>
                  {snapshot.features.map((f) => (
                    <td key={f.id} className="py-3 pr-3 font-mono text-xs">
                      {String(row.features[f.id])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
