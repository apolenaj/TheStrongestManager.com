import {
  HARD_SET_RIR_MAX,
  HARD_SET_RPE_MIN,
  SPIKE_MIN_ABSOLUTE_VOLUME_KG,
  SPIKE_MIN_BASELINE_TRAINING_DAYS,
  SPIKE_VOLUME_RATIO_MIN,
} from "@/domain/training-load/constants";

/** One completed set row used for load math (canonical kg). */
export type LoadSetInput = {
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  completedAt: Date;
  performedReps: number | null;
  performedLoadKg: number | null;
  performedRpe: number | null;
  performedRir: number | null;
  prescribedPercent: number | null;
  sessionRpe: number | null;
};

export type LoadTotals = {
  setCount: number;
  repCount: number;
  /** Σ (loadKg × reps) for sets with both values — tonnage. */
  volumeKg: number;
  /** Sets contributing to volume (both load and reps present). */
  volumeSetCount: number;
  hardSetCount: number;
  /** Mean set RPE when logged. */
  avgSetRpe: number | null;
  /** Mean prescribed % when logged (fallback intensity signal). */
  avgPrescribedPercent: number | null;
  /**
   * Estimated intensity 0–100 scale for display:
   * prefer mean set RPE × 10, else mean prescribed %, else null.
   */
  estimatedIntensity: number | null;
  estimatedIntensityBasis: "set_rpe" | "prescribed_percent" | null;
};

export type ExerciseWorkload = {
  exerciseId: string;
  exerciseName: string;
  setCount: number;
  repCount: number;
  volumeKg: number;
  hardSetCount: number;
  avgSetRpe: number | null;
};

export type SessionLoadSummary = {
  sessionId: string;
  completedAt: Date;
  setCount: number;
  repCount: number;
  volumeKg: number;
  hardSetCount: number;
  sessionRpe: number | null;
};

export type DailyVolumePoint = {
  /** YYYY-MM-DD local calendar day key */
  dayKey: string;
  volumeKg: number;
  setCount: number;
  hardSetCount: number;
  sessionCount: number;
};

export type LoadSpikeAssessment = {
  flagged: boolean;
  /** recentAvg / baselineAvg when both computable */
  ratio: number | null;
  recentAvgDailyVolumeKg: number | null;
  baselineAvgDailyVolumeKg: number | null;
  /** Honest athlete-facing label — never “fatigue score”. */
  label: string | null;
  explanation: string;
};

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function isHardSet(input: {
  performedRpe: number | null;
  performedRir: number | null;
}): boolean {
  if (input.performedRpe != null && input.performedRpe >= HARD_SET_RPE_MIN) {
    return true;
  }
  if (input.performedRir != null && input.performedRir <= HARD_SET_RIR_MAX) {
    return true;
  }
  return false;
}

export function setVolumeKg(input: {
  performedLoadKg: number | null;
  performedReps: number | null;
}): number | null {
  if (input.performedLoadKg == null || input.performedReps == null) return null;
  if (input.performedReps < 0 || input.performedLoadKg < 0) return null;
  return input.performedLoadKg * input.performedReps;
}

