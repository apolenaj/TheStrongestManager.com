import { BarChart3, Brain, Dumbbell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { homeCopy } from "@/lib/content/home";

const PILLAR_ICONS: Record<(typeof homeCopy.pillars)[number]["id"], LucideIcon> =
  {
    powerlifting: Dumbbell,
    mental: Brain,
    data: BarChart3,
  };

export function HomePillars() {
  return (
    <section
      id="pillars"
      aria-labelledby="home-pillars-heading"
      className="relative border-t border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Philosophy
          </p>
          <h2
            id="home-pillars-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold uppercase leading-[1.1] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            Three pillars of dominance
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
            Strength on the platform, resilience in decisions, and progress
            driven by data — one system for the athlete and the leader.
          </p>
        </div>

        <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          {homeCopy.pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[pillar.id];
            return (
              <li
                key={pillar.id}
                className="home-rise group border-t border-[var(--color-border)] pt-8 transition-all duration-300"
                style={{ animationDelay: `${0.06 * index}s` }}
              >
                <div className="flex h-11 w-11 items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-accent)] transition-all duration-300 group-hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)]">
                  <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden />
                </div>
                <p className="mt-6 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                  0{index + 1}
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)] sm:text-2xl">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
                  {pillar.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
