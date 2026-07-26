import type { MicroLearningSnapshot } from "@/domain/micro-learning";

export function MicroLearningPanel({
  snapshot,
}: {
  snapshot: MicroLearningSnapshot;
}) {
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
            Lessons
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.lessonCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Max / day
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.maxPerDay}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Quality
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.quality.passed ? "pass" : "fail"}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Anti-spam
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Dismiss cooldown {snapshot.dismissCooldownHours}h · Complete cooldown{" "}
          {snapshot.completeCooldownHours}h · Max {snapshot.maxPerDay} card/day
          on dashboard only.
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Catalog
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 font-mono text-xs text-[var(--color-muted)]">
          {snapshot.lessonIds.map((id) => (
            <li key={id}>{id}</li>
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
      </section>
    </div>
  );
}
