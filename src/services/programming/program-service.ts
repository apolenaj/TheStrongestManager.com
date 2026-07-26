import { prisma } from "@/lib/db";
import {
  assertProgramKind,
  isProgramEditable,
  isSessionPrescriptionLocked,
  validateProgramOwnership,
} from "@/domain/programming/guards";
import { featureFlags } from "@/config/feature-flags";

/**
 * Clone a library program template into an editable athlete program.
 * Templates remain unchanged; the clone is a separate graph.
 */
export async function assignProgramTemplateToAthlete(input: {
  templateProgramId: string;
  athleteProfileId: string;
  name?: string;
  /** When set, creates program version v1 (Prompt 118). */
  changedByUserId?: string;
}): Promise<{ ok: true; programId: string } | { ok: false; error: string }> {
  const template = await prisma.program.findFirst({
    where: { id: input.templateProgramId },
    include: {
      blocks: { orderBy: { blockNumber: "asc" } },
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          days: { orderBy: { dayIndex: "asc" } },
        },
      },
      progressionRules: true,
    },
  });

  if (!template) {
    return { ok: false, error: "Template program not found." };
  }

  const kind = assertProgramKind(template.kind);
  if (kind !== "template") {
    return {
      ok: false,
      error: "Only programs with kind=template can be assigned as templates.",
    };
  }

  const ownership = validateProgramOwnership({
    kind: "athlete",
    athleteProfileId: input.athleteProfileId,
  });
  if (!ownership.ok) return ownership;

  const athlete = await prisma.athleteProfile.findUnique({
    where: { id: input.athleteProfileId },
    select: { userId: true },
  });
  if (!athlete) {
    return { ok: false, error: "Athlete profile not found." };
  }

  const activeCount = await prisma.program.count({
    where: {
      athleteProfileId: input.athleteProfileId,
      kind: "athlete",
      status: { in: ["active", "draft"] },
    },
  });
  const { canConsumeFeatureSlot, formatEntitlementDenial } = await import(
    "@/services/entitlements/entitlement-service"
  );
  const programGate = await canConsumeFeatureSlot(
    athlete.userId,
    "programs",
    activeCount,
  );
  if (!programGate.ok) {
    return { ok: false, error: formatEntitlementDenial(programGate) };
  }

  const created = await prisma.$transaction(async (tx) => {
    const program = await tx.program.create({
      data: {
        kind: "athlete",
        athleteProfileId: input.athleteProfileId,
        sourceTemplateId: template.id,
        name: input.name ?? template.name,
        description: template.description,
        status: "draft",
        startDate: null,
        endDate: null,
      },
    });

    const blockIdMap = new Map<string, string>();
    for (const block of template.blocks) {
      const createdBlock = await tx.programBlock.create({
        data: {
          programId: program.id,
          blockNumber: block.blockNumber,
          name: block.name,
          focus: block.focus,
          notes: block.notes,
          startDate: block.startDate,
          endDate: block.endDate,
        },
      });
      blockIdMap.set(block.id, createdBlock.id);
    }

    const weekIdMap = new Map<string, string>();
    for (const week of template.weeks) {
      const createdWeek = await tx.programWeek.create({
        data: {
          programId: program.id,
          blockId: week.blockId ? blockIdMap.get(week.blockId) ?? null : null,
          weekNumber: week.weekNumber,
          name: week.name,
          focus: week.focus,
          notes: week.notes,
          workoutId: week.workoutId,
        },
      });
      weekIdMap.set(week.id, createdWeek.id);

      for (const day of week.days) {
        await tx.programDay.create({
          data: {
            programWeekId: createdWeek.id,
            dayIndex: day.dayIndex,
            name: day.name,
            notes: day.notes,
            workoutId: day.workoutId,
          },
        });
      }
    }

    for (const rule of template.progressionRules) {
      if (rule.workoutExerciseId) continue; // exercise-scoped rules clone with workouts later
      await tx.progressionRule.create({
        data: {
          programId: program.id,
          ruleKind: rule.ruleKind,
          paramsJson: rule.paramsJson,
          source: rule.source,
          notes: rule.notes,
          sortOrder: rule.sortOrder,
        },
      });
    }

    return program;
  });

  if (input.changedByUserId && featureFlags.programVersionControl) {
    const { createProgramVersion } = await import(
      "@/services/program-version"
    );
    await createProgramVersion({
      programId: created.id,
      changedByUserId: input.changedByUserId,
      reason: "Initial assignment from template",
      source: "assign",
    });
  }

  return { ok: true, programId: created.id };
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Copy workout prescription into SessionExercise / SessionSet when the ledger is empty.
 * Does not complete or lock the session — safe to call when starting a live workout.
 * Never invents loads/reps; null prescribed fields stay null.
 */
