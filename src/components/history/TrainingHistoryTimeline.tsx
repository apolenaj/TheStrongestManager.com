import Link from "next/link";
import {
  Alert,
  Badge,
  ButtonLink,
} from "@/design-system";
import {
  HISTORY_HONESTY,
  HISTORY_TIMELINE_TITLE,
  historyEraPath,
  type HistoryEra,
} from "@/domain/history";
import { getMethodBySlug } from "@/domain/methods/catalog";

function MethodLinks({ slugs }: { slugs: string[] }) {
  const items = slugs
    .map((slug) => {
      const method = getMethodBySlug(slug);
      return method ? { slug, name: method.name } : null;
    })
    .filter((x): x is { slug: string; name: string } => Boolean(x));

  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={`/methods/${item.slug}`}
            className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HistoryEraArticle({
  era,
  mode,
}: {
  era: HistoryEra;
  mode: "timeline" | "detail";
}) {
  const headingId = `era-${era.slug}`;

  return (
    <article
      id={era.slug}
      aria-labelledby={headingId}
      className="scroll-mt-28"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {era.periodLabel}
        </p>
        <Badge variant="neutral">Historical overview</Badge>
      </div>
      <h2
        id={headingId}
        className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-3xl"
      >
        {mode === "detail" ? (
          era.title
        ) : (
          <Link
            href={historyEraPath(era.slug)}
            className="transition-colors hover:text-[var(--color-accent)]"
          >
            {era.title}
          </Link>
        )}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
        {era.teaser}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {era.themes.map((theme) => (
          <li key={theme}>
            <Badge variant="info">{theme}</Badge>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--color-foreground)] sm:text-base">
        {era.narrative.map((paragraph, index) => (
          <p key={`${era.slug}-p-${index}`}>{paragraph}</p>
        ))}
      </div>
      {era.caution ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">{era.caution}</p>
      ) : null}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Related methods
        </h3>
        <MethodLinks slugs={era.relatedMethodSlugs} />
      </div>
      {mode === "timeline" ? (
        <p className="mt-5">
          <Link
            href={historyEraPath(era.slug)}
            className="text-sm text-[var(--color-accent)]"
          >
            Open era page →
          </Link>
        </p>
      ) : (
        <p className="mt-5 flex flex-wrap gap-4">
          <Link href="/history" className="text-sm text-[var(--color-accent)]">
            ← Full timeline
          </Link>
          <Link
            href={`/compare?methods=${era.relatedMethodSlugs.slice(0, 2).join(",")}`}
            className="text-sm text-[var(--color-accent)]"
          >
            Compare related methods →
          </Link>
        </p>
      )}
    </article>
  );
}

export function TrainingHistoryTimeline({ eras }: { eras: HistoryEra[] }) {
  return (
    <div className="space-y-10">
      <Alert tone="info" title="Original educational overview">
        {HISTORY_HONESTY[0]} {HISTORY_HONESTY[1]}
      </Alert>

      <nav
        aria-label="Timeline eras"
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4 backdrop-blur-sm"
      >
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
          Jump to era
        </p>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {eras.map((era, index) => (
            <li key={era.slug}>
              <a
                href={`#${era.slug}`}
                className="group flex gap-3 rounded-[var(--radius-sm)] px-2 py-2 text-sm transition-colors hover:bg-[var(--color-surface-elevated)]"
              >
                <span className="font-[family-name:var(--font-display)] text-[var(--color-accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)]">
                    {era.title}
                  </span>
                  <span className="block text-xs text-[var(--color-muted)]">
                    {era.periodLabel}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="relative">
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-[0.7rem] w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-border-strong)] to-transparent sm:left-[1.05rem]"
        />
        <ol className="space-y-14">
          {eras.map((era, index) => (
            <li
              key={era.slug}
              className="relative pl-10 sm:pl-14"
              style={{
                animation: `fade-up var(--duration-slow) var(--easing-standard) both`,
                animationDelay: `${Math.min(index, 6) * 60}ms`,
              }}
            >
              <span
                aria-hidden
                className="absolute top-2 left-0 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] text-[10px] font-semibold text-[var(--color-accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-background)_80%,transparent)] sm:h-8 sm:w-8 sm:text-xs"
              >
                {index + 1}
              </span>
              <HistoryEraArticle era={era} mode="timeline" />
            </li>
          ))}
        </ol>
      </div>

      <section className="border-t border-[var(--color-border)] pt-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Continue learning
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          {HISTORY_TIMELINE_TITLE} links into our method knowledge engine — not
          into reproduced commercial programs.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/history/archive" variant="primary" size="md">
            Historical archive
          </ButtonLink>
          <ButtonLink href="/methods" variant="secondary" size="md">
            Browse methods
          </ButtonLink>
          <ButtonLink href="/compare" variant="secondary" size="md">
            Compare methods
          </ButtonLink>
        </div>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          {HISTORY_HONESTY[2]}
        </p>
      </section>
    </div>
  );
}
