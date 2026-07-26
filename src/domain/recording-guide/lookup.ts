import {
  DEADLIFT_RECORDING_GUIDE,
  SQUAT_RECORDING_GUIDE,
  BENCH_RECORDING_GUIDE,
  GENERAL_RECORDING_GUIDE,
} from "@/domain/recording-guide/catalog";
import type {
  RecordingGuide,
  RecordingGuideLookup,
} from "@/domain/recording-guide/types";
import type { RecordingGuideLiftKind } from "@/domain/recording-guide/constants";

/**
 * Resolve exercise-specific filming guidance from a catalog slug.
 * Never invents metrics claims — guides are filming defaults with tradeoffs.
 */
export function getRecordingGuide(
  exerciseSlug: string | null | undefined,
): RecordingGuideLookup {
  const slug = (exerciseSlug ?? "").toLowerCase().trim();
  if (!slug) {
    return { guide: GENERAL_RECORDING_GUIDE, matchedSlug: null };
  }
  if (slug.includes("deadlift")) {
    return { guide: DEADLIFT_RECORDING_GUIDE, matchedSlug: slug };
  }
  if (slug.includes("squat")) {
    return { guide: SQUAT_RECORDING_GUIDE, matchedSlug: slug };
  }
  if (slug.includes("bench")) {
    return { guide: BENCH_RECORDING_GUIDE, matchedSlug: slug };
  }
  return { guide: GENERAL_RECORDING_GUIDE, matchedSlug: slug };
}

export function recordingGuideForKind(
  kind: RecordingGuideLiftKind,
): RecordingGuide {
  switch (kind) {
    case "deadlift":
      return DEADLIFT_RECORDING_GUIDE;
    case "squat":
      return SQUAT_RECORDING_GUIDE;
    case "bench":
      return BENCH_RECORDING_GUIDE;
    default:
      return GENERAL_RECORDING_GUIDE;
  }
}
