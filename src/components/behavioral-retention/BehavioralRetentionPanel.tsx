import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { BehavioralRetentionPayload } from "@/domain/behavioral-retention";

function statusVariant(
  status: BehavioralRetentionPayload["loops"][number]["status"],
): "success" | "warning" | "info" | "neutral" {
  if (status === "celebrating") return "success";
  if (status === "needs_attention") return "warning";
  if (status === "on_track") return "info";
  return "neutral";
}

export function BehavioralRetentionPanel({
  retention,
}: {
  retention: BehavioralRetentionPayload;
}) {
  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Ethical follow-through">
        {retention.honesty[0]} {retention.honesty[1]}
      </Alert>

      {retention.summaryLine ? (
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug">
          {retention.summaryLine}
        </p>
      ) : (
        <Alert tone="warning" title="Not enough signal yet">
          Complete sessions, take planned rest, or open a weekly review so loops
          can stay honest.
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">Last {retention.lookbackDays} days</Badge>
        {retention.onPlanStreakDays > 0 ? (
          <Badge variant="success">
            {retention.onPlanStreakDays}-day on-plan streak
          </Badge>
        ) : null}
        {retention.plannedRestDaysInStreak > 0 ? (
          <Badge variant="info">
            {retention.plannedRestDaysInStreak} rest day
            {retention.plannedRestDaysInStreak === 1 ? "" : "s"} counted
          </Badge>
        ) : null}
      </div>

      <ul className="grid gap-4">
        {retention.loops.map((loop) => (
          <li key={loop.id}>
            <Card>
              <CardHeader>
                <CardTitle>{loop.label}</CardTitle>
                <CardDescription>{loop.headline}</CardDescription>
              </CardHeader>
              <div className="grid gap-2 px-6 pb-6 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={statusVariant(loop.status)}>
                    {loop.status.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="neutral">confidence: {loop.confidence}</Badge>
                  {loop.metricValue != null && loop.metricLabel ? (
                    <Badge variant="neutral">
                      {loop.metricValue} {loop.metricLabel}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-[var(--color-muted)]">{loop.detail}</p>
                {loop.nudge ? (
                  <p className="text-xs text-[var(--color-subtle)]">{loop.nudge}</p>
                ) : null}
                {loop.evidence.length > 0 ? (
                  <ul className="list-inside list-disc text-xs text-[var(--color-muted)]">
                    {loop.evidence.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : null}
                <Link
                  href={loop.href}
                  className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                >
                  Open
                </Link>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--color-muted)]">
        {retention.honesty.slice(2).join(" ")} Engine {retention.engineVersion}.
      </p>
    </div>
  );
}
