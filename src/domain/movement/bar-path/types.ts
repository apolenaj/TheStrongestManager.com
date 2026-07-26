import type { ConfidenceLevel } from "@/domain/movement/types";
import type { BarPathLiftKind } from "@/domain/movement/bar-path/constants";

export type BarPathPoint = {
  /** Frame index */
  frameIndex: number;
  timeSeconds: number;
  /** Normalized image x (0–1). */
  x: number;
  /** Normalized image y (0–1, top = 0). */
  y: number;
  visibility: number;
};

export type BarPathMetric = {
  key: string;
  label: string;
  value: number;
  unit: string;
  /** Short athlete-facing basis. */
  basis: string;
};

/**
 * Bar-path analysis result.
 * When `displayable` is false, metrics and pathPoints are empty — UI must hide them.
 */
export type BarPathAnalysis = {
  engineVersion: string;
  liftKind: BarPathLiftKind | null;
  /** Always mid_wrist for this engine — honest proxy label. */
  proxy: "mid_wrist";
  confidence: ConfidenceLevel;
  confidenceScore: number;
  /** False when confidence/coverage is too poor to show metrics or a path. */
  displayable: boolean;
  unavailableReason: string | null;
  horizontalDeviation: BarPathMetric | null;
  verticalPath: BarPathMetric | null;
  repConsistency: BarPathMetric | null;
  /** Downsampled path for SVG — empty when not displayable. */
  pathPoints: BarPathPoint[];
  sampleCount: number;
  wristCoverage: number;
  honesty: readonly string[];
};
