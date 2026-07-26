"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { ExerciseDetailView } from "@/services/exercises/exercise-catalog";
import type { RelatedMoveRef } from "@/domain/exercises/types";
import {
  EXERCISE_DETAIL_SECTIONS,
  type CoachingContextCard,
} from "@/domain/exercises/detail-presentation";
import { EvidenceQualityClaimBlock } from "@/components/evidence-quality/EvidenceQualityBadge";
import { evidenceQualityForClaim } from "@/domain/evidence-quality";

function Section({
  id,
  title,
  children,
  compact = true,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-[var(--color-border)] pt-5"
    >
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
        {title}
      </h2>
      <div
        className={
          compact
            ? "mt-2 space-y-2 text-sm leading-relaxed text-[var(--color-muted)]"
            : "mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-muted)]"
        }
      >
        {children}
      </div>
    </section>
  );
}

function RefList({ items }: { items: RelatedMoveRef[] }) {
  if (items.length === 0) {
    return <p>No entries listed yet.</p>;
  }
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={`${item.label}-${item.relatedSlug ?? ""}`}>
          <span className="font-medium text-[var(--color-foreground)]">
            {item.relatedSlug ? (
              <Link
                href={`/exercises/${item.relatedSlug}`}
                className="text-[var(--color-accent)] hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </span>
          <span className="text-[var(--color-muted)]"> — {item.note}</span>
        </li>
      ))}
    </ul>
  );
}

function ContextCards({ cards }: { cards: CoachingContextCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <Card key={card.id} className="!p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-subtle)]">
            {card.label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-[var(--color-subtle)]">{card.detail}</p>
        </Card>
      ))}
    </div>
  );
}

