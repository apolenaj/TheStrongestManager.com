import Link from "next/link";
import { homeCopy } from "@/lib/content/home";

export function HomeFinalCta() {
  return (
    <section
      id="start"
      aria-labelledby="home-final-cta-heading"
      className="relative isolate overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(183,255,42,0.1),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="max-w-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 sm:p-12">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold uppercase leading-[1.05] tracking-[0.02em] text-[var(--color-foreground)]">
            The Strongest{" "}
            <span className="text-[var(--color-accent)]">Manager</span>
          </p>
          <h2
            id="home-final-cta-heading"
            className="mt-6 font-[family-name:var(--font-display)] text-[clamp(1.35rem,2.8vw,2.1rem)] font-semibold uppercase leading-snug tracking-[0.02em] text-[var(--color-foreground)]"
          >
            {homeCopy.finalCta.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
            {homeCopy.finalCta.body}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-accent)] px-6 text-base font-semibold text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)]"
            >
              {homeCopy.ctaPrimary}
            </Link>
            <Link
              href="/methods"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[var(--color-border)] px-6 text-base font-medium text-[var(--color-foreground)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_50%,transparent)]"
            >
              {homeCopy.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
