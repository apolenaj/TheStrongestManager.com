import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  EvidenceQualityClaimBlock,
  EvidenceQualityLegendLink,
} from "@/components/evidence-quality/EvidenceQualityBadge";
import {
  MYTH_PAGE_SECTION_LABELS,
  MYTH_VS_REALITY_HONESTY,
  mythEntryToSections,
  mythVsRealityEntryPath,
  type MythPageSection,
  type MythVsRealityEntry,
} from "@/domain/myth-vs-reality";
import { buildEvidenceQualityBadge } from "@/domain/evidence-quality";

const SECTION_ORDER: MythPageSection[] = [
  "claim",
  "whatPeopleSay",
  "whatEvidenceSuggests",
  "practicalAnswer",
  "nuance",
];

export function MythVsRealityIndex({
  entries,
}: {
  entries: MythVsRealityEntry[];
}) {
  return (
    <div className="grid gap-10">
      <Alert tone="info" title="Educational, not clickbait">
        {MYTH_VS_REALITY_HONESTY[0]} {MYTH_VS_REALITY_HONESTY[1]}
      </Alert>
      <Alert tone="warning" title="No invented citations">
        {MYTH_VS_REALITY_HONESTY[2]}{" "}
        <EvidenceQualityLegendLink />
      </Alert>

      <ul className="grid gap-4">
        {entries.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={mythVsRealityEntryPath(entry.slug)}
              className="group block border-b border-[var(--color-border)] pb-4 transition-colors hover:border-[var(--color-accent)]"
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)] group-hover:text-[var(--color-accent)]">
                {entry.claim}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {entry.practicalAnswer.slice(0, 140)}
                {entry.practicalAnswer.length > 140 ? "…" : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.topics.slice(0, 4).map((topic) => (
                  <Badge key={topic} variant="neutral">
                    {topic}
                  </Badge>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-sm text-[var(--color-muted)]">
        See also{" "}
        <Link href="/evidence" className="text-[var(--color-accent)]">
          Evidence Quality
        </Link>
        ,{" "}
        <Link href="/research" className="text-[var(--color-accent)]">
          Research Library
        </Link>
        , and{" "}
        <Link href="/methods" className="text-[var(--color-accent)]">
          Training methods
        </Link>
        , and{" "}
        <Link href="/decision-trees" className="text-[var(--color-accent)]">
          Decision trees
        </Link>
        .
      </p>
    </div>
  );
}

export function MythVsRealityEntryView({
  entry,
}: {
  entry: MythVsRealityEntry;
}) {
  const sections = mythEntryToSections(entry);
  const badge = buildEvidenceQualityBadge({ label: entry.evidenceLabel });

  return (
    <article className="grid gap-10">
      <Alert tone="info" title="Read the nuance">
        {MYTH_VS_REALITY_HONESTY[1]} {MYTH_VS_REALITY_HONESTY[3]}
      </Alert>

      {SECTION_ORDER.map((key) => (
        <section key={key} className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.01em]">
            {MYTH_PAGE_SECTION_LABELS[key]}
          </h2>
          {key === "claim" ? (
            <p className="text-lg leading-relaxed text-[var(--color-foreground)]">
              {sections[key]}
            </p>
          ) : (
            <p className="text-base leading-relaxed text-[var(--color-muted)]">
              {sections[key]}
            </p>
          )}
          {key === "whatEvidenceSuggests" ? (
            <div className="mt-2">
              <EvidenceQualityClaimBlock model={badge} />
            </div>
          ) : null}
        </section>
      ))}

      <div className="flex flex-wrap gap-2">
        {entry.topics.map((topic) => (
          <Badge key={topic} variant="neutral">
            {topic}
          </Badge>
        ))}
      </div>

      <p className="text-sm text-[var(--color-muted)]">
        <Link href="/myths" className="text-[var(--color-accent)]">
          ← All myth pages
        </Link>
        {" · "}
        <EvidenceQualityLegendLink />
      </p>
    </article>
  );
}
