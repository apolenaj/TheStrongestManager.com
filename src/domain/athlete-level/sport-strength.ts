/**
 * Sport-specific strength classifications — SEPARATE from Athlete Level (Prompt 80).
 * This module documents the boundary; it does not compute Wilks/DOTS elite labels.
 */

export const SPORT_STRENGTH_CLASS_SYSTEMS = [
  "wilks",
  "dots",
  "ipf_gl",
  "weight_class_placing",
] as const;

export type SportStrengthClassSystem =
  (typeof SPORT_STRENGTH_CLASS_SYSTEMS)[number];

/**
 * Athlete Level must not import or substitute these.
 * Strength class bands belong in a future dedicated surface.
 */
export const SPORT_STRENGTH_CLASS_BOUNDARY = [
  "Sport-specific strength classifications measure load relative to bodyweight or federation norms.",
  "Athlete Level measures training behaviors and progress signals — not Wilks/DOTS bands.",
  "An athlete can be Elite on Athlete Level only with competitive evidence + multi-factor scores, independent of any strength-class calculator.",
] as const;

/** Stub — not used by resolveAthleteLevel. */
export type SportStrengthClassification = {
  system: SportStrengthClassSystem;
  /** Free-text band label when a real calculator exists later. */
  bandLabel: string | null;
  note: string;
};

export function sportStrengthClassPlaceholder(
  system: SportStrengthClassSystem,
): SportStrengthClassification {
  return {
    system,
    bandLabel: null,
    note: "Not computed by Athlete Level. Use a dedicated strength-class tool when available.",
  };
}
