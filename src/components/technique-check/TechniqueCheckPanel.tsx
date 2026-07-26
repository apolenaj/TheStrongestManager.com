import type { TechniqueCheckSnapshot } from "@/domain/technique-check";

export function TechniqueCheckPanel({
  snapshot,
}: {
  snapshot: TechniqueCheckSnapshot;
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
            Claim limit
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.claimLimit} / hr
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Ticket TTL
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.ticketTtlSeconds}s
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
          Funnel
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.funnelSteps.map((s) => (
            <li key={s.id}>
              <span className="text-[var(--color-fg)]">{s.label}</span> —{" "}
              {s.detail}
            </li>
          ))}
        </ol>
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

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Privacy
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {snapshot.privacyCopy}
        </p>
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

      <p className="font-mono text-xs text-[var(--color-muted)]">
        Public: {snapshot.publicPath} · Signup: {snapshot.signupHref}
      </p>
    </div>
  );
}
