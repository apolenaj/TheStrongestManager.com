import { LIFT_PHASE_LABELS } from "@/domain/movement/phases/constants";
import type { MovementReport } from "@/domain/movement/types";
import { areCameraAnglesComparable } from "@/domain/technique-trend/camera";
import {
  VIDEO_COMPARE_PATH_METRIC_KEYS,
  VIDEO_COMPARE_START_COMPONENT_IDS,
  VIDEO_COMPARISON_ENGINE_VERSION,
  VIDEO_COMPARISON_HONESTY,
} from "@/domain/video-comparison/constants";
import type {
  MetricDeltaRow,
  PhaseCompareRow,
  VideoCompareLandmarkFrame,
  VideoCompareSide,
  VideoComparisonResult,
} from "@/domain/video-comparison/types";

export type AssembleVideoComparisonInput = {
  old: {
    analysisId: string;
    createdAtIso: string;
    cameraAngle: string | null;
    exerciseSlug: string | null;
    exerciseName: string | null;
    overallScore: number | null;
    confidence: string | null;
    durationSeconds: number | null;
    signedMediaPath: string | null;
    report: MovementReport | null;
    landmarkFrames?: VideoCompareLandmarkFrame[];
  };
  new: {
    analysisId: string;
    createdAtIso: string;
    cameraAngle: string | null;
    exerciseSlug: string | null;
    exerciseName: string | null;
    overallScore: number | null;
    confidence: string | null;
    durationSeconds: number | null;
    signedMediaPath: string | null;
    report: MovementReport | null;
    landmarkFrames?: VideoCompareLandmarkFrame[];
  };
};

/**
 * Pure assembly of old vs new lift comparison.
 * Does not invent landmarks or metric deltas without both sides observed.
 */
export function assembleVideoComparison(
  input: AssembleVideoComparisonInput,
): VideoComparisonResult {
  const oldSide = toSide(input.old, "Old lift");
  const newSide = toSide(input.new, "New lift");

  const sameExercise =
    Boolean(oldSide.exerciseSlug) &&
    oldSide.exerciseSlug === newSide.exerciseSlug;
  const anglesOk = areCameraAnglesComparable(
    oldSide.cameraAngle,
    newSide.cameraAngle,
  );
  const metricsComparable = sameExercise && anglesOk;

  let cameraWarning: string | null = null;
  if (!sameExercise) {
    cameraWarning =
      "Exercises differ — videos can still play side by side, but technique metrics are not compared.";
  } else if (!anglesOk) {
    cameraWarning =
      "Camera angles are incompatible for metric comparison. Playback stays available; start position / path / technique deltas are withheld.";
  }

  const landmarksAvailable =
    oldSide.landmarkFrames.length > 0 || newSide.landmarkFrames.length > 0;

  if (!oldSide.signedMediaPath && !newSide.signedMediaPath) {
    return {
      engineVersion: VIDEO_COMPARISON_ENGINE_VERSION,
      oldSide,
      newSide,
      metricsComparable: false,
      cameraWarning,
      startPositionRows: [],
      movementPathRows: [],
      techniqueMetricRows: [],
      phaseRows: [],
      landmarksAvailable: false,
      honesty: VIDEO_COMPARISON_HONESTY,
      emptyReason:
        "Neither analysis has private video on file — side-by-side playback needs media.",
    };
  }

  return {
    engineVersion: VIDEO_COMPARISON_ENGINE_VERSION,
    oldSide,
    newSide,
    metricsComparable,
    cameraWarning,
    startPositionRows: metricsComparable
      ? buildStartRows(oldSide, newSide)
      : [],
    movementPathRows: metricsComparable
      ? buildPathRows(oldSide, newSide)
      : [],
    techniqueMetricRows: metricsComparable
      ? buildTechniqueRows(oldSide, newSide)
      : [],
    phaseRows: metricsComparable ? buildPhaseRows(oldSide, newSide) : [],
    landmarksAvailable,
    honesty: VIDEO_COMPARISON_HONESTY,
    emptyReason: null,
  };
}

