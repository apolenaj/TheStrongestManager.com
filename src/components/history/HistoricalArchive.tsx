import Link from "next/link";
import {
  Alert,
  Badge,
  ButtonLink,
} from "@/design-system";
import {
  ARCHIVE_COPYRIGHT_NOTICE,
  ARCHIVE_HONESTY,
  ARCHIVE_LENS_LABELS,
  ARCHIVE_PROFILE_KIND_LABELS,
  HISTORICAL_ARCHIVE_DESCRIPTION,
  HISTORICAL_ARCHIVE_TITLE,
  archiveProfilePath,
  getHistoryEraBySlug,
  type ArchiveProfileKind,
  type HistoricalArchiveProfile,
} from "@/domain/history";
import { getMethodBySlug } from "@/domain/methods/catalog";
import { historyEraPath } from "@/domain/history/timeline";
import { EvidenceQualityLabelChip } from "@/components/evidence-quality/EvidenceQualityBadge";

function LensSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "innovative" | "useful" | "questions";
}) {
  const border =
    tone === "innovative"
      ? "border-[var(--color-accent)]/35"
      : tone === "useful"
        ? "border-[var(--color-border-strong)]"
        : "border-[var(--color-score-needs-attention)]/40";

  return (
    <section
      className={`rounded-[var(--radius-md)] border ${border} bg-[var(--color-surface)]/60 p-5`}
    >
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
        {title}
      </h3>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-[var(--color-foreground)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ArchiveProfileCard({
  profile,
}: {
  profile: HistoricalArchiveProfile;
}) {
  return (
    <article className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-5 transition-[border-color,transform] hover:-translate-y-px hover:border-[var(--color-accent)]/40">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">
          {ARCHIVE_PROFILE_KIND_LABELS[profile.kind]}
        </Badge>
        <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          {profile.periodLabel}
        </span>
      </div>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
        <Link
          href={archiveProfilePath(profile.slug)}
          className="transition-colors hover:text-[var(--color-accent)]"
        >
          {profile.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{profile.subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-foreground)]">
        {profile.teaser}
      </p>
      <p className="mt-4">
        <Link
          href={archiveProfilePath(profile.slug)}
          className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Open archive profile →
        </Link>
      </p>
    </article>
  );
}

export function HistoricalArchiveIndex({
  byKind,
}: {
  byKind: Record<ArchiveProfileKind, HistoricalArchiveProfile[]>;
}) {
  return (
    <div className="space-y-12">
      <Alert tone="info" title="Principles only — no program reprints">
        {ARCHIVE_HONESTY[0]} {ARCHIVE_HONESTY[2]}
      </Alert>

      <Alert tone="warning" title="Copyright boundary">
        {ARCHIVE_COPYRIGHT_NOTICE}
      </Alert>

      {(Object.keys(byKind) as ArchiveProfileKind[]).map((kind) => (
        <section key={kind} className="space-y-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              {ARCHIVE_PROFILE_KIND_LABELS[kind]}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {kind === "system"
                ? "How training cultures organized practice across eras."
                : kind === "coach"
                  ? "Influential coaching figures — educational associations, not biographies for hire."
                  : "Famous methods summarized as principles with modern honesty layers."}
            </p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {byKind[kind].map((profile) => (
              <li key={profile.slug}>
                <ArchiveProfileCard profile={profile} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="text-sm text-[var(--color-muted)]">
        Prefer the timeline?{" "}
        <Link href="/history" className="text-[var(--color-accent)]">
          Evolution of Strength & Physique Training
        </Link>
      </p>
    </div>
  );
}

export function HistoricalArchiveProfileView({
  profile,
}: {
  profile: HistoricalArchiveProfile;
}) {
  const methods = profile.relatedMethodSlugs
    .map((slug) => {
      const method = getMethodBySlug(slug);
      return method ? { slug, name: method.name } : null;
    })
    .filter((x): x is { slug: string; name: string } => Boolean(x));

  return (
    <div className="space-y-8">
      <Alert tone="info" title="Educational archive profile">
        {ARCHIVE_HONESTY[1]} History uses the{" "}
        <Link
          href="/evidence"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          Historical method
        </Link>{" "}
        evidence label — not research certainty.
      </Alert>
      <div className="flex flex-wrap gap-2">
        <EvidenceQualityLabelChip label="historical_method" showFamily />
      </div>
      <Alert tone="warning" title="Copyright boundary">
        {ARCHIVE_COPYRIGHT_NOTICE}
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">
          {ARCHIVE_PROFILE_KIND_LABELS[profile.kind]}
        </Badge>
        <Badge variant="neutral">{profile.periodLabel}</Badge>
      </div>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Principles (summary)
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Original educational bullets — not a reprinted program.
        </p>
        <ul className="grid gap-2 text-sm leading-relaxed sm:text-base">
          {profile.principlesSummary.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4">
        <LensSection
          title={ARCHIVE_LENS_LABELS.innovative}
          items={profile.whatWasInnovative}
          tone="innovative"
        />
        <LensSection
          title={ARCHIVE_LENS_LABELS.remainsUseful}
          items={profile.whatRemainsUseful}
          tone="useful"
        />
        <LensSection
          title={ARCHIVE_LENS_LABELS.evidenceQuestions}
          items={profile.whatModernEvidenceQuestions}
          tone="questions"
        />
      </div>

      {profile.relatedEraSlugs.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Related timeline eras</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.relatedEraSlugs.map((slug) => {
              const era = getHistoryEraBySlug(slug);
              return (
                <li key={slug}>
                  <Link
                    href={historyEraPath(slug)}
                    className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    {era?.title ?? slug.replaceAll("-", " ")}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {methods.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Related method pages</h2>
          <ul className="flex flex-wrap gap-2">
            {methods.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/methods/${m.slug}`}
                  className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/history/archive" variant="secondary">
          ← Archive index
        </ButtonLink>
        <ButtonLink href="/history" variant="secondary">
          Full timeline
        </ButtonLink>
        <ButtonLink href="/methods" variant="secondary">
          Methods catalog
        </ButtonLink>
      </div>
    </div>
  );
}

/** Lightweight promo block for the main /history page. */
export function ArchivePromoBanner() {
  return (
    <aside className="rounded-[var(--radius-lg)] border border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
        Premium archive
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
        {HISTORICAL_ARCHIVE_TITLE}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
        {HISTORICAL_ARCHIVE_DESCRIPTION}
      </p>
      <div className="mt-4">
        <ButtonLink href="/history/archive">Explore the archive</ButtonLink>
      </div>
    </aside>
  );
}
