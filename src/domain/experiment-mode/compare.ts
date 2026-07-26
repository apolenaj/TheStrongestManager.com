/**
 * Before / after comparison for personal training experiments.
 * Observational only — never claims scientific causality.
 */

import {
  EXPERIMENT_MEASURE_LABELS,
  EXPERIMENT_MODE_HONESTY,
  type ExperimentMeasure,
} from "@/domain/experiment-mode/constants";
import type {
  ExperimentCompareResult,
  ExperimentCompareRow,
  ExperimentMeasureValue,
  ExperimentSnapshot,
} from "@/domain/experiment-mode/types";

function findMeasure(
  snapshot: ExperimentSnapshot | null,
  measure: ExperimentMeasure,
): ExperimentMeasureValue | null {
  if (!snapshot) return null;
  return snapshot.measures.find((m) => m.measure === measure) ?? null;
}

function deltaDisplay(
  before: number | null,
  after: number | null,
): string | null {
  if (before == null || after == null) return null;
  const d = after - before;
  if (Math.abs(d) < 0.05) return "≈ unchanged";
  const sign = d > 0 ? "+" : "";
  if (Number.isInteger(before) && Number.isInteger(after)) {
    return `${sign}${Math.round(d)}`;
  }
  return `${sign}${d.toFixed(1)}`;
}

function confidenceFor(
  before: ExperimentMeasureValue | null,
  after: ExperimentMeasureValue | null,
): ExperimentCompareRow["confidence"] {
  if (!before?.display || !after?.display) return "none";
  if (before.numeric == null || after.numeric == null) return "low";
  return "medium";
}

/**
 * Compare baseline vs outcome for selected measures.
 */
export function compareExperimentSnapshots(input: {
  measures: ExperimentMeasure[];
  baseline: ExperimentSnapshot | null;
  outcome: ExperimentSnapshot | null;
}): ExperimentCompareResult {
  const rows: ExperimentCompareRow[] = input.measures.map((measure) => {
    const before = findMeasure(input.baseline, measure);
    const after = findMeasure(input.outcome, measure);
    const missingParts: string[] = [];
    if (!before?.display) missingParts.push("before");
    if (!after?.display) missingParts.push("after");

    return {
      measure,
      label: EXPERIMENT_MEASURE_LABELS[measure],
      beforeDisplay: before?.display ?? null,
      afterDisplay: after?.display ?? null,
      deltaDisplay: deltaDisplay(before?.numeric ?? null, after?.numeric ?? null),
      confidence: confidenceFor(before, after),
      missingNote:
        missingParts.length > 0
          ? `Missing ${missingParts.join(" / ")} data for this measure`
          : (before?.missingNote ?? after?.missingNote ?? null),
    };
  });

  return {
    rows,
    disclaimer: EXPERIMENT_MODE_HONESTY[1],
  };
}

export function experimentWindow(input: {
  startedAt: Date;
  durationWeeks: number;
}): { windowStart: Date; windowEnd: Date } {
  const windowStart = new Date(input.startedAt);
  const windowEnd = new Date(input.startedAt);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + input.durationWeeks * 7);
  return { windowStart, windowEnd };
}

/** Equal-length lookback immediately before start. */
export function baselineWindow(input: {
  startedAt: Date;
  durationWeeks: number;
}): { windowStart: Date; windowEnd: Date } {
  const windowEnd = new Date(input.startedAt);
  const windowStart = new Date(input.startedAt);
  windowStart.setUTCDate(windowStart.getUTCDate() - input.durationWeeks * 7);
  return { windowStart, windowEnd };
}

export function parseMeasuresJson(raw: string): ExperimentMeasure[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ExperimentMeasure =>
        typeof m === "string" &&
        m in EXPERIMENT_MEASURE_LABELS,
    );
  } catch {
    return [];
  }
}

export function parseSnapshotJson(
  raw: string,
): ExperimentSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as ExperimentSnapshot;
    if (!parsed?.capturedAt || !Array.isArray(parsed.measures)) return null;
    if (Object.keys(parsed).length === 0) return null;
    if (parsed.measures.length === 0 && !parsed.windowStart) return null;
    return parsed;
  } catch {
    return null;
  }
}
