import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import {
  EXAMPLE_WEEK_LABEL_COPY,
  LEGENDARY_CONTENT_LAYER_LABELS,
  LEGENDARY_METHOD_CATEGORY_LABELS,
  LEGENDARY_PROFILE_TOC,
  PROFILE_INDEPENDENT_BADGE,
  editorialLabelForContentLayer,
  estimateLegendaryMethodReadingTimeMinutes,
  type LegendaryContentLayer,
  type LegendaryEditorialLabelId,
  type LegendaryMethodProfile,
  type ScoredMetric,
} from "@/domain/legendary-methods";
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

function formatReviewedDate(value?: string): string {
  if (!value) return "Pending review";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ScoreBar({ metric, label }: { metric: ScoredMetric; label: string }) {
  const value = metric.value;
  const width = value == null ? 0 : value * 10;
  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          {label}
        </h3>
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-accent)]">
          {value == null ? "—" : value}
          <span className="text-sm text-[var(--color-subtle)]"> / 10</span>
        </p>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden bg-[var(--color-background)]"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value ?? 0}
        {...(value == null ? { "aria-valuetext": "Not scored" } : {})}
      >
        <div
          className="h-full bg-[var(--color-accent)] transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        {metric.justification.trim()
          ? metric.justification
          : "Justification pending — scores publish with a short written rationale."}
      </p>
    </div>
  );
}

function DistributionChart({
  title,
  slices,
}: {
  title: string;
  slices: Array<{ label: string; share: number }>;
}) {
  if (slices.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          {title}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-subtle)]">
          Distribution visuals appear when sourced structure data is added.
        </p>
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
              aria-label={`${slice.label} share`}
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
  if (!refs?.length) return null;
  return (
    <p className="text-xs text-[var(--color-subtle)]">
      <span className="sr-only">Cited sources: </span>
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
  title: string;
  layer?: LegendaryContentLayer;
  extraLabelIds?: LegendaryEditorialLabelId[];
  sourceRefs?: number[];
  children: ReactNode;
}) {
  const primary = layer ? editorialLabelForContentLayer(layer) : null;
  return (
    <section id={id} className="scroll-mt-28 border-t border-[var(--color-border)] pt-10">
      <div className="flex flex-wrap gap-2">
        {primary ? <LegendaryEditorialLabel id={primary.id} /> : null}
        {extraLabelIds?.map((labelId) => (
          <LegendaryEditorialLabel key={labelId} id={labelId} />
        ))}
      </div>
      {layer ? (
        <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-subtle)]">
          {LEGENDARY_CONTENT_LAYER_LABELS[layer]}
        </p>
      ) : null}
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)] sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 max-w-prose space-y-4 text-base leading-relaxed text-[var(--color-muted)]">
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
  profile: LegendaryMethodProfile,
  id: LegendaryMethodProfile["sections"][number]["id"],
): string {
  return profile.sections.find((section) => section.id === id)?.body.trim() ?? "";
}

function getSectionSourceRefs(
  profile: LegendaryMethodProfile,
  id: LegendaryMethodProfile["sections"][number]["id"],
): number[] | undefined {
  return profile.sections.find((section) => section.id === id)?.sourceRefs;
}

/**
 * Single reusable production profile template for all Legendary Methods pages.
 */