function ExerciseSectionNav({
  activeId,
  availableIds,
}: {
  activeId: string;
  availableIds: Set<string>;
}) {
  const items = EXERCISE_DETAIL_SECTIONS.filter((s) => availableIds.has(s.id));

  return (
    <>
      {/* Mobile: compact horizontal chips */}
      <nav
        aria-label="Exercise sections"
        className="sticky top-14 z-20 -mx-4 mb-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 px-4 py-2 backdrop-blur lg:hidden"
      >
        <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className={
                    active
                      ? "inline-flex rounded-[var(--radius-sm)] bg-[var(--color-accent-muted)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]"
                      : "inline-flex rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-muted)]"
                  }
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop: sticky side rail */}
      <nav
        aria-label="Exercise sections"
        className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block"
      >
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]">
          On this page
        </p>
        <ul className="grid gap-1 border-l border-[var(--color-border)]">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={
                    active
                      ? "-ml-px border-l-2 border-[var(--color-accent)] pl-3 text-sm font-medium text-[var(--color-foreground)]"
                      : "-ml-px border-l-2 border-transparent pl-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export function ExerciseDetailPageContent({
  exercise,
}: {
  exercise: ExerciseDetailView;
}) {
  const availableIds = useMemo(() => {
    const ids = new Set<string>([
      "overview",
      "technique",
      "media",
      "muscles",
      "programming",
      "useful-for",
      "avoid-modify",
      "related-exercises",
      "related-methods",
    ]);
    if (exercise.setup) ids.add("setup");
    if (exercise.execution) ids.add("execution");
    if (exercise.commonMistakes.length > 0) ids.add("mistakes");
    if (
      exercise.variations.length > 0 ||
      exercise.progressions.length > 0 ||
      exercise.regressions.length > 0
    ) {
      ids.add("variations");
    }
    return ids;
  }, [exercise]);

  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const nodes = EXERCISE_DETAIL_SECTIONS.map((s) =>
      document.getElementById(s.id),
    ).filter((n): n is HTMLElement => Boolean(n));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [exercise.slug]);

  const relatedExercises = [
    ...exercise.catalogRelations.map((rel) => ({
      label: rel.exercise.name,
      note: rel.note ?? rel.relationType,
      relatedSlug: rel.exercise.slug,
    })),
    ...exercise.regressions.filter((r) => r.relatedSlug),
    ...exercise.progressions.filter((r) => r.relatedSlug),
    ...exercise.variations.filter((v) => v.relatedSlug),
  ];

  const relatedDeduped = relatedExercises.filter(
    (item, index, arr) =>
      item.relatedSlug &&
      arr.findIndex((x) => x.relatedSlug === item.relatedSlug) === index,
  );

  return (
    <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-10">
      <ExerciseSectionNav activeId={activeId} availableIds={availableIds} />

      <article className="min-w-0">
        <header className="grid gap-3 pb-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Exercise intelligence
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{exercise.category}</Badge>
            <Badge variant="neutral">{exercise.movementPattern}</Badge>
            <Badge variant="neutral">{exercise.difficulty}</Badge>
            {exercise.laterality ? (
              <Badge variant="neutral">{exercise.laterality}</Badge>
            ) : null}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
            {exercise.name}
          </h1>
          {exercise.description ? (
            <p className="max-w-2xl text-[var(--color-muted)]">
              {exercise.description}
            </p>
          ) : null}
          {exercise.aliases.length > 0 ? (
            <p className="text-xs text-[var(--color-subtle)]">
              Also known as: {exercise.aliases.join(" · ")}
            </p>
          ) : null}
        </header>

        <Alert tone="info" title="Coaching practice — not scientific validation">
          Context cards and cues below are general coaching knowledge. They are
          not lab-validated scores or research conclusions. Evidence claims appear
          only when a real citation exists ({exercise.evidenceClaims.length}{" "}
          attached).
        </Alert>

        <Section id="overview" title="Exercise overview">
          {exercise.executionOverview ? (
            <p>{exercise.executionOverview}</p>
          ) : (
            <p>Overview not written yet.</p>
          )}
          <div className="pt-3">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-subtle)]">
              Coaching context cards
            </p>
            <ContextCards cards={exercise.coachingContextCards} />
          </div>
        </Section>

        <Section id="technique" title="Technique">
          {exercise.executionOverview ? <p>{exercise.executionOverview}</p> : null}
          {exercise.breathingBracing ? (
            <p>
              <span className="font-medium text-[var(--color-foreground)]">
                Breathing / bracing:{" "}
              </span>
              {exercise.breathingBracing}
            </p>
          ) : (
            <p>Technique notes will expand as the catalog deepens.</p>
          )}
        </Section>

        {exercise.setup ? (
          <Section id="setup" title="Setup">
            <p>{exercise.setup}</p>
          </Section>
        ) : null}

        {exercise.execution ? (
          <Section id="execution" title="Execution">
            <p>{exercise.execution}</p>
          </Section>
        ) : null}

        <Section id="media" title="Video / media">
          <Card className="!p-4">
            <CardHeader className="mb-1">
              <CardTitle className="text-base">Media area</CardTitle>
              <CardDescription>
                Reserved for technique video or imagery when attached to this
                entry.
              </CardDescription>
            </CardHeader>
            <div className="flex aspect-video items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] text-sm text-[var(--color-subtle)]">
              No media attached yet — nothing is invented here.
            </div>
          </Card>
        </Section>

        <Section id="muscles" title="Muscles">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Primary
              </dt>
              <dd className="mt-1 text-[var(--color-foreground)]">
                {exercise.primaryMuscles.join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Secondary
              </dt>
              <dd className="mt-1 text-[var(--color-foreground)]">
                {exercise.secondaryMuscles.join(", ") || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Equipment
              </dt>
              <dd className="mt-1 text-[var(--color-foreground)]">
                {exercise.equipment.join(", ") || "—"}
              </dd>
            </div>
          </dl>
        </Section>

        {exercise.commonMistakes.length > 0 ? (
          <Section id="mistakes" title="Common mistakes">
            <ul className="list-disc space-y-1.5 pl-5">
              {exercise.commonMistakes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {availableIds.has("variations") ? (
          <Section id="variations" title="Variations">
            <div className="grid gap-4">
              {exercise.variations.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                    Variations
                  </p>
                  <RefList items={exercise.variations} />
                </div>
              ) : null}
              {exercise.regressions.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                    Regressions
                  </p>
                  <RefList items={exercise.regressions} />
                </div>
              ) : null}
              {exercise.progressions.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                    Progressions
                  </p>
                  <RefList items={exercise.progressions} />
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        <Section id="programming" title="Programming">
          <p>
            {exercise.programmingUses ??
              "Programming notes not written for this entry yet."}
          </p>
        </Section>

        <Section id="useful-for" title="Who it is useful for">
          {exercise.usefulFor.length === 0 ? (
            <p>Sport relevance tags not set for this entry.</p>
          ) : (
            <ul className="list-disc space-y-1.5 pl-5">
              {exercise.usefulFor.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </Section>

        <Section id="avoid-modify" title="When to avoid or modify">
          {exercise.safetyNotes ? <p>{exercise.safetyNotes}</p> : null}
          {exercise.regressions.length > 0 ? (
            <div className="pt-1">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--color-subtle)]">
                Modify with
              </p>
              <RefList items={exercise.regressions.slice(0, 4)} />
            </div>
          ) : null}
          {!exercise.safetyNotes && exercise.regressions.length === 0 ? (
            <p>No avoid/modify notes attached yet.</p>
          ) : null}
        </Section>

        <Section id="related-exercises" title="Related exercises">
          {relatedDeduped.length === 0 ? (
            <p>No linked catalog exercises yet.</p>
          ) : (
            <RefList items={relatedDeduped} />
          )}
        </Section>

        <Section id="related-methods" title="Related training methods">
          {exercise.relatedMethods.length === 0 ? (
            <p>
              No method associations tagged for this movement pattern yet. Browse
              the{" "}
              <Link href="/methods" className="text-[var(--color-accent)]">
                Training Methods
              </Link>{" "}
              catalog for periodization and intensification systems.
            </p>
          ) : (
            <ul className="grid gap-2">
              {exercise.relatedMethods.map((method) => (
                <li key={method.slug}>
                  <Link
                    href={`/methods/${method.slug}`}
                    className="font-medium text-[var(--color-accent)] hover:underline"
                  >
                    {method.name}
                  </Link>
                  <span className="text-[var(--color-muted)]">
                    {" "}
                    — {method.note}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--color-subtle)]">
                    Coaching association only — not a validated protocol library.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {exercise.evidenceClaims.length > 0 ? (
          <Section id="evidence" title="Evidence claims">
            <p className="mb-3 text-sm text-[var(--color-muted)]">
              Research evidence labels only — citations link when a real URL
              exists.{" "}
              <Link
                href="/evidence"
                className="text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                Evidence label guide
              </Link>
            </p>
            <ul className="grid gap-3">
              {exercise.evidenceClaims.map((claim) => {
                const quality = evidenceQualityForClaim({
                  supportLevel: claim.supportLevel,
                  citationLabel: claim.citationLabel,
                  citationUrl: claim.citationUrl,
                });
                return (
                  <li
                    key={claim.id}
                    className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
                  >
                    <p className="font-medium text-[var(--color-foreground)]">
                      {claim.claim}
                    </p>
                    <div className="mt-3">
                      <EvidenceQualityClaimBlock model={quality} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
        ) : null}

        <p className="mt-8 text-xs text-[var(--color-subtle)]">
          <Link href="/exercises" className="text-[var(--color-accent)] hover:underline">
            ← All exercises
          </Link>
        </p>
      </article>
    </div>
  );
}
