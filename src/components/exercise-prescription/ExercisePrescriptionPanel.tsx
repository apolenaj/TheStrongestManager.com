import Link from "next/link";
import {
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { ExercisePrescriptionView } from "@/services/exercise-prescription";
import { WEAK_POINT_LABELS } from "@/domain/exercise-prescription";
import { fromExercisePrescriptionRec } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

export function ExercisePrescriptionPanel({
  view,
}: {
  view: ExercisePrescriptionView;
}) {
  const { result, profileDefaults, weakPointOptions } = view;

  return (
    <div className="grid gap-6">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Exercise prescription</Badge>
            <Badge variant="neutral">{result.engineVersion}</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight">
            Recommended exercises
          </CardTitle>
          <CardDescription>
            Multi-rule recommendations from the published catalog — never a
            single-heuristic auto-prescribe.
          </CardDescription>
        </CardHeader>
        <dl className="grid gap-2 text-sm text-[var(--color-muted)] sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.12em]">Goal</dt>
            <dd className="text-[var(--color-fg)]">
              {profileDefaults.goalLabel ?? result.inputs.goal}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em]">Weak point</dt>
            <dd className="text-[var(--color-fg)]">
              {WEAK_POINT_LABELS[result.inputs.weakPoint]}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em]">Sport</dt>
            <dd className="text-[var(--color-fg)]">
              {profileDefaults.sport ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em]">Experience</dt>
            <dd className="text-[var(--color-fg)]">
              {profileDefaults.experience ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em]">Equipment</dt>
            <dd className="text-[var(--color-fg)]">
              {profileDefaults.equipment.length
                ? profileDefaults.equipment.join(", ")
                : "Not listed"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em]">
              Pain / technique flags
            </dt>
            <dd className="text-[var(--color-fg)]">
              {profileDefaults.painFlags ? "Caution notes on file" : "None"}
              {profileDefaults.techniqueLimitations
                ? ` · ${profileDefaults.techniqueLimitations.slice(0, 80)}`
                : ""}
            </dd>
          </div>
        </dl>

        <form className="mt-4 flex flex-wrap gap-2" method="get">
          <label className="text-sm text-[var(--color-muted)]">
            Focus weak point{" "}
            <select
              name="weakPoint"
              defaultValue={result.inputs.weakPoint}
              className="ml-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-fg)]"
            >
              {weakPointOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-1 text-sm"
          >
            Update
          </button>
        </form>
      </Card>

      {result.emptyReason ? (
        <Card>
          <CardHeader>
            <CardTitle>No recommendations</CardTitle>
            <CardDescription>{result.emptyReason}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        result.recommendations.map((rec) => (
          <Card key={rec.slug} elevated>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">score {rec.score}</Badge>
                <ConfidenceBadge
                  confidence={
                    fromExercisePrescriptionRec(rec).confidence
                  }
                />
                <Badge variant="neutral">fatigue {rec.expectedFatigue}</Badge>
                <Badge variant="neutral">skill {rec.skillDemand}</Badge>
              </div>
              <CardTitle className="text-xl">
                <Link
                  href={rec.href}
                  className="hover:text-[var(--color-accent)]"
                >
                  {rec.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Why
                </dt>
                <dd className="mt-1 text-[var(--color-fg)]">{rec.reason}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Primary purpose
                </dt>
                <dd className="mt-1 text-[var(--color-fg)]">
                  {rec.primaryPurpose}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Best placement in week
                </dt>
                <dd className="mt-1 text-[var(--color-fg)]">
                  {rec.bestPlacementInWeek}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Rules that supported this
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {rec.matchedRuleLabels.map((l) => (
                    <Badge key={l} variant="neutral">
                      {l}
                    </Badge>
                  ))}
                </dd>
              </div>
              {rec.alternatives.length > 0 ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    Alternatives
                  </dt>
                  <dd className="mt-2 grid gap-2">
                    {rec.alternatives.map((alt) => (
                      <div
                        key={alt.slug}
                        className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/exercises/${alt.slug}`}
                            className="font-medium text-[var(--color-fg)] hover:text-[var(--color-accent)]"
                          >
                            {alt.name}
                          </Link>
                          {alt.requiresUnavailableEquipment ? (
                            <Badge variant="warning">Alternative gear</Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-[var(--color-muted)]">
                          {alt.reason}
                        </p>
                        {alt.equipmentNote ? (
                          <p className="mt-1 text-xs text-[var(--color-score-needs-attention)]">
                            {alt.equipmentNote}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-4 px-0">
              <WhyAmISeeingThis view={fromExercisePrescriptionRec(rec)} />
              <AiTrustChrome
                relatedType="exercise_prescription"
                relatedId={rec.slug}
                correctHref="/app/exercise-prescription"
                correctLabel="Change weak-point focus or open exercise detail"
              />
            </div>
          </Card>
        ))
      )}

      {result.matchedRules.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Rules that fired</CardTitle>
            <CardDescription>
              Transparency panel — same pattern as the Fit engine.
            </CardDescription>
          </CardHeader>
          <ul className="grid gap-2 text-sm">
            {result.matchedRules.map((r) => (
              <li key={r.id}>
                <span className="font-medium text-[var(--color-fg)]">
                  {r.label}
                </span>
                <span className="text-[var(--color-muted)]">
                  {" "}
                  — {r.description}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {result.missingInformation.length > 0 ? (
        <p className="text-xs text-[var(--color-muted)]">
          Missing for richer picks: {result.missingInformation.join("; ")}.
        </p>
      ) : null}

      <p className="text-xs text-[var(--color-muted)]">{result.disclaimers[0]}</p>

      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/app/exercises" variant="secondary" size="sm">
          Exercise library
        </ButtonLink>
        <ButtonLink href="/app/programs" variant="ghost" size="sm">
          Programs
        </ButtonLink>
      </div>
    </div>
  );
}
