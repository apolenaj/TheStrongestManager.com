import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { coachingProcessSteps } from "@/lib/content/home-value";

export function HomeCoachingProcess() {
  return (
    <section
      id="how-coaching-works"
      aria-labelledby="home-coaching-process-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              How coaching works
            </p>
            <h2
              id="home-coaching-process-heading"
              className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
            >
              Four steps. No guessing theater.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
              Assessment → build → adjust → perform. Every step is tied to
              product surfaces you can actually open.
            </p>
          </div>
          <Link
            href="/coaching"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-accent)] transition-colors duration-300 hover:text-[var(--color-accent-hover)]"
          >
            Explore coaching
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        <ol className="mt-12 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {coachingProcessSteps.map((step, index) => (
            <li
              key={step.id}
              className="relative border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
            >
              <p className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[0.04em] text-[var(--color-accent)]">
                {step.id}
              </p>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.06em] text-[var(--color-foreground)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {step.body}
              </p>
              {index < coachingProcessSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-[var(--color-border)] xl:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
