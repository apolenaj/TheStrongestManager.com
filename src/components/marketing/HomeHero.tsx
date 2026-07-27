import { ButtonLink } from "@/design-system";
import { MediaPlaceholder } from "@/components/marketing/MediaPlaceholder";
import { homeCopy } from "@/lib/content/home";

export function HomeHero({
  primaryCtaLabel = homeCopy.ctaPrimary,
  heroSupport = homeCopy.heroSupport,
  secondaryHref = "/methods",
  secondaryLabel = homeCopy.ctaSecondary,
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
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      {/* Full-bleed visual plane */}
      <MediaPlaceholder
        label="Elite strength training photography placeholder"
        className="home-hero-media absolute inset-0 -z-20 min-h-[100svh] w-full"
        iconClassName="h-10 w-10 sm:h-12 sm:w-12"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(8,8,10,0.97)_0%,rgba(8,8,10,0.88)_38%,rgba(8,8,10,0.55)_62%,rgba(8,8,10,0.72)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(to_top,#0a0a0b,transparent)]"
      />
      <div
        aria-hidden
        className="home-hero-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.22]"
      />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:justify-center sm:px-6 sm:pb-28 sm:pt-36">
        <div className="max-w-3xl">
          <p className="home-rise font-[family-name:var(--font-display)] text-[clamp(2.15rem,7vw,4.85rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-[var(--color-foreground)]">
            {homeCopy.brand}
          </p>

          <h1
            id="home-hero-heading"
            className="home-rise home-rise-delay-1 mt-8 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.55rem,3.8vw,2.85rem)] font-semibold leading-[1.12] tracking-[-0.025em] text-[var(--color-foreground)]"
          >
            {homeCopy.heroLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="home-rise home-rise-delay-2 mt-7 max-w-xl text-base leading-relaxed text-[#d4d4d8] sm:text-lg sm:leading-relaxed">
            {heroSupport}
          </p>

          <div className="home-rise home-rise-delay-3 mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink
              href="/signup"
              size="lg"
              className="min-h-12 rounded-sm bg-[#e8c547] px-6 font-semibold tracking-tight text-[#0a0a0b] shadow-none hover:bg-[#f0d15c]"
            >
              {primaryCtaLabel}
            </ButtonLink>
            <ButtonLink
              href={secondaryHref}
              variant="secondary"
              size="lg"
              className="min-h-12 border-[#3f3f46] bg-transparent px-6 text-[var(--color-foreground)] hover:border-[#e8c547] hover:bg-white/[0.03]"
            >
              {secondaryLabel}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
