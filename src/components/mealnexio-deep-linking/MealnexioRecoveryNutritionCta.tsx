import type { RecoveryNutritionDeepLinkPrompt } from "@/domain/mealnexio-deep-linking";

/**
 * Cross-product CTA: recovery context → Mealnexio nutrition review.
 * Plain external link — no fake SSO session.
 */
export function MealnexioRecoveryNutritionCta({
  prompt,
}: {
  prompt: RecoveryNutritionDeepLinkPrompt;
}) {
  return (
    <aside className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
        {prompt.message}
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{prompt.caveat}</p>
      <p className="mt-4">
        <a
          href={prompt.deepLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          {prompt.ctaLabel}
        </a>
      </p>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        {prompt.deepLink.honesty}
      </p>
    </aside>
  );
}
