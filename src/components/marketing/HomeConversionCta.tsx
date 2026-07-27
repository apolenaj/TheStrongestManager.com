import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { finalCtaCopy } from "@/lib/content/home-value";

export function HomeConversionCta() {
  return (
    <section
      id="start"
      aria-labelledby="home-conversion-cta-heading"
      className="relative isolate overflow-hidden border-b border-[var(--color-border)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[#050605]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(183,255,42,0.14)_0%,transparent_48%),radial-gradient(ellipse_at_80%_100%,rgba(24,27,24,0.9)_0%,#050605_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start px-4 py-24 sm:px-6 sm:py-32 lg:py-36">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Final call
        </p>
        <h2
          id="home-conversion-cta-heading"
          className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.4rem,7vw,5rem)] font-bold uppercase leading-[0.98] tracking-[0.01em] text-[var(--color-foreground)]"
        >
          {finalCtaCopy.title}
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
          {finalCtaCopy.body}
        </p>
        <div className="mt-12 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href={finalCtaCopy.primaryHref}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-7 text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)]"
          >
            {finalCtaCopy.primaryCta}
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
          <Link
            href={finalCtaCopy.secondaryHref}
            className="inline-flex min-h-14 items-center justify-center rounded-sm border border-[var(--color-border)] px-7 text-sm font-bold uppercase tracking-[0.1em] text-[var(--color-foreground)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_45%,transparent)]"
          >
            {finalCtaCopy.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
