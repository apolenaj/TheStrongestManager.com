import type { PersonalizedHomepageSnapshot } from "@/domain/personalized-homepage";

export function PersonalizedHomepagePanel({
  snapshot,
}: {
  snapshot: PersonalizedHomepageSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            Intents
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.intents.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Canonical
          </dt>
          <dd className="mt-1 font-mono text-sm">
            {snapshot.lockedMetadata.canonical}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Anti-cloaking & brand
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Locked metadata (all intents)
        </h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Title
            </dt>
            <dd className="mt-1">{snapshot.lockedMetadata.title}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Description
            </dt>
            <dd className="mt-1 text-[var(--color-muted)]">
              {snapshot.lockedMetadata.description}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm">
          <span className="text-[var(--color-muted)]">Brand: </span>
          {snapshot.brandIdentity.brand}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Hero lines: {snapshot.brandIdentity.heroLines.join(" / ")}
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Intent variants
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Use <span className="font-mono">?intent=</span> or allowlisted{" "}
          <span className="font-mono">utm_campaign</span> aliases. Soft support
          and secondary CTA only.
        </p>
        <div className="mt-4 space-y-6">
          {snapshot.variants.map((v) => {
            const def = snapshot.intents.find((i) => i.id === v.intentId);
            return (
              <div
                key={v.intentId}
                className="border-t border-[var(--color-border)] pt-4"
              >
                <p className="font-medium">
                  {def?.label ?? v.intentId}
                  <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">
                    {v.intentId}
                  </span>
                </p>
                {def?.aliases.length ? (
                  <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                    aliases: {def.aliases.join(", ")}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {v.heroSupport}
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  Secondary: {v.secondaryLabel} →{" "}
                  <span className="font-mono">{v.secondaryHref}</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
