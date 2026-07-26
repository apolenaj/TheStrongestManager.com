import type { CameraAngleId } from "@/domain/technique/constants";
import type { RecordingGuideLiftKind } from "@/domain/recording-guide/constants";

/** Schematic camera placement for the visual guide (SVG). */
export type RecordingGuideVisual = {
  /** Camera azimuth around the athlete: 0 = front, 90 = pure side. */
  cameraAzimuthDeg: number;
  /** Relative camera height cue for the diagram. */
  cameraHeight: "hip" | "mid_torso" | "shoulder";
  /** Relative distance cue for the diagram. */
  cameraDistance: "close" | "medium" | "far";
  /** Athlete pose silhouette key for the diagram. */
  athletePose: "hinge" | "squat" | "bench";
};

export type RecordingGuideAngleOption = {
  angleId: CameraAngleId;
  label: string;
  /** What this angle is relatively good for — never “captures all metrics”. */
  bestFor: string;
  /** Metrics / views this angle typically misses or weakens. */
  limitedFor: string;
};

export type RecordingGuide = {
  liftKind: RecordingGuideLiftKind;
  title: string;
  /** Primary recommended angle for the default analysis goal. */
  recommendedAngleId: CameraAngleId;
  recommendedAngleLabel: string;
  /** Short headline matching the prompt examples. */
  recommendationSummary: string;
  distance: string;
  height: string;
  mustBeVisible: string[];
  /** Alternate angles with honest tradeoffs. */
  angleOptions: RecordingGuideAngleOption[];
  visual: RecordingGuideVisual;
  tips: string[];
};

export type RecordingGuideLookup = {
  guide: RecordingGuide;
  matchedSlug: string | null;
};
