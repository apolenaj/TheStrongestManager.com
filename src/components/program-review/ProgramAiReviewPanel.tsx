"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ScoreRing,
} from "@/design-system";
import type { ProgramAiReviewPayload } from "@/domain/program-review";
import { displayableProgramScore } from "@/domain/program-score";
import type {
  ProgramReviewHistoryItem,
  ProgramReviewOption,
} from "@/services/program-review";
import { saveProgramAiReviewAction } from "@/services/program-review/actions";
import { AthleteAiFeedbackControls } from "@/components/ai/AthleteAiFeedbackControls";

function statusBadgeVariant(
  status: string,
): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "strong") return "success";
  if (status === "adequate") return "info";
  if (status === "needs_attention") return "warning";
  if (status === "context_mismatch") return "warning";
  return "neutral";
}

export function ProgramAiReviewPanel({
  review,
  options,
  selectedProgramId,
  history,
  storedId,
}: {
  review: ProgramAiReviewPayload | null;
  options: ProgramReviewOption[];
  selectedProgramId: string | null;
  history: ProgramReviewHistoryItem[];
  storedId?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    if (!selectedProgramId) return;
    setError(null);
    setSavedNote(null);
    startTransition(async () => {
      const result = await saveProgramAiReviewAction(selectedProgramId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedNote("Review saved to history.");
    });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose a program</CardTitle>
          <CardDescription>
            Analyze an assigned program or a library template. Create or assign
            programs from Programs — this review never auto-rewrites your plan.
          </CardDescription>
        </CardHeader>
        {options.length === 0 ? (
          <EmptyPrograms />
        ) : (
          <ul className="grid gap-2">
            {options.map((opt) => {
              const selected = opt.id === selectedProgramId;
              return (
                <li key={opt.id}>
                  <Link
                    href={`/app/program-review?programId=${encodeURIComponent(opt.id)}`}
                    className={
                      selected
                        ? "flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[var(--color-accent-muted)] px-3 py-2 text-sm"
                        : "flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:border-[var(--color-accent)]/40"
                    }
                  >
                    <span className="font-medium text-[var(--color-fg)]">
                      {opt.name}
                    </span>
                    <span className="text-[var(--color-muted)]">
                      {opt.kind} · {opt.status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/app/programs" variant="secondary" size="sm">
            Open Programs
          </ButtonLink>
          {selectedProgramId ? (
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={pending || !review}
              onClick={save}
            >
              {pending ? "Saving…" : "Save review to history"}
            </Button>
          ) : null}
        </div>
        {error ? (
          <Alert tone="danger" title="Could not save" className="mt-3">
            {error}
          </Alert>
        ) : null}
        {savedNote ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">{savedNote}</p>
        ) : null}
      </Card>

      {review ? (
        <>
          <ReviewBody review={review} />
          {storedId ? (
            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
                <CardDescription>
                  Rate this saved AI review. Feedback is reviewed offline — it
                  never auto-retrains production models.
                </CardDescription>
              </CardHeader>
              <div className="px-1 pb-3">
                <AthleteAiFeedbackControls
                  relatedType="program_ai_review"
                  relatedId={storedId}
                />
              </div>
            </Card>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              Save the review to history to leave helpful / not helpful
              feedback.
            </p>
          )}
        </>
      ) : null}

      {history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Saved reviews</CardTitle>
            <CardDescription>
              Historical analyses stay on file — open the program to re-run.
            </CardDescription>
          </CardHeader>
          <ul className="grid gap-4">
            {history.map((h) => (
              <li
                key={h.id}
                className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
              >
                <Link
                  href={`/app/program-review?programId=${encodeURIComponent(h.programId)}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm hover:text-[var(--color-accent)]"
                >
                  <span className="font-medium text-[var(--color-fg)]">
                    {h.programName}
                  </span>
                  <span className="text-[var(--color-muted)]">
                    {h.createdAtIso.slice(0, 10)}
                  </span>
                </Link>
                <AthleteAiFeedbackControls
                  relatedType="program_ai_review"
                  relatedId={h.id}
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function EmptyPrograms() {
  return (
    <p className="text-sm text-[var(--color-muted)]">
      No programs on file yet. Assign or create a program under Programs, then
      return here for analysis.
    </p>
  );
}

function ReviewBody({ review }: { review: ProgramAiReviewPayload }) {
  const displayScore = displayableProgramScore(review.programScore);

  return (
    <>
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Program overview</Badge>
            <Badge variant="neutral">{review.engineVersion}</Badge>
            <Badge variant="info">{review.program.status}</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight">
            {review.program.name}
          </CardTitle>
          <CardDescription>{review.overview}</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap items-start gap-6">
          {displayScore != null ? (
            <ScoreRing value={displayScore} label="Program Score" />
          ) : (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-muted)]">
              Program Score unavailable
              <p className="mt-1 text-xs">
                {review.programScore.explanation}
              </p>
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs text-[var(--color-muted)]">
              Context used: goal {review.athleteContextUsed.goalTitle ?? "—"} ·
              experience {review.athleteContextUsed.experienceLevel ?? "—"} ·
              days/week {review.athleteContextUsed.daysPerWeek ?? "—"} · recovery{" "}
              {review.athleteContextUsed.recoveryCapacityLabel}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Formula {review.programScore.formulaId} v
              {review.programScore.formulaVersion} · confidence{" "}
              {review.programScore.confidence}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program Score subscores</CardTitle>
          <CardDescription>
            Transparent weighted components — null when information is missing
            (not invented).
          </CardDescription>
        </CardHeader>
        <div className="grid gap-3">
          {review.programScore.subscores.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] pb-2 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-fg)]">
                  {s.label}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  weight {s.weight}
                  {s.status === "observed"
                    ? ` · effective ${s.effectiveWeight}`
                    : " · unavailable"}
                </p>
              </div>
              <Badge variant={s.score != null ? "info" : "neutral"}>
                {s.score != null ? `${s.score}` : "—"}
              </Badge>
            </div>
          ))}
        </div>
        {review.programScore.reasoning.notes[0] ? (
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            {review.programScore.reasoning.notes.slice(0, 2).join(" ")}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
          </CardHeader>
          <ul className="grid gap-2 text-sm text-[var(--color-fg)]">
            {review.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Potential issues</CardTitle>
            <CardDescription>
              Framed against your context — not a blanket “bad program” label.
            </CardDescription>
          </CardHeader>
          <ul className="grid gap-2 text-sm text-[var(--color-fg)]">
            {review.potentialIssues.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal alignment</CardTitle>
          <CardDescription>{review.goalAlignment.summary}</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={
              review.goalAlignment.aligned === true
                ? "success"
                : review.goalAlignment.aligned === false
                  ? "warning"
                  : "neutral"
            }
          >
            {review.goalAlignment.aligned === true
              ? "Aligned"
              : review.goalAlignment.aligned === false
                ? "Mismatch signals"
                : "Inconclusive"}
          </Badge>
          <Badge variant="info">{review.goalAlignment.confidence}</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly stress distribution</CardTitle>
          <CardDescription>
            Relative density from the prescription — not injury risk.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-2 sm:grid-cols-7">
          {review.weeklyStressDistribution.map((d) => (
            <div
              key={d.dayIndex}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-2 text-center"
            >
              <p className="text-xs font-semibold text-[var(--color-muted)]">
                D{d.dayIndex}
              </p>
              <Badge
                variant={
                  d.stressBand === "high"
                    ? "warning"
                    : d.stressBand === "rest"
                      ? "neutral"
                      : "info"
                }
                className="mt-1"
              >
                {d.stressBand}
              </Badge>
              <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                {d.detail}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis dimensions</CardTitle>
        </CardHeader>
        <div className="grid gap-3">
          {review.dimensions.map((d) => (
            <div
              key={d.id}
              className="border-b border-[var(--color-border)] pb-3 last:border-b-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[var(--color-fg)]">
                  {d.label}
                </p>
                <Badge variant={statusBadgeVariant(d.status)}>
                  {d.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {d.finding}
              </p>
              {d.contextNote ? (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {d.contextNote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle>Recommended improvements</CardTitle>
          <CardDescription>
            Suggestions only — nothing is auto-applied to your program.
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-2 text-sm text-[var(--color-fg)]">
          {review.recommendedImprovements.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>

      {review.missingInformation.length > 0 ? (
        <p className="text-xs text-[var(--color-muted)]">
          Missing for a richer review: {review.missingInformation.join("; ")}.
        </p>
      ) : null}

      <p className="text-xs text-[var(--color-muted)]">{review.honesty[1]}</p>
    </>
  );
}