export function aggregateLoadTotals(sets: LoadSetInput[]): LoadTotals {
  let setCount = 0;
  let repCount = 0;
  let volumeKg = 0;
  let volumeSetCount = 0;
  let hardSetCount = 0;
  const rpes: number[] = [];
  const percents: number[] = [];

  for (const set of sets) {
    setCount += 1;
    if (set.performedReps != null) repCount += set.performedReps;
    const vol = setVolumeKg(set);
    if (vol != null) {
      volumeKg += vol;
      volumeSetCount += 1;
    }
    if (isHardSet(set)) hardSetCount += 1;
    if (set.performedRpe != null) rpes.push(set.performedRpe);
    if (set.prescribedPercent != null) percents.push(set.prescribedPercent);
  }

  const avgSetRpe = mean(rpes);
  const avgPrescribedPercent = mean(percents);

  let estimatedIntensity: number | null = null;
  let estimatedIntensityBasis: LoadTotals["estimatedIntensityBasis"] = null;
  if (avgSetRpe != null) {
    estimatedIntensity = Math.round(avgSetRpe * 10 * 10) / 10;
    estimatedIntensityBasis = "set_rpe";
  } else if (avgPrescribedPercent != null) {
    estimatedIntensity = Math.round(avgPrescribedPercent * 10) / 10;
    estimatedIntensityBasis = "prescribed_percent";
  }

  return {
    setCount,
    repCount,
    volumeKg: Math.round(volumeKg * 10) / 10,
    volumeSetCount,
    hardSetCount,
    avgSetRpe: avgSetRpe != null ? Math.round(avgSetRpe * 10) / 10 : null,
    avgPrescribedPercent:
      avgPrescribedPercent != null
        ? Math.round(avgPrescribedPercent * 10) / 10
        : null,
    estimatedIntensity,
    estimatedIntensityBasis,
  };
}

export function aggregateExerciseWorkloads(
  sets: LoadSetInput[],
): ExerciseWorkload[] {
  const map = new Map<
    string,
    {
      exerciseName: string;
      sets: LoadSetInput[];
    }
  >();

  for (const set of sets) {
    const existing = map.get(set.exerciseId);
    if (existing) existing.sets.push(set);
    else map.set(set.exerciseId, { exerciseName: set.exerciseName, sets: [set] });
  }

  const rows: ExerciseWorkload[] = [];
  for (const [exerciseId, group] of map) {
    const totals = aggregateLoadTotals(group.sets);
    rows.push({
      exerciseId,
      exerciseName: group.exerciseName,
      setCount: totals.setCount,
      repCount: totals.repCount,
      volumeKg: totals.volumeKg,
      hardSetCount: totals.hardSetCount,
      avgSetRpe: totals.avgSetRpe,
    });
  }

  return rows.sort((a, b) => b.volumeKg - a.volumeKg);
}

export function aggregateSessionSummaries(
  sets: LoadSetInput[],
): SessionLoadSummary[] {
  const map = new Map<
    string,
    { completedAt: Date; sets: LoadSetInput[]; sessionRpe: number | null }
  >();

  for (const set of sets) {
    const existing = map.get(set.sessionId);
    if (existing) {
      existing.sets.push(set);
      if (set.completedAt > existing.completedAt) {
        existing.completedAt = set.completedAt;
      }
    } else {
      map.set(set.sessionId, {
        completedAt: set.completedAt,
        sets: [set],
        sessionRpe: set.sessionRpe,
      });
    }
  }

  const rows: SessionLoadSummary[] = [];
  for (const [sessionId, group] of map) {
    const totals = aggregateLoadTotals(group.sets);
    rows.push({
      sessionId,
      completedAt: group.completedAt,
      setCount: totals.setCount,
      repCount: totals.repCount,
      volumeKg: totals.volumeKg,
      hardSetCount: totals.hardSetCount,
      sessionRpe: group.sessionRpe,
    });
  }

  return rows.sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
  );
}

export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDailyVolumeSeries(
  sets: LoadSetInput[],
): DailyVolumePoint[] {
  const sessions = aggregateSessionSummaries(sets);
  const byDay = new Map<
    string,
    { volumeKg: number; setCount: number; hardSetCount: number; sessions: Set<string> }
  >();

  for (const session of sessions) {
    const key = toDayKey(session.completedAt);
    const row = byDay.get(key) ?? {
      volumeKg: 0,
      setCount: 0,
      hardSetCount: 0,
      sessions: new Set<string>(),
    };
    row.volumeKg += session.volumeKg;
    row.setCount += session.setCount;
    row.hardSetCount += session.hardSetCount;
    row.sessions.add(session.sessionId);
    byDay.set(key, row);
  }

  return [...byDay.entries()]
    .map(([dayKey, row]) => ({
      dayKey,
      volumeKg: Math.round(row.volumeKg * 10) / 10,
      setCount: row.setCount,
      hardSetCount: row.hardSetCount,
      sessionCount: row.sessions.size,
    }))
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}

