export {
  INJURY_MODIFICATION_ENGINE_VERSION,
  INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
  INJURY_MODIFICATION_HONESTY,
  INJURY_DECLARATION_KINDS,
  INJURY_DECLARATION_LABELS,
  INJURY_DECLARATION_DESCRIPTIONS,
  INJURY_SUGGESTION_KINDS,
  INJURY_SUGGESTION_LABELS,
  INJURY_MODIFICATION_STATUSES,
  INJURY_MODIFICATION_FORBIDDEN_PHRASES,
  type InjuryDeclarationKind,
  type InjurySuggestionKind,
  type InjuryModificationStatus,
} from "@/domain/injury-modification/constants";

export type {
  InjuryModificationRecord,
  InjuryModificationSuggestion,
  InjuryModificationPlan,
} from "@/domain/injury-modification/types";

export {
  resolveInjuryModificationPlan,
  injuryModificationPrefersLowerLoading,
  injuryModificationAdaptationHold,
  isInjuryDeclarationKind,
} from "@/domain/injury-modification/resolve";
