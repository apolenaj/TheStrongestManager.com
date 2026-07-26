import type { CameraQualityCheckId } from "@/domain/camera-quality/constants";
import type { ConfidenceLevel } from "@/domain/scoring/types";

export type CameraQualityVerdict = "good_for_analysis" | "record_again";

export type CameraQualityCheckStatus = "pass" | "fail" | "unknown";

export type CameraQualityCheck = {
  id: CameraQualityCheckId;
  label: string;
  status: CameraQualityCheckStatus;
  /** 0–100 contribution quality for this check. */
  score: number | null;
  detail: string;
};

export type CameraQualityResult = {
  engineVersion: string;
  /** 0–100 analysis readiness. */
  readinessScore: number | null;
  verdict: CameraQualityVerdict;
  verdictLabel: "GOOD FOR ANALYSIS" | "RECORD AGAIN";
  /** Primary athlete-facing reason (first critical failure or summary). */
  reason: string;
  checks: CameraQualityCheck[];
  recordingInstructions: string[];
  confidence: ConfidenceLevel;
  honesty: readonly string[];
  /** True when pose landmarks informed visibility / occlusion / framing. */
  usedPoseEvidence: boolean;
};

/**
 * Inputs for pure assessment — never invent landmark evidence.
 */
export type CameraQualitySignals = {
  exerciseSlug: string | null;
  declaredCameraAngle: string | null;
  widthPx: number | null;
  heightPx: number | null;
  durationSeconds: number | null;
  /** Estimated frames per second when measurable. */
  estimatedFps: number | null;
  /** Mean luma 0–255 from sampled frames; null if not sampled. */
  meanLuma: number | null;
  /**
   * Optional pose evidence (after extraction).
   * Omit or leave nulls when not available — checks stay unknown rather than fabricated.
   */
  pose?: {
    frameCount: number;
    framesWithMidHip: number;
    meanLandmarkVisibility: number | null;
    /** Fraction of frames with visible left or right ankle. */
    ankleCoverage: number | null;
    /** Fraction of frames with visible left or right wrist. */
    wristCoverage: number | null;
    /** True when any ankle landmark sits within EDGE_MARGIN of the frame border. */
    anklesNearEdge: boolean | null;
    /** True when any wrist landmark sits within EDGE_MARGIN of the frame border. */
    wristsNearEdge: boolean | null;
  } | null;
};
