import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FreeProgramConversionPrompts } from "@/components/catalog-workout/FreeProgramConversionPrompts";
import type {
  CatalogActiveProgramView,
  CatalogLibraryItem,
} from "@/services/catalog-workout";

function LibraryGroup({
  title,
  items,
}: {
  title: string;
  items: CatalogLibraryItem[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {title}
      </h3>
      <ul className="mt-3 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        {items.map((item) => (
          <li
            key={item.userProgramId}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-medium text-[var(--color-foreground)]">
                {item.productName}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                {item.source} · week {item.currentWeek}/{item.durationWeeks} ·{" "}
                {item.status}
              </p>
            </div>
            {item.status === "active" ? (
              <Link
                href={`/app/programs/active/${item.userProgramId}`}
                className="text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                Open
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CatalogProgramsDashboard({
  active,
  library,
}: {
  active: CatalogActiveProgramView | null;
  library: CatalogLibraryItem[];
}) {
  const purchased = library.filter(
    (i) => !i.isFree && i.kind !== "completed",
  );
  const free = library.filter((i) => i.isFree && i.kind !== "completed");
  const completed = library.filter((i) => i.kind === "completed");

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
          Active program
        </h2>
        {!active ? (
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <p className="text-sm text-[var(--color-muted)]">
              No active catalog program. Start a free 4-week block from the public
              catalog or finder.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/programs/find-my-program"
                className="inline-flex min-h-11 items-center rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)]"
              >
                Find my program
              </Link>
              <Link
                href="/programs"
                className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)]"
              >
                Browse catalog
              </Link>
            </div>
          </div>
        ) : (
          <article className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
              Week {active.currentWeek} of {active.durationWeeks}
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              {active.productName}
            </h3>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                  Current block
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {active.currentBlock}
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                  Week completion
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {active.completionPercent}%
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                  Next workout
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-foreground)]">
                  {active.nextWorkout?.label ?? "Week complete"}
                </dd>
              </div>
            </dl>
            <div
              className="mt-5 h-1.5 overflow-hidden bg-[var(--color-surface)]"
              role="progressbar"
              aria-valuenow={active.completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-[var(--color-accent)] transition-[width] duration-300"
                style={{ width: `${active.completionPercent}%` }}
              />
            </div>
            {active.pendingTmAdjustments > 0 ? (
              <p className="mt-4 text-xs text-[var(--color-warning)]">
                {active.pendingTmAdjustments} training-max suggestion
                {active.pendingTmAdjustments === 1 ? "" : "s"} waiting for your
                approval.
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {active.nextWorkout ? (
                <Link
                  href={active.nextWorkout.href}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)]"
                >
                  Start next workout
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                </Link>
              ) : null}
              <Link
                href={`/app/programs/active/${active.userProgramId}`}
                className="inline-flex min-h-11 items-center border border-[var(--color-border)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)]"
              >
                Program overview
              </Link>
            </div>
            {active.isFree ? (
              <div className="mt-6">
                <FreeProgramConversionPrompts active={active} />
              </div>
            ) : null}
          </article>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
          My library
        </h2>
        {library.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Purchased, free, and completed catalog programs will appear here.
          </p>
        ) : (
          <div className="space-y-8">
            <LibraryGroup title="Purchased" items={purchased} />
            <LibraryGroup title="Free" items={free} />
            <LibraryGroup title="Completed" items={completed} />
          </div>
        )}
      </section>
    </div>
  );
}
