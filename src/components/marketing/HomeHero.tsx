import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeCopy } from "@/lib/content/home";

export function HomeHero({
  primaryCtaLabel = homeCopy.ctaPrimary,
  heroSupport = homeCopy.heroSupport,
  secondaryHref = "/methods",
  secondaryLabel = homeCopy.ctaSecondary,
}: {
  primaryCtaLabel?: string;
  heroSupport?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-hidden border-b border-white/10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[#050505]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(72,72,78,0.45)_0%,rgba(24,24,27,0.35)_35%,rgba(5,5,5,0.98)_72%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.2]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 50% 20%, black 10%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-yellow-500/[0.06] blur-3xl"
      />

      <div className="mx-auto flex min-h-[88svh] w-full max-w-6xl flex-col justify-center px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
        <p className="home-rise font-[family-name:var(--font-display)] text-[clamp(1.65rem,4.5vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
          The Strongest <span className="text-yellow-500">Manager</span>
        </p>

        <h1
          id="home-hero-heading"
          className="home-rise home-rise-delay-1 mt-8 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2rem,5.5vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.55)]"
        >
          {homeCopy.heroLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <p className="home-rise home-rise-delay-2 mt-7 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
          {heroSupport}
        </p>

        <div className="home-rise home-rise-delay-3 mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-yellow-500 px-6 text-base font-semibold tracking-tight text-black transition-all duration-300 hover:bg-yellow-400"
          >
            {primaryCtaLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/10 bg-white/[0.03] px-6 text-base font-medium text-white transition-all duration-300 hover:border-yellow-500/50 hover:bg-white/[0.06]"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
