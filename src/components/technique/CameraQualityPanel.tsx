import { Badge, Button } from "@/design-system";
import type { CameraQualityResult } from "@/domain/camera-quality";

export function CameraQualityPanel({
  result,
  onProceedAnyway,
  proceedPending,
}: {
  result: CameraQualityResult;
  /** When RECORD AGAIN, optional override to still run analysis. */
  onProceedAnyway?: () => void;
  proceedPending?: boolean;
}) {
  const good = result.verdict === "good_for_analysis";

  return (
    <div className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={good ? "success" : "warning"}>
          {result.verdictLabel}
        </Badge>
        {result.readinessScore != null ? (
          <Badge variant="neutral">
            Readiness {result.readinessScore}/100
          </Badge>
        ) : null}
        <Badge variant="info">Confidence: {result.confidence}</Badge>
        <Badge variant="neutral">{result.engineVersion}</Badge>
        {result.usedPoseEvidence ? (
          <Badge variant="neutral">Pose-checked</Badge>
        ) : (
          <Badge variant="neutral">Pre-pose</Badge>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
          Reason
        </p>
        <p className="mt-1 text-sm text-[var(--color-fg)]">{result.reason}</p>
      </div>

      <ul className="grid gap-2 text-sm">
        {result.checks.map((check) => (
          <li
            key={check.id}
            className="border-l-2 border-[var(--color-border)] pl-3"
          >
            <span className="font-medium text-[var(--color-fg)]">
              {check.label}
            </span>
            <Badge
              variant={
                check.status === "pass"
                  ? "success"
                  : check.status === "fail"
                    ? "danger"
                    : "neutral"
              }
              className="ml-2"
            >
              {check.status}
            </Badge>
            <p className="mt-0.5 text-[var(--color-muted)]">{check.detail}</p>
          </li>
        ))}
      </ul>

      {!good ? (
        <div className="grid gap-2">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Recording instructions
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--color-fg)]">
            {result.recordingInstructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          {onProceedAnyway ? (
            <Button
              type="button"
              variant="secondary"
              loading={proceedPending}
              disabled={proceedPending}
              onClick={onProceedAnyway}
            >
              Analyze anyway
            </Button>
          ) : null}
        </div>
      ) : null}

      <ul className="grid gap-1 text-xs text-[var(--color-subtle)]">
        {result.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
