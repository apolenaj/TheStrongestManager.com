import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogActiveProgramView } from "@/services/catalog-workout";

/**
 * Contextual free → paid prompts. No scarcity timers.
 */
export function FreeProgramConversionPrompts({
  active,
}: {
  active: CatalogActiveProgramView;
}) {
  if (!active.isFree) return null;

  const showWeek1 = active.currentWeek === 1;
  const showWeek4 =
    active.currentWeek >= 4 ||
    (active.durationWeeks <= 4 && active.completionPercent >= 100);

  const paidHref = active.paidProductSlug
    ? `/programs/${active.paidProductSlug}`
    : "/pricing?tab=programs";

  return (
    <div className="space-y-4">
      {showWeek1 ? (
        <aside className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Week 1 · How this method progresses
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
            {active.methodProgressBlurb ??
              "This free block introduces the method. Later weeks in the full cycle raise specificity and intensity on a planned schedule — not random hard days."}
          </p>
          <p className="mt-3 text-xs text-[var(--color-subtle)]">
            Educational context only — not a sales countdown.
          </p>
        </aside>
      ) : null}

      {showWeek4 ? (
        <aside className="border border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] bg-[var(--color-surface-elevated)] p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
            Week 4 · Completion summary
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            Free block wrap-up
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                Sessions completed
              </dt>
              <dd className="mt-1 text-lg text-[var(--color-foreground)]">
                {active.sessionsCompleted}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                Volume logged
              </dt>
              <dd className="mt-1 text-lg text-[var(--color-foreground)]">
                {active.volumeLogged > 0
                  ? `${active.volumeLogged.toLocaleString()} ${active.unitSystem}`
                  : "No loads logged yet"}
              </dd>
            </div>
          </dl>
          <Link
            href={paidHref}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Continue with the full program
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </Link>
        </aside>
      ) : null}

      <aside className="border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
        <p className="text-sm text-[var(--color-muted)]">
          Need individual adjustments?{" "}
          <Link
            href="/coaching/apply"
            className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
          >
            Explore 1:1 coaching
          </Link>
        </p>
      </aside>
    </div>
  );
}
