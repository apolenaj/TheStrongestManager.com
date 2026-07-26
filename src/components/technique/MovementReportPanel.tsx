import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import type { MovementReport } from "@/domain/movement/types";
import { formatConfidenceLabel } from "@/domain/confidence-system";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

export function MovementReportPanel({ report }: { report: MovementReport }) {
  return (
    <div className="grid gap-4">
      {!report.cameraSuitability.suitable ? (
        <Card className="border-[var(--color-score-needs-attention)]/40">
          <CardHeader>
            <CardTitle>Camera angle unsuitable</CardTitle>
            <CardDescription>{report.cameraSuitability.message}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          {report.cameraSuitability.message}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Movement report</CardTitle>
          <CardDescription>
            Confidence: {formatConfidenceLabel(report.reportConfidence)}.
            Technique Score:{" "}
            {report.overallTechniqueScore == null
              ? "none (not invented)"
              : report.overallTechniqueScore}
          </CardDescription>
        </CardHeader>
        <p className="text-sm">{report.summary}</p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phases</CardTitle>
        </CardHeader>
        {report.phases.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No phases detected.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {report.phases.map((phase) => (
              <li
                key={`${phase.phase}-${phase.startFrame}-${phase.endFrame}`}
                className="flex flex-wrap items-center gap-2"
              >
                <Badge variant="neutral">{phase.phase}</Badge>
                <ConfidenceBadge confidence={phase.confidence} prefix={null} />
                <span className="text-[var(--color-muted)]">
                  {phase.startTimeSeconds.toFixed(2)}s–{phase.endTimeSeconds.toFixed(2)}s
                </span>
                <span className="text-xs text-[var(--color-subtle)]">{phase.note}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observable metrics</CardTitle>
          <CardDescription>Every metric includes confidence.</CardDescription>
        </CardHeader>
        <ul className="grid gap-3">
          {report.metrics.map((metric) => (
            <li key={metric.key} className="border-t border-[var(--color-border)] pt-3 text-sm first:border-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{metric.label}</span>
                <ConfidenceBadge confidence={metric.confidence} prefix={null} />
              </div>
              <p className="mt-1 tabular-nums">
                {metric.value == null
                  ? "—"
                  : `${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`}
              </p>
              <p className="mt-1 text-xs text-[var(--color-subtle)]">{metric.basis}</p>
              {metric.caveats.length > 0 ? (
                <ul className="mt-1 list-disc pl-4 text-xs text-[var(--color-muted)]">
                  {metric.caveats.map((caveat) => (
                    <li key={caveat}>{caveat}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      {report.heuristics.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Technique heuristics</CardTitle>
            <CardDescription>
              Observational only — not injury risk or joint-force claims.
            </CardDescription>
          </CardHeader>
          <ul className="grid gap-3 text-sm">
            {report.heuristics.map((item) => (
              <li key={item.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  <ConfidenceBadge confidence={item.confidence} prefix={null} />
                </div>
                <p className="mt-1 text-[var(--color-muted)]">{item.observation}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Disclaimers</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-1 pl-4 text-xs text-[var(--color-muted)]">
          {report.disclaimers.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
