import type { UnitSystemSnapshot } from "@/domain/unit-system";

export function UnitSystemPanel({
  snapshot,
}: {
  snapshot: UnitSystemSnapshot;
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
            Canonical storage
          </dt>
          <dd className="mt-1 text-sm">
            mass {snapshot.canonical.mass} · length {snapshot.canonical.length} ·
            distance {snapshot.canonical.distance}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Presentation
          </dt>
          <dd className="mt-1 text-sm">
            metric: kg / cm / m·km · imperial: lb / ft·in / ft·mi
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Sample conversions (presentation only)
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Canonical</th>
                <th className="py-2 pr-4 font-medium">Metric</th>
                <th className="py-2 font-medium">Imperial</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border)]/60">
                <td className="py-3 pr-4">100 kg</td>
                <td className="py-3 pr-4">{snapshot.samples.mass100kg.metric}</td>
                <td className="py-3">{snapshot.samples.mass100kg.imperial}</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/60">
                <td className="py-3 pr-4">180 cm</td>
                <td className="py-3 pr-4">
                  {snapshot.samples.height180cm.metric}
                </td>
                <td className="py-3">
                  {snapshot.samples.height180cm.imperial}
                </td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/60">
                <td className="py-3 pr-4">40 m walk</td>
                <td className="py-3 pr-4">{snapshot.samples.walk40m.metric}</td>
                <td className="py-3">{snapshot.samples.walk40m.imperial}</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/60">
                <td className="py-3 pr-4">5000 m</td>
                <td className="py-3 pr-4">{snapshot.samples.run5km.metric}</td>
                <td className="py-3">{snapshot.samples.run5km.imperial}</td>
              </tr>
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
