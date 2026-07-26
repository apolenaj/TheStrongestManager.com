/**
 * Validate Program Builder 2.0 inputs.
 */

import {
  FIT_DAYS,
  FIT_EQUIPMENT,
  FIT_EXPERIENCE,
  FIT_GOALS,
  FIT_SESSION,
} from "@/domain/fit/types";
import {
  PROGRAM_BUILDER_MAX_PRIORITY_LIFTS,
  PROGRAM_BUILDER_PRIORITY_LIFTS,
  type ProgramBuilderPriorityLift,
} from "@/domain/program-builder/constants";
import type { ProgramBuilderInputs } from "@/domain/program-builder/types";

function isPriorityLift(raw: string): raw is ProgramBuilderPriorityLift {
  return (PROGRAM_BUILDER_PRIORITY_LIFTS as readonly string[]).includes(raw);
}

export function validateProgramBuilderInputs(
  raw: Partial<ProgramBuilderInputs> & {
    priorityLifts?: string[];
  },
):
  | { ok: true; inputs: ProgramBuilderInputs }
  | { ok: false; error: string } {
  if (!raw.goal || !(FIT_GOALS as readonly string[]).includes(raw.goal)) {
    return { ok: false, error: "Choose a valid goal." };
  }
  if (!raw.days || !(FIT_DAYS as readonly string[]).includes(raw.days)) {
    return { ok: false, error: "Choose training days per week (2–6)." };
  }
  if (!raw.session || !(FIT_SESSION as readonly string[]).includes(raw.session)) {
    return { ok: false, error: "Choose a session duration." };
  }
  if (
    !raw.equipment ||
    !(FIT_EQUIPMENT as readonly string[]).includes(raw.equipment)
  ) {
    return { ok: false, error: "Choose available equipment." };
  }
  if (
    !raw.experience ||
    !(FIT_EXPERIENCE as readonly string[]).includes(raw.experience)
  ) {
    return { ok: false, error: "Choose an experience level." };
  }

  const lifts = (raw.priorityLifts ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  if (lifts.length === 0) {
    return { ok: false, error: "Select at least one priority lift." };
  }
  if (lifts.length > PROGRAM_BUILDER_MAX_PRIORITY_LIFTS) {
    return {
      ok: false,
      error: `Select at most ${PROGRAM_BUILDER_MAX_PRIORITY_LIFTS} priority lifts.`,
    };
  }
  for (const lift of lifts) {
    if (!isPriorityLift(lift)) {
      return {
        ok: false,
        error: `Unknown priority lift “${lift}” — catalog options only.`,
      };
    }
  }

  // Minimal equipment cannot honestly claim barbell competition lifts as primary.
  if (raw.equipment === "minimal") {
    const barbellOnly = lifts.filter(
      (l) =>
        l === "back-squat" ||
        l === "front-squat" ||
        l === "bench-press" ||
        l === "deadlift" ||
        l === "barbell-row" ||
        l === "overhead-press" ||
        l === "romanian-deadlift",
    );
    if (barbellOnly.length > 0) {
      return {
        ok: false,
        error:
          "Minimal equipment cannot host barbell priority lifts — choose home_barbell / full_gym or different priorities.",
      };
    }
  }

  return {
    ok: true,
    inputs: {
      goal: raw.goal,
      days: raw.days,
      session: raw.session,
      equipment: raw.equipment,
      experience: raw.experience,
      priorityLifts: lifts as ProgramBuilderPriorityLift[],
    },
  };
}
