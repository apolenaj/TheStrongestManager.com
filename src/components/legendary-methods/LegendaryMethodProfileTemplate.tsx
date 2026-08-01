import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  LEGENDARY_PROFILE_TOC,
  editorialLabelForContentLayer,
  type LegendaryContentLayer,
  type LegendaryEditorialLabelId,
  type ScoreValue,
} from "@/domain/legendary-methods";
import type { ResolvedLegendaryMethodProfile } from "@/domain/legendary-methods/resolve-profile";

type ResolvedScore = {
  value: ScoreValue | null;
  justification: string;
};
import { LegendaryEditorialLabel } from "@/components/legendary-methods/LegendaryEditorialLabel";
import { LegendaryMethodCardArt } from "@/components/legendary-methods/LegendaryMethodCardArt";
import {
  LegendaryMethodDisclaimer,
  LegendaryRelatedProgrammeDisclaimer,
} from "@/components/legendary-methods/LegendaryMethodDisclaimer";
import { LegendarySourceAnalyticsLink } from "@/components/legendary-methods/LegendaryAnalytics";
import { LegendaryMethodProfileToc } from "@/components/legendary-methods/LegendaryMethodProfileToc";
import { RelatedProgramLinks } from "@/components/legendary-methods/RelatedProgramLinks";

function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function formatReviewedDate(value: string | undefined, locale: string, pending: string): string {
  if (!value) return pending;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ScoreBar({
  metric,
  label,
  notScored,
  pending,
}: {
  metric: ResolvedScore;
  label: string;
  notScored: string;
  pending: string;
}) {
  const value = metric.value;
  const width = value == null ? 0 : value * 10;
  return (
    <div className="legendary-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
          {label}
        </h3>
        <p className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--color-accent)]">
          {value == null ? "—" : value}
          <span className="text-sm font-semibold text-[var(--color-subtle)]"> / 10</span>
        </p>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden bg-[var(--color-background)]"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value ?? 0}
        {...(value == null ? { "aria-valuetext": notScored } : {})}
      >
        <div
          className="h-full bg-[var(--color-accent)] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        {metric.justification.trim() ? metric.justification : pending}
      </p>
    </div>
  );
}

function DistributionChart({
  title,
  emptyLabel,
  slices,
}: {
  title: string;
  emptyLabel: string;
  slices: Array<{ label: string; share: number }>;
}) {
  if (slices.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-subtle)]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
        {title}
      </h3>
      <ul className="mt-3 space-y-3" aria-label={title}>
        {slices.map((slice) => (
          <li key={slice.label}>
            <div className="flex justify-between gap-3 text-xs text-[var(--color-muted)]">
              <span>{slice.label}</span>
              <span>{slice.share}%</span>
            </div>
            <div
              className="mt-1 h-2 overflow-hidden bg-[var(--color-background)]"
              role="meter"
              aria-label={slice.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(100, Math.max(0, slice.share))}
            >
              <div
                className="h-full bg-[var(--color-accent)] motion-reduce:transition-none"
                style={{
                  width: `${Math.min(100, Math.max(0, slice.share))}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceCitations({
  refs,
}: {
  refs?: number[];
}) {
  const t = useTranslations("LegendaryMethods");
  if (!refs?.length) return null;
  return (
    <p className="text-xs text-[var(--color-subtle)]">
      <span className="sr-only">{t("profile.citedSources")} </span>
      {refs.map((ref, index) => (
        <span key={ref}>
          {index > 0 ? " " : null}
          <a
            href={`#source-${ref}`}
            className="text-[var(--color-accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            [{ref}]
          </a>
        </span>
      ))}
    </p>
  );
}

function SectionShell({
  id,
  title,
  layer,
  extraLabelIds,
  sourceRefs,
  children,
}: {
  id: string;
  /** Optional override — defaults to LegendaryMethods.profile.toc[id]. */
  title?: string;
  layer?: LegendaryContentLayer;
  extraLabelIds?: LegendaryEditorialLabelId[];
  sourceRefs?: number[];
  children: ReactNode;
}) {
  const t = useTranslations("LegendaryMethods");
  const primary = layer ? editorialLabelForContentLayer(layer) : null;
  const heading =
    title ??
    t(`profile.toc.${id}` as Parameters<typeof t>[0]);
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-white/10 pt-12 sm:pt-16"
    >
      <div className="flex flex-wrap gap-2">
        {primary ? <LegendaryEditorialLabel id={primary.id} /> : null}
        {extraLabelIds?.map((labelId) => (
          <LegendaryEditorialLabel key={labelId} id={labelId} />
        ))}
      </div>
      {layer ? (
        <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-subtle)]">
          {t(`profile.contentLayers.${layer}`)}
        </p>
      ) : null}
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl">
        {heading}
      </h2>
      <div className="legendary-prose mt-6 space-y-5 text-base">
        {children}
        <SourceCitations refs={sourceRefs} />
      </div>
    </section>
  );
}

