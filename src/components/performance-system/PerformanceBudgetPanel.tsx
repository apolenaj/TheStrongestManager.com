import type { PerformanceSystemSnapshot } from "@/domain/performance-system";

function pillarLabel(pillar: string): string {
  return pillar.replaceAll("_", " ");
}

export function PerformanceBudgetPanel({
  snapshot,
}: {
  snapshot: PerformanceSystemSnapshot;
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
            Surfaces
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.budgets.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Optimizations shipped
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {
              snapshot.optimizations.filter((o) => o.status === "shipped")
                .length
            }
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Measurable budgets (good CWV)
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Field targets — LCP / INP / CLS / TTFB. Global good thresholds: LCP ≤{" "}
          {snapshot.thresholds.LCP}ms, INP ≤ {snapshot.thresholds.INP}ms, CLS ≤{" "}
          {snapshot.thresholds.CLS}, TTFB ≤ {snapshot.thresholds.TTFB}ms.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Surface</th>
                <th className="py-2 pr-4 font-medium">Path</th>
                <th className="py-2 pr-4 font-medium">LCP</th>
                <th className="py-2 pr-4 font-medium">INP</th>
                <th className="py-2 pr-4 font-medium">CLS</th>
                <th className="py-2 font-medium">TTFB</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.budgets.map((row) => (
                <tr
                  key={row.surface}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4 font-medium">{row.label}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-[var(--color-muted)]">
                    {row.pathPattern}
                  </td>
                  <td className="py-3 pr-4">≤ {row.budgets.lcpMs}ms</td>
                  <td className="py-3 pr-4">≤ {row.budgets.inpMs}ms</td>
                  <td className="py-3 pr-4">≤ {row.budgets.cls}</td>
                  <td className="py-3">≤ {row.budgets.ttfbMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Optimization pillars
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Pillar</th>
                <th className="py-2 pr-4 font-medium">Action</th>
                <th className="py-2 pr-4 font-medium">Surfaces</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.optimizations.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4 text-[var(--color-muted)]">
                    {pillarLabel(row.pillar)}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {row.detail}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-[var(--color-muted)]">
                    {row.surfaces.join(", ")}
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
