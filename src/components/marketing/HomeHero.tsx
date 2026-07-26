import { ButtonLink } from "@/design-system";
import { homeCopy } from "@/lib/content/home";

export function HomeHero({
  primaryCtaLabel = "Start free",
  heroSupport = homeCopy.heroSupport,
  secondaryHref = "/features",
  secondaryLabel = "See what's included",
}: {
  primaryCtaLabel?: string;
  /** Soft support by traffic intent — brand + headline lines stay canonical. */
  heroSupport?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden border-b border-[var(--color-border)] pb-16 pt-28 sm:justify-center sm:pb-28 sm:pt-36"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--color-background)]" />
        <div className="home-hero-grid absolute inset-0 opacity-[0.45]" />
        <div className="absolute inset-x-0 top-0 h-[min(72vh,42rem)] bg-[radial-gradient(ellipse_at_18%_0%,rgba(212,160,23,0.11),transparent_52%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--color-background),transparent)]" />
        <div className="absolute inset-y-[18%] right-0 hidden w-px bg-[linear-gradient(to_bottom,transparent,rgba(212,160,23,0.35),transparent)] lg:block lg:right-[max(1.5rem,calc((100%-72rem)/2+1.5rem))]" />
        <div className="home-hero-line absolute left-[max(1rem,calc((100%-72rem)/2+1rem))] top-28 hidden h-[42%] w-px bg-[var(--color-accent)]/55 sm:block" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-border-strong),transparent)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <p className="home-rise font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,4.75rem)] font-semibold leading-[var(--leading-tight)] tracking-[-0.03em] text-[var(--color-foreground)]">
          {homeCopy.brand}
        </p>

        <h1
          id="home-hero-heading"
          className="home-rise home-rise-delay-1 mt-8 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[var(--color-foreground)]"
        >
          {homeCopy.heroLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <p className="home-rise home-rise-delay-2 mt-7 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg sm:leading-relaxed">
          {heroSupport}
        </p>

        <div className="home-rise home-rise-delay-3 mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/signup" size="lg">
            {primaryCtaLabel}
          </ButtonLink>
          <ButtonLink href={secondaryHref} variant="secondary" size="lg">
            {secondaryLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