function PendingCopy({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[var(--color-subtle)]">{children}</p>;
}

function getSectionBody(
  profile: ResolvedLegendaryMethodProfile,
  id: ResolvedLegendaryMethodProfile["sections"][number]["id"],
): string {
  return profile.sections.find((section) => section.id === id)?.body.trim() ?? "";
}

function getSectionSourceRefs(
  profile: ResolvedLegendaryMethodProfile,
  id: ResolvedLegendaryMethodProfile["sections"][number]["id"],
): number[] | undefined {
  return profile.sections.find((section) => section.id === id)?.sourceRefs;
}

/**
 * Single reusable production profile template for all Legendary Methods pages.
 */
export function LegendaryMethodProfileTemplate({
  profile,
}: {
  /** Locale-resolved profile (strings already extracted for the active locale). */
  profile: ResolvedLegendaryMethodProfile;
}) {
  const t = useTranslations("LegendaryMethods");
  // Reading time uses English registry fields when available; fall back via resolved text length.
  const readingTime = Math.max(
    5,
    Math.ceil(
      [
        profile.summary,
        profile.introductoryDisclaimer,
        ...profile.sections.map((section) => section.body),
      ]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length / 220,
    ),
  );
  const locale = useLocale();
  const reviewed =
    profile.lastReviewedAt ?? profile.updatedAt ?? profile.publishedAt;
  const athleteEraBody = getSectionBody(profile, "athlete-and-era");
  const documentedBody = getSectionBody(profile, "documented-training-method");
  const structureNarrative = getSectionBody(profile, "training-structure");
  const routineBody = getSectionBody(profile, "core-training-routine");
  const nutritionBody = getSectionBody(
    profile,
    "documented-nutritional-approach",
  );
  const volumeBody = getSectionBody(profile, "volume-intensity-frequency");
  const whyBody = getSectionBody(profile, "why-it-worked");
  const wrongBody = getSectionBody(profile, "what-lifters-get-wrong");
  const risksBody = getSectionBody(profile, "risks-and-recovery");
  const verdictBody = getSectionBody(profile, "verdict");
  const modernBody = getSectionBody(profile, "modernised-application");

  const tocIds = LEGENDARY_PROFILE_TOC.filter(
    (item) => item.id !== "system-comparison" || Boolean(profile.systemComparison),
  ).map((item) => item.id);

  const quick = profile.quickProfile;
  const scores = profile.scores;
  const structure = profile.trainingStructure;
  const why = profile.whyItWorked;
  const modern = profile.modernAdaptation;
  const week = profile.exampleWeek;
  const comparison = profile.systemComparison;
  const evidenceLabelId =
    profile.evidenceQuality === "limited"
      ? ("limited-evidence" as const)
      : null;

  return (
    <article className="pb-20 sm:pb-24">
      <a
        href="#legendary-profile-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-accent-foreground)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]"
      >
        {t("profile.skipToContent")}
      </a>

      <nav aria-label={t("profile.breadcrumbAria")} className="text-sm text-[var(--color-muted)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {t("profile.home")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href="/legendary-methods"
              className="hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {t("profile.library")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[var(--color-foreground)]" aria-current="page">
            {profile.athleteName}
          </li>
        </ol>
      </nav>

      <header className="mt-10 grid gap-8 sm:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-12">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {t(`categories.${profile.category}`)}
          </p>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            {profile.athleteName}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.75rem)] font-bold uppercase leading-[1.02] tracking-tight text-[var(--color-foreground)]">
            {profile.profileTitle}
          </h1>
          <p className="legendary-prose mt-6 text-base sm:text-lg">
            {profile.summary.trim()
              ? profile.summary
              : t("profile.emptySummary")}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="inline-flex min-h-9 items-center border border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              {t("profile.independentBadge")}
            </span>
            <span className="inline-flex min-h-9 items-center border border-white/10 px-3 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {t("profile.evidenceBadge", { quality: profile.evidenceQuality })}
            </span>
            {evidenceLabelId ? (
              <LegendaryEditorialLabel id={evidenceLabelId} />
            ) : null}
            <span className="inline-flex min-h-9 items-center border border-white/10 px-3 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {t("profile.minRead", { minutes: readingTime })}
            </span>
            <span className="inline-flex min-h-9 items-center border border-white/10 px-3 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {t("profile.reviewedBadge", {
                date: reviewed
                  ? formatReviewedDate(reviewed, locale, t("profile.pendingReview"))
                  : t("profile.pendingReview"),
              })}
            </span>
          </div>

          <div className="mt-6 max-w-prose space-y-4">
            <LegendaryMethodDisclaimer variant="short" />
            {profile.introductoryDisclaimer.trim() ? (
              <p
                className="text-sm leading-relaxed text-[var(--color-subtle)]"
                role="note"
              >
                {profile.introductoryDisclaimer}
              </p>
            ) : null}
          </div>
        </div>
        <LegendaryMethodCardArt
          category={profile.category}
          title={profile.shortTitle || profile.athleteName}
        />
      </header>

      <div
        id="legendary-profile-main"
        className="mt-16 grid gap-10 sm:mt-20 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12"
      >
        <LegendaryMethodProfileToc sectionIds={tocIds} />

        <div className="min-w-0 space-y-2">
          <section
            id="quick-method-profile"
            className="scroll-mt-28"
            aria-labelledby="quick-method-heading"
          >
            <h2
              id="quick-method-heading"
              className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl"
            >
              {t("profile.quickProfile")}
            </h2>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
              {(
                [
                  [t("profile.quickFields.primaryGoal"), quick.primaryGoal],
                  [
                    t("profile.quickFields.typicalFrequency"),
                    quick.typicalFrequency || profile.trainingDays || "",
                  ],
                  [t("profile.quickFields.volumeLevel"), quick.volumeLevel],
                  [
                    t("profile.quickFields.intensityProfile"),
                    quick.intensityProfile,
                  ],
                  [
                    t("profile.quickFields.recoveryDemand"),
                    quick.recoveryDemand,
                  ],
                  [
                    t("profile.quickFields.technicalDifficulty"),
                    quick.technicalDifficulty,
                  ],
                  [
                    t("profile.quickFields.bestSuitedFor"),
                    quick.bestSuitedFor || profile.bestFor.join(", "),
                  ],
                  [
                    t("profile.quickFields.evidenceQuality"),
                    quick.evidenceQuality || profile.evidenceQuality,
                  ],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="legendary-surface p-5"
                >
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                    {label}
                  </dt>
                  <dd className="mt-2 text-sm text-[var(--color-foreground)]">
                    {displayOrDash(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <SectionShell
            id="athlete-and-era"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(profile, "athlete-and-era")}
          >
            {athleteEraBody ? (
              <p className="whitespace-pre-line">{athleteEraBody}</p>
            ) : (
<PendingCopy>{t("profile.pending.athleteEra")}</PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="documented-training-method"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(profile, "documented-training-method")}
          >
            {documentedBody ? (
              <>
                <p className="whitespace-pre-line">{documentedBody}</p>
<p className="text-sm text-[var(--color-subtle)]">{t("profile.pending.claimsCite")}</p>
              </>
            ) : (
<PendingCopy>{t("profile.pending.documentedMethod")}</PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="training-structure"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(profile, "training-structure")}
          >
            {structureNarrative ? (
              <p className="whitespace-pre-line">{structureNarrative}</p>
            ) : null}
            <div className="grid gap-6 not-prose sm:grid-cols-2">
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-[var(--color-subtle)]">{t("profile.trainingDays")}:</span>{" "}
                  {displayOrDash(structure?.trainingDays)}
                </p>
                <p>
                  <span className="text-[var(--color-subtle)]">
                    {t("profile.exerciseFrequency")}:
                  </span>{" "}
                  {displayOrDash(structure?.exerciseFrequency)}
                </p>
                <p>
                  <span className="text-[var(--color-subtle)]">
                    {t("profile.progression")}:
                  </span>{" "}
                  {displayOrDash(structure?.progressionApproach)}
                </p>
                <p>
                  <span className="text-[var(--color-subtle)]">{t("profile.recovery")}:</span>{" "}
                  {displayOrDash(structure?.recoveryStructure)}
                </p>
                <div>
                  <p className="text-[var(--color-subtle)]">{t("profile.primaryMovements")}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--color-foreground)]">
                    {(structure?.primaryMovements?.length
                      ? structure.primaryMovements
                      : ["—"]
                    ).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[var(--color-subtle)]">{t("profile.accessoryWork")}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-[var(--color-foreground)]">
                    {(structure?.accessoryWork?.length
                      ? structure.accessoryWork
                      : ["—"]
                    ).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-6">
                <DistributionChart
                  title={t("profile.volumeDistribution")}
                  emptyLabel={t("profile.distributionEmpty")}
                  slices={structure?.volumeDistribution ?? []}
                />
                <DistributionChart
                  title={t("profile.intensityDistribution")}
                  emptyLabel={t("profile.distributionEmpty")}
                  slices={structure?.intensityDistribution ?? []}
                />
              </div>
            </div>
          </SectionShell>

          <SectionShell
            id="core-training-routine"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(profile, "core-training-routine")}
          >
            {routineBody ? (
              <p className="whitespace-pre-line">{routineBody}</p>
            ) : (
<PendingCopy>{t("profile.pending.coreRoutine")}</PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="documented-nutritional-approach"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(
              profile,
              "documented-nutritional-approach",
            )}
          >
            {nutritionBody ? (
              <p className="whitespace-pre-line">{nutritionBody}</p>
            ) : (
<PendingCopy>{t("profile.pending.nutrition")}</PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="volume-intensity-frequency"
            layer="independent_analysis"
            sourceRefs={getSectionSourceRefs(
              profile,
              "volume-intensity-frequency",
            )}
          >
            {volumeBody ? (
              <p className="whitespace-pre-line">{volumeBody}</p>
            ) : (
<PendingCopy>{t("profile.pending.volume")}</PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="example-training-week"
            layer={
              !week || week.label === "original-modernised-example"
                ? "modernised_adaptation"
                : week.label === "documented-example"
                  ? "documented_historical"
                  : undefined
            }
            extraLabelIds={
              week?.label === "reconstructed-from-public-sources"
                ? ["reconstructed"]
                : undefined
            }
          >
            {week ? (
              <>
                <p className="inline-flex border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
                  {t(`profile.exampleWeekLabels.${week.label}.title`)}
                </p>
                <p className="text-sm text-[var(--color-subtle)]">
                  {t(`profile.exampleWeekLabels.${week.label}.caution`)}
                </p>
                <p>{week.disclaimer}</p>
                <div className="not-prose overflow-x-auto">
                  <table className="mt-2 w-full min-w-[28rem] border-collapse text-left text-sm">
                    <caption className="sr-only">{week.title}</caption>
                    <thead>
                      <tr className="border-b border-white/10 text-[var(--color-subtle)]">
                        <th scope="col" className="py-2 pr-3 font-medium">{t("profile.tableDay")}</th>
                        <th scope="col" className="py-2 pr-3 font-medium">{t("profile.tableFocus")}</th>
                        <th scope="col" className="py-2 font-medium">{t("profile.tableNotes")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {week.days.map((day) => (
                        <tr
                          key={day.dayLabel}
                          className="border-b border-white/10 align-top"
                        >
                          <td className="py-3 pr-3 text-[var(--color-foreground)]">
                            {day.dayLabel}
                          </td>
                          <td className="py-3 pr-3 text-[var(--color-muted)]">
                            {day.focus}
                          </td>
                          <td className="py-3 text-[var(--color-muted)]">
                            {day.notes ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
<PendingCopy>{t("profile.pending.exampleWeek")}</PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="why-it-worked"
            layer="independent_analysis"
          >
            {whyBody ? <p className="whitespace-pre-line">{whyBody}</p> : null}
            <dl className="not-prose grid gap-3 sm:grid-cols-2">
              {(
                [
                  [t("profile.whyFactors.specificity"), why?.specificity],
                  [t("profile.whyFactors.volume"), why?.volume],
                  [t("profile.whyFactors.intensity"), why?.intensity],
                  [t("profile.whyFactors.technicalPractice"), why?.technicalPractice],
                  [t("profile.whyFactors.athleteExperience"), why?.athleteExperience],
                  [t("profile.whyFactors.bodyweight"), why?.bodyweight],
                  [t("profile.whyFactors.recovery"), why?.recovery],
                  [t("profile.whyFactors.sportDemands"), why?.sportDemands],
                  [t("profile.whyFactors.longTermAdaptation"), why?.longTermAdaptation],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="legendary-surface p-4"
                >
                  <dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-subtle)]">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--color-muted)]">
                    {displayOrDash(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </SectionShell>

          <SectionShell
            id="what-lifters-get-wrong"
            layer="independent_analysis"
          >
            {wrongBody ? <p className="whitespace-pre-line">{wrongBody}</p> : null}
            {profile.whatLiftersGetWrong.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5">
                {profile.whatLiftersGetWrong.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
<PendingCopy>{t("profile.pending.wrong")}</PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="risks-and-recovery"
            layer="independent_analysis"
            sourceRefs={getSectionSourceRefs(profile, "risks-and-recovery")}
          >
            {risksBody ? (
              <p className="whitespace-pre-line">{risksBody}</p>
            ) : (
              <PendingCopy>{t("profile.pending.risks")}</PendingCopy>
            )}
          </SectionShell>

          <section
            id="scores"
            className="scroll-mt-28 border-t border-white/10 pt-12 sm:pt-16"
          >
            <div className="flex flex-wrap gap-2">
              <LegendaryEditorialLabel id="analysis" />
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl">
              {t("profile.scoresHeading")}
            </h2>
            <p className="legendary-prose mt-5 text-sm sm:text-base">
              {t("profile.scoresIntro")}
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8">
              <ScoreBar metric={scores.strengthPotential} label={t("profile.scoreStrength")} notScored={t("profile.notScored")} pending={t("profile.justificationPending")} />
              <ScoreBar metric={scores.hypertrophyPotential} label={t("profile.scoreHypertrophy")} notScored={t("profile.notScored")} pending={t("profile.justificationPending")} />
              <ScoreBar metric={scores.recoveryDemand} label={t("profile.scoreRecovery")} notScored={t("profile.notScored")} pending={t("profile.justificationPending")} />
              <ScoreBar metric={scores.technicalDifficulty} label={t("profile.scoreTechnical")} notScored={t("profile.notScored")} pending={t("profile.justificationPending")} />
              <ScoreBar metric={scores.beginnerSuitability} label={t("profile.scoreBeginner")} notScored={t("profile.notScored")} pending={t("profile.justificationPending")} />
              <ScoreBar metric={scores.advancedSuitability} label={t("profile.scoreAdvanced")} notScored={t("profile.notScored")} pending={t("profile.justificationPending")} />
            </div>
          </section>

          <SectionShell
            id="verdict"
            layer="independent_analysis"
            sourceRefs={getSectionSourceRefs(profile, "verdict")}
          >
            {verdictBody ? (
              <p className="whitespace-pre-line">{verdictBody}</p>
            ) : (
<PendingCopy>{t("profile.pending.verdict")}</PendingCopy>
            )}
          </SectionShell>

          {comparison ? (
            <SectionShell
              id="system-comparison"
              title={comparison.title}
              layer="independent_analysis"
            >
              <p className="whitespace-pre-line">{comparison.summary}</p>
              <p className="text-sm text-[var(--color-subtle)]">
                {t("profile.comparedWith")}{" "}
                <Link
                  href={`/legendary-methods/${comparison.counterpartSlug}`}
                  className="text-[var(--color-accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  {comparison.counterpartName}
                </Link>
                . {t("profile.comparisonNote")}
              </p>
              <div className="not-prose overflow-x-auto">
                <table className="mt-2 w-full min-w-[36rem] border-collapse text-left text-sm">
                  <caption className="sr-only">{comparison.title}</caption>
                  <thead>
                    <tr className="border-b border-white/10 text-[var(--color-subtle)]">
                      <th scope="col" className="py-2 pr-3 font-medium">{t("profile.tableDimension")}</th>
                      <th scope="col" className="py-2 pr-3 font-medium">{t("profile.tableThisSystem")}</th>
                      <th scope="col" className="py-2 font-medium">
                        {comparison.counterpartName}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.rows.map((row) => (
                      <tr
                        key={row.dimension}
                        className="border-b border-white/10 align-top"
                      >
                        <td className="py-3 pr-3 font-medium text-[var(--color-foreground)]">
                          {row.dimension}
                        </td>
                        <td className="py-3 pr-3 text-[var(--color-muted)]">
                          {row.thisSystem}
                        </td>
                        <td className="py-3 text-[var(--color-muted)]">
                          {row.otherSystem}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionShell>
          ) : null}

          <SectionShell
            id="modernised-application"
            layer="modernised_adaptation"
          >
            <p className="inline-flex border border-[var(--color-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              {t("profile.originalInterpretation")}
            </p>
            {modern?.summary || modernBody ? (
              <p className="whitespace-pre-line">
                {modern?.summary || modernBody}
              </p>
            ) : (
<PendingCopy>{t("profile.pending.modern")}</PendingCopy>
            )}
            <div className="not-prose grid gap-4 sm:grid-cols-3">
              {(
                [
                  [t("profile.beginnerAdjustment"), modern?.beginnerAdjustment],
                  [t("profile.intermediateAdjustment"), modern?.intermediateAdjustment],
                  [t("profile.advancedAdjustment"), modern?.advancedAdjustment],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="legendary-surface p-5"
                >
                  <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                    {label}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {displayOrDash(value)}
                  </p>
                </div>
              ))}
            </div>
            <p>
              <span className="text-[var(--color-subtle)]">
                {t("profile.recommendedFrequency")}:
              </span>{" "}
              {displayOrDash(modern?.recommendedFrequency)}
            </p>
            <p>
              <span className="text-[var(--color-subtle)]">
                {t("profile.whenToReduceVolume")}:
              </span>{" "}
              {displayOrDash(modern?.whenToReduceVolume)}
            </p>
            <div>
              <p className="text-[var(--color-subtle)]">{t("profile.recoveryControls")}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {(modern?.recoveryControls?.length
                  ? modern.recoveryControls
                  : ["—"]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[var(--color-subtle)]">{t("profile.progressionRules")}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {(modern?.progressionRules?.length
                  ? modern.progressionRules
                  : ["—"]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[var(--color-subtle)]">{t("profile.whoShouldAvoid")}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {(modern?.whoShouldAvoid?.length
                  ? modern.whoShouldAvoid
                  : profile.notRecommendedFor.length
                    ? profile.notRecommendedFor
                    : ["—"]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </SectionShell>

          <section
            id="sources"
            className="scroll-mt-28 border-t border-white/10 pt-12 sm:pt-16"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl">
              {t("profile.sources")}
            </h2>
            <div className="mt-6 max-w-prose">
              <LegendaryMethodDisclaimer variant="complete" />
            </div>
            {profile.sources.length === 0 ? (
              <p className="mt-6 max-w-prose text-sm leading-relaxed text-[var(--color-subtle)]">
                {t("profile.noSources")}
              </p>
            ) : (
              <ol className="mt-8 max-w-prose list-decimal space-y-5 pl-5 text-sm leading-relaxed text-[var(--color-muted)]">
                {profile.sources.map((source, index) => (
                  <li key={`${source.url}-${index}`} id={`source-${index + 1}`}>
                    <p className="font-medium text-[var(--color-foreground)]">
                      {source.title}
                    </p>
                    <p className="mt-1">
                      {source.author ? `${source.author}. ` : null}
                      {source.publisher}
                      {source.publicationDate
                        ? ` (${source.publicationDate})`
                        : null}
                      {" "}{t("profile.accessed", { date: source.accessDate })}
                    </p>
                    <LegendarySourceAnalyticsLink
                      href={source.url}
                      slug={profile.slug}
                      className="mt-1 inline-flex items-center gap-1 text-[var(--color-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      {t("profile.externalSource")}
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="sr-only"> {t("profile.opensNewTab")}</span>
                    </LegendarySourceAnalyticsLink>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section
            id="related-programmes"
            className="scroll-mt-28 border-t border-white/10 pt-12 sm:pt-16"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl">
              {t("profile.relatedProgrammes")}
            </h2>
            <LegendaryRelatedProgrammeDisclaimer />
            <div className="mt-6">
              <RelatedProgramLinks
                programmes={profile.relatedProgrammes}
                profileSlug={profile.slug}
                category={profile.category}
              />
            </div>
          </section>

          <LegendaryMethodDisclaimer
            variant="complete"
            className="legendary-surface mt-12 p-6 text-sm leading-relaxed text-[var(--color-muted)] sm:mt-16 sm:p-8"
          />
        </div>
      </div>
    </article>
  );
}