function toSide(
  raw: AssembleVideoComparisonInput["old"],
  label: string,
): VideoCompareSide {
  const report = raw.report;
  const assessment = report?.techniqueAssessment;
  const components =
    assessment?.components
      ?.filter((c) => c.status === "observed" && c.score != null)
      .map((c) => ({
        id: c.id,
        label: c.label,
        score: c.score as number,
      })) ?? [];

  const metrics =
    report?.metrics
      ?.filter((m) => m.value != null && m.confidence !== "none")
      .map((m) => ({
        key: m.key,
        label: m.label,
        value: m.value,
        unit: m.unit,
        confidence: m.confidence,
      })) ?? [];

  const phases =
    report?.phases
      ?.filter((p) => p.phase !== "unknown")
      .map((p) => ({
        phase: p.phase,
        label: LIFT_PHASE_LABELS[p.phase] ?? p.phase,
        startTimeSeconds: p.startTimeSeconds,
        endTimeSeconds: p.endTimeSeconds,
        confidence: p.confidence,
      })) ?? [];

  return {
    analysisId: raw.analysisId,
    label,
    createdAtIso: raw.createdAtIso,
    cameraAngle: raw.cameraAngle,
    exerciseSlug: raw.exerciseSlug,
    exerciseName: raw.exerciseName,
    overallScore: raw.overallScore,
    confidence: raw.confidence,
    durationSeconds: raw.durationSeconds,
    signedMediaPath: raw.signedMediaPath,
    landmarkFrames: raw.landmarkFrames ?? [],
    phases,
    components,
    metrics,
  };
}

function buildStartRows(
  oldSide: VideoCompareSide,
  newSide: VideoCompareSide,
): MetricDeltaRow[] {
  const ids = VIDEO_COMPARE_START_COMPONENT_IDS as readonly string[];
  return componentDeltas(oldSide, newSide, ids, "start_position");
}

function buildTechniqueRows(
  oldSide: VideoCompareSide,
  newSide: VideoCompareSide,
): MetricDeltaRow[] {
  const startIds = new Set(
    VIDEO_COMPARE_START_COMPONENT_IDS as readonly string[],
  );
  const ids = [
    ...new Set([
      ...oldSide.components.map((c) => c.id),
      ...newSide.components.map((c) => c.id),
    ]),
  ].filter((id) => !startIds.has(id));
  return componentDeltas(oldSide, newSide, ids, "technique");
}

function componentDeltas(
  oldSide: VideoCompareSide,
  newSide: VideoCompareSide,
  ids: readonly string[],
  category: MetricDeltaRow["category"],
): MetricDeltaRow[] {
  const rows: MetricDeltaRow[] = [];
  for (const id of ids) {
    const o = oldSide.components.find((c) => c.id === id);
    const n = newSide.components.find((c) => c.id === id);
    if (!o && !n) continue;
    const delta =
      o != null && n != null ? Math.round(n.score - o.score) : null;
    rows.push({
      id,
      label: n?.label ?? o?.label ?? id,
      oldValue: o != null ? `${Math.round(o.score)}` : "—",
      newValue: n != null ? `${Math.round(n.score)}` : "—",
      delta,
      category,
    });
  }
  return rows;
}

function buildPathRows(
  oldSide: VideoCompareSide,
  newSide: VideoCompareSide,
): MetricDeltaRow[] {
  const keys = VIDEO_COMPARE_PATH_METRIC_KEYS as readonly string[];
  const rows: MetricDeltaRow[] = [];
  for (const key of keys) {
    const o = oldSide.metrics.find((m) => m.key === key);
    const n = newSide.metrics.find((m) => m.key === key);
    if (!o && !n) continue;
    const delta =
      o?.value != null && n?.value != null
        ? Math.round((n.value - o.value) * 1000) / 1000
        : null;
    rows.push({
      id: key,
      label: n?.label ?? o?.label ?? key,
      oldValue: formatMetric(o?.value ?? null, o?.unit ?? null),
      newValue: formatMetric(n?.value ?? null, n?.unit ?? null),
      delta,
      category: "movement_path",
    });
  }
  return rows;
}

function buildPhaseRows(
  oldSide: VideoCompareSide,
  newSide: VideoCompareSide,
): PhaseCompareRow[] {
  const labels = new Map<string, string>();
  for (const p of [...oldSide.phases, ...newSide.phases]) {
    labels.set(p.phase, p.label);
  }
  const rows: PhaseCompareRow[] = [];
  for (const [phase, label] of labels) {
    const o = oldSide.phases.find((p) => p.phase === phase);
    const n = newSide.phases.find((p) => p.phase === phase);
    rows.push({
      phase,
      label,
      oldTime: o
        ? `${o.startTimeSeconds.toFixed(1)}s–${o.endTimeSeconds.toFixed(1)}s`
        : null,
      newTime: n
        ? `${n.startTimeSeconds.toFixed(1)}s–${n.endTimeSeconds.toFixed(1)}s`
        : null,
      oldConfidence: o?.confidence ?? null,
      newConfidence: n?.confidence ?? null,
    });
  }
  return rows;
}

function formatMetric(value: number | null, unit: string | null): string {
  if (value == null) return "—";
  return unit ? `${value} ${unit}` : String(value);
}
