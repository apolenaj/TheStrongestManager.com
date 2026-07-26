import { ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { homeCopy } from "@/lib/content/home";

export function HomeFinalCta() {
  const secondaryHref = featureFlags.demoMode ? "/demo" : "/features";
  const secondaryLabel = featureFlags.demoMode
    ? "Explore example dashboard"
    : "See what's included";

  return (
    <section
      id="start"
      className="relative border-t border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="home-final-accent pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl">
          {homeCopy.brand}
        </p>
        <h2 className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug tracking-tight text-[var(--color-foreground)] sm:text-3xl">
          Create a free account and log your next session.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
          {homeCopy.ambition}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/signup" size="lg">
            Start free
          </ButtonLink>
          <ButtonLink href={secondaryHref} variant="secondary" size="lg">
            {secondaryLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
