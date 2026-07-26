import type { SportGoalLandingSnapshot } from "@/domain/sport-goal-landings";

export function SportGoalLandingsPanel({
  snapshot,
}: {
  snapshot: SportGoalLandingSnapshot;
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
            Allowlisted
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.pages.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Indexable
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.indexableCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Rejected
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.rejectedCount}
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
          Landings
        </h3>
        <div className="mt-4 space-y-6">
          {snapshot.pages.map(({ page, quality, href }) => (
            <div
              key={page.slug}
              className="border-t border-[var(--color-border)] pt-4"
            >
              <p className="font-medium">
                {page.goalLabel}
                <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">
                  {href}
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {quality.passed ? "indexable" : "rejected"} ·{" "}
                {page.productLinks.length} product links
              </p>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {quality.checks.map((c) => (
                  <li
                    key={`${page.slug}-${c.id}`}
                    className="text-xs text-[var(--color-muted)]"
                  >
                    <span className="font-mono text-[var(--color-fg)]">
                      {c.ok ? "pass" : "fail"}
                    </span>
                    {" — "}
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Filler phrases refused
        </h3>
        <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">
          {snapshot.fillerPhrases.join(" · ")}
        </p>
      </section>
    </div>
  );
}
