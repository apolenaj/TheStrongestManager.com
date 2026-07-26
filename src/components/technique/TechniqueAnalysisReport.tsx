"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";
import {
  Alert,
  Badge,
  ButtonLink,
  ProgressBar,
  ScoreRing,
} from "@/design-system";
import { TechniqueComparison } from "@/components/technique/TechniqueComparison";
import { TechniqueFeedbackList } from "@/components/technique/TechniqueFeedbackList";
import { TechniqueVideoTimeline } from "@/components/technique/TechniqueVideoTimeline";
import { BarPathPanel } from "@/components/technique/BarPathPanel";
import { TechniqueShareSection } from "@/components/technique-share/TechniqueShareSection";
import type { MovementReport } from "@/domain/movement/types";
import type { TechniqueFeedbackAthleteContext } from "@/domain/technique/feedback/types";
import { runTechniqueFeedbackEngine } from "@/domain/technique/feedback/engine";
import {
  buildComparisonSummary,
  buildLiftPhaseAnalysis,
  buildTimelineMarkers,
  prioritizeTechniqueActions,
  topPositiveFindings,
  type TechniqueComparisonSummary,
} from "@/domain/technique/report-presentation";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { LearnWhy } from "@/components/on-site-education/LearnWhy";

/** MediaPipe / WASM — deferred until Re-analyze section mounts (Performance 2.0). */
const MovementAnalysisRunner = dynamic(
  () =>
    import("@/components/technique/MovementAnalysisRunner").then(
      (m) => m.MovementAnalysisRunner,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-[var(--color-muted)]">
        Loading pose analysis tools…
      </p>
    ),
  },
);

export type TechniqueReportModel = {
  id: string;
  status: string;
  analysisBackendStatus: string;
  overallScore: number | null;
  confidenceBasis: string | null;
  summary: string | null;
  cameraAngle: string | null;
  loadKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  signedMediaPath: string | null;
  movementReport: MovementReport | null;
  exercise: { name: string; slug: string } | null;
  createdAt: Date;
  canRunFixture: boolean;
  athleteContext: TechniqueFeedbackAthleteContext | null;
  /** Prompt 95 — never show Expert reviewed unless an expert decided. */
  authorshipBadge?: string;
  authorshipDetail?: string;
  isExpertReviewed?: boolean;
  previous: {
    id: string;
    createdAt: Date;
    overallScore: number | null;
    confidenceBasis: string | null;
    movementReport: MovementReport | null;
  } | null;
};

function ReportSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="technique-console grid gap-4 p-5 sm:p-6 animate-[fade-up_0.45s_ease-out_both]">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function TechniqueAnalysisReport({
  analysis,
}: {
  analysis: TechniqueReportModel;
}) {
  const assessment = analysis.movementReport?.techniqueAssessment ?? null;
  const score =
    analysis.overallScore ??
    assessment?.score ??
    analysis.movementReport?.overallTechniqueScore ??
    null;
  const confidence =
    assessment?.confidence ??
    analysis.movementReport?.reportConfidence ??
    analysis.confidenceBasis ??
    "none";

  const actions = useMemo(
    () => prioritizeTechniqueActions(assessment),
    [assessment],
  );
  const feedback = useMemo(
    () =>
      runTechniqueFeedbackEngine({
        assessment,
        athlete: analysis.athleteContext,
      }),
    [assessment, analysis.athleteContext],
  );
  const positives = useMemo(
    () => topPositiveFindings(assessment),
    [assessment],
  );
  const markers = useMemo(
    () => buildTimelineMarkers(analysis.movementReport),
    [analysis.movementReport],
  );
  const phaseAnalysis = useMemo(
    () => buildLiftPhaseAnalysis(analysis.movementReport),
    [analysis.movementReport],
  );
  const comparison: TechniqueComparisonSummary | null = useMemo(
    () =>
      buildComparisonSummary({
        previous: analysis.previous,
        currentId: analysis.id,
        currentScore: score,
        currentConfidence: confidence,
      }),
    [analysis.previous, analysis.id, score, confidence],
  );

  const observedComponents =
    assessment?.components.filter((c) => c.status === "observed") ?? [];
  const hasReport = Boolean(analysis.movementReport);

  return (
    <div className="grid gap-2">
      {/* Hero: score + confidence */}
      <section className="grid gap-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[linear-gradient(160deg,var(--color-surface)_0%,var(--color-surface-elevated)_100%)] p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-7 animate-[fade-up_0.4s_ease-out_both]">
        <div className="flex justify-center sm:justify-start">
          {score != null ? (
            <ScoreRing value={score} size={132} strokeWidth={10} label="Technique" />
          ) : (
            <div className="flex h-[132px] w-[132px] items-center justify-center rounded-full border border-dashed border-[var(--color-border-strong)] text-center text-xs text-[var(--color-muted)]">
              No score yet
            </div>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={analysis.isExpertReviewed ? "success" : "info"}
            >
              {analysis.authorshipBadge ?? "AI analysis"}
            </Badge>
            <ConfidenceBadge confidence={confidence} />
            {analysis.cameraAngle ? (
              <Badge variant="neutral">{analysis.cameraAngle} view</Badge>
            ) : null}
            {analysis.loadKg != null ? (
              <Badge variant="neutral">{analysis.loadKg} kg</Badge>
            ) : null}
            {analysis.reps != null ? (
              <Badge variant="neutral">{analysis.reps} reps</Badge>
            ) : null}
          </div>
          <LearnWhy topicId="technique_confidence" compact />
          <p className="text-xs text-[var(--color-muted)]">
            Image-plane / heuristic coaching readout — not laboratory biomechanics
            or medical diagnosis.{" "}
            <a
              href="/trust"
              className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Trust Center
            </a>
          </p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            Overall Technique Score
            {score != null ? (
              <span className="ml-2 tabular-nums text-[var(--color-accent)]">
                {Math.round(score)}
              </span>
            ) : (
              <span className="ml-2 text-[var(--color-muted)]">—</span>
            )}
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
            {assessment?.keyIssue ??
              analysis.summary ??
              "Run movement analysis to generate a Technique Score and coaching report."}
          </p>
          {analysis.authorshipDetail ? (
            <p className="max-w-xl text-xs leading-relaxed text-[var(--color-subtle)]">
              {analysis.authorshipDetail}
            </p>
          ) : null}
          {assessment ? (
            <p className="text-xs text-[var(--color-subtle)]">
              {assessment.formulaId} v{assessment.formulaVersion}
              {analysis.exercise ? (
                <>
                  {" · "}
                  <Link
                    href={`/exercises/${analysis.exercise.slug}`}
                    className="text-[var(--color-accent)] hover:underline"
                  >
                    Exercise guide
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </section>

      <TechniqueShareSection
        analysisId={analysis.id}
        exerciseLabel={analysis.exercise?.name ?? "Lift"}
        overallScore={score}
        components={
          assessment?.components.map((c) => ({
            label: c.label,
            score: c.score,
            status: c.status,
          })) ?? []
        }
        insightOptions={[
          ...positives.slice(0, 3),
          ...(assessment?.keyIssue ? [assessment.keyIssue] : []),
          ...(assessment?.recommendations?.slice(0, 2) ?? []),
        ].filter(Boolean)}
      />

      {!analysis.movementReport?.cameraSuitability.suitable &&
      analysis.movementReport ? (
        <Alert tone="warning" title="Camera angle limits this report">
          {analysis.movementReport.cameraSuitability.message}
        </Alert>
      ) : null}

      <ReportSection
        title="Video & lift phases"
        description="Click a phase on the timeline for frame, metric, issue, and recommendation."
      >
        <TechniqueVideoTimeline
          src={analysis.signedMediaPath}
          markers={markers}
          phaseInsights={phaseAnalysis.insights}
          phasesUnavailableReason={phaseAnalysis.unavailableReason}
          durationSeconds={analysis.durationSeconds}
        />
        {!phaseAnalysis.phasesSupported &&
        phaseAnalysis.catalogPhases.length > 0 ? (
          <p className="mt-3 text-xs text-[var(--color-subtle)]">
            Catalogued for this lift:{" "}
            {phaseAnalysis.catalogPhases.map((p) => p.label).join(" → ")}.
            {phaseAnalysis.catalogPhases.every((p) => !p.implemented)
              ? " Detection not enabled until reliable."
              : null}
          </p>
        ) : null}
      </ReportSection>

      {analysis.movementReport?.barPath ? (
        <ReportSection
          title="Bar path"
          description="Mid-wrist proxy path — hidden when detection confidence is poor."
        >
          <BarPathPanel analysis={analysis.movementReport.barPath} />
        </ReportSection>
      ) : null}

      {comparison ? <TechniqueComparison comparison={comparison} /> : null}

      {hasReport ? (
        <ReportSection
          title="Technique breakdown"
          description="Observed components only — unavailable metrics are omitted, not invented."
        >
          {observedComponents.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No scored components yet for this camera angle / clip.
            </p>
          ) : (
            <ul className="grid gap-4">
              {observedComponents
                .slice()
                .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                .map((component) => (
                  <li key={component.id}>
                    <ProgressBar
                      value={component.score ?? 0}
                      label={component.label}
                      tone={
                        (component.score ?? 0) >= 75
                          ? "excellent"
                          : (component.score ?? 0) >= 55
                            ? "good"
                            : "needsAttention"
                      }
                    />
                  </li>
                ))}
            </ul>
          )}
        </ReportSection>
      ) : null}

      {positives.length > 0 ? (
        <ReportSection title="What you did well">
          <ul className="grid gap-2">
            {positives.map((item) => (
              <li
                key={item}
                className="border-l-2 border-[var(--color-score-excellent)] pl-3 text-sm text-[var(--color-foreground)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </ReportSection>
      ) : null}

      {actions.length > 0 ? (
        <ReportSection
          title="Main improvement opportunity"
          description="Top priorities only — not a laundry list of warnings."
        >
          <ol className="grid gap-4">
            {actions.map((action) => (
              <li key={action.id} className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">{action.priority}</Badge>
                  <span className="font-medium">{action.title}</span>
                </div>
                <p className="text-sm text-[var(--color-muted)]">{action.detail}</p>
              </li>
            ))}
          </ol>
        </ReportSection>
      ) : null}

      {(actions.length > 0 ||
        feedback.recommendations.length > 0 ||
        feedback.withheldReasons.length > 0) &&
      assessment ? (
        <ReportSection
          title="How to improve"
          description="Rule-based recommendations — gated by confidence, training level, pain notes, and goal. Not blind prescriptions."
        >
          <TechniqueFeedbackList
            recommendations={feedback.recommendations}
            withheldReasons={feedback.withheldReasons}
          />
        </ReportSection>
      ) : null}

      <ReportSection
        title="Re-analyze"
        description="Extract poses again after you film a better clip — scores are never invented."
      >
        <MovementAnalysisRunner
          analysisId={analysis.id}
          signedMediaPath={analysis.signedMediaPath}
          exerciseSlug={analysis.exercise?.slug ?? null}
          cameraAngle={analysis.cameraAngle}
          canRunFixture={analysis.canRunFixture}
        />
        <div className="flex flex-wrap gap-2 pt-2">
          <ButtonLink href="/app/technique" variant="secondary">
            Upload a new video
          </ButtonLink>
          <ButtonLink
            href={`/app/technique/${analysis.id}/diagnostics`}
            variant="ghost"
          >
            Developer diagnostics
          </ButtonLink>
        </div>
      </ReportSection>
    </div>
  );
}
