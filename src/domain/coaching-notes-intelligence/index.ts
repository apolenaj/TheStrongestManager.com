export {
  COACHING_NOTES_INTELLIGENCE_ENGINE_VERSION,
  COACHING_NOTES_SOURCE,
  COACHING_NOTES_SOURCE_LABELS,
  COACHING_NOTES_INTELLIGENCE_HONESTY,
  COACHING_NOTES_AI_SUMMARY_DISCLAIMER,
  COACHING_NOTES_FORBIDDEN_UNRELATED_USES,
  type CoachingNotesSource,
} from "@/domain/coaching-notes-intelligence/constants";

export type {
  CoachNoteForIntelligence,
  CoachingNoteDisplayItem,
  CoachNotesAiSummaryResult,
} from "@/domain/coaching-notes-intelligence/types";

export {
  notesEligibleForAiSummary,
  notesAllowedForUnrelatedProductUse,
  countPrivateNotesExcluded,
} from "@/domain/coaching-notes-intelligence/privacy";

export {
  assembleCoachNotesAiSummary,
  toCoachNoteDisplayItem,
} from "@/domain/coaching-notes-intelligence/assemble";
