import type { AthleteState } from "@/domain/performance-intelligence";
import {
  buildFreshnessSnapshot,
  type FreshnessSnapshot,
} from "@/domain/data-freshness";

/**
 * Rebuild a FreshnessSnapshot from assembled AthleteState pillars.
 * Prefer this over recomputing from Prisma in presentational UI.
 */
export function freshnessSnapshotFromAthleteState(
  state: AthleteState,
): FreshnessSnapshot {
  const value = state.dataFreshness.value;
  const now = state.computedAt;
  if (!value) {
    return buildFreshnessSnapshot([], now);
  }
  return buildFreshnessSnapshot(
    [
      ...(value.pillars.technique.lastAt
        ? [
            {
              kind: "technique_analysis",
              at: value.pillars.technique.lastAt,
            },
          ]
        : []),
      ...(value.pillars.recovery.lastAt
        ? [{ kind: "recovery_checkin", at: value.pillars.recovery.lastAt }]
        : []),
      ...(value.pillars.strength.lastAt
        ? [{ kind: "lift_log", at: value.pillars.strength.lastAt }]
        : []),
      ...(value.newestSignalAt
        ? [
            {
              kind: value.newestSignalKind ?? "training_session",
              at: value.newestSignalAt,
            },
          ]
        : []),
    ],
    now,
  );
}
