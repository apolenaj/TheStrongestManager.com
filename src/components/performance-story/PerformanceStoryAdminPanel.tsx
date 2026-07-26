import type { PerformanceStorySnapshot } from "@/domain/performance-story";

export function PerformanceStoryAdminPanel({
  snapshot,
}: {
  snapshot: PerformanceStorySnapshot;
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
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Example chapter shape
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.exampleChapterShape.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Causality caveat
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {snapshot.causalityCaveat}
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
          Athlete: <code>/app/performance-story</code> · Share:{" "}
          <code>/share/story/[token]</code> · <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
