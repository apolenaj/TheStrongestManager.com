import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  RESEARCH_LIBRARY_CATEGORY_LABELS,
  RESEARCH_LIBRARY_HONESTY,
  researchLibraryEntryPath,
  type ResearchLibraryCategory,
  type ResearchLibraryEntry,
} from "@/domain/research-library";
import { EvidenceQualityClaimBlock } from "@/components/evidence-quality/EvidenceQualityBadge";
import { buildEvidenceQualityBadge } from "@/domain/evidence-quality";

export function ResearchLibraryIndex({
  byCategory,
  counts,
}: {
  byCategory: Record<ResearchLibraryCategory, ResearchLibraryEntry[]>;
  counts: Array<{
    category: ResearchLibraryCategory;
    label: string;
    count: number;
  }>;
}) {
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="grid gap-10">
      <Alert tone="info" title="Curated research architecture">
        {RESEARCH_LIBRARY_HONESTY[0]} {RESEARCH_LIBRARY_HONESTY[1]}
      </Alert>
      <Alert tone="warning" title="Empty categories stay empty">
        {RESEARCH_LIBRARY_HONESTY[2]} Import validated entries via Admin →
        Research (dry-run rejects missing citations).
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Categories
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map((c) => (
            <li key={c.category}>
              <a
                href={`#${c.category}`}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm transition-colors hover:border-[var(--color-accent)]/40"
              >
                <span className="font-medium">{c.label}</span>
                <Badge variant="neutral">{c.count}</Badge>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--color-muted)]">
          {total} curated entries ·{" "}
          <Link href="/evidence" className="text-[var(--color-accent)]">
            Evidence labels
          </Link>
        </p>
      </section>

      {counts.map((c) => (
        <section key={c.category} id={c.category} className="scroll-mt-28 grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {c.label}
          </h2>
          {byCategory[c.category].length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No curated entries yet — we will not invent citations to fill this
              category.
            </p>
          ) : (
            <ul className="grid gap-4">
              {byCategory[c.category].map((entry) => (
                <li key={entry.slug}>
                  <ResearchLibraryEntryCard entry={entry} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export function ResearchLibraryEntryCard({
  entry,
}: {
  entry: ResearchLibraryEntry;
}) {
  const quality = buildEvidenceQualityBadge({
    label: entry.evidenceLabel,
    citationLabel: entry.citationLabel,
    citationUrl: entry.citationUrl,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">
            {RESEARCH_LIBRARY_CATEGORY_LABELS[entry.category]}
          </Badge>
        </div>
        <CardTitle>
          <Link
            href={researchLibraryEntryPath(entry.slug)}
            className="hover:text-[var(--color-accent)]"
          >
            {entry.citationLabel}
          </Link>
        </CardTitle>
        <CardDescription>{entry.summary}</CardDescription>
      </CardHeader>
      <div className="grid gap-4 px-6 pb-6 text-sm">
        <div>
          <p className="font-medium">Practical takeaway</p>
          <p className="mt-1 text-[var(--color-muted)]">
            {entry.practicalTakeaway}
          </p>
        </div>
        <div>
          <p className="font-medium">Limitations</p>
          <p className="mt-1 text-[var(--color-muted)]">{entry.limitations}</p>
        </div>
        <EvidenceQualityClaimBlock model={quality} />
      </div>
    </Card>
  );
}

export function ResearchLibraryEntryView({
  entry,
}: {
  entry: ResearchLibraryEntry;
}) {
  const quality = buildEvidenceQualityBadge({
    label: entry.evidenceLabel,
    citationLabel: entry.citationLabel,
    citationUrl: entry.citationUrl,
  });

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Citation">
        Real citation on file. We do not invent DOIs or paper titles.
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">
          {RESEARCH_LIBRARY_CATEGORY_LABELS[entry.category]}
        </Badge>
      </div>

      <section className="grid gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Citation
        </h2>
        <p className="text-sm leading-relaxed">{entry.citationLabel}</p>
      </section>

      <section className="grid gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Summary
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          {entry.summary}
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Practical takeaway
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          {entry.practicalTakeaway}
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Limitations
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          {entry.limitations}
        </p>
      </section>

      <EvidenceQualityClaimBlock model={quality} />

      <p className="text-sm">
        <Link href="/research" className="text-[var(--color-accent)]">
          ← Research Library
        </Link>
      </p>
    </div>
  );
}
