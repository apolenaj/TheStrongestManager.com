import type { OnSiteEducationSnapshot } from "@/domain/on-site-education";
import { getEducationTopic } from "@/domain/on-site-education";

export function OnSiteEducationPanel({
  snapshot,
}: {
  snapshot: OnSiteEducationSnapshot;
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
            Topics
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.topicCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Trigger
          </dt>
          <dd className="mt-1 text-sm">{snapshot.triggerLabel}</dd>
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
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Topics
        </h3>
        <div className="mt-4 space-y-4">
          {snapshot.topicIds.map((id) => {
            const topic = getEducationTopic(id);
            if (!topic) return null;
            return (
              <div
                key={id}
                className="border-t border-[var(--color-border)] pt-3"
              >
                <p className="font-medium">
                  {topic.title}{" "}
                  <span className="font-mono text-xs text-[var(--color-muted)]">
                    {id}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {topic.shortWhy}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Quality checks
        </h3>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {snapshot.quality.checks.map((c) => (
            <li key={c.id} className="text-xs text-[var(--color-muted)]">
              <span className="font-mono text-[var(--color-fg)]">
                {c.ok ? "pass" : "fail"}
              </span>
              {" — "}
              {c.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
