import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  TCI_CONTEXT_LABELS,
  TCI_MIN_RESOLVED_PLAN_DAYS,
  type TrainingConsistencyAnalysis,
} from "@/domain/training-consistency-intelligence";

export function TrainingConsistencyIntelligencePanel({
  analysis,
}: {
  analysis: TrainingConsistencyAnalysis;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Adherence to plan — not days in the gym">
        {analysis.honesty[0]} {analysis.honesty[2]}
      </Alert>
      <Alert tone="info" title="Context matters">
        {analysis.honesty[1]} {analysis.honesty[3]}
      </Alert>

      <p className="text-sm text-[var(--color-muted)]">
        Window: {analysis.windowLabel}. Publish when ≥{TCI_MIN_RESOLVED_PLAN_DAYS}{" "}
        resolvable plan days (have {analysis.resolvedPlanDays}).
      </p>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Plan adherence
        </h2>
        {analysis.publishable && analysis.adherencePct != null ? (
          <p className="text-3xl font-semibold tabular-nums text-[var(--color-foreground)]">
            {analysis.adherencePct}%
          </p>
        ) : (
          <Alert tone="info" title="Insufficient plan history">
            {analysis.suppressedReason}
          </Alert>
        )}
        <ul className="flex flex-wrap gap-2">
          <Badge variant="success">On-plan {analysis.adheredDays}</Badge>
          <Badge variant="warning">Missed {analysis.missedDays}</Badge>
          <Badge variant="accent">
            Context-adjusted {analysis.contextAdjustedDays}
          </Badge>
          <Badge variant="neutral">
            Rest honored {analysis.plannedRestHonored}
          </Badge>
          <Badge variant="neutral">
            Extra gym {analysis.extraGymSessions}
          </Badge>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Narrative
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {analysis.narrativeLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {analysis.blindCompletionNote ? (
          <Alert tone="warning" title="Blind completion not rewarded">
            {analysis.blindCompletionNote}
          </Alert>
        ) : null}
      </section>

      {analysis.activeContexts.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Active context windows
          </h2>
          <ul className="grid gap-2">
            {analysis.activeContexts.map((c) => (
              <li
                key={`${c.kind}-${c.startDayKey}-${c.endDayKey}-${c.label}`}
                className="text-sm text-[var(--color-muted)]"
              >
                <Badge variant="neutral">{TCI_CONTEXT_LABELS[c.kind]}</Badge>{" "}
                {c.label}: {c.startDayKey} → {c.endDayKey}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-[var(--color-muted)]">
        Related:{" "}
        <Link href="/app/retention" className="text-[var(--color-accent)]">
          Behavioral retention
        </Link>{" "}
        (follow-through UX) ·{" "}
        <Link href="/app/programs" className="text-[var(--color-accent)]">
          Programs
        </Link>{" "}
        ·{" "}
        <Link href="/app/adaptations" className="text-[var(--color-accent)]">
          Adaptations
        </Link>
        .
      </p>
    </div>
  );
}
