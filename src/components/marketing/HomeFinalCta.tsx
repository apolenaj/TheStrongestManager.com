import Link from "next/link";
import { homeCopy } from "@/lib/content/home";

export function HomeFinalCta() {
  return (
    <section
      id="start"
      aria-labelledby="home-final-cta-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-[#050505]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(234,179,8,0.12),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="max-w-2xl border border-white/10 bg-black/50 p-8 sm:p-12">
          <p className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
            The Strongest <span className="text-yellow-500">Manager</span>
          </p>
          <h2
            id="home-final-cta-heading"
            className="mt-6 font-[family-name:var(--font-display)] text-[clamp(1.35rem,2.8vw,2.1rem)] font-semibold leading-snug tracking-tight text-white"
          >
            {homeCopy.finalCta.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-400">
            {homeCopy.finalCta.body}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-sm bg-yellow-500 px-6 text-base font-semibold text-black transition-all duration-300 hover:bg-yellow-400"
            >
              {homeCopy.ctaPrimary}
            </Link>
            <Link
              href="/methods"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/10 px-6 text-base font-medium text-white transition-all duration-300 hover:border-yellow-500/50"
            >
              {homeCopy.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
