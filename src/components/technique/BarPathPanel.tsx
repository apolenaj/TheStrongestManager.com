"use client";

import { Badge } from "@/design-system";
import type { BarPathAnalysis } from "@/domain/movement/bar-path";

/**
 * Bar-path visualization — only renders metrics/path when displayable.
 * Poor confidence → honest empty (never fabricates a plot).
 */
export function BarPathPanel({ analysis }: { analysis: BarPathAnalysis }) {
  if (!analysis.displayable) {
    return (
      <div className="grid gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Bar path</Badge>
          <Badge variant="warning">Hidden</Badge>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          {analysis.unavailableReason ??
            "Bar-path detection confidence is poor — metric hidden."}
        </p>
        <p className="text-xs text-[var(--color-subtle)]">
          Mid-wrist proxy only. We never fabricate bar tracking.
        </p>
      </div>
    );
  }

  const points = analysis.pathPoints;
  const pad = 8;
  const w = 320;
  const h = 180;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(0.001, maxX - minX);
  const spanY = Math.max(0.001, maxY - minY);

  const toSvg = (x: number, y: number) => {
    const sx = pad + ((x - minX) / spanX) * (w - pad * 2);
    const sy = pad + ((y - minY) / spanY) * (h - pad * 2);
    return { sx, sy };
  };

  const d = points
    .map((p, i) => {
      const { sx, sy } = toSvg(p.x, p.y);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  const metrics = [
    analysis.horizontalDeviation,
    analysis.verticalPath,
    analysis.repConsistency,
  ].filter(Boolean);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">Bar path</Badge>
        <Badge variant="neutral">{analysis.engineVersion}</Badge>
        <Badge variant="info">Confidence: {analysis.confidence}</Badge>
        <Badge variant="neutral">Proxy: mid-wrist</Badge>
        {analysis.liftKind ? (
          <Badge variant="neutral">{analysis.liftKind}</Badge>
        ) : null}
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-md rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
        role="img"
        aria-label="Bar path visualization from mid-wrist proxy"
      >
        <path
          d={d}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.length > 0 ? (
          <>
            <circle
              cx={toSvg(points[0].x, points[0].y).sx}
              cy={toSvg(points[0].x, points[0].y).sy}
              r="4"
              fill="var(--color-info)"
            />
            <circle
              cx={toSvg(points[points.length - 1].x, points[points.length - 1].y).sx}
              cy={toSvg(
                points[points.length - 1].x,
                points[points.length - 1].y,
              ).sy}
              r="4"
              fill="var(--color-accent)"
            />
          </>
        ) : null}
      </svg>
      <p className="text-xs text-[var(--color-subtle)]">
        Blue = start · accent = end · image-plane wrist/bar proxy (not plate
        detection).
      </p>

      {metrics.length > 0 ? (
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          {analysis.horizontalDeviation ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Horizontal deviation
              </dt>
              <dd className="mt-1 tabular-nums text-[var(--color-fg)]">
                {analysis.horizontalDeviation.value}{" "}
                <span className="text-[var(--color-muted)]">
                  {analysis.horizontalDeviation.unit}
                </span>
              </dd>
            </div>
          ) : null}
          {analysis.verticalPath ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Vertical path
              </dt>
              <dd className="mt-1 tabular-nums text-[var(--color-fg)]">
                {analysis.verticalPath.value}{" "}
                <span className="text-[var(--color-muted)]">
                  {analysis.verticalPath.unit}
                </span>
              </dd>
            </div>
          ) : null}
          {analysis.repConsistency ? (
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Rep consistency
              </dt>
              <dd className="mt-1 tabular-nums text-[var(--color-fg)]">
                {analysis.repConsistency.value}
                <span className="text-[var(--color-muted)]"> / 100</span>
              </dd>
            </div>
          ) : (
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Rep consistency
              </dt>
              <dd className="mt-1 text-[var(--color-muted)]">
                Hidden — need ≥2 vertical cycles
              </dd>
            </div>
          )}
        </dl>
      ) : null}

      <ul className="grid gap-1 text-xs text-[var(--color-subtle)]">
        {analysis.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