export async function snapshotSessionPrescription(input: {
  trainingSessionId: string;
  athleteProfileId: string;
  /** When true, wipe empty ledgers and rebuild (never used once sets are logged). */
  forceRebuild?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await prisma.trainingSession.findFirst({
    where: {
      id: input.trainingSessionId,
      athleteProfileId: input.athleteProfileId,
    },
    include: {
      workout: {
        include: {
          workoutExercises: {
            orderBy: { sortOrder: "asc" },
            include: {
              exercise: { select: { id: true, name: true } },
              workoutSets: { orderBy: { setNumber: "asc" } },
            },
          },
        },
      },
      sessionExercises: {
        select: {
          id: true,
          sessionSets: {
            select: {
              id: true,
              performedReps: true,
              performedLoadKg: true,
              completedAt: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return { ok: false, error: "Training session not found." };
  }

  if (isSessionPrescriptionLocked(session)) {
    return { ok: false, error: "Session prescription is already locked." };
  }

  const hasLoggedWork = session.sessionExercises.some((line) =>
    line.sessionSets.some(
      (set) =>
        set.completedAt != null ||
        set.performedReps != null ||
        set.performedLoadKg != null,
    ),
  );

  if (session.sessionExercises.length > 0 && !input.forceRebuild) {
    return { ok: true };
  }

  if (hasLoggedWork) {
    return {
      ok: false,
      error: "Cannot rebuild prescription after sets have been logged.",
    };
  }

  if (!session.workout) {
    await prisma.trainingSession.update({
      where: { id: session.id },
      data: {
        workoutNameSnapshot: session.workoutNameSnapshot ?? "Ad-hoc session",
      },
    });
    return { ok: true };
  }

  await prisma.$transaction(async (tx) => {
    await writePrescriptionSnapshot(tx, session.id, session.workout!);
    await tx.trainingSession.update({
      where: { id: session.id },
      data: { workoutNameSnapshot: session.workout!.name },
    });
  });

  return { ok: true };
}

async function writePrescriptionSnapshot(
  tx: Tx,
  trainingSessionId: string,
  workout: {
    name: string;
    workoutExercises: Array<{
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
      exercise: { id: string; name: string };
      workoutSets: Array<{
        setNumber: number;
        setType: string;
        targetReps: number | null;
        targetLoadKg: number | null;
        targetWeight: number | null;
        targetPercent: number | null;
        targetRpe: number | null;
        targetRir: number | null;
        targetTempo: string | null;
        restSeconds: number | null;
      }>;
    }>;
  },
) {
  await tx.sessionExercise.deleteMany({
    where: { trainingSessionId },
  });

  for (const line of workout.workoutExercises) {
    const sessionExercise = await tx.sessionExercise.create({
      data: {
        trainingSessionId,
        exerciseId: line.exerciseId,
        sortOrder: line.sortOrder,
        exerciseNameSnapshot: line.exercise.name,
        notes: line.notes,
        prescribedSets: line.targetSets,
        prescribedReps: line.targetReps,
        prescribedRpe: line.targetRpe,
        prescribedRir: line.targetRir,
        prescribedPercent: line.targetPercent,
        prescribedLoadKg: line.targetLoadKg,
        prescribedTempo: line.targetTempo,
        prescribedRestSeconds: line.restSeconds,
      },
    });

    if (line.workoutSets.length > 0) {
      await tx.sessionSet.createMany({
        data: line.workoutSets.map((set) => ({
          sessionExerciseId: sessionExercise.id,
          setNumber: set.setNumber,
          setType: set.setType,
          prescribedReps: set.targetReps,
          prescribedLoadKg: set.targetLoadKg ?? set.targetWeight,
          prescribedPercent: set.targetPercent,
          prescribedRpe: set.targetRpe,
          prescribedRir: set.targetRir,
          prescribedTempo: set.targetTempo,
          prescribedRestSeconds: set.restSeconds,
          source: "reported",
        })),
      });
    } else if (line.targetSets && line.targetSets > 0) {
      await tx.sessionSet.createMany({
        data: Array.from({ length: line.targetSets }, (_, index) => ({
          sessionExerciseId: sessionExercise.id,
          setNumber: index + 1,
          setType: "work",
          prescribedReps: null,
          prescribedLoadKg: line.targetLoadKg,
          prescribedPercent: line.targetPercent,
          prescribedRpe: line.targetRpe,
          prescribedRir: line.targetRir,
          prescribedTempo: line.targetTempo,
          prescribedRestSeconds: line.restSeconds,
          source: "reported",
        })),
      });
    }
  }
}

/**
 * Snapshot workout prescription (if needed) and lock the session as completed.
 * Future edits to Program/Workout templates must not rewrite these rows.
 * Existing logged set performance is preserved.
 */
export async function lockSessionPrescription(input: {
  trainingSessionId: string;
  athleteProfileId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await prisma.trainingSession.findFirst({
    where: {
      id: input.trainingSessionId,
      athleteProfileId: input.athleteProfileId,
    },
    include: {
      sessionExercises: { select: { id: true } },
      workout: { select: { name: true } },
    },
  });

  if (!session) {
    return { ok: false, error: "Training session not found." };
  }

  if (isSessionPrescriptionLocked(session) && session.sessionExercises.length > 0) {
    return { ok: false, error: "Session prescription is already locked." };
  }

  if (session.sessionExercises.length === 0) {
    const snap = await snapshotSessionPrescription({
      trainingSessionId: input.trainingSessionId,
      athleteProfileId: input.athleteProfileId,
    });
    if (!snap.ok) return snap;
  }

  await prisma.trainingSession.update({
    where: { id: session.id },
    data: {
      status: "completed",
      completedAt: session.completedAt ?? new Date(),
      prescriptionLockedAt: new Date(),
      workoutNameSnapshot:
        session.workoutNameSnapshot ??
        session.workout?.name ??
        "Ad-hoc session",
    },
  });

  return { ok: true };
}

export async function assertCanEditProgram(input: {
  programId: string;
  athleteProfileId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const program = await prisma.program.findFirst({
    where: {
      id: input.programId,
      OR: [
        { athleteProfileId: input.athleteProfileId },
        { kind: "template", athleteProfileId: null },
      ],
    },
    select: { status: true, kind: true, athleteProfileId: true },
  });
  if (!program) {
    return { ok: false, error: "Program not found." };
  }
  if (program.kind === "athlete" && program.athleteProfileId !== input.athleteProfileId) {
    return { ok: false, error: "Not allowed to edit this program." };
  }
  if (!isProgramEditable(program.status)) {
    return {
      ok: false,
      error: `Program status “${program.status}” is not editable. Historical completed sessions stay unchanged regardless.`,
    };
  }
  return { ok: true };
}
