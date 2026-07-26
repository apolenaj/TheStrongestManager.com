import type { DeviceDataNormalizationSnapshot } from "@/domain/device-data-normalization";

export function DeviceDataNormalizationPanel({
  snapshot,
}: {
  snapshot: DeviceDataNormalizationSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2">
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
            Families
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.families.length}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Metric families
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          {snapshot.families.map((f) => (
            <li key={f.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {f.label}
              </span>
              <span className="ml-2 font-mono text-[10px]">{f.id}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Canonical units
        </h3>
        <dl className="mt-3 grid gap-2 text-sm text-[var(--color-muted)] sm:grid-cols-2">
          {Object.entries(snapshot.canonicalUnits).map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px]">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Comparison caveats
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          <li>{snapshot.caveats.crossDevice}</li>
          <li>{snapshot.caveats.sameSourceTrend}</li>
          <li>{snapshot.caveats.hrvMethod}</li>
        </ul>
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
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Runbook: <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
