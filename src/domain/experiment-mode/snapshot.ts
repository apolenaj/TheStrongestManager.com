/**
 * Build observational snapshots from logged signals.
 * Never invents missing values.
 */

import {
  EXPERIMENT_MEASURE_LABELS,
  type ExperimentMeasure,
} from "@/domain/experiment-mode/constants";
import type {
  ExperimentMeasureValue,
  ExperimentSnapshot,
} from "@/domain/experiment-mode/types";

export type ExperimentSignalBag = {
  completedSessions: number;
  volumeKg: number | null;
  volumeSetCount: number;
  /** Best estimated 1RM / top set load for the lift when known. */
  deadliftBestKg: number | null;
  squatBestKg: number | null;
  benchBestKg: number | null;
  techniqueAvg: number | null;
  techniqueCount: number;
};

function massDisplay(kg: number | null, unitsLabel: string): string | null {
  if (kg == null) return null;
  return `${Math.round(kg * 10) / 10} ${unitsLabel}`;
}

export function buildExperimentSnapshot(input: {
  measures: ExperimentMeasure[];
  windowStart: Date;
  windowEnd: Date;
  signals: ExperimentSignalBag;
  unitsLabel?: string;
  notes?: string | null;
  now?: Date;
}): ExperimentSnapshot {
  const units = input.unitsLabel ?? "kg";
  const s = input.signals;
  const measures: ExperimentMeasureValue[] = input.measures.map((measure) => {
    const label = EXPERIMENT_MEASURE_LABELS[measure];
    switch (measure) {
      case "deadlift_performance":
        return {
          measure,
          label,
          display: massDisplay(s.deadliftBestKg, units),
          numeric: s.deadliftBestKg,
          unit: units,
          missingNote: s.deadliftBestKg == null ? "Deadlift loads in window" : null,
        };
      case "squat_performance":
        return {
          measure,
          label,
          display: massDisplay(s.squatBestKg, units),
          numeric: s.squatBestKg,
          unit: units,
          missingNote: s.squatBestKg == null ? "Squat loads in window" : null,
        };
      case "bench_performance":
        return {
          measure,
          label,
          display: massDisplay(s.benchBestKg, units),
          numeric: s.benchBestKg,
          unit: units,
          missingNote: s.benchBestKg == null ? "Bench loads in window" : null,
        };
      case "technique":
        return {
          measure,
          label,
          display:
            s.techniqueAvg != null
              ? `${s.techniqueAvg.toFixed(1)} avg (${s.techniqueCount} analysis)`
              : null,
          numeric: s.techniqueAvg,
          unit: "score",
          missingNote:
            s.techniqueAvg == null ? "Technique analyses in window" : null,
        };
      case "training_volume":
        return {
          measure,
          label,
          display:
            s.volumeSetCount > 0 && s.volumeKg != null
              ? `${massDisplay(s.volumeKg, units)}·reps · ${s.volumeSetCount} sets`
              : null,
          numeric: s.volumeKg,
          unit: units,
          missingNote:
            s.volumeSetCount === 0 ? "Sets with load × reps in window" : null,
        };
      case "session_adherence":
        return {
          measure,
          label,
          display: `${s.completedSessions} completed session(s)`,
          numeric: s.completedSessions,
          unit: "sessions",
          missingNote:
            s.completedSessions === 0 ? "Completed sessions in window" : null,
        };
      default:
        return {
          measure,
          label,
          display: null,
          numeric: null,
          unit: null,
          missingNote: "Unsupported measure",
        };
    }
  });

  return {
    capturedAt: (input.now ?? new Date()).toISOString(),
    windowStart: input.windowStart.toISOString(),
    windowEnd: input.windowEnd.toISOString(),
    measures,
    notes: input.notes?.trim() || null,
  };
}
