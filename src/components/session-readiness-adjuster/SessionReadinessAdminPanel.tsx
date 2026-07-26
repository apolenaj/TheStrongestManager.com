import type { SessionReadinessAdjusterSnapshot } from "@/domain/session-readiness-adjuster";

export function SessionReadinessAdminPanel({
  snapshot,
}: {
  snapshot: SessionReadinessAdjusterSnapshot;
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
            Review-load min concerns
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.reviewLoadMinConcerns}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Cancel from check-in
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            Never
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Recommendations
        </h3>
        <ul className="mt-3 space-y-3">
          {snapshot.recommendations.map((r) => (
            <li
              key={r.id}
              className="border-b border-[var(--color-border)]/60 pb-3 text-sm"
            >
              <p className="font-medium">
                {r.label}{" "}
                <span className="font-mono text-xs text-[var(--color-muted)]">
                  ({r.id})
                </span>
              </p>
              <p className="mt-1 text-[var(--color-muted)]">{r.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Check-in fields
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.checkInFields.map((f) => (
            <li key={f.id}>
              {f.label} ({f.id})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Forbidden
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.forbidden.map((id) => (
            <li key={id}>
              <code className="text-xs">{id}</code>
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
          Athlete: <code>/app/session-readiness</code> ·{" "}
          <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
