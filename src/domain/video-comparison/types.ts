import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { MovementPhaseId } from "@/domain/movement/types";

export type VideoCompareSide = {
  analysisId: string;
  label: string;
  createdAtIso: string;
  cameraAngle: string | null;
  exerciseSlug: string | null;
  exerciseName: string | null;
  overallScore: number | null;
  confidence: ConfidenceLevel | string | null;
  durationSeconds: number | null;
  signedMediaPath: string | null;
  /** Sparse landmark samples for overlay — empty when not persisted. */
  landmarkFrames: VideoCompareLandmarkFrame[];
  phases: Array<{
    phase: MovementPhaseId;
    label: string;
    startTimeSeconds: number;
    endTimeSeconds: number;
    confidence: ConfidenceLevel;
  }>;
  components: Array<{
    id: string;
    label: string;
    score: number;
  }>;
  metrics: Array<{
    key: string;
    label: string;
    value: number | null;
    unit: string | null;
    confidence: ConfidenceLevel;
  }>;
};

export type VideoCompareLandmarkFrame = {
  timeSeconds: number;
  points: Array<{ name: string; x: number; y: number; visibility: number }>;
};

export type MetricDeltaRow = {
  id: string;
  label: string;
  oldValue: string;
  newValue: string;
  delta: number | null;
  category: "start_position" | "movement_path" | "technique" | "phase";
};

export type PhaseCompareRow = {
  phase: MovementPhaseId | string;
  label: string;
  oldTime: string | null;
  newTime: string | null;
  oldConfidence: string | null;
  newConfidence: string | null;
};

export type VideoComparisonResult = {
  engineVersion: string;
  oldSide: VideoCompareSide;
  newSide: VideoCompareSide;
  metricsComparable: boolean;
  cameraWarning: string | null;
  startPositionRows: MetricDeltaRow[];
  movementPathRows: MetricDeltaRow[];
  techniqueMetricRows: MetricDeltaRow[];
  phaseRows: PhaseCompareRow[];
  landmarksAvailable: boolean;
  honesty: readonly string[];
  emptyReason: string | null;
};