export function LegendaryMethodProfileTemplate({
  profile,
}: {
  profile: LegendaryMethodProfile;
}) {
  const readingTime = estimateLegendaryMethodReadingTimeMinutes(profile);
  const reviewed =
    profile.lastReviewedAt ?? profile.updatedAt ?? profile.publishedAt;
  const athleteEraBody = getSectionBody(profile, "athlete-and-era");
  const documentedBody = getSectionBody(profile, "documented-training-method");
  const structureNarrative = getSectionBody(profile, "training-structure");
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
    <article className="pb-16">
      <a
        href="#legendary-profile-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-accent-foreground)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-focus)]"
      >
        Skip to profile content
      </a>

      <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-muted)]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href="/legendary-methods"
              className="hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Legendary Methods
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[var(--color-foreground)]" aria-current="page">
            {profile.athleteName}
          </li>
        </ol>
      </nav>

      <header className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {LEGENDARY_METHOD_CATEGORY_LABELS[profile.category]}
          </p>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {profile.athleteName}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase leading-[1.05] tracking-[0.03em] text-[var(--color-foreground)] sm:text-4xl md:text-5xl">
            {profile.profileTitle}
          </h1>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            {profile.summary.trim()
              ? profile.summary
              : "Educational analysis shell — long-form sourced content is added before publish."}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex min-h-9 items-center border border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              {PROFILE_INDEPENDENT_BADGE}
            </span>
            <span className="inline-flex min-h-9 items-center border border-[var(--color-border)] px-3 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Evidence · {profile.evidenceQuality}
            </span>
            {evidenceLabelId ? (
              <LegendaryEditorialLabel id={evidenceLabelId} />
            ) : null}
            <span className="inline-flex min-h-9 items-center border border-[var(--color-border)] px-3 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              ~{readingTime} min read
            </span>
            <span className="inline-flex min-h-9 items-center border border-[var(--color-border)] px-3 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Reviewed · {formatReviewedDate(reviewed)}
            </span>
          </div>

          <div className="mt-5 max-w-prose space-y-3">
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
        className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
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
              className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]"
            >
              Quick Method Profile
            </h2>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {(
                [
                  ["Primary goal", quick.primaryGoal],
                  ["Typical frequency", quick.typicalFrequency || profile.trainingDays || ""],
                  ["Volume level", quick.volumeLevel],
                  ["Intensity profile", quick.intensityProfile],
                  ["Recovery demand", quick.recoveryDemand],
                  ["Technical difficulty", quick.technicalDifficulty],
                  ["Best suited for", quick.bestSuitedFor || profile.bestFor.join(", ")],
                  ["Evidence quality", quick.evidenceQuality || profile.evidenceQuality],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4"
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
            title="The Athlete and the Era"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(profile, "athlete-and-era")}
          >
            {athleteEraBody ? (
              <p className="whitespace-pre-line">{athleteEraBody}</p>
            ) : (
              <PendingCopy>
                Career-stage and sport context will appear here from sourced
                material — not a general biography.
              </PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="documented-training-method"
            title="The Documented Training Method"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(profile, "documented-training-method")}
          >
            {documentedBody ? (
              <>
                <p className="whitespace-pre-line">{documentedBody}</p>
                <p className="text-sm text-[var(--color-subtle)]">
                  Significant factual claims should cite the Sources list below.
                  Uncertain or conflicting reports are labelled in the sourced
                  copy when present.
                </p>
              </>
            ) : (
              <PendingCopy>
                Only source-supported method details are published here. No
                fabricated routines or quotes.
              </PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="training-structure"
            title="Training Structure"
            layer="documented_historical"
            sourceRefs={getSectionSourceRefs(profile, "training-structure")}
          >
            {structureNarrative ? (
              <p className="whitespace-pre-line">{structureNarrative}</p>
            ) : null}
            <div className="grid gap-6 not-prose sm:grid-cols-2">
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-[var(--color-subtle)]">Training days:</span>{" "}
                  {displayOrDash(structure?.trainingDays)}
                </p>
                <p>
                  <span className="text-[var(--color-subtle)]">
                    Exercise frequency:
                  </span>{" "}
                  {displayOrDash(structure?.exerciseFrequency)}
                </p>
                <p>
                  <span className="text-[var(--color-subtle)]">
                    Progression:
                  </span>{" "}
                  {displayOrDash(structure?.progressionApproach)}
                </p>
                <p>
                  <span className="text-[var(--color-subtle)]">Recovery:</span>{" "}
                  {displayOrDash(structure?.recoveryStructure)}
                </p>
                <div>
                  <p className="text-[var(--color-subtle)]">Primary movements</p>
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
                  <p className="text-[var(--color-subtle)]">Accessory work</p>
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
                  title="Volume distribution"
                  slices={structure?.volumeDistribution ?? []}
                />
                <DistributionChart
                  title="Intensity distribution"
                  slices={structure?.intensityDistribution ?? []}
                />
              </div>
            </div>
          </SectionShell>

          <SectionShell
            id="volume-intensity-frequency"
            title="Volume, Intensity and Frequency Analysis"
            layer="independent_analysis"
            sourceRefs={getSectionSourceRefs(
              profile,
              "volume-intensity-frequency",
            )}
          >
            {volumeBody ? (
              <p className="whitespace-pre-line">{volumeBody}</p>
            ) : (
              <PendingCopy>
                Independent analysis of volume, intensity, and frequency appears
                here once sourced claims are ready.
              </PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="example-training-week"
            title="Example Training Week"
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
                  {EXAMPLE_WEEK_LABEL_COPY[week.label].title}
                </p>
                <p className="text-sm text-[var(--color-subtle)]">
                  {EXAMPLE_WEEK_LABEL_COPY[week.label].caution}
                </p>
                <p>{week.disclaimer}</p>
                <div className="not-prose overflow-x-auto">
                  <table className="mt-2 w-full min-w-[28rem] border-collapse text-left text-sm">
                    <caption className="sr-only">{week.title}</caption>
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-[var(--color-subtle)]">
                        <th scope="col" className="py-2 pr-3 font-medium">Day</th>
                        <th scope="col" className="py-2 pr-3 font-medium">Focus</th>
                        <th scope="col" className="py-2 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {week.days.map((day) => (
                        <tr
                          key={day.dayLabel}
                          className="border-b border-[var(--color-border)] align-top"
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
              <PendingCopy>
                Example weeks support three labels: Documented example,
                Reconstructed from multiple public sources, or Original
                modernised example. Reconstructed and original weeks are never
                presented as the athlete’s exact routine.
              </PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="why-it-worked"
            title="Why It Worked"
            layer="independent_analysis"
          >
            {whyBody ? <p className="whitespace-pre-line">{whyBody}</p> : null}
            <dl className="not-prose grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Specificity", why?.specificity],
                  ["Volume", why?.volume],
                  ["Intensity", why?.intensity],
                  ["Technical practice", why?.technicalPractice],
                  ["Athlete experience", why?.athleteExperience],
                  ["Bodyweight", why?.bodyweight],
                  ["Recovery", why?.recovery],
                  ["Sport demands", why?.sportDemands],
                  ["Long-term adaptation", why?.longTermAdaptation],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
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
            title="What Most Lifters Get Wrong"
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
              <PendingCopy>
                Practical warnings appear here — without exaggerated injury
                claims or medical diagnosis.
              </PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="risks-and-recovery"
            title="Risks and Recovery Demands"
            layer="independent_analysis"
            sourceRefs={getSectionSourceRefs(profile, "risks-and-recovery")}
          >
            {risksBody ? (
              <p className="whitespace-pre-line">{risksBody}</p>
            ) : (
              <PendingCopy>
                Recovery demands and practical risk notes appear here — without
                medical diagnosis or exaggerated injury claims.
              </PendingCopy>
            )}
          </SectionShell>

          <SectionShell
            id="risks-and-recovery"
            title="Risks and Recovery Demands"
            layer="independent_analysis"
            sourceRefs={getSectionSourceRefs(profile, "risks-and-recovery")}
          >
            {risksBody ? (
              <p className="whitespace-pre-line">{risksBody}</p>
            ) : (
              <PendingCopy>
                Recovery demands and practical risk notes appear here — without
                medical diagnosis or exaggerated injury claims.
              </PendingCopy>
            )}
          </SectionShell>

          <section id="scores" className="scroll-mt-28 border-t border-[var(--color-border)] pt-10">
            <div className="flex flex-wrap gap-2">
              <LegendaryEditorialLabel id="analysis" />
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)] sm:text-3xl">
              The Strongest Manager Score
            </h2>
            <p className="mt-3 max-w-prose text-sm text-[var(--color-muted)]">
              Independent 1–10 editorial scores with short justifications — not
              laboratory measurements or athlete endorsements.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ScoreBar metric={scores.strengthPotential} label="Strength Potential" />
              <ScoreBar
                metric={scores.hypertrophyPotential}
                label="Hypertrophy Potential"
              />
              <ScoreBar metric={scores.recoveryDemand} label="Recovery Demand" />
              <ScoreBar
                metric={scores.technicalDifficulty}
                label="Technical Difficulty"
              />
              <ScoreBar
                metric={scores.beginnerSuitability}
                label="Beginner Suitability"
              />
              <ScoreBar
                metric={scores.advancedSuitability}
                label="Advanced Suitability"
              />
            </div>
          </section>

          <SectionShell
            id="verdict"
            title="The Strongest Manager Verdict"
            layer="independent_analysis"
            sourceRefs={getSectionSourceRefs(profile, "verdict")}
          >
            {verdictBody ? (
              <p className="whitespace-pre-line">{verdictBody}</p>
            ) : (
              <PendingCopy>
                An independent editorial verdict appears here when the sourced
                analysis is complete.
              </PendingCopy>
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
                Compared with{" "}
                <Link
                  href={`/legendary-methods/${comparison.counterpartSlug}`}
                  className="text-[var(--color-accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  {comparison.counterpartName}
                </Link>
                . Original educational comparison — not a reprint of any copyrighted
                programme table.
              </p>
              <div className="not-prose overflow-x-auto">
                <table className="mt-2 w-full min-w-[36rem] border-collapse text-left text-sm">
                  <caption className="sr-only">{comparison.title}</caption>
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-subtle)]">
                      <th scope="col" className="py-2 pr-3 font-medium">Dimension</th>
                      <th scope="col" className="py-2 pr-3 font-medium">This system</th>
                      <th scope="col" className="py-2 font-medium">
                        {comparison.counterpartName}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.rows.map((row) => (
                      <tr
                        key={row.dimension}
                        className="border-b border-[var(--color-border)] align-top"
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
            title="Modernised Application"
            layer="modernised_adaptation"
          >
            <p className="inline-flex border border-[var(--color-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              Original interpretation by The Strongest Manager
            </p>
            {modern?.summary || modernBody ? (
              <p className="whitespace-pre-line">
                {modern?.summary || modernBody}
              </p>
            ) : (
              <PendingCopy>
                Modernised applications are original interpretations — never
                sold as the athlete’s exact programme.
              </PendingCopy>
            )}
            <div className="not-prose grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Beginner adjustment", modern?.beginnerAdjustment],
                  ["Intermediate adjustment", modern?.intermediateAdjustment],
                  ["Advanced adjustment", modern?.advancedAdjustment],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
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
                Recommended frequency:
              </span>{" "}
              {displayOrDash(modern?.recommendedFrequency)}
            </p>
            <p>
              <span className="text-[var(--color-subtle)]">
                When to reduce volume:
              </span>{" "}
              {displayOrDash(modern?.whenToReduceVolume)}
            </p>
            <div>
              <p className="text-[var(--color-subtle)]">Recovery controls</p>
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
              <p className="text-[var(--color-subtle)]">Progression rules</p>
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
              <p className="text-[var(--color-subtle)]">Who should avoid</p>
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
            className="scroll-mt-28 border-t border-[var(--color-border)] pt-10"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              Sources
            </h2>
            <div className="mt-4 max-w-prose">
              <LegendaryMethodDisclaimer variant="complete" />
            </div>
            {profile.sources.length === 0 ? (
              <p className="mt-4 max-w-prose text-sm text-[var(--color-subtle)]">
                Numbered citations appear when verified. We do not fabricate
                sources.
              </p>
            ) : (
              <ol className="mt-5 max-w-prose list-decimal space-y-4 pl-5 text-sm text-[var(--color-muted)]">
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
                      . Accessed {source.accessDate}.
                    </p>
                    <LegendarySourceAnalyticsLink
                      href={source.url}
                      slug={profile.slug}
                      className="mt-1 inline-flex items-center gap-1 text-[var(--color-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      External source
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </LegendarySourceAnalyticsLink>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section
            id="related-programmes"
            className="scroll-mt-28 border-t border-[var(--color-border)] pt-10"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              Related original programmes
            </h2>
            <LegendaryRelatedProgrammeDisclaimer />
            <div className="mt-5">
              <RelatedProgramLinks
                programmes={profile.relatedProgrammes}
                profileSlug={profile.slug}
                category={profile.category}
              />
            </div>
          </section>

          <LegendaryMethodDisclaimer variant="complete" className="mt-12 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm leading-relaxed text-[var(--color-muted)]" />
        </div>
      </div>
    </article>
  );
}
