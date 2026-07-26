import { featureFlags } from "@/config/feature-flags";
import {
  LIVE_ATTEMPT_RESULTS,
  LIVE_ATTEMPT_RESULT_LABELS,
  LIVE_COMPETITION_CAPABILITIES,
  LIVE_COMPETITION_ENGINE_VERSION,
  LIVE_COMPETITION_HONESTY,
  LIVE_COMPETITION_OFFLINE_MUTATIONS,
  LIVE_COMPETITION_OFFLINE_STORAGE_KEY,
  LIVE_COMPETITION_SAFETY_COPY,
  LIVE_COMPETITION_SAFETY_REFUSALS,
  LIVE_MEET_STATUSES,
  LIVE_MEET_STATUS_LABELS,
  LIVE_WARMUP_SLOT_KINDS,
  LIVE_WARMUP_SLOT_LABELS,
} from "@/domain/live-competition-mode/constants";
import type { LiveCompetitionSnapshot } from "@/domain/live-competition-mode/types";

export function isLiveCompetitionArchitectureEnabled(): boolean {
  return featureFlags.liveCompetitionMode;
}

/**
 * Runtime meet-day UI / persistence — stays off until intentionally launched.
 * Architecture can be on while this remains false.
 */
export function isLiveCompetitionRuntimeEnabled(): boolean {
  return (
    featureFlags.liveCompetitionMode &&
    featureFlags.liveCompetitionRuntime
  );
}

export function buildLiveCompetitionSnapshot(
  generatedAt: string = new Date().toISOString(),
): LiveCompetitionSnapshot {
  return {
    engineVersion: LIVE_COMPETITION_ENGINE_VERSION,
    honesty: LIVE_COMPETITION_HONESTY,
    capabilities: LIVE_COMPETITION_CAPABILITIES.map((c) => ({
      id: c.id,
      label: c.label,
      detail: c.detail,
    })),
    meetStatuses: LIVE_MEET_STATUSES.map((id) => ({
      id,
      label: LIVE_MEET_STATUS_LABELS[id],
    })),
    attemptResults: LIVE_ATTEMPT_RESULTS.map((id) => ({
      id,
      label: LIVE_ATTEMPT_RESULT_LABELS[id],
    })),
    warmupSlotKinds: LIVE_WARMUP_SLOT_KINDS.map((id) => ({
      id,
      label: LIVE_WARMUP_SLOT_LABELS[id],
    })),
    safetyRefusals: LIVE_COMPETITION_SAFETY_REFUSALS,
    safetyCopy: LIVE_COMPETITION_SAFETY_COPY,
    offlineMutations: LIVE_COMPETITION_OFFLINE_MUTATIONS,
    offlineStorageKey: LIVE_COMPETITION_OFFLINE_STORAGE_KEY,
    architectureEnabled: isLiveCompetitionArchitectureEnabled(),
    liveRuntimeEnabled: isLiveCompetitionRuntimeEnabled(),
    docPath: "docs/LIVE_COMPETITION_MODE.md",
    relatedPrepDoc: "docs/COMPETITION_MODE.md",
    generatedAt,
  };
}
