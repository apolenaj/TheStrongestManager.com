/**
 * Lift Phase Analysis — Prompt 61
 * Phase IDs and reliability gates. Only emit phases when detection is honest.
 */

import type { MovementPhaseId } from "@/domain/movement/types";

/** Bump when phase ID set or segmentation contract changes. */
export const LIFT_PHASE_ANALYSIS_VERSION = "lift_phase.v1" as const;

/**
 * Deadlift primary timeline (Prompt 61).
 * `pull` retained for legacy stored reports / fallback when knee split is unreliable.
 * `descent` is optional post-rep and may appear after lockout.
 */
export const DEADLIFT_PRIMARY_PHASES = [
  "setup",
  "initial_pull",
  "knee_level",
  "lockout",
] as const satisfies readonly MovementPhaseId[];

/** Phases that count as the rising pull for metrics / Technique Score. */
export const DEADLIFT_PULL_SCOPE_PHASES = [
  "pull",
  "initial_pull",
  "knee_level",
] as const satisfies readonly MovementPhaseId[];

/** Catalogued squat phases — detector not enabled until reliable. */
export const SQUAT_PHASE_CATALOG = [
  "setup",
  "descent",
  "bottom",
  "sticking_region",
  "lockout",
] as const satisfies readonly MovementPhaseId[];

/** Catalogued bench phases — detector not enabled until reliable. */
export const BENCH_PHASE_CATALOG = [
  "setup",
  "descent",
  "touch",
  "initial_press",
  "mid_range",
  "lockout",
] as const satisfies readonly MovementPhaseId[];

export const LIFT_PHASE_LABELS: Record<MovementPhaseId, string> = {
  setup: "Setup",
  initial_pull: "Initial pull",
  knee_level: "Knee level",
  pull: "Pull",
  lockout: "Lockout",
  descent: "Descent",
  bottom: "Bottom",
  sticking_region: "Sticking region",
  touch: "Touch",
  initial_press: "Initial press",
  mid_range: "Mid-range",
  unknown: "Unknown",
};

/** Minimum knee landmark coverage (fraction of rising frames) to attempt knee_level. */
export const KNEE_LEVEL_MIN_COVERAGE = 0.45;
/** Frames around the knee-crossing used for the knee_level window. */
export const KNEE_LEVEL_WINDOW_RADIUS = 1;
/** Absolute |wrist.y − knee.y| band to accept a knee crossing (normalized image). */
export const KNEE_CROSSING_TOLERANCE = 0.06;

export const LIFT_PHASE_HONESTY = [
  "Phases are image-plane segmentation from pose landmarks — not a biomechanical force model.",
  "Knee-level is only emitted when knees and a wrist/bar proxy are visible enough to cross honestly.",
  "Squat and bench phase timelines are catalogued but not detected until segmentation is reliable.",
  "Click a phase for the video frame, a related metric, any issue, and a recommendation — never invented scores.",
] as const;

export function isDeadliftPullScopePhase(phase: MovementPhaseId): boolean {
  return (DEADLIFT_PULL_SCOPE_PHASES as readonly string[]).includes(phase);
}