/**
 * Conservative sudden load spike detection.
 * Compares average daily volume in the recent window vs a prior baseline window.
 * Does not claim acute fatigue, ACWR science, or injury risk.
 */
export function assessLoadSpike(input: {
  daily: DailyVolumePoint[];
  recentDays: number;
  baselineDays: number;
  /** End of windows (usually “today”). */
  asOf: Date;
}): LoadSpikeAssessment {
  const asOfKey = toDayKey(input.asOf);
  const recentKeys = new Set<string>();
  const baselineKeys = new Set<string>();

  for (let i = 0; i < input.recentDays; i += 1) {
    const d = new Date(input.asOf);
    d.setDate(d.getDate() - i);
    recentKeys.add(toDayKey(d));
  }
  for (let i = input.recentDays; i < input.recentDays + input.baselineDays; i += 1) {
    const d = new Date(input.asOf);
    d.setDate(d.getDate() - i);
    baselineKeys.add(toDayKey(d));
  }

  const recentPoints = input.daily.filter((p) => recentKeys.has(p.dayKey));
  const baselinePoints = input.daily.filter((p) => baselineKeys.has(p.dayKey));

  if (baselinePoints.length < SPIKE_MIN_BASELINE_TRAINING_DAYS) {
    return {
      flagged: false,
      ratio: null,
      recentAvgDailyVolumeKg: null,
      baselineAvgDailyVolumeKg: null,
      label: null,
      explanation: `Need at least ${SPIKE_MIN_BASELINE_TRAINING_DAYS} training days in the baseline window before flagging a sudden load increase (as of ${asOfKey}).`,
    };
  }

  if (recentPoints.length === 0) {
    return {
      flagged: false,
      ratio: null,
      recentAvgDailyVolumeKg: null,
      baselineAvgDailyVolumeKg: null,
      label: null,
      explanation: "No completed training volume in the recent window.",
    };
  }

  const recentAvg =
    recentPoints.reduce((s, p) => s + p.volumeKg, 0) / input.recentDays;
  const baselineAvg =
    baselinePoints.reduce((s, p) => s + p.volumeKg, 0) / input.baselineDays;

  if (baselineAvg <= 0) {
    return {
      flagged: false,
      ratio: null,
      recentAvgDailyVolumeKg: Math.round(recentAvg * 10) / 10,
      baselineAvgDailyVolumeKg: 0,
      label: null,
      explanation: "Baseline average volume is zero — spike ratio is not meaningful.",
    };
  }

  const ratio = recentAvg / baselineAvg;
  const absoluteLift = recentAvg - baselineAvg;
  const flagged =
    ratio >= SPIKE_VOLUME_RATIO_MIN &&
    absoluteLift >= SPIKE_MIN_ABSOLUTE_VOLUME_KG;

  return {
    flagged,
    ratio: Math.round(ratio * 100) / 100,
    recentAvgDailyVolumeKg: Math.round(recentAvg * 10) / 10,
    baselineAvgDailyVolumeKg: Math.round(baselineAvg * 10) / 10,
    label: flagged
      ? "Possible sudden increase in estimated training load"
      : null,
    explanation: flagged
      ? `Recent ${input.recentDays}-day average estimated volume is ~${(ratio * 100).toFixed(0)}% of the prior ${input.baselineDays}-day baseline (absolute lift ${Math.round(absoluteLift)} kg·reps/day). This is a conservative volume alert — not a fatigue score or injury prediction.`
      : `Recent estimated volume is within a conservative range versus the prior baseline (ratio ${ratio.toFixed(2)}).`,
  };
}
