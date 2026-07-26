import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  AI_MODEL_PROVIDER_STATUS_LABELS,
  AI_ROUTER_TASK_KIND_LABELS,
  type AiRouterDashboardSnapshot,
} from "@/domain/ai-model-router";

/**
 * Internal multi-model router panel — chains, providers, latency/errors.
 */
export function AiModelRouterPanel({
  snapshot,
}: {
  snapshot: AiRouterDashboardSnapshot;
}) {
  return (
    <div className="space-y-6">
      <Alert tone="info" title="Multi-model AI router">
        {snapshot.honesty[0]} {snapshot.honesty[2]}
      </Alert>
      <Alert tone="warning" title="Cost & latency logging">
        {snapshot.honesty[3]} Engine{" "}
        <code className="text-xs">{snapshot.engineVersion}</code>.
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Attempts</CardTitle>
            <CardDescription>{snapshot.totals.attempts}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Successes</CardTitle>
            <CardDescription>{snapshot.totals.successes}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Errors</CardTitle>
            <CardDescription>{snapshot.totals.errors}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total latency</CardTitle>
            <CardDescription>
              {snapshot.totals.totalLatencyMs} ms
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task → provider chains</CardTitle>
          <CardDescription>
            Text reasoning · Vision · Summarization · Simple classification
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-3">
          {snapshot.taskKinds.map((row) => (
            <li
              key={row.kind}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-3"
            >
              <p className="font-medium text-[var(--color-foreground)]">
                {row.label}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {row.chain.map((id, i) => (
                  <Badge key={`${row.kind}-${id}-${i}`} variant="neutral">
                    {i + 1}. {id}
                  </Badge>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered providers</CardTitle>
          <CardDescription>
            Not hard-wired — register OpenAI, Anthropic, or others when ready.
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-3">
          {snapshot.providers.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0"
            >
              <span className="font-medium">{p.label}</span>
              <Badge variant="neutral">{p.id}</Badge>
              <Badge
                variant={
                  p.status === "ready"
                    ? "accent"
                    : p.status === "stub"
                      ? "info"
                      : "warning"
                }
              >
                {AI_MODEL_PROVIDER_STATUS_LABELS[p.status]}
              </Badge>
              <span className="text-xs text-[var(--color-muted)]">
                {p.supportedTaskKinds
                  .map((k) => AI_ROUTER_TASK_KIND_LABELS[k])
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent attempts</CardTitle>
          <CardDescription>
            Latency, errors, and null responses (no fabricated completions).
          </CardDescription>
        </CardHeader>
        {snapshot.recentAttempts.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No router attempts yet. Calls appear when{" "}
            <code className="text-xs">routeAiModelRequest</code> runs.
          </p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {[...snapshot.recentAttempts].reverse().slice(0, 20).map((a, i) => (
              <li
                key={`${a.providerId}-${a.attemptIndex}-${i}`}
                className="border-t border-[var(--color-border)] pt-2 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">{a.featureId}</Badge>
                  <Badge variant="info">
                    {AI_ROUTER_TASK_KIND_LABELS[a.taskKind]}
                  </Badge>
                  <Badge variant="neutral">{a.providerId}</Badge>
                  <Badge
                    variant={
                      a.outcome === "success"
                        ? "accent"
                        : a.outcome === "error"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {a.outcome}
                  </Badge>
                  <span className="text-[var(--color-muted)]">
                    {a.latencyMs} ms
                  </span>
                </div>
                {a.errorMessage ? (
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {a.errorMessage}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
