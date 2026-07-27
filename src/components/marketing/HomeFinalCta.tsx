import { ButtonLink } from "@/design-system";
import { MediaPlaceholder } from "@/components/marketing/MediaPlaceholder";
import { homeCopy } from "@/lib/content/home";

export function HomeFinalCta() {
  return (
    <section
      id="start"
      aria-labelledby="home-final-cta-heading"
      className="relative isolate overflow-hidden border-t border-[var(--color-border)]"
    >
      <MediaPlaceholder
        label="Training floor photography placeholder"
        className="absolute inset-0 -z-20 h-full w-full"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.96)_100%)]"
      />
      <div
        aria-hidden
        className="home-final-accent pointer-events-none absolute inset-x-0 top-0 h-px"
      />

      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="max-w-2xl">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--color-foreground)]">
            {homeCopy.brand}
          </p>
          <h2
            id="home-final-cta-heading"
            className="mt-6 font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2.35rem)] font-semibold leading-snug tracking-tight text-[var(--color-foreground)]"
          >
            {homeCopy.finalCta.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
            {homeCopy.finalCta.body}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/signup"
              size="lg"
              className="min-h-12 rounded-sm bg-[#e8c547] px-6 font-semibold text-[#0a0a0b] shadow-none hover:bg-[#f0d15c]"
            >
              {homeCopy.ctaPrimary}
            </ButtonLink>
            <ButtonLink
              href="/methods"
              variant="secondary"
              size="lg"
              className="min-h-12 border-[#3f3f46] bg-transparent px-6 hover:border-[#e8c547]"
            >
              {homeCopy.ctaSecondary}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
