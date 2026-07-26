import type { ProgrammaticSeoSafetySnapshot } from "@/domain/programmatic-seo-safety";

export function ProgrammaticSeoSafetyPanel({
  snapshot,
}: {
  snapshot: ProgrammaticSeoSafetySnapshot;
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
          Templates
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Template</th>
                <th className="py-2 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.templates.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{t.label}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {t.id}
                    </p>
                  </td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {t.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Quality-gated pages
        </h3>
        <div className="mt-4 space-y-6">
          {snapshot.pages.map(({ page, quality, href }) => (
            <div
              key={page.slug}
              className="border-t border-[var(--color-border)] pt-4"
            >
              <p className="font-medium">
                {page.title}
                <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">
                  {href}
                </span>
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                template={page.templateId} ·{" "}
                {quality.passed ? "indexable" : "rejected"}
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {quality.checks.map((c) => (
                  <li
                    key={`${page.slug}-${c.id}-${c.label}`}
                    className="text-xs text-[var(--color-muted)]"
                  >
                    <span className="font-mono text-[var(--color-fg)]">
                      {c.ok ? "pass" : "fail"}
                    </span>
                    {" — "}
                    {c.label}: {c.detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Refused patterns
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.refused.map((r) => (
            <li key={r.id}>
              <span className="text-[var(--color-fg)]">{r.label}</span>
              {" — "}
              {r.reason}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
