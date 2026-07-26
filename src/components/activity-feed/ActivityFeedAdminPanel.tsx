import type { ActivityFeedSnapshot } from "@/domain/activity-feed";

export function ActivityFeedAdminPanel({
  snapshot,
}: {
  snapshot: ActivityFeedSnapshot;
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
            Page size
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.pageSize}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Hard max
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.maxItems}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          MVP kinds
        </h3>
        <ul className="mt-3 space-y-3">
          {snapshot.kinds.map((k) => (
            <li
              key={k.id}
              className="border-b border-[var(--color-border)]/60 pb-3 text-sm"
            >
              <p className="font-medium">
                {k.label}{" "}
                <span className="font-mono text-xs text-[var(--color-muted)]">
                  ({k.id})
                </span>
              </p>
              <p className="mt-1 text-[var(--color-muted)]">{k.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Refused dark patterns
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.forbiddenPatterns.map((p) => (
            <li key={p}>
              <code className="text-xs">{p}</code>
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
          Athlete: <code>/app/activity-feed</code> · Runbook:{" "}
          <code>{snapshot.docPath}</code>
        </p>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Follower social network remains gated by Prompt 194 (
          <code>socialActivityFeed</code> default off).
        </p>
      </section>
    </div>
  );
}
