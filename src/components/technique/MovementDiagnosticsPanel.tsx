import Link from "next/link";
import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import type { MovementReport } from "@/domain/movement/types";
import { formatConfidenceLabel } from "@/domain/confidence-system";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

export function MovementDiagnosticsPanel({
  report,
  analysisId,
}: {
  report: MovementReport | null;
  analysisId: string;
}) {
  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--color-muted)]">
        Developer diagnostics for the movement pipeline.{" "}
        <Link
          href={`/app/technique/${analysisId}`}
          className="text-[var(--color-accent)] hover:underline"
        >
          ← Back to analysis
        </Link>
      </p>

      {!report ? (
        <Card>
          <CardHeader>
            <CardTitle>No report yet</CardTitle>
            <CardDescription>
              Run pose extraction or the diagnostics fixture from the analysis
              page first.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pipeline diagnostics</CardTitle>
              <CardDescription>
                {report.diagnostics.pipelineVersion} · provider{" "}
                {report.diagnostics.poseProvider}
              </CardDescription>
            </CardHeader>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                  Frames
                </dt>
                <dd>
                  {report.diagnostics.frameCount} (mid-hip:{" "}
                  {report.diagnostics.framesWithMidHip})
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                  Mean landmark visibility
                </dt>
                <dd>{report.diagnostics.meanLandmarkVisibility}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                  Fixture
                </dt>
                <dd>{report.diagnostics.fixture ? "yes" : "no"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                  Report confidence
                </dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <ConfidenceBadge
                    confidence={report.reportConfidence}
                    prefix={null}
                  />
                  <span className="text-xs text-[var(--color-muted)]">
                    Level: {formatConfidenceLabel(report.reportConfidence)}
                    {" · "}
                    Internal score withheld (uncalibrated)
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                  Technique score
                </dt>
                <dd>
                  {report.overallTechniqueScore == null
                    ? "null (honest)"
                    : report.overallTechniqueScore}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                  Warnings
                </dt>
                <dd>
                  {report.diagnostics.warnings.length === 0
                    ? "—"
                    : report.diagnostics.warnings.join(", ")}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Landmark coverage</CardTitle>
            </CardHeader>
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {Object.entries(report.diagnostics.landmarkCoverageByName).map(
                ([name, coverage]) => (
                  <li key={name} className="flex justify-between gap-2">
                    <span>{name}</span>
                    <span className="tabular-nums text-[var(--color-muted)]">
                      {Math.round((coverage ?? 0) * 100)}%
                    </span>
                  </li>
                ),
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw report JSON</CardTitle>
            </CardHeader>
            <pre className="max-h-96 overflow-auto rounded-[var(--radius-sm)] bg-[var(--color-surface-elevated)] p-3 text-xs">
              {JSON.stringify(report, null, 2)}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
}
