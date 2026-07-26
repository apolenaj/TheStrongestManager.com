/** Exercise Prescription Engine — Prompt 59 */

export const EXERCISE_PRESCRIPTION_ENGINE_VERSION =
  "exercise_prescription.v1" as const;

/**
 * A recommendation must accumulate weight from at least this many distinct rules.
 * Prevents single-heuristic auto-prescription.
 */
export const EXERCISE_PRESCRIPTION_MIN_RULE_HITS = 2;

/** Max recommendations returned (excluding nested alternatives). */
export const EXERCISE_PRESCRIPTION_MAX_RESULTS = 5;

export const EXERCISE_PRESCRIPTION_HONESTY = [
  "Recommendations come from multiple transparent rules over the published exercise catalog — not a single heuristic.",
  "Candidates without enough rule support are omitted rather than forced.",
  "Pain and technique flags soft-gate high-skill or high-fatigue picks; this is not a medical diagnosis.",
  "Suggestions never auto-write into your program.",
] as const;

export const WEAK_POINTS = [
  "deadlift_lockout",
  "deadlift_off_floor",
  "squat_strength",
  "bench_press",
  "posterior_chain",
  "upper_back",
  "general_strength",
  "hypertrophy",
  "none",
] as const;

export type WeakPointId = (typeof WEAK_POINTS)[number];

export const WEAK_POINT_LABELS: Record<WeakPointId, string> = {
  deadlift_lockout: "Improve deadlift lockout",
  deadlift_off_floor: "Improve deadlift off the floor",
  squat_strength: "Improve squat strength",
  bench_press: "Improve bench press",
  posterior_chain: "Build posterior chain",
  upper_back: "Build upper back",
  general_strength: "General strength",
  hypertrophy: "Hypertrophy / muscle",
  none: "No specific weak point",
};

export const FATIGUE_LEVELS = ["low", "moderate", "high"] as const;
export type FatigueLevel = (typeof FATIGUE_LEVELS)[number];

export const SKILL_DEMAND_LEVELS = ["low", "moderate", "high"] as const;
export type SkillDemandLevel = (typeof SKILL_DEMAND_LEVELS)[number];
