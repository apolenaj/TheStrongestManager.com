import { Badge } from "@/design-system";
import type { LiftPhaseInsight } from "@/domain/movement/phases";

/**
 * Detail for a selected lift phase: frame time, metric, issue, recommendation.
 */
export function LiftPhaseDetailPanel({
  insight,
  currentTimeSeconds,
}: {
  insight: LiftPhaseInsight;
  currentTimeSeconds: number;
}) {
  return (
    <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 animate-[fade-up_0.3s_ease-out_both]">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          {insight.label}
        </h3>
        <Badge variant="info">Confidence: {insight.confidence}</Badge>
        <Badge variant="neutral">
          Frame {insight.startFrame}–{insight.endFrame}
        </Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Video frame
          </dt>
          <dd className="mt-1 text-[var(--color-fg)]">
            Phase {insight.startTimeSeconds.toFixed(1)}s–
            {insight.endTimeSeconds.toFixed(1)}s
            <span className="text-[var(--color-muted)]">
              {" "}
              · playhead {currentTimeSeconds.toFixed(1)}s
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Metric
          </dt>
          <dd className="mt-1 text-[var(--color-fg)]">
            {insight.metric ? (
              <>
                <span className="font-medium">{insight.metric.label}</span>
                <span className="text-[var(--color-muted)]">
                  {" "}
                  · {insight.metric.display} ({insight.metric.confidence})
                </span>
              </>
            ) : (
              <span className="text-[var(--color-muted)]">
                No phase-scoped metric with enough confidence.
              </span>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Issue
          </dt>
          <dd className="mt-1 text-[var(--color-fg)]">
            {insight.issue ?? (
              <span className="text-[var(--color-muted)]">
                No specific issue flagged for this phase —{" "}
                {insight.detectionNote || "segment looks usable."}
              </span>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Recommendation
          </dt>
          <dd className="mt-1 text-[var(--color-fg)]">{insight.recommendation}</dd>
        </div>
      </dl>
    </div>
  );
}
