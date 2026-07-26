/**
 * User edits for Program Builder drafts.
 * Set counts stay within table-safe bounds — never invent random volume.
 */

import {
  PROGRAM_BUILDER_SET_MAX,
  PROGRAM_BUILDER_SET_MIN,
} from "@/domain/program-builder/constants";
import type {
  ProgramBuilderDraft,
  ProgramBuilderExerciseEdit,
} from "@/domain/program-builder/types";

function clampSets(value: number): number {
  return Math.max(
    PROGRAM_BUILDER_SET_MIN,
    Math.min(PROGRAM_BUILDER_SET_MAX, Math.round(value)),
  );
}

/**
 * Apply athlete edits to a draft. autoApply remains false.
 */
export function editProgramBuilderDraft(
  draft: ProgramBuilderDraft,
  edits: ProgramBuilderExerciseEdit[],
):
  | { ok: true; draft: ProgramBuilderDraft }
  | { ok: false; error: string } {
  if (edits.length === 0) {
    return { ok: false, error: "No edits provided." };
  }

  const weeks = draft.weeks.map((week) => ({
    ...week,
    days: week.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => ({ ...ex })),
    })),
  }));

  for (const edit of edits) {
    let found = false;
    for (const week of weeks) {
      const day = week.days.find((d) => d.dayIndex === edit.dayIndex);
      if (!day) continue;
      const exercise = day.exercises.find((e) => e.slug === edit.exerciseSlug);
      if (!exercise) continue;
      found = true;
      if (edit.targetSets != null) {
        if (!Number.isFinite(edit.targetSets)) {
          return { ok: false, error: "targetSets must be a number." };
        }
        exercise.targetSets = clampSets(edit.targetSets);
        exercise.whyChosen = `${exercise.whyChosen} (sets edited by athlete; clamped to ${PROGRAM_BUILDER_SET_MIN}–${PROGRAM_BUILDER_SET_MAX}, not random AI volume.)`;
      }
      if (edit.targetReps != null) {
        const reps = edit.targetReps.trim();
        if (!reps) {
          return { ok: false, error: "targetReps cannot be blank." };
        }
        exercise.targetReps = reps.slice(0, 24);
      }
    }
    if (!found) {
      return {
        ok: false,
        error: `Exercise “${edit.exerciseSlug}” not found on day ${edit.dayIndex}.`,
      };
    }
  }

  const weeklyHardSetsPlanned = weeks[0]
    ? weeks[0].days.reduce(
        (sum, day) =>
          sum + day.exercises.reduce((s, ex) => s + ex.targetSets, 0),
        0,
      )
    : draft.volumeSource.weeklyHardSetsPlanned;

  return {
    ok: true,
    draft: {
      ...draft,
      status: "user_edited",
      autoApply: false,
      weeks,
      volumeSource: {
        ...draft.volumeSource,
        weeklyHardSetsPlanned,
      },
    },
  };
}
