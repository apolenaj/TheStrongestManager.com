import type { MealnexioDeepLinkingSnapshot } from "@/domain/mealnexio-deep-linking";

export function MealnexioDeepLinkingPanel({
  snapshot,
}: {
  snapshot: MealnexioDeepLinkingSnapshot;
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
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Return protocol
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.returnProtocol.status}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Example CTA
        </h3>
        <p className="mt-2 text-sm text-[var(--color-foreground)]">
          {snapshot.examplePrompt.message}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          CTA: {snapshot.examplePrompt.ctaLabel}
        </p>
        <p className="mt-3 break-all font-mono text-[10px] text-[var(--color-muted)]">
          {snapshot.sampleOutboundHref}
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Intents
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          {snapshot.intents.map((i) => (
            <li key={i.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {i.label}
              </span>
              <span className="ml-2 font-mono text-[10px]">{i.id}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">SSO</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {snapshot.sso.statusLabel} · planned {snapshot.sso.plannedModel}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{snapshot.sso.note}</p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Return path
        </h3>
        <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">
          {snapshot.returnProtocol.returnPath}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {snapshot.returnProtocol.note}
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
          Runbook: <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
