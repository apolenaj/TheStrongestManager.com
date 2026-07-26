import type { RecordingGuide } from "@/domain/recording-guide/types";

export const DEADLIFT_RECORDING_GUIDE: RecordingGuide = {
  liftKind: "deadlift",
  title: "Deadlift filming",
  recommendedAngleId: "forty_five",
  recommendedAngleLabel: "45° front-side",
  recommendationSummary:
    "45° front-side recommended for general analysis.",
  distance:
    "About 2.5–4 m (8–13 ft) so the full bar and both feet stay in frame through lockout.",
  height:
    "Camera near mid-thigh to hip height — roughly level with the bar at the start, not on the floor and not overhead.",
  mustBeVisible: [
    "Both feet and plates on the floor",
    "Barbell end (or sleeve) through the whole pull",
    "Hips and shoulders from setup to lockout",
    "Head and full stance width without cropping",
  ],
  angleOptions: [
    {
      angleId: "forty_five",
      label: "45° front-side",
      bestFor:
        "General technique review — start position, hip rise, and lockout in one view",
      limitedFor:
        "True sagittal torso angle and precise bar-path depth; left/right symmetry is foreshortened",
    },
    {
      angleId: "side",
      label: "Side",
      bestFor:
        "Sagittal cues: torso angle consistency, hip–shoulder relationship, bar-path proxy",
      limitedFor:
        "Left/right symmetry and some front-facing setup cues",
    },
    {
      angleId: "front",
      label: "Front",
      bestFor: "Stance symmetry and lateral shift checks",
      limitedFor:
        "Sagittal lean, true hip depth, and conventional bar-path analysis",
    },
  ],
  visual: {
    cameraAzimuthDeg: 45,
    cameraHeight: "hip",
    cameraDistance: "medium",
    athletePose: "hinge",
  },
  tips: [
    "Film one working set with the full pull — setup through lockout.",
    "Do not use overhead; it is unsuitable for most deadlift metrics.",
  ],
};

export const SQUAT_RECORDING_GUIDE: RecordingGuide = {
  liftKind: "squat",
  title: "Squat filming",
  recommendedAngleId: "side",
  recommendedAngleLabel: "Side (or 45° by goal)",
  recommendationSummary:
    "Side or 45° depending on analysis goal.",
  distance:
    "About 2–3.5 m (7–11 ft) so head, bar, and both feet stay visible at the bottom.",
  height:
    "Camera near hip to mid-thigh height — level with the bottom of the squat, not floor-level looking up.",
  mustBeVisible: [
    "Full depth (hip crease / thigh relative to the frame goal)",
    "Barbell and upper back",
    "Both feet and knees through the rep",
    "Lockout / stand at the top",
  ],
  angleOptions: [
    {
      angleId: "side",
      label: "Side",
      bestFor:
        "Depth, torso lean, and bar-path / vertical travel cues",
      limitedFor: "Knee cave / frontal-plane symmetry",
    },
    {
      angleId: "forty_five",
      label: "45°",
      bestFor:
        "General review when you want depth plus a hint of stance width",
      limitedFor:
        "Pure sagittal depth measurement and clean frontal knee tracking — neither is complete from 45° alone",
    },
    {
      angleId: "front",
      label: "Front",
      bestFor: "Knee tracking and stance symmetry",
      limitedFor: "True depth and sagittal torso angle",
    },
  ],
  visual: {
    cameraAzimuthDeg: 90,
    cameraHeight: "hip",
    cameraDistance: "medium",
    athletePose: "squat",
  },
  tips: [
    "Pick side for depth/path goals; pick 45° for a general overview — one clip cannot optimize both.",
    "Keep the rack uprights from hiding the knees or bar.",
  ],
};

export const BENCH_RECORDING_GUIDE: RecordingGuide = {
  liftKind: "bench",
  title: "Bench press filming",
  recommendedAngleId: "side",
  recommendedAngleLabel: "Side",
  recommendationSummary: "Side view for bar path.",
  distance:
    "About 1.5–2.5 m (5–8 ft) from the side of the bench so the bar travels fully in frame.",
  height:
    "Camera near bench-pad / mid-chest height — level with the bar path, not from the floor or ceiling.",
  mustBeVisible: [
    "Barbell end through touch and lockout",
    "Shoulders and upper arms",
    "Bench pad and head position",
    "Full press range without cropping the lockout",
  ],
  angleOptions: [
    {
      angleId: "side",
      label: "Side",
      bestFor: "Bar-path vertical/horizontal travel and touch height",
      limitedFor: "Elbow flare symmetry and grip-width appearance",
    },
    {
      angleId: "forty_five",
      label: "45°",
      bestFor: "General setup and press overview",
      limitedFor:
        "Clean bar-path measurement — prefer pure side when path is the goal",
    },
    {
      angleId: "front",
      label: "Front / head-on",
      bestFor: "Elbow path symmetry cues",
      limitedFor: "Bar-path depth and touch position in the sagittal plane",
    },
  ],
  visual: {
    cameraAzimuthDeg: 90,
    cameraHeight: "mid_torso",
    cameraDistance: "close",
    athletePose: "bench",
  },
  tips: [
    "For bar-path intelligence, prefer a true side view over 45° or front.",
    "Stabilize the phone — a shaking side clip hides path deviation.",
  ],
};

export const GENERAL_RECORDING_GUIDE: RecordingGuide = {
  liftKind: "general",
  title: "General lift filming",
  recommendedAngleId: "side",
  recommendedAngleLabel: "Side or 45°",
  recommendationSummary:
    "Side or 45° for most lifts — choose based on the metrics you care about.",
  distance:
    "Far enough that the full stance and implement stay in frame for the whole set.",
  height: "Roughly mid-body height for standing lifts; pad height for bench-like work.",
  mustBeVisible: [
    "Full body (or the working segment) without edge cropping",
    "The implement through the full range",
    "Clear lighting on the athlete",
  ],
  angleOptions: [
    {
      angleId: "side",
      label: "Side",
      bestFor: "Sagittal technique and path cues",
      limitedFor: "Frontal symmetry",
    },
    {
      angleId: "forty_five",
      label: "45°",
      bestFor: "General overview",
      limitedFor: "Any single specialized metric family",
    },
  ],
  visual: {
    cameraAzimuthDeg: 45,
    cameraHeight: "hip",
    cameraDistance: "medium",
    athletePose: "hinge",
  },
  tips: [
    "No single angle captures all metrics — re-film from another view when needed.",
  ],
};
