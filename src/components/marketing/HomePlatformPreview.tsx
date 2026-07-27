import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Layers3,
} from "lucide-react";
import { platformPreviewCopy } from "@/lib/content/home-value";

export function HomePlatformPreview() {
  const { currentBlock, readiness, nextHeavy } = platformPreviewCopy;

  return (
    <section
      id="platform-preview"
      aria-labelledby="home-platform-preview-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(183,255,42,0.06),transparent_45%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {platformPreviewCopy.eyebrow}
          </p>
          <h2
            id="home-platform-preview-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            {platformPreviewCopy.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
            {platformPreviewCopy.description}
          </p>
        </div>

        <div className="mt-12 overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-5 py-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-foreground)]">
                Athlete workspace
              </p>
              <p className="mt-1 text-xs text-[var(--color-subtle)]">
                Layout preview · sample chrome
              </p>
            </div>
            <span className="rounded-sm border border-[var(--color-border)] px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Not live data
            </span>
          </div>

          <div className="grid gap-0 lg:grid-cols-12">
            <aside className="border-b border-[var(--color-border)] p-5 lg:col-span-3 lg:border-b-0 lg:border-r">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                Today
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
                {["Session queue", "Technique inbox", "Recovery check-in", "Progress"].map(
                  (item) => (
                    <li
                      key={item}
                      className="border border-transparent px-3 py-2.5 transition-colors hover:border-[var(--color-border)] hover:bg-white/[0.03] hover:text-[var(--color-foreground)]"
                    >
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </aside>

            <div className="grid gap-3 p-5 sm:grid-cols-3 lg:col-span-9">
              <article className="border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <Layers3 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em]">
                    {currentBlock.label}
                  </p>
                </div>
                <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                  {currentBlock.value}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {currentBlock.detail}
                </p>
              </article>

              <article className="border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <Activity className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em]">
                    {readiness.label}
                  </p>
                </div>
                <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                  {readiness.value}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {readiness.detail}
                </p>
                <div className="mt-5 space-y-2" aria-hidden>
                  {["Sleep", "Soreness", "Stress"].map((metric) => (
                    <div key={metric} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[var(--color-subtle)]">
                        {metric}
                      </span>
                      <span className="h-1.5 w-24 rounded-sm bg-[var(--color-border)]">
                        <span className="block h-full w-1/3 rounded-sm bg-[var(--color-border-strong)]" />
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                  Empty until check-in
                </p>
              </article>

              <article className="border border-[var(--color-border)] bg-[var(--color-background)] p-5 sm:col-span-1">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <CalendarDays className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em]">
                    {nextHeavy.label}
                  </p>
                </div>
                <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                  {nextHeavy.value}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {nextHeavy.detail}
                </p>
                <div className="mt-5 border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-4 text-xs leading-relaxed text-[var(--color-subtle)]">
                  Top-set targets appear here after a real program is assigned —
                  no decorative sparkline, no invented tonnage.
                </div>
              </article>

              <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 sm:col-span-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
                      Next action
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Complete today&apos;s session or run a technique check —
                      charts stay empty until you log work.
                    </p>
                  </div>
                  <Link
                    href="/demo"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)]"
                  >
                    Open demo workspace
                    <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
