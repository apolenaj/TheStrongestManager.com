import {
  LIVE_AUTOREG_ENGINE_VERSION,
  LIVE_AUTOREG_EXAMPLE,
  LIVE_AUTOREG_FORBIDDEN,
  LIVE_AUTOREG_HONESTY,
  LIVE_AUTOREG_SIGNIFICANT_RPE_DELTA,
} from "@/domain/live-session-autoregulation/constants";
import type { LiveAutoregSnapshot } from "@/domain/live-session-autoregulation/types";

export function buildLiveAutoregSnapshot(
  generatedAt: string = new Date().toISOString(),
): LiveAutoregSnapshot {
  return {
    engineVersion: LIVE_AUTOREG_ENGINE_VERSION,
    honesty: LIVE_AUTOREG_HONESTY,
    significantRpeDelta: LIVE_AUTOREG_SIGNIFICANT_RPE_DELTA,
    example: LIVE_AUTOREG_EXAMPLE,
    forbidden: LIVE_AUTOREG_FORBIDDEN,
    docPath: "docs/LIVE_SESSION_AUTOREGULATION.md",
    generatedAt,
  };
}
