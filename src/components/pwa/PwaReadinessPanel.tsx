import type { PwaReadinessSnapshot } from "@/domain/pwa-readiness";

export function PwaReadinessPanel({
  snapshot,
}: {
  snapshot: PwaReadinessSnapshot;
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
            Service worker
          </dt>
          <dd className="mt-1 font-mono text-sm">{snapshot.swPath}</dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Capabilities
        </h3>
        <ul className="mt-3 space-y-4 text-sm text-[var(--color-muted)]">
          {snapshot.capabilities.map((c) => (
            <li key={c.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {c.title}
              </span>
              <span className="mt-1 block text-xs">{c.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Never cache (deny list)
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-[var(--color-muted)]">
          {snapshot.neverCachePatterns.map((p) => (
            <li
              key={p}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Shell precache
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-mono text-xs text-[var(--color-muted)]">
          {snapshot.shellPrecache.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Caches: {snapshot.cacheNames.shell} · {snapshot.cacheNames.static}
        </p>
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
