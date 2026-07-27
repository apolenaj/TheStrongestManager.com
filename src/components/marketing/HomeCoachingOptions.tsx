import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { coachingOptionsCopy } from "@/lib/content/home-value";
import { cn } from "@/design-system/utils/cn";

export function HomeCoachingOptions() {
  return (
    <section
      id="coaching-options"
      aria-labelledby="home-coaching-options-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {coachingOptionsCopy.eyebrow}
          </p>
          <h2
            id="home-coaching-options-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            {coachingOptionsCopy.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
            {coachingOptionsCopy.description}
          </p>
        </div>

        <ul className="mt-14 grid gap-4 lg:grid-cols-3">
          {coachingOptionsCopy.options.map((option) => (
            <li key={option.id}>
              <article
                className={cn(
                  "flex h-full flex-col border p-7 sm:p-8 transition-all duration-300",
                  option.featured
                    ? "border-[var(--color-accent)] bg-[var(--color-background)] shadow-[var(--shadow-accent-soft)]"
                    : "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]",
                )}
              >
                {option.featured ? (
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    Most direct product path
                  </p>
                ) : (
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                    Option
                  </p>
                )}

                <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
                  {option.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                  {option.summary}
                </p>

                <ul className="mt-8 flex-1 space-y-3">
                  {option.includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-[var(--color-foreground)]"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={option.href}
                  className={cn(
                    "mt-10 inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-5 text-sm font-bold uppercase tracking-[0.08em] transition-all duration-300",
                    option.featured
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
                      : "border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]",
                  )}
                >
                  {option.cta}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
