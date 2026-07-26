/**
 * Structured volume tables for Program Builder 2.0.
 * Volume comes from these rows — never Math.random or free-form AI.
 */

import type { FitExperience, FitGoal, FitSession } from "@/domain/fit/types";
import { PROGRAM_BUILDER_VOLUME_TABLE_ID } from "@/domain/program-builder/constants";

export type VolumeTableRow = {
  goal: FitGoal | "*";
  experience: FitExperience;
  session: FitSession;
  /** Weekly hard-set budget across the whole plan (validation ceiling). */
  weeklyHardSetBudget: number;
  /** Sets per priority lift appearance (per session). */
  prioritySetsPerSession: number;
  /** Rep prescription for priority lifts. */
  priorityReps: string;
  priorityRpe: number;
  /** Accessory slots per training day. */
  accessoriesPerDay: number;
  accessorySets: number;
  accessoryReps: string;
  accessoryRpe: number;
  /** Weeks between deload weeks in the draft skeleton. */
  deloadEveryWeeks: number;
};

/**
 * Lookup table — first matching row wins (specific goal before "*").
 */
export const PROGRAM_BUILDER_VOLUME_TABLE: readonly VolumeTableRow[] = [
  // Beginner
  {
    goal: "*",
    experience: "beginner",
    session: "short",
    weeklyHardSetBudget: 28,
    prioritySetsPerSession: 3,
    priorityReps: "5",
    priorityRpe: 7,
    accessoriesPerDay: 1,
    accessorySets: 2,
    accessoryReps: "8-12",
    accessoryRpe: 7,
    deloadEveryWeeks: 6,
  },
  {
    goal: "*",
    experience: "beginner",
    session: "medium",
    weeklyHardSetBudget: 36,
    prioritySetsPerSession: 3,
    priorityReps: "5",
    priorityRpe: 7,
    accessoriesPerDay: 2,
    accessorySets: 2,
    accessoryReps: "8-12",
    accessoryRpe: 7,
    deloadEveryWeeks: 6,
  },
  {
    goal: "*",
    experience: "beginner",
    session: "long",
    weeklyHardSetBudget: 40,
    prioritySetsPerSession: 4,
    priorityReps: "5",
    priorityRpe: 7,
    accessoriesPerDay: 2,
    accessorySets: 3,
    accessoryReps: "8-12",
    accessoryRpe: 7,
    deloadEveryWeeks: 6,
  },
  // Intermediate
  {
    goal: "hypertrophy",
    experience: "intermediate",
    session: "short",
    weeklyHardSetBudget: 40,
    prioritySetsPerSession: 3,
    priorityReps: "6-10",
    priorityRpe: 8,
    accessoriesPerDay: 2,
    accessorySets: 3,
    accessoryReps: "8-15",
    accessoryRpe: 8,
    deloadEveryWeeks: 5,
  },
  {
    goal: "hypertrophy",
    experience: "intermediate",
    session: "medium",
    weeklyHardSetBudget: 52,
    prioritySetsPerSession: 4,
    priorityReps: "6-10",
    priorityRpe: 8,
    accessoriesPerDay: 3,
    accessorySets: 3,
    accessoryReps: "8-15",
    accessoryRpe: 8,
    deloadEveryWeeks: 5,
  },
  {
    goal: "hypertrophy",
    experience: "intermediate",
    session: "long",
    weeklyHardSetBudget: 60,
    prioritySetsPerSession: 4,
    priorityReps: "6-10",
    priorityRpe: 8,
    accessoriesPerDay: 3,
    accessorySets: 3,
    accessoryReps: "8-15",
    accessoryRpe: 8,
    deloadEveryWeeks: 5,
  },
  {
    goal: "*",
    experience: "intermediate",
    session: "short",
    weeklyHardSetBudget: 36,
    prioritySetsPerSession: 3,
    priorityReps: "3-5",
    priorityRpe: 8,
    accessoriesPerDay: 1,
    accessorySets: 2,
    accessoryReps: "6-10",
    accessoryRpe: 7,
    deloadEveryWeeks: 5,
  },
  {
    goal: "*",
    experience: "intermediate",
    session: "medium",
    weeklyHardSetBudget: 48,
    prioritySetsPerSession: 4,
    priorityReps: "3-5",
    priorityRpe: 8,
    accessoriesPerDay: 2,
    accessorySets: 3,
    accessoryReps: "6-10",
    accessoryRpe: 7,
    deloadEveryWeeks: 5,
  },
  {
    goal: "*",
    experience: "intermediate",
    session: "long",
    weeklyHardSetBudget: 56,
    prioritySetsPerSession: 4,
    priorityReps: "3-5",
    priorityRpe: 8,
    accessoriesPerDay: 3,
    accessorySets: 3,
    accessoryReps: "6-10",
    accessoryRpe: 7,
    deloadEveryWeeks: 5,
  },
  // Advanced
  {
    goal: "hypertrophy",
    experience: "advanced",
    session: "short",
    weeklyHardSetBudget: 48,
    prioritySetsPerSession: 3,
    priorityReps: "6-10",
    priorityRpe: 8,
    accessoriesPerDay: 2,
    accessorySets: 3,
    accessoryReps: "8-15",
    accessoryRpe: 8,
    deloadEveryWeeks: 4,
  },
  {
    goal: "hypertrophy",
    experience: "advanced",
    session: "medium",
    weeklyHardSetBudget: 64,
    prioritySetsPerSession: 4,
    priorityReps: "6-10",
    priorityRpe: 8,
    accessoriesPerDay: 3,
    accessorySets: 3,
    accessoryReps: "8-15",
    accessoryRpe: 8,
    deloadEveryWeeks: 4,
  },
  {
    goal: "hypertrophy",
    experience: "advanced",
    session: "long",
    weeklyHardSetBudget: 72,
    prioritySetsPerSession: 4,
    priorityReps: "6-12",
    priorityRpe: 8,
    accessoriesPerDay: 4,
    accessorySets: 3,
    accessoryReps: "8-15",
    accessoryRpe: 8,
    deloadEveryWeeks: 4,
  },
  {
    goal: "*",
    experience: "advanced",
    session: "short",
    weeklyHardSetBudget: 44,
    prioritySetsPerSession: 3,
    priorityReps: "1-5",
    priorityRpe: 8,
    accessoriesPerDay: 2,
    accessorySets: 2,
    accessoryReps: "5-8",
    accessoryRpe: 7,
    deloadEveryWeeks: 4,
  },
  {
    goal: "*",
    experience: "advanced",
    session: "medium",
    weeklyHardSetBudget: 56,
    prioritySetsPerSession: 4,
    priorityReps: "1-5",
    priorityRpe: 8,
    accessoriesPerDay: 2,
    accessorySets: 3,
    accessoryReps: "5-8",
    accessoryRpe: 7,
    deloadEveryWeeks: 4,
  },
  {
    goal: "*",
    experience: "advanced",
    session: "long",
    weeklyHardSetBudget: 68,
    prioritySetsPerSession: 5,
    priorityReps: "1-5",
    priorityRpe: 8,
    accessoriesPerDay: 3,
    accessorySets: 3,
    accessoryReps: "5-8",
    accessoryRpe: 7,
    deloadEveryWeeks: 4,
  },
] as const;

export function lookupVolumeTable(input: {
  goal: FitGoal;
  experience: FitExperience;
  session: FitSession;
}): VolumeTableRow {
  const specific = PROGRAM_BUILDER_VOLUME_TABLE.find(
    (row) =>
      row.goal === input.goal &&
      row.experience === input.experience &&
      row.session === input.session,
  );
  if (specific) return specific;

  const wildcard = PROGRAM_BUILDER_VOLUME_TABLE.find(
    (row) =>
      row.goal === "*" &&
      row.experience === input.experience &&
      row.session === input.session,
  );
  if (wildcard) return wildcard;

  // Deterministic fallback — still table-shaped, never random.
  return {
    goal: "*",
    experience: input.experience,
    session: input.session,
    weeklyHardSetBudget: 40,
    prioritySetsPerSession: 3,
    priorityReps: "5",
    priorityRpe: 7,
    accessoriesPerDay: 2,
    accessorySets: 2,
    accessoryReps: "8-12",
    accessoryRpe: 7,
    deloadEveryWeeks: 5,
  };
}

export function volumeTableId(): string {
  return PROGRAM_BUILDER_VOLUME_TABLE_ID;
}
