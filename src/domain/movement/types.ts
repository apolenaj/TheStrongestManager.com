import type { CameraAngleId } from "@/domain/technique/constants";
import type { DeadliftTechniqueAssessment } from "@/domain/movement/deadlift/score/types";
import type { BarPathAnalysis } from "@/domain/movement/bar-path/types";

/** Canonical landmark names — adapters map provider IDs into this set. */
export type LandmarkName =
  | "nose"
  | "left_shoulder"
  | "right_shoulder"
  | "left_hip"
  | "right_hip"
  | "left_knee"
  | "right_knee"
  | "left_ankle"
  | "right_ankle"
  | "left_wrist"
  | "right_wrist";

export type LandmarkPoint = {
  name: LandmarkName;
  /** Normalized image x (0–1), origin top-left. */
  x: number;
  /** Normalized image y (0–1), origin top-left (y increases downward). */
  y: number;
  /** Provider visibility / presence score 0–1. */
  visibility: number;
};

export type PoseFrame = {
  index: number;
  timeSeconds: number;
  landmarks: LandmarkPoint[];
};

export type ConfidenceLevel = "none" | "low" | "medium" | "high";

export type CameraSuitability = {
  suitable: boolean;
  level: ConfidenceLevel;
  angle: CameraAngleId | "unknown";
  message: string;
  /** Metrics that are suppressed or heavily down-weighted for this angle. */
  limitedMetricKeys: string[];
};

export type MovementPhaseId =
  // Deadlift (Prompt 61) + legacy
  | "setup"
  | "initial_pull"
  | "knee_level"
  | "pull" // legacy / fallback when knee split is unavailable
  | "lockout"
  | "descent"
  // Squat (catalogued; detector gated until reliable)
  | "bottom"
  | "sticking_region"
  // Bench (catalogued; detector gated until reliable)
  | "touch"
  | "initial_press"
  | "mid_range"
  | "unknown";

export type MovementPhaseSegment = {
  phase: MovementPhaseId;
  startFrame: number;
  endFrame: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  note: string;
};

export type ObservableMetric = {
  key: string;
  label: string;
  value: number | null;
  unit: string | null;
  confidence: ConfidenceLevel;
  /** 0–1 continuous confidence for diagnostics. */
  confidenceScore: number;
  /** How the value was derived (observable geometry only). */
  basis: string;
  caveats: string[];
  /** Optional phase scope. */
  phase?: MovementPhaseId;
};

/**
 * Qualitative technique observations — not diagnoses, forces, or injury claims.
 */
export type TechniqueHeuristic = {
  id: string;
  label: string;
  observation: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  relatedMetricKeys: string[];
};

export type MovementDiagnostics = {
  poseProvider: string;
  frameCount: number;
  framesWithMidHip: number;
  meanLandmarkVisibility: number;
  pipelineVersion: string;
  /** True when frames came from the developer fixture adapter — not athlete video. */
  fixture: boolean;
  landmarkCoverageByName: Partial<Record<LandmarkName, number>>;
  warnings: string[];
};

export type MovementReport = {
  pipelineVersion: string;
  exerciseSlug: string;
  supportedExercise: boolean;
  cameraSuitability: CameraSuitability;
  phases: MovementPhaseSegment[];
  metrics: ObservableMetric[];
  heuristics: TechniqueHeuristic[];
  /**
   * Overall pipeline confidence for the report as a package.
   * Independent of any Technique Score (which stays null).
   */
  reportConfidence: ConfidenceLevel;
  reportConfidenceScore: number;
  summary: string;
  diagnostics: MovementDiagnostics;
  disclaimers: string[];
  /**
   * Conventional deadlift Technique Score when the Prompt 18 scorer can run.
   * Null when unsupported exercise, unsuitable camera, or insufficient components.
   */
  overallTechniqueScore: number | null;
  /** Structured deadlift Technique Score assessment (Prompt 18). */
  techniqueAssessment: DeadliftTechniqueAssessment | null;
  /**
   * Bar-path intelligence (Prompt 65) — mid-wrist proxy.
   * When confidence is poor, `displayable` is false and metrics/path are empty.
   */
  barPath: BarPathAnalysis | null;
};
