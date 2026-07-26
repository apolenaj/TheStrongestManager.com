import type { ProgramVersionSource } from "@/domain/program-version/constants";

export type ProgramVersionSnapshotExercise = {
  workoutExerciseId: string;
  workoutId: string;
  exerciseId: string;
  sortOrder: number;
  notes: string | null;
  targetSets: number | null;
  targetReps: string | null;
  targetRpe: number | null;
  targetRir: number | null;
  targetPercent: number | null;
  targetLoadKg: number | null;
  targetTempo: string | null;
  restSeconds: number | null;
};

export type ProgramVersionSnapshotDay = {
  dayIndex: number;
  name: string | null;
  notes: string | null;
  workoutId: string | null;
};

export type ProgramVersionSnapshotWeek = {
  weekNumber: number;
  name: string | null;
  focus: string | null;
  notes: string | null;
  workoutId: string | null;
  days: ProgramVersionSnapshotDay[];
};

export type ProgramVersionSnapshotBlock = {
  blockNumber: number;
  name: string | null;
  focus: string | null;
  notes: string | null;
};

export type ProgramVersionSnapshotRule = {
  ruleKind: string;
  paramsJson: string;
  source: string;
  notes: string | null;
  sortOrder: number;
};

export type ProgramVersionSnapshot = {
  engineVersion: typeof import("@/domain/program-version/constants").PROGRAM_VERSION_ENGINE_VERSION;
  capturedAt: string;
  program: {
    name: string;
    description: string | null;
    status: string;
    kind: string;
  };
  blocks: ProgramVersionSnapshotBlock[];
  weeks: ProgramVersionSnapshotWeek[];
  progressionRules: ProgramVersionSnapshotRule[];
  exercises: ProgramVersionSnapshotExercise[];
};

export type ProgramVersionRecord = {
  id: string;
  programId: string;
  versionNumber: number;
  /** Display label e.g. v1 */
  label: string;
  changedByUserId: string;
  changedByName: string | null;
  reason: string;
  source: ProgramVersionSource;
  restoredFromVersionNumber: number | null;
  createdAt: string;
  snapshot: ProgramVersionSnapshot;
};

export type ProgramVersionRestorePlan = {
  targetVersionNumber: number;
  targetLabel: string;
  /** WorkoutExercise ids that will be updated from the snapshot. */
  mutableExerciseIds: string[];
  /** Completed / locked training sessions that must not be touched. */
  protectedSessionIds: string[];
  protectedSessionCount: number;
};
