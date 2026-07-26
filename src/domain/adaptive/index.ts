export {
  ADAPTIVE_ENGINE_VERSION,
  ADAPTATION_CHANGE_KINDS,
  ADAPTATION_STATUSES,
  ADAPTATION_CONFIDENCE_LEVELS,
  ADAPTATION_EVENT_TYPES,
} from "@/domain/adaptive/constants";
export type {
  AdaptationChangeKind,
  AdaptationStatus,
  AdaptationConfidence,
  AdaptationEventType,
} from "@/domain/adaptive/constants";
export {
  proposeAdaptation,
  previewAdaptedPrescription,
} from "@/domain/adaptive/engine";
export type {
  AdaptationSignals,
  AdaptationParams,
  AdaptationSuggestion,
} from "@/domain/adaptive/engine";
