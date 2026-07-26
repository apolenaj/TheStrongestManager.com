import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { AiCostDashboardSnapshot } from "@/domain/ai-cost-control";
import { AI_TASK_CLASS_LABELS } from "@/domain/ai-cost-control";

/**
 * Internal AI cost dashboard — architecture + live meter rollups.
 * Never invents USD when pricing is not configured.
 */
export function AiCostDashboardPanel({
  snapshot,
}: {
  snapshot: AiCostDashboardSnapshot;
}) {
  return (
    <div className="space-y-6">
      <Alert tone="info" title="Cost control architecture">
        {snapshot.honesty[0]} {snapshot.honesty[1]}
      </Alert>
      <Alert tone="warning" title="Pricing honesty">
        {snapshot.pricingConfigured
          ? "Provider pricing is configured — USD estimates may appear."
          : "Provider pricing is not configured — estimated USD stays null. Never invent spend."}{" "}
        Engine <code className="text-xs">{snapshot.engineVersion}</code>.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>{snapshot.totals.eventCount}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deterministic skips</CardTitle>
            <CardDescription>
              {snapshot.totals.skippedDeterministic}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cache hits</CardTitle>
            <CardDescription>{snapshot.totals.cacheHits}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LLM calls</CardTitle>
            <CardDescription>{snapshot.totals.llmCalls}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Never call LLM for</CardTitle>
          <CardDescription>
            Simple calculations, filters, known rules, scoring formulas.
          </CardDescription>
        </CardHeader>
        <ul className="flex flex-wrap gap-2 px-1 pb-1">
          {snapshot.deniedTaskClasses.map((c) => (
            <Badge key={c} variant="neutral">
              {AI_TASK_CLASS_LABELS[c]}
            </Badge>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost per feature</CardTitle>
          <CardDescription>
            {snapshot.byFeature.length === 0
              ? "No meter events yet — stubs record skipped_deterministic when AI paths run."
              : "Rollup from in-memory meter (architecture-ready for Redis/DB)."}
          </CardDescription>
        </CardHeader>
        {snapshot.byFeature.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Totals estimated USD:{" "}
            {snapshot.totals.estimatedUsdSum == null
              ? "null (not invented)"
              : `$${snapshot.totals.estimatedUsdSum.toFixed(4)}`}
          </p>
        ) : (
          <ul className="grid gap-3">
            {snapshot.byFeature.map((row) => (
              <li
                key={row.featureId}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--color-foreground)]">
                    {row.label}
                  </p>
                  <Badge variant="neutral">{row.featureId}</Badge>
                </div>
                <dl className="mt-2 grid gap-1 text-sm text-[var(--color-muted)] sm:grid-cols-2">
                  <div>Events: {row.eventCount}</div>
                  <div>Deterministic: {row.skippedDeterministic}</div>
                  <div>Cache hits: {row.cacheHits}</div>
                  <div>LLM ok: {row.llmOk}</div>
                  <div>LLM denied: {row.llmDenied}</div>
                  <div>Tokens: {row.totalTokens}</div>
                  <div>
                    Est. USD:{" "}
                    {row.estimatedUsdSum == null
                      ? "null"
                      : `$${row.estimatedUsdSum.toFixed(4)}`}
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Routing policy examples</CardTitle>
          <CardDescription>
            Structured prompts + smaller models when LLM is allowlisted.
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-3 text-sm">
          {snapshot.routingExamples.map((ex, i) => (
            <li
              key={`${ex.featureId}-${ex.taskClass}-${i}`}
              className="border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0"
            >
              <p className="font-medium text-[var(--color-foreground)]">
                {ex.featureId} · {AI_TASK_CLASS_LABELS[ex.taskClass]}
              </p>
              <p className="mt-1 text-[var(--color-muted)]">
                {ex.decision.allow ? (
                  <Badge variant="accent">LLM allowed · {ex.decision.modelTier}</Badge>
                ) : (
                  <Badge variant="warning">Denied · {ex.decision.reason}</Badge>
                )}{" "}
                {ex.decision.message}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LLM allowlist</CardTitle>
          <CardDescription>
            Only these features may use nl_* task classes — still require a live
            adapter and structured output.
          </CardDescription>
        </CardHeader>
        <ul className="flex flex-wrap gap-2">
          {snapshot.allowlistedFeatures.map((id) => (
            <Badge key={id} variant="info">
              {id}
            </Badge>
          ))}
        </ul>
      </Card>
    </div>
  );
}
