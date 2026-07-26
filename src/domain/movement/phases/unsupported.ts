import type { MovementPhaseSegment } from "@/domain/movement/types";
import {
  BENCH_PHASE_CATALOG,
  LIFT_PHASE_LABELS,
  SQUAT_PHASE_CATALOG,
} from "@/domain/movement/phases/constants";

/**
 * Squat / bench phase detectors are intentionally not implemented.
 * Callers must not invent phase timelines — use these helpers for honest UX copy.
 */

export function squatPhasesImplemented(): boolean {
  return false;
}

export function benchPhasesImplemented(): boolean {
  return false;
}

export function squatPhaseCatalogLabels(): string[] {
  return SQUAT_PHASE_CATALOG.map((id) => LIFT_PHASE_LABELS[id]);
}

export function benchPhaseCatalogLabels(): string[] {
  return BENCH_PHASE_CATALOG.map((id) => LIFT_PHASE_LABELS[id]);
}

/** Always empty — detection not reliable yet. */
export function detectSquatPhases(): MovementPhaseSegment[] {
  return [];
}

/** Always empty — detection not reliable yet. */
export function detectBenchPhases(): MovementPhaseSegment[] {
  return [];
}
