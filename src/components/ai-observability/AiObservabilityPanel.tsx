import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { AiObservabilitySnapshot } from "@/domain/ai-observability";

function pct(rate: number | null): string {
  if (rate == null) return "—";
  return `${Math.round(rate * 100)}%`;
}

/**
 * Internal AI observability panel — KPIs without private raw inputs.
 */
export function AiObservabilityPanel({
  snapshot,
}: {
  snapshot: AiObservabilitySnapshot;
}) {
  return (
    <div className="space-y-6">
      <Alert tone="info" title="AI observability">
        {snapshot.honesty[0]}
      </Alert>
      <Alert tone="warning" title="Privacy">
        {snapshot.honesty[1]} Engine{" "}
        <code className="text-xs">{snapshot.engineVersion}</code>.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>AI requests</CardTitle>
            <CardDescription>{snapshot.requests.total}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Success rate</CardTitle>
            <CardDescription>
              {pct(snapshot.requests.successRate)}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg latency</CardTitle>
            <CardDescription>
              {snapshot.latency.avgMs == null
                ? "—"
                : `${snapshot.latency.avgMs} ms`}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost (est. USD)</CardTitle>
            <CardDescription>
              {snapshot.cost.estimatedUsdSum == null
                ? "null"
                : `$${snapshot.cost.estimatedUsdSum.toFixed(4)}`}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Failures</CardTitle>
            <CardDescription>
              LLM failed {snapshot.failures.llmFailed} · denied{" "}
              {snapshot.failures.llmDenied} · router errors{" "}
              {snapshot.failures.routerErrors} · null{" "}
              {snapshot.failures.nullResponses}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hallucination reports</CardTitle>
            <CardDescription>
              Quality flags: {snapshot.hallucination.userQualityFlags}
            </CardDescription>
          </CardHeader>
          <p className="text-xs text-[var(--color-muted)]">
            {snapshot.hallucination.note}
          </p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User feedback</CardTitle>
            <CardDescription>
              {snapshot.feedback.total} · helpful {pct(snapshot.feedback.helpfulRate)}{" "}
              · coach accept {pct(snapshot.feedback.coachAcceptRate)}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request mix</CardTitle>
          <CardDescription>Outcomes from cost meters (enums only).</CardDescription>
        </CardHeader>
        <ul className="flex flex-wrap gap-2">
          <Badge variant="accent">llm_ok {snapshot.requests.llmOk}</Badge>
          <Badge variant="warning">llm_failed {snapshot.requests.llmFailed}</Badge>
          <Badge variant="neutral">
            llm_denied {snapshot.requests.llmDenied}
          </Badge>
          <Badge variant="info">
            skipped {snapshot.requests.skippedDeterministic}
          </Badge>
          <Badge variant="neutral">cache {snapshot.requests.cacheHits}</Badge>
          <Badge variant="neutral">
            tokens {snapshot.cost.totalTokens}
          </Badge>
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback by verdict</CardTitle>
          <CardDescription>
            Counts only — free-text reasons are never loaded here.
          </CardDescription>
        </CardHeader>
        {snapshot.feedback.total === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No model feedback rows yet.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {Object.entries(snapshot.feedback.byVerdict).map(([v, n]) => (
              <Badge key={v} variant="neutral">
                {v}: {n}
              </Badge>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost by feature</CardTitle>
          <CardDescription>
            Linked detail:{" "}
            <Link
              href="/app/admin/ai-cost"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              AI cost
            </Link>{" "}
            ·{" "}
            <Link
              href="/app/admin/ai-router"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              AI router
            </Link>
          </CardDescription>
        </CardHeader>
        {snapshot.cost.byFeature.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No feature meters yet.
          </p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {snapshot.cost.byFeature.map((f) => (
              <li
                key={f.featureId}
                className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-2 first:border-t-0 first:pt-0"
              >
                <span className="font-medium">{f.label}</span>
                <Badge variant="neutral">{f.featureId}</Badge>
                <span className="text-[var(--color-muted)]">
                  events {f.eventCount} · USD{" "}
                  {f.estimatedUsdSum == null
                    ? "null"
                    : `$${f.estimatedUsdSum.toFixed(4)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="text-xs text-[var(--color-muted)]">
        Sources: {snapshot.sources.meterEventCount} meters ·{" "}
        {snapshot.sources.attemptLogCount} router attempts ·{" "}
        {snapshot.sources.feedbackRowCount} feedback rows.
      </p>
    </div>
  );
}
