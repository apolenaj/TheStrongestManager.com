/** Weak Point Intelligence — Prompt 60 */

export const WEAK_POINT_ENGINE_VERSION = "weak_point.v1" as const;

export const WEAK_POINT_CATEGORIES = [
  "technical_weakness",
  "strength_weakness",
  "muscular_weakness",
  "programming_weakness",
  "recovery_limitation",
  "consistency_issue",
] as const;

export type WeakPointCategory = (typeof WEAK_POINT_CATEGORIES)[number];

export const WEAK_POINT_CATEGORY_LABELS: Record<WeakPointCategory, string> = {
  technical_weakness: "Technical weakness",
  strength_weakness: "Strength weakness",
  muscular_weakness: "Muscular weakness",
  programming_weakness: "Programming weakness",
  recovery_limitation: "Recovery limitation",
  consistency_issue: "Consistency issue",
};

export const WEAK_POINT_HONESTY = [
  "Weak points require logged evidence — they are never claimed from visual appearance alone.",
  "Muscular weakness is only proposed when lift/log signals support it; photos and “looks weak” are not inputs.",
  "Technical findings use technique-score components (image-plane heuristics), not bar-speed sensors unless those metrics exist.",
  "Confidence stays moderate or lower when sample sizes are thin; missing information is listed explicitly.",
] as const;

/** Component score ≤ this counts as a technical issue (aligned with feedback engine). */
export const WPI_TECHNIQUE_ISSUE_MAX = 55;
/** Lockout “stable” band for floor-vs-lockout contrast. */
export const WPI_LOCKOUT_STABLE_MIN = 75;
/** Minimum completed technique analyses for a multi-film technical claim. */
export const WPI_MIN_TECHNIQUE_ANALYSES = 2;
/** Prefer 3 for the example “3 recent technique analyses”. */
export const WPI_PREFERRED_TECHNIQUE_ANALYSES = 3;
/** Recovery check-ins needed before recovery-limitation claims. */
export const WPI_MIN_RECOVERY_CHECKINS = 3;
/** Sessions in 28d below this (with program) → consistency issue candidate. */
export const WPI_LOW_SESSION_COUNT_28D = 3;
