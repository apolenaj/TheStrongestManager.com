/**
 * Program Version Control service (Prompt 118).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import { isProgramEditable } from "@/domain/programming/guards";
import {
  PROGRAM_VERSION_ENGINE_VERSION,
  formatProgramVersionLabel,
  parseProgramVersionSnapshot,
  planProgramVersionRestore,
  restorePlanProtectsCompletedHistory,
  type ProgramVersionRecord,
  type ProgramVersionSnapshot,
  type ProgramVersionSource,
} from "@/domain/program-version";

function parseSource(raw: string): ProgramVersionSource {
  if (
    raw === "save" ||
    raw === "assign" ||
    raw === "adaptation" ||
    raw === "restore" ||
    raw === "checkpoint"
  ) {
    return raw;
  }
  return "save";
}

async function loadProgramGraph(programId: string) {
  return prisma.program.findFirst({
    where: { id: programId },
    include: {
      blocks: { orderBy: { blockNumber: "asc" } },
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: { days: { orderBy: { dayIndex: "asc" } } },
      },
      progressionRules: {
        where: { workoutExerciseId: null },
        orderBy: { sortOrder: "asc" },
      },
      trainingSessions: {
        select: {
          id: true,
          status: true,
          prescriptionLockedAt: true,
          workoutId: true,
        },
      },
    },
  });
}

async function collectProgramExercises(programId: string) {
  const weeks = await prisma.programWeek.findMany({
    where: { programId },
    include: { days: true },
  });
  const workoutIds = new Set<string>();
  for (const week of weeks) {
    if (week.workoutId) workoutIds.add(week.workoutId);
    for (const day of week.days) {
      if (day.workoutId) workoutIds.add(day.workoutId);
    }
  }

  if (workoutIds.size === 0) return [];

  return prisma.workoutExercise.findMany({
    where: { workoutId: { in: [...workoutIds] } },
    orderBy: [{ workoutId: "asc" }, { sortOrder: "asc" }],
  });
}

export async function buildProgramVersionSnapshot(
  programId: string,
): Promise<
  | { ok: true; snapshot: ProgramVersionSnapshot }
  | { ok: false; error: string }
> {
  const program = await loadProgramGraph(programId);
  if (!program) return { ok: false, error: "Program not found." };

  const exercises = await collectProgramExercises(programId);

  const snapshot: ProgramVersionSnapshot = {
    engineVersion: PROGRAM_VERSION_ENGINE_VERSION,
    capturedAt: new Date().toISOString(),
    program: {
      name: program.name,
      description: program.description,
      status: program.status,
      kind: program.kind,
    },
    blocks: program.blocks.map((b) => ({
      blockNumber: b.blockNumber,
      name: b.name,
      focus: b.focus,
      notes: b.notes,
    })),
    weeks: program.weeks.map((w) => ({
      weekNumber: w.weekNumber,
      name: w.name,
      focus: w.focus,
      notes: w.notes,
      workoutId: w.workoutId,
      days: w.days.map((d) => ({
        dayIndex: d.dayIndex,
        name: d.name,
        notes: d.notes,
        workoutId: d.workoutId,
      })),
    })),
    progressionRules: program.progressionRules.map((r) => ({
      ruleKind: r.ruleKind,
      paramsJson: r.paramsJson,
      source: r.source,
      notes: r.notes,
      sortOrder: r.sortOrder,
    })),
    exercises: exercises.map((ex) => ({
      workoutExerciseId: ex.id,
      workoutId: ex.workoutId,
      exerciseId: ex.exerciseId,
      sortOrder: ex.sortOrder,
      notes: ex.notes,
      targetSets: ex.targetSets,
      targetReps: ex.targetReps,
      targetRpe: ex.targetRpe,
      targetRir: ex.targetRir,
      targetPercent: ex.targetPercent,
      targetLoadKg: ex.targetLoadKg,
      targetTempo: ex.targetTempo,
      restSeconds: ex.restSeconds,
    })),
  };

  return { ok: true, snapshot };
}

/**
 * Create the next version (v1, v2, v3, …) with who / why / date.
 */
export async function createProgramVersion(input: {
  programId: string;
  changedByUserId: string;
  reason: string;
  source?: ProgramVersionSource;
  restoredFromVersionNumber?: number | null;
}): Promise<
  | { ok: true; version: ProgramVersionRecord }
  | { ok: false; error: string }
> {
  if (!featureFlags.programVersionControl) {
    return { ok: false, error: "Program Version Control is not enabled." };
  }

  const reason = input.reason.trim();
  if (!reason) {
    return { ok: false, error: "A reason is required for each version." };
  }

  const program = await prisma.program.findFirst({
    where: { id: input.programId },
    select: { id: true, currentVersionNumber: true },
  });
  if (!program) return { ok: false, error: "Program not found." };

  const built = await buildProgramVersionSnapshot(input.programId);
  if (!built.ok) return built;

  const versionNumber = program.currentVersionNumber + 1;
  const label = formatProgramVersionLabel(versionNumber);
  const source = input.source ?? "save";

  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.programVersion.create({
      data: {
        programId: input.programId,
        versionNumber,
        label,
        changedByUserId: input.changedByUserId,
        reason,
        snapshotJson: JSON.stringify(built.snapshot),
        source,
        restoredFromVersionNumber: input.restoredFromVersionNumber ?? null,
      },
      include: {
        changedBy: { select: { name: true, email: true } },
      },
    });
    await tx.program.update({
      where: { id: input.programId },
      data: { currentVersionNumber: versionNumber },
    });
    return row;
  });

  return {
    ok: true,
    version: {
      id: created.id,
      programId: created.programId,
      versionNumber: created.versionNumber,
      label: created.label ?? label,
      changedByUserId: created.changedByUserId,
      changedByName: created.changedBy.name ?? created.changedBy.email,
      reason: created.reason,
      source: parseSource(created.source),
      restoredFromVersionNumber: created.restoredFromVersionNumber,
      createdAt: created.createdAt.toISOString(),
      snapshot: built.snapshot,
    },
  };
}

