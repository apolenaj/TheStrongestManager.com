"use client";

import Link from "next/link";
import { Badge } from "@/design-system";
import type { TechniqueFeedbackRecommendation } from "@/domain/technique/feedback/types";

const KIND_LABEL: Record<TechniqueFeedbackRecommendation["kind"], string> = {
  position_drill: "Position drill",
  exercise_variation: "Exercise",
  tempo_work: "Tempo",
  load_management: "Load management",
  setup_cue: "Setup cue",
  reassess: "Reassess",
  caution: "Caution",
};

export function TechniqueFeedbackList({
  recommendations,
  withheldReasons,
}: {
  recommendations: TechniqueFeedbackRecommendation[];
  withheldReasons: string[];
}) {
  if (recommendations.length === 0) {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-[var(--color-muted)]">
          No prescriptions yet — confidence or component thresholds were not
          met. Nothing was invented.
        </p>
        {withheldReasons.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-xs text-[var(--color-subtle)]">
            {withheldReasons.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="grid gap-6">
      {recommendations.map((rec) => (
        <li
          key={rec.id}
          className="grid gap-3 border-t border-[var(--color-border)] pt-5 first:border-0 first:pt-0"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">{rec.priority}</Badge>
            <Badge variant="neutral">{KIND_LABEL[rec.kind]}</Badge>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold">
              {rec.exerciseSlug ? (
                <Link
                  href={`/exercises/${rec.exerciseSlug}`}
                  className="text-[var(--color-accent)] hover:underline"
                >
                  {rec.title}
                </Link>
              ) : (
                rec.title
              )}
            </span>
            {rec.relatedComponentLabel ? (
              <span className="text-xs text-[var(--color-subtle)]">
                for {rec.relatedComponentLabel}
              </span>
            ) : null}
          </div>

          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                Why
              </dt>
              <dd className="mt-1 text-[var(--color-muted)]">{rec.why}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                How
              </dt>
              <dd className="mt-1 text-[var(--color-muted)]">{rec.how}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                Suggested dosage
              </dt>
              <dd className="mt-1 text-[var(--color-muted)]">{rec.dosage}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                When to reassess
              </dt>
              <dd className="mt-1 text-[var(--color-muted)]">{rec.reassess}</dd>
            </div>
          </dl>

          {rec.caveats.length > 0 ? (
            <ul className="list-disc space-y-0.5 pl-4 text-xs text-[var(--color-subtle)]">
              {rec.caveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
