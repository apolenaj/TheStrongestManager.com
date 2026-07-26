"use client";

import { useId, useMemo, useState } from "react";
import { ChartCard } from "@/design-system";
import type { ChartPoint, ProgressSeries } from "@/domain/progress/ranges";
import { cn } from "@/design-system/utils/cn";
import { LearnWhy } from "@/components/on-site-education/LearnWhy";
import { resolveEducationTopicId } from "@/domain/on-site-education";

type TrendChartProps = {
  series: ProgressSeries;
  className?: string;
};

function formatAxisDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    return [min - pad, min, min + pad];
  }
  const span = max - min;
  const step = span / Math.max(count - 1, 1);
  const ticks: number[] = [];
  for (let i = 0; i < count; i += 1) {
    ticks.push(Math.round((min + step * i) * 100) / 100);
  }
  return ticks;
}

export function TrendChart({ series, className }: TrendChartProps) {
  const reactId = useId();
  const [active, setActive] = useState<number | null>(null);

  const layout = useMemo(() => {
    const width = 640;
    const height = 220;
    const padL = 44;
    const padR = 16;
    const padT = 16;
    const padB = 36;
    const points = series.points;
    const values = points.map((p) => p.value);
    const minV = values.length ? Math.min(...values) : 0;
    const maxV = values.length ? Math.max(...values) : 1;
    const yPad = (maxV - minV) * 0.12 || Math.abs(maxV) * 0.1 || 1;
    const yMin = minV - yPad;
    const yMax = maxV + yPad;
    const innerW = width - padL - padR;
    const innerH = height - padT - padB;

    const coords = points.map((point, index) => {
      const x =
        points.length === 1
          ? padL + innerW / 2
          : padL + (innerW * index) / (points.length - 1);
      const t = (point.value - yMin) / (yMax - yMin || 1);
      const y = padT + innerH * (1 - t);
      return { x, y, point };
    });

    const path = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(" ");

    const yTicks = niceTicks(yMin, yMax, 4);
    const xTickIndexes =
      points.length <= 4
        ? points.map((_, i) => i)
        : [0, Math.floor((points.length - 1) / 2), points.length - 1];

    return {
      width,
      height,
      padL,
      padT,
      innerW,
      innerH,
      yMin,
      yMax,
      coords,
      path,
      yTicks,
      xTickIndexes,
    };
  }, [series.points]);

  if (series.points.length === 0) {
    return (
      <div className={className}>
        <ChartCard
          title={series.title}
          description={series.description}
          empty
          emptyTitle={series.emptyTitle}
          emptyDescription={series.emptyDescription}
        />
        {resolveEducationTopicId(series.id) ? (
          <div className="mt-3">
            <LearnWhy metricKey={series.id} />
          </div>
        ) : null}
      </div>
    );
  }
  const activePoint: ChartPoint | null =
    active != null ? series.points[active] ?? null : null;

  return (
    <ChartCard
      title={series.title}
      description={series.description}
      className={className}
    >
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto w-full min-w-[280px] max-w-full"
          role="img"
          aria-label={`${series.title} chart in ${series.unitLabel}`}
        >
          <title>{series.title}</title>
          {/* Y grid + labels */}
          {layout.yTicks.map((tick) => {
            const t = (tick - layout.yMin) / (layout.yMax - layout.yMin || 1);
            const y = layout.padT + layout.innerH * (1 - t);
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={layout.padL}
                  x2={layout.padL + layout.innerW}
                  y1={y}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
                <text
                  x={layout.padL - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[var(--color-subtle)]"
                  style={{ fontSize: 10 }}
                >
                  {tick}
                </text>
              </g>
            );
          })}
          {/* Y unit */}
          <text
            x={12}
            y={14}
            className="fill-[var(--color-muted)]"
            style={{ fontSize: 10 }}
          >
            {series.unitLabel}
          </text>
          {/* X labels */}
          {layout.xTickIndexes.map((idx) => {
            const c = layout.coords[idx];
            if (!c) return null;
            return (
              <text
                key={`x-${idx}`}
                x={c.x}
                y={layout.height - 10}
                textAnchor="middle"
                className="fill-[var(--color-subtle)]"
                style={{ fontSize: 10 }}
              >
                {formatAxisDate(c.point.at)}
              </text>
            );
          })}
          {/* Line */}
          {layout.coords.length > 1 ? (
            <path
              d={layout.path}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-[stroke] duration-[var(--duration-normal)]"
            />
          ) : null}
          {/* Points */}
          {layout.coords.map((c, index) => (
            <circle
              key={`${c.point.at}-${index}`}
              cx={c.x}
              cy={c.y}
              r={active === index ? 5.5 : 4}
              fill="var(--color-accent)"
              stroke="var(--color-background)"
              strokeWidth={2}
              className="cursor-pointer transition-[r] duration-[var(--duration-fast)]"
              tabIndex={0}
              role="button"
              aria-label={`${formatAxisDate(c.point.at)}: ${c.point.value} ${series.unitLabel}`}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                  event.preventDefault();
                  const next = Math.min(layout.coords.length - 1, index + 1);
                  setActive(next);
                  (
                    event.currentTarget.parentElement?.querySelectorAll(
                      "circle[role='button']",
                    )[next] as SVGCircleElement | undefined
                  )?.focus();
                }
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                  event.preventDefault();
                  const prev = Math.max(0, index - 1);
                  setActive(prev);
                  (
                    event.currentTarget.parentElement?.querySelectorAll(
                      "circle[role='button']",
                    )[prev] as SVGCircleElement | undefined
                  )?.focus();
                }
              }}
            />
          ))}
        </svg>

        {/* Screen-reader data table — not color/shape dependent */}
        <table className="sr-only">
          <caption>{series.title} data</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">{series.unitLabel}</th>
              {series.points.some((p) => p.meta) ? (
                <th scope="col">Notes</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {series.points.map((point, index) => (
              <tr key={`${point.at}-${index}`}>
                <td>{formatAxisDate(point.at)}</td>
                <td>
                  {point.value} {series.unitLabel}
                </td>
                {series.points.some((p) => p.meta) ? (
                  <td>{point.meta ?? ""}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tooltip */}
        <div
          id={`${reactId}-tip`}
          className={cn(
            "pointer-events-none absolute left-1/2 top-2 z-10 min-w-[10rem] -translate-x-1/2 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-3 py-2 text-xs shadow-[var(--shadow-md)] transition-opacity",
            activePoint ? "opacity-100" : "opacity-0",
          )}
          role="status"
        >
          {activePoint ? (
            <>
              <p className="font-medium text-[var(--color-foreground)]">
                {activePoint.value} {series.unitLabel}
              </p>
              <p className="text-[var(--color-muted)]">
                {new Date(activePoint.at).toLocaleString()}
              </p>
              {activePoint.meta ? (
                <p className="mt-0.5 text-[var(--color-subtle)]">
                  {activePoint.meta}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-[var(--color-subtle)]">Tap a point</p>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--color-subtle)]">
        Axes show {series.unitLabel}. Hover, tap, or use arrow keys on points
        for details. A data table is available to screen readers.
      </p>
      {resolveEducationTopicId(series.id) ? (
        <div className="mt-3">
          <LearnWhy metricKey={series.id} />
        </div>
      ) : null}
    </ChartCard>
  );
}
