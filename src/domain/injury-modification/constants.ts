/**
 * Injury-Modification Architecture (Prompt 130).
 * User-declared training limitations — NOT injury diagnosis.
 */

export const INJURY_MODIFICATION_ENGINE_VERSION =
  "injury_modification.v1" as const;

/** Always surfaced in product copy. */
export const INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER =
  "Follow guidance from a qualified healthcare professional who knows your history. This app does not diagnose injury or disease." as const;

export const INJURY_MODIFICATION_HONESTY = [
  "This records training limitations you declare — it is not an injury diagnosis or medical assessment.",
  INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
  "Suggestions (alternative exercises, reduced range, lower loading) are coaching options you choose — never auto-applied as treatment.",
  "If you have sharp pain, neurological symptoms, or a serious injury, use Pain-Safe Response and seek clinical evaluation.",
] as const;

/** User-selected declaration kinds. */
export const INJURY_DECLARATION_KINDS = [
  "avoid_painful_movement",
  "temporary_restriction",
  "professional_instruction",
] as const;

export type InjuryDeclarationKind = (typeof INJURY_DECLARATION_KINDS)[number];

export const INJURY_DECLARATION_LABELS: Record<InjuryDeclarationKind, string> = {
  avoid_painful_movement: "Avoid painful movement",
  temporary_restriction: "Temporary restriction",
  professional_instruction: "Professional instruction",
};

export const INJURY_DECLARATION_DESCRIPTIONS: Record<
  InjuryDeclarationKind,
  string
> = {
  avoid_painful_movement:
    "You want to skip or swap movements that currently hurt — without claiming a diagnosis.",
  temporary_restriction:
    "A short-term limit on how you train (load, range, or pattern) while you recover capacity.",
  professional_instruction:
    "A clinician or qualified coach gave you specific training instructions to follow.",
};

/** System suggestion kinds — never auto-applied. */
export const INJURY_SUGGESTION_KINDS = [
  "alternative_exercise",
  "reduced_range",
  "lower_loading",
] as const;

export type InjurySuggestionKind = (typeof INJURY_SUGGESTION_KINDS)[number];

export const INJURY_SUGGESTION_LABELS: Record<InjurySuggestionKind, string> = {
  alternative_exercise: "Alternative exercises",
  reduced_range: "Reduced range",
  lower_loading: "Lower loading",
};

export const INJURY_MODIFICATION_STATUSES = ["active", "cleared"] as const;
export type InjuryModificationStatus =
  (typeof INJURY_MODIFICATION_STATUSES)[number];

/** Forbidden product language — never diagnose. */
export const INJURY_MODIFICATION_FORBIDDEN_PHRASES = [
  "you have a tear",
  "you are diagnosed",
  "this is a herniated",
  "you have a fracture",
  "medical diagnosis:",
  "i diagnose",
  "your injury is",
] as const;
