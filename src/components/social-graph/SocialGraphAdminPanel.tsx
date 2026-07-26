import type { SocialGraphSnapshot } from "@/domain/social-graph";

export function SocialGraphAdminPanel({
  snapshot,
}: {
  snapshot: SocialGraphSnapshot;
}) {
  const gate = snapshot.launchGate;

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
            Default privacy
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.defaultPrivate ? "Private" : "Public"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Full feed launch
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {gate.mayLaunchFullFeed ? "Allowed" : "Blocked"}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Moderation launch checklist
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {gate.honesty} Do not enable a full social feed until every row is
          green and staffing can handle reports.
        </p>
        <ul className="mt-4 space-y-3">
          {gate.checklist.map((row) => (
            <li
              key={row.id}
              className="border-b border-[var(--color-border)]/60 pb-3 text-sm"
            >
              <p className="font-medium">
                {row.ok ? "Ready" : "Blocked"} — {row.label}
              </p>
              <p className="mt-1 text-[var(--color-muted)]">{row.detail}</p>
            </li>
          ))}
        </ul>
        {gate.blockers.length > 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Blockers: {gate.blockers.join(" · ")}
          </p>
        ) : null}
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Follow targets
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.followTargets.map((t) => (
            <li key={t.id}>
              {t.label} ({t.id})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Follow statuses
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Private accounts start at pending until accepted. Blocked edges mute
          the relationship.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.followStatuses.map((s) => (
            <li key={s.id}>
              {s.label} ({s.id})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Planned activity kinds
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Contract only — no live posts are generated from this console.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.activityKinds.map((k) => (
            <li key={k.id}>
              {k.label} ({k.id})
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
          Runbook: <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
