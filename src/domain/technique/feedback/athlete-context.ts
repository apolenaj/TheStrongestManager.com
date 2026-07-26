import type { TechniqueFeedbackAthleteContext } from "@/domain/technique/feedback/types";
import type { ExperienceLevel } from "@/domain/technique/feedback/types";

function asExperienceLevel(raw: string | null | undefined): ExperienceLevel | null {
  if (
    raw === "beginner" ||
    raw === "intermediate" ||
    raw === "advanced" ||
    raw === "elite"
  ) {
    return raw;
  }
  return null;
}

/**
 * Map profile fields into feedback-engine athlete context.
 * Pain flags = non-empty movement notes (caution), not a clinical diagnosis.
 */
export function buildFeedbackAthleteContext(input: {
  experienceLevel: string | null;
  goalCategory: string | null;
  goalTitle: string | null;
  primaryDiscipline: string | null;
  movementNotes: string | null;
  painCautionAcknowledgedAt: Date | null;
}): TechniqueFeedbackAthleteContext {
  const notes = input.movementNotes?.trim() ?? "";
  return {
    experienceLevel: asExperienceLevel(input.experienceLevel),
    goalCategory: input.goalCategory,
    goalTitle: input.goalTitle,
    primaryDiscipline: input.primaryDiscipline,
    hasPainOrMovementFlags: notes.length > 0,
    painCautionAcknowledged: Boolean(input.painCautionAcknowledgedAt),
  };
}