export async function listProgramVersions(input: {
  programId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; versions: ProgramVersionRecord[]; currentVersionNumber: number }
  | { ok: false; error: string }
> {
  if (!featureFlags.programVersionControl) {
    return { ok: false, error: "Program Version Control is not enabled." };
  }

  const program = await prisma.program.findFirst({
    where: {
      id: input.programId,
      athleteProfileId: input.athleteProfileId,
    },
    select: { id: true, currentVersionNumber: true },
  });
  if (!program) return { ok: false, error: "Program not found." };

  const rows = await prisma.programVersion.findMany({
    where: { programId: program.id },
    orderBy: { versionNumber: "desc" },
    include: { changedBy: { select: { name: true, email: true } } },
  });

  const versions: ProgramVersionRecord[] = [];
  for (const row of rows) {
    const parsed = parseProgramVersionSnapshot(row.snapshotJson);
    if (!parsed.ok) continue;
    versions.push({
      id: row.id,
      programId: row.programId,
      versionNumber: row.versionNumber,
      label: row.label ?? formatProgramVersionLabel(row.versionNumber),
      changedByUserId: row.changedByUserId,
      changedByName: row.changedBy.name ?? row.changedBy.email,
      reason: row.reason,
      source: parseSource(row.source),
      restoredFromVersionNumber: row.restoredFromVersionNumber,
      createdAt: row.createdAt.toISOString(),
      snapshot: parsed.snapshot,
    });
  }

  return {
    ok: true,
    versions,
    currentVersionNumber: program.currentVersionNumber,
  };
}

/**
 * Restore a prior version into the live editable program.
 * Creates a checkpoint version first, then applies snapshot targets.
 * Never mutates completed / locked TrainingSession ledgers.
 */
export async function restoreProgramVersion(input: {
  programId: string;
  athleteProfileId: string;
  versionNumber: number;
  changedByUserId: string;
  reason: string;
}): Promise<
  | {
      ok: true;
      restoredToLabel: string;
      newVersionNumber: number;
      protectedSessionCount: number;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.programVersionControl) {
    return { ok: false, error: "Program Version Control is not enabled." };
  }

  const reason = input.reason.trim();
  if (!reason) {
    return { ok: false, error: "A restore reason is required." };
  }

  const program = await loadProgramGraph(input.programId);
  if (!program || program.athleteProfileId !== input.athleteProfileId) {
    return { ok: false, error: "Program not found." };
  }
  if (!isProgramEditable(program.status)) {
    return {
      ok: false,
      error: "Only draft/active programs can be restored.",
    };
  }

  const target = await prisma.programVersion.findUnique({
    where: {
      programId_versionNumber: {
        programId: input.programId,
        versionNumber: input.versionNumber,
      },
    },
  });
  if (!target) return { ok: false, error: "Version not found." };

  const parsed = parseProgramVersionSnapshot(target.snapshotJson);
  if (!parsed.ok) return parsed;

  const liveExercises = await collectProgramExercises(input.programId);
  const plan = planProgramVersionRestore({
    targetVersionNumber: target.versionNumber,
    snapshot: parsed.snapshot,
    sessions: program.trainingSessions,
    liveExerciseIds: liveExercises.map((e) => e.id),
  });

  // Checkpoint current state before restore
  const checkpoint = await createProgramVersion({
    programId: input.programId,
    changedByUserId: input.changedByUserId,
    reason: `Checkpoint before restore to ${plan.targetLabel}`,
    source: "checkpoint",
  });
  if (!checkpoint.ok) return checkpoint;

  const mutableSet = new Set(plan.mutableExerciseIds);
  const byId = new Map(
    parsed.snapshot.exercises.map((ex) => [ex.workoutExerciseId, ex]),
  );

  // Mutation list for session ledgers must stay empty (hard protection).
  const sessionMutations: string[] = [];
  if (!restorePlanProtectsCompletedHistory(plan, sessionMutations)) {
    return {
      ok: false,
      error: "Restore aborted — would touch protected completed history.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.program.update({
      where: { id: input.programId },
      data: {
        name: parsed.snapshot.program.name,
        description: parsed.snapshot.program.description,
      },
    });

    for (const exerciseId of plan.mutableExerciseIds) {
      const snap = byId.get(exerciseId);
      if (!snap || !mutableSet.has(exerciseId)) continue;
      await tx.workoutExercise.update({
        where: { id: exerciseId },
        data: {
          notes: snap.notes,
          targetSets: snap.targetSets,
          targetReps: snap.targetReps,
          targetRpe: snap.targetRpe,
          targetRir: snap.targetRir,
          targetPercent: snap.targetPercent,
          targetLoadKg: snap.targetLoadKg,
          targetTempo: snap.targetTempo,
          restSeconds: snap.restSeconds,
          sortOrder: snap.sortOrder,
        },
      });
    }

    // Explicitly do not touch TrainingSession / SessionExercise / SessionSet.
  });

  const restored = await createProgramVersion({
    programId: input.programId,
    changedByUserId: input.changedByUserId,
    reason,
    source: "restore",
    restoredFromVersionNumber: target.versionNumber,
  });
  if (!restored.ok) return restored;

  return {
    ok: true,
    restoredToLabel: plan.targetLabel,
    newVersionNumber: restored.version.versionNumber,
    protectedSessionCount: plan.protectedSessionCount,
  };
}
