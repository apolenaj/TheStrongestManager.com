import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import type { ExerciseSubstitutionResult } from "@/domain/exercise-substitutions";

export function ExerciseSubstitutionsPanel({
  result,
}: {
  result: ExerciseSubstitutionResult;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Catalog-backed substitutions">
        {result.honesty[0]} {result.honesty[2]}
      </Alert>
      <Alert tone="info" title="Tradeoffs explained">
        {result.honesty[1]} {result.honesty[3]}
      </Alert>

      <section className="grid gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Request
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Unavailable:{" "}
          <span className="text-[var(--color-foreground)]">
            {result.unavailable.name}
          </span>{" "}
          ({result.unavailable.movementPattern}
          {result.unavailable.primaryMuscles.length
            ? ` · ${result.unavailable.primaryMuscles.join(", ")}`
            : ""}
          )
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Goal: {result.goalLabel}</Badge>
          {result.equipment.length > 0 ? (
            <Badge variant="neutral">
              Equipment: {result.equipment.join(", ")}
            </Badge>
          ) : (
            <Badge variant="neutral">Equipment: not specified</Badge>
          )}
        </div>
      </section>

      {result.missingInformation.length > 0 ? (
        <Alert tone="info" title="Missing context">
          <ul className="list-disc pl-5 text-sm">
            {result.missingInformation.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Substitutes
        </h2>
        {result.emptyReason ? (
          <Alert tone="warning" title="No substitutes">
            {result.emptyReason}
          </Alert>
        ) : (
          <ul className="grid gap-4">
            {result.recommendations.map((rec) => (
              <li
                key={rec.slug}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">#{rec.rank}</Badge>
                  <Link
                    href={rec.href}
                    className="font-medium text-[var(--color-accent)]"
                  >
                    {rec.name}
                  </Link>
                  <Badge variant="neutral">Fatigue: {rec.expectedFatigue}</Badge>
                  <Badge variant="neutral">Skill: {rec.skillDemand}</Badge>
                </div>
                <p className="mt-2 text-sm text-[var(--color-foreground)]">
                  {rec.primaryPurpose}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {rec.reason}
                </p>
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    Tradeoffs vs {result.unavailable.name}
                  </p>
                  <ul className="mt-2 grid gap-1 text-sm text-[var(--color-muted)]">
                    {rec.tradeoffs.map((t) => (
                      <li key={`${rec.slug}-${t.dimension}`}>
                        <span className="text-[var(--color-foreground)]">
                          {t.dimension.replace(/_/g, " ")}
                        </span>{" "}
                        ({t.vsUnavailable}): {t.summary}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-[var(--color-muted)]">
        Related:{" "}
        <Link
          href="/app/exercise-prescription"
          className="text-[var(--color-accent)]"
        >
          Exercise picks
        </Link>{" "}
        ·{" "}
        <Link href="/exercises" className="text-[var(--color-accent)]">
          Exercise library
        </Link>
        .
      </p>
    </div>
  );
}
