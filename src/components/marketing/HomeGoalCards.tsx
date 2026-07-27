import Link from "next/link";
import { BookOpen, Dumbbell, Flag, ScanLine, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { homeCopy } from "@/lib/content/home";
import { cn } from "@/design-system/utils/cn";

const GOAL_ICONS: Record<(typeof homeCopy.goals)[number]["icon"], LucideIcon> = {
  dumbbell: Dumbbell,
  scan: ScanLine,
  flag: Flag,
  book: BookOpen,
};

export function HomeGoalCards() {
  return (
    <section
      id="goals"
      aria-labelledby="home-goals-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Choose your goal
          </p>
          <h2
            id="home-goals-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            Where do you want the next cycle to bite?
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
            Pick a lane. Every path links to a real product surface — not a
            brochure dead end.
          </p>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {homeCopy.goals.map((goal, index) => {
            const Icon = GOAL_ICONS[goal.icon];
            return (
              <li key={goal.id} className={cn(index === 0 && "sm:col-span-1")}>
                <Link
                  href={goal.href}
                  className="group relative flex h-full min-h-[16.5rem] flex-col overflow-hidden border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] hover:bg-[var(--color-surface-elevated)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(183,255,42,0.12),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90"
                  />

                  <div className="relative z-[1] flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center border border-[var(--color-border)] bg-black/30 text-[var(--color-accent)] transition-all duration-300 group-hover:border-[color-mix(in_srgb,var(--color-accent)_50%,transparent)]">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <ArrowUpRight
                      className="h-5 w-5 text-[var(--color-subtle)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-accent)]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>

                  <div className="relative z-[1] mt-auto pt-10">
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
                      {goal.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-foreground)]/85">
                      {goal.body}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
