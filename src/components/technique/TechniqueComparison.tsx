import Link from "next/link";
import { Badge, ButtonLink } from "@/design-system";
import type { TechniqueComparisonSummary } from "@/domain/technique/report-presentation";

export function TechniqueComparison({
  comparison,
}: {
  comparison: TechniqueComparisonSummary;
}) {
  const deltaLabel =
    comparison.delta == null
      ? "Score delta unavailable"
      : comparison.delta === 0
        ? "No change"
        : comparison.delta > 0
          ? `+${comparison.delta} vs previous`
          : `${comparison.delta} vs previous`;

  const deltaTone =
    comparison.delta == null
      ? "neutral"
      : comparison.delta > 0
        ? "success"
        : comparison.delta < 0
          ? "warning"
          : "neutral";

  return (
    <section className="grid gap-4 border-t border-[var(--color-border)] pt-8">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
          Compared with previous
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Same exercise · prior analysis from{" "}
          {comparison.previousCreatedAt.toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
            Previous
          </p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums">
            {comparison.previousScore == null
              ? "—"
              : Math.round(comparison.previousScore)}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Confidence: {comparison.previousConfidence ?? "—"}
          </p>
        </div>
        <div className="grid gap-1">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
            Current
          </p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums">
            {comparison.currentScore == null
              ? "—"
              : Math.round(comparison.currentScore)}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Confidence: {comparison.currentConfidence ?? "—"}
          </p>
        </div>
        <div className="grid gap-1">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-subtle)]">
            Change
          </p>
          <div>
            <Badge variant={deltaTone}>{deltaLabel}</Badge>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            <Link
              href={`/app/technique/${comparison.previousId}`}
              className="text-[var(--color-accent)] hover:underline"
            >
              Open previous report
            </Link>
          </p>
        </div>
      </div>

      <div>
        <ButtonLink
          href={`/app/technique/compare?old=${comparison.previousId}&new=${comparison.currentId}`}
          variant="secondary"
        >
          Side-by-side video compare
        </ButtonLink>
      </div>
    </section>
  );
}
