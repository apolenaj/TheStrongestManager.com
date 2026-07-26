import {
  TECHNIQUE_TREND_ELIGIBLE_ANGLES,
  TECHNIQUE_TREND_SUPPORTED_ANGLE_PAIRS,
} from "@/domain/technique-trend/constants";

/**
 * Whether two camera angles may be compared in a longitudinal series.
 * Default: exact match among eligible angles only.
 * Cross-angle only when listed in TECHNIQUE_TREND_SUPPORTED_ANGLE_PAIRS.
 */
export function areCameraAnglesComparable(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  const eligible = TECHNIQUE_TREND_ELIGIBLE_ANGLES as readonly string[];
  if (!eligible.includes(a) || !eligible.includes(b)) return false;
  if (a === b) return true;
  return TECHNIQUE_TREND_SUPPORTED_ANGLE_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

/** Series key: exercise + representative angle (exact angle for now). */
export function techniqueTrendSeriesKey(
  exerciseSlug: string,
  cameraAngle: string,
): string {
  return `${exerciseSlug}::${cameraAngle}`;
}
