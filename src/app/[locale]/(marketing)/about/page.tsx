import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PAGE_TITLE = "About Joe Apolenar — The Strongest";
const PAGE_DESCRIPTION =
  "Joe Apolenar: natural IPF powerlifter (−120 kg), former 155 kg athlete turned 115 kg competitor, retail operations manager, and full-stack builder of The Strongest.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Joe Apolenar",
    "Josef Apolenar",
    "IPF powerlifter",
    "online powerlifting coach",
    "The Strongest",
  ],
  alternates: { canonical: "/about" },
  authors: [{ name: "Joe Apolenar" }],
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/about",
    type: "profile",
  },
};

const LIFT_STATS = [
  { value: "310 kg", label: "Deadlift" },
  { value: "775 kg", label: "Total" },
  { value: "−120 kg", label: "IPF class" },
  { value: "290 kg", label: "Squat" },
  { value: "185 kg", label: "Bench" },
] as const;

export default function AboutPage() {
  return (
    <article className="bg-[var(--color-background)]">
      {/* 1 — Hook */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(220,38,38,0.14),transparent_48%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_85%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-600">
            Founder · Joe Apolenar
          </p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[0.95] tracking-tighter text-white">
            Built on Pain.
            <br />
            Driven by Results.
          </h1>
          <p className="mt-8 max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
            The Strongest is not just a fitness brand. It is the
            intersection of elite strength and professional management systems —
            built by a natural IPF powerlifter who also ran retail operations and
            ships full-stack platforms.
          </p>
          <p className="mt-6 font-[family-name:var(--font-display)] text-sm font-medium uppercase tracking-[0.2em] text-white">
            Discipline Today, Strength Forever.
          </p>
        </div>
      </section>

      {/* Athletic identity strip */}
      <section
        aria-label="Athletic status"
        className="border-b border-white/10 bg-[var(--color-surface)]"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-4 py-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-zinc-400 sm:px-6">
          <span className="text-white">Natural IPF Powerlifter</span>
          <span aria-hidden className="text-white/20">
            /
          </span>
          <span>Ice Hockey</span>
          <span aria-hidden className="text-white/20">
            /
          </span>
          <span>Fighter</span>
          <span aria-hidden className="text-white/20">
            /
          </span>
          <span>Fitness Coach</span>
        </div>
      </section>

      {/* 2 — Transformation */}
      <section
        aria-labelledby="transformation-heading"
        className="border-b border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
                The Transformation
              </p>
              <h2
                id="transformation-heading"
                className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.25rem)] font-black uppercase leading-[1.02] tracking-tighter text-white"
              >
                155 kg → 115 kg
              </h2>
              <p className="mt-3 text-sm uppercase tracking-[0.14em] text-zinc-500">
                342 lbs → 253 lbs · Two years
              </p>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
                A grueling two-year body transformation. Not a challenge. Not a
                hype cycle. Relentless discipline and consistency — session after
                session, decision after decision — until the scale and the
                platform both moved.
              </p>
              <p className="mt-6 max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
                That process is the same operating system behind every programme
                here: structure under pressure, measurable progress, and zero
                tolerance for random effort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — The Numbers */}
      <section
        aria-labelledby="numbers-heading"
        className="border-b border-white/10 bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
            Competition / Gym
          </p>
          <h2
            id="numbers-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.25rem)] font-black uppercase tracking-tighter text-white"
          >
            The Numbers
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-400">
            Natural IPF powerlifter in the −120 kg class. Best lifts below —
            competition and gym standards, not marketing fiction.
          </p>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            {LIFT_STATS.map((stat) => (
              <li
                key={stat.label}
                className="border border-white/10 bg-[var(--color-background)] px-5 py-7"
              >
                <p className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.35rem)] font-black tracking-tighter text-red-600">
                  {stat.value}
                </p>
                <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4 — Managerial Mindset */}
      <section
        aria-labelledby="mindset-heading"
        className="border-b border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
            The Managerial Mindset
          </p>
          <h2
            id="mindset-heading"
            className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.25rem)] font-black uppercase leading-[1.02] tracking-tighter text-white"
          >
            Same System.
            <br />
            Different Arena.
          </h2>

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-white">
                Corporate operations
              </h3>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-400">
                Extensive background as Store and Area Manager for massive retail
                chains — Amazon, Tesco, Kaufland, Lidl — plus a degree in
                Managerial Psychology and IT. Leading people, processes, and
                results under real operational pressure.
              </p>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-white">
                Full-stack systems
              </h3>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-400">
                Full-stack developer building custom platforms with Next.js,
                Tailwind, and Supabase — the same stack powering The Strongest
                Manager.
              </p>
            </div>
          </div>

          <p className="mt-12 max-w-prose border-l-2 border-red-600 pl-6 text-base leading-relaxed text-zinc-300 sm:text-lg">
            Managing massive retail operations and coding full-stack apps
            requires the exact same structured, systematic approach as peaking
            for a 310 kg deadlift. That is why the training programmes here are
            systems — not random workouts.
          </p>
        </div>
      </section>

      {/* Philosophy / Will of Fire */}
      <section
        aria-labelledby="philosophy-heading"
        className="border-b border-white/10 bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
            Philosophy
          </p>
          <h2
            id="philosophy-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.5rem)] font-black uppercase tracking-tighter text-white"
          >
            Discipline Today,
            <br />
            Strength Forever.
          </h2>
          <p className="mt-8 max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
            The Will of Fire is the bridge: elite physical strength and
            professional management systems, forced into one operating standard.
            Show up. Execute the plan. Measure what matters. Repeat until the
            result is inevitable.
          </p>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/program-audit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-red-600 px-5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              Get your free strength audit
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </Link>
            <Link
              href="/coaching/apply"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/10 px-5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              Apply for coaching
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
