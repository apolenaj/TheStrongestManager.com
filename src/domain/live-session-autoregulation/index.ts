export {
  LIVE_AUTOREG_ENGINE_VERSION,
  LIVE_AUTOREG_HONESTY,
  LIVE_AUTOREG_SIGNIFICANT_RPE_DELTA,
  LIVE_AUTOREG_EXAMPLE,
  LIVE_AUTOREG_SUGGESTION_KINDS,
  LIVE_AUTOREG_SUGGESTION_LABELS,
  LIVE_AUTOREG_LOAD_STEP_KG,
  LIVE_AUTOREG_LARGE_OVERSHOOT,
  LIVE_AUTOREG_FORBIDDEN,
} from "@/domain/live-session-autoregulation/constants";
export type { LiveAutoregSuggestionKind } from "@/domain/live-session-autoregulation/constants";
export type {
  LiveAutoregSetSignal,
  LiveAutoregSuggestion,
  LiveAutoregEvaluation,
  LiveAutoregSnapshot,
} from "@/domain/live-session-autoregulation/types";
export {
  roundAutoregLoadKg,
  proposeReducedNextLoadKg,
  evaluateLiveAutoregulation,
  mayAutoApplyAutoregulation,
} from "@/domain/live-session-autoregulation/evaluate";
export { buildLiveAutoregSnapshot } from "@/domain/live-session-autoregulation/snapshot";
