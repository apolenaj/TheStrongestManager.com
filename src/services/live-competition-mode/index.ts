import {
  buildLiveCompetitionSnapshot,
  isLiveCompetitionRuntimeEnabled,
  type LiveCompetitionSnapshot,
} from "@/domain/live-competition-mode";

export function getLiveCompetitionSnapshot(): LiveCompetitionSnapshot {
  return buildLiveCompetitionSnapshot();
}

/**
 * Meet-day runtime is not launched — always empty / blocked until the
 * liveCompetitionRuntime flag is intentionally enabled and persistence ships.
 */
export function getLiveCompetitionMeetDay(): {
  runtimeEnabled: boolean;
  session: null;
  honesty: string;
} {
  return {
    runtimeEnabled: isLiveCompetitionRuntimeEnabled(),
    session: null,
    honesty: isLiveCompetitionRuntimeEnabled()
      ? "Runtime flag is on, but meet-day persistence is not shipped yet — no invented session."
      : "Live Competition Mode is architecture-only. Meet-day tracking is not launched.",
  };
}
