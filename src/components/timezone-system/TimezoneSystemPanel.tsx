import type { TimezoneSystemSnapshot } from "@/domain/timezone-system";

export function TimezoneSystemPanel({
  snapshot,
}: {
  snapshot: TimezoneSystemSnapshot;
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
            Storage
          </dt>
          <dd className="mt-1 text-sm">{snapshot.storageRule}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Display
          </dt>
          <dd className="mt-1 text-sm">{snapshot.displayRule}</dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Surfaces
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.surfaces.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Sample instant (store UTC → display local)
        </h3>
        <dl className="mt-3 grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted)]">UTC ISO</dt>
            <dd className="font-mono">{snapshot.samples.utcIso}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">America/New_York</dt>
            <dd>{snapshot.samples.newYorkDate}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Europe/Prague</dt>
            <dd>{snapshot.samples.pragueDate}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Local calendar near midnight</dt>
            <dd>{snapshot.samples.nearMidnightUtc}</dd>
          </div>
        </dl>
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
