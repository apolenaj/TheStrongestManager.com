import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import type { DeadliftTechniqueAssessment } from "@/domain/movement/deadlift/score/types";

export function DeadliftTechniqueScorePanel({
  assessment,
}: {
  assessment: DeadliftTechniqueAssessment;
}) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Deadlift Technique Score</CardTitle>
          <CardDescription>
            {assessment.formulaId} v{assessment.formulaVersion} · confidence{" "}
            {assessment.confidence}
          </CardDescription>
        </CardHeader>
        {assessment.score == null ? (
          <p className="text-sm text-[var(--color-muted)]">
            No Technique Score — insufficient observable components for this
            camera angle / clip. Nothing was invented.
          </p>
        ) : (
          <p className="font-[family-name:var(--font-display)] text-4xl font-semibold tabular-nums">
            {assessment.score}
            <span className="ml-2 text-base font-normal text-[var(--color-muted)]">
              / 100
            </span>
          </p>
        )}
      </Card>

      {assessment.keyIssue ? (
        <Card>
          <CardHeader>
            <CardTitle>Key issue</CardTitle>
          </CardHeader>
          <p className="text-sm">{assessment.keyIssue}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metrics observed</CardTitle>
          </CardHeader>
          {assessment.metricsObserved.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">None</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {assessment.metricsObserved.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Metrics unavailable</CardTitle>
          </CardHeader>
          {assessment.metricsUnavailable.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">None</p>
          ) : (
            <ul className="list-disc space-y-1 pl-4 text-sm text-[var(--color-muted)]">
              {assessment.metricsUnavailable.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription>
            Deterministic weights; unavailable components are omitted and
            remaining weights renormalized.
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-3">
          {assessment.components.map((component) => (
            <li
              key={component.id}
              className="border-t border-[var(--color-border)] pt-3 text-sm first:border-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{component.label}</span>
                <Badge
                  variant={
                    component.status === "observed" ? "info" : "neutral"
                  }
                >
                  {component.status}
                </Badge>
                {component.status === "observed" ? (
                  <Badge variant="accent">{component.score}/100</Badge>
                ) : null}
                <span className="text-xs text-[var(--color-subtle)]">
                  weight {component.weight.toFixed(2)}
                  {component.status === "observed"
                    ? ` → ${component.effectiveWeight.toFixed(2)}`
                    : ""}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {component.evidence}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      {assessment.positiveFindings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Positive findings</CardTitle>
          </CardHeader>
          <ul className="list-disc space-y-1 pl-4 text-sm">
            {assessment.positiveFindings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-1 pl-4 text-sm">
          {assessment.recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scoring assumptions</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-1 pl-4 text-xs text-[var(--color-muted)]">
          {assessment.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
