import type { WarmupGeneratorSnapshot } from "@/domain/warmup-generator";

export function WarmupGeneratorAdminPanel({
  snapshot,
}: {
  snapshot: WarmupGeneratorSnapshot;
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
            Max sets
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.maxSets}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Top fraction cap
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {Math.round(snapshot.topFractionCap * 100)}%
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Known exercises
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.knownExercises.map((e) => (
            <li key={e.id}>
              {e.label} ({e.id})
            </li>
          ))}
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
          Athlete: <code>/app/warmup</code> · Runbook:{" "}
          <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
