import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  ADAPTATION_RECOVERY_LOOKBACK_DAYS,
  ADAPTATION_SESSION_LOOKBACK,
  ADAPTATION_TECHNIQUE_LOOKBACK,
  ADAPTIVE_ENGINE_VERSION,
  type AdaptationEventType,
} from "@/domain/adaptive/constants";
import {
  previewAdaptedPrescription,
  proposeAdaptation,
  type AdaptationParams,
  type AdaptationSignals,
} from "@/domain/adaptive/engine";
import { isProgramEditable } from "@/domain/programming/guards";
import { SESSION_WINDOW_DAYS } from "@/domain/scoring/thresholds";
import { painSafeAdaptationHold } from "@/domain/pain-safe-response-system";
import { isPainSafeModeActiveForAthlete } from "@/services/pain-safe-response-system";
import {
  injuryModificationAdaptationHold,
  injuryModificationPrefersLowerLoading,
} from "@/domain/injury-modification";
import { isInjuryModificationActiveForAthlete } from "@/services/injury-modification";

function parseParams(raw: string | null | undefined): AdaptationParams {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as AdaptationParams;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function appendEvent(input: {
  adaptationId: string;
  eventType: AdaptationEventType;
  actorUserId?: string | null;
  detail?: Record<string, unknown>;
}) {
  await prisma.programAdaptationEvent.create({
    data: {
      adaptationId: input.adaptationId,
      eventType: input.eventType,
      actorUserId: input.actorUserId ?? null,
      detailJson: JSON.stringify(input.detail ?? {}),
    },
  });
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

async function buildSignalsForExercise(input: {
  athleteProfileId: string;
  exerciseId: string;
  exerciseName: string;
  currentLoadKg: number | null;
  currentSets: number | null;
  goalTitle: string | null;
  goalCategory: string | null;
}): Promise<AdaptationSignals> {
  const since = new Date();
  since.setDate(since.getDate() - ADAPTATION_SESSION_LOOKBACK);

  const sets = await prisma.sessionSet.findMany({
    where: {
      completedAt: { not: null },
      sessionExercise: {
        exerciseId: input.exerciseId,
        trainingSession: {
          athleteProfileId: input.athleteProfileId,
          status: "completed",
          completedAt: { gte: since },
        },
      },
    },
    include: {
      sessionExercise: {
        select: {
          prescribedReps: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 40,
  });

  const rpes = sets
    .map((s) => s.performedRpe)
    .filter((v): v is number => v != null);
  const targetRpes = sets
    .map((s) => s.prescribedRpe)
    .filter((v): v is number => v != null);

  let missed = 0;
  let comparable = 0;
  for (const set of sets) {
    const targetReps = set.prescribedReps;
    if (targetReps != null && set.performedReps != null) {
      comparable += 1;
      if (set.performedReps < targetReps) missed += 1;
    }
  }

  // Also count exercise-level prescribedReps string when set-level missing
  if (comparable === 0) {
    for (const set of sets) {
      const lineReps = set.sessionExercise.prescribedReps;
      if (!lineReps || set.performedReps == null) continue;
      const match = lineReps.match(/(\d+)/);
      if (!match) continue;
      const target = Number(match[1]);
      if (!Number.isFinite(target)) continue;
      comparable += 1;
      if (set.performedReps < target) missed += 1;
    }
  }

  const loads = sets
    .map((s) => s.performedLoadKg)
    .filter((v): v is number => v != null);
  let recentLoadTrendKg: number | null = null;
  if (loads.length >= 4) {
    const recent = mean(loads.slice(0, Math.floor(loads.length / 2)));
    const prior = mean(loads.slice(Math.floor(loads.length / 2)));
    if (recent != null && prior != null) {
      recentLoadTrendKg = Math.round((recent - prior) * 10) / 10;
    }
  }

  const recoverySince = new Date();
  recoverySince.setDate(
    recoverySince.getDate() - ADAPTATION_RECOVERY_LOOKBACK_DAYS,
  );
  const recovery = await prisma.recoveryEntry.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      recordedAt: { gte: recoverySince },
      readiness: { not: null },
    },
    select: { readiness: true },
    orderBy: { recordedAt: "desc" },
    take: 14,
  });
  const recoveryReadiness = mean(
    recovery.map((r) => r.readiness!).filter((v) => v != null),
  );

  const consistencySince = new Date();
  consistencySince.setDate(consistencySince.getDate() - SESSION_WINDOW_DAYS);
  const sessions = await prisma.trainingSession.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      status: { in: ["completed", "skipped"] },
      OR: [
        { completedAt: { gte: consistencySince } },
        { scheduledAt: { gte: consistencySince } },
      ],
    },
    select: { status: true },
  });
  const completed = sessions.filter((s) => s.status === "completed").length;
  const skipped = sessions.filter((s) => s.status === "skipped").length;
  const consistencyScore =
    completed + skipped > 0
      ? Math.round((100 * completed) / (completed + skipped))
      : null;

  const techniqueRows = await prisma.techniqueAnalysis.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      exerciseId: input.exerciseId,
      status: "completed",
      overallScore: { not: null },
      deletedAt: null,
    },
    select: { overallScore: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: ADAPTATION_TECHNIQUE_LOOKBACK,
  });
  let techniqueTrendDelta: number | null = null;
  let techniqueRecentMean: number | null = null;
  if (techniqueRows.length >= 2) {
    const scores = techniqueRows.map((r) => r.overallScore!);
    const half = Math.ceil(scores.length / 2);
    const recent = mean(scores.slice(0, half));
    const prior = mean(scores.slice(half));
    techniqueRecentMean = recent;
    if (recent != null && prior != null) {
      techniqueTrendDelta = Math.round((recent - prior) * 10) / 10;
    }
  } else if (techniqueRows.length === 1) {
    techniqueRecentMean = techniqueRows[0]!.overallScore;
  }

  return {
    goalTitle: input.goalTitle,
    goalCategory: input.goalCategory,
    completedSetCount: sets.length,
    avgRpe: mean(rpes),
    avgTargetRpe: mean(targetRpes),
    missedRepRate: comparable > 0 ? missed / comparable : null,
    recentLoadTrendKg,
    consistencyScore,
    recoveryReadiness,
    techniqueTrendDelta,
    techniqueRecentMean,
    currentLoadKg: input.currentLoadKg,
    currentSets: input.currentSets,
    exerciseName: input.exerciseName,
  };
}

export type AdaptationView = {
  id: string;
  changeKind: string;
  recommendedChange: string;
  reason: string;
  confidence: string;
  status: string;
  source: string;
  engineVersion: string;
  exerciseName: string | null;
  programName: string | null;
  proposedParams: AdaptationParams;
  modifiedParams: AdaptationParams | null;
  appliedParams: AdaptationParams | null;
  preview: { loadKg: number | null; sets: number | null } | null;
  currentLoadKg: number | null;
  currentSets: number | null;
  createdAt: string;
  decidedAt: string | null;
  appliedAt: string | null;
  decisionNote: string | null;
  events: Array<{
    id: string;
    eventType: string;
    createdAt: string;
    detailJson: string;
  }>;
};

/**
 * Gather signals and create pending ProgramAdaptation rows.
 * Never mutates Workout/Program prescription — proposals only.
 */
export async function proposeAdaptationsForAthlete(input: {
  userId: string;
  trainingSessionId?: string;
}): Promise<
  | { ok: true; createdIds: string[]; skippedReason?: string }
  | { ok: false; error: string }
> {
  const { requireFeature, formatEntitlementDenial } = await import(
    "@/services/entitlements/entitlement-service"
  );
  const gate = await requireFeature(input.userId, "adaptive_coaching");
  if (!gate.ok) {
    return { ok: false, error: formatEntitlementDenial(gate) };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
    },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile not found." };
  }

  let sessionWorkoutId: string | null = null;
  let sessionProgramId: string | null = null;
  if (input.trainingSessionId) {
    const session = await prisma.trainingSession.findFirst({
      where: {
        id: input.trainingSessionId,
        athleteProfileId: profile.id,
      },
      select: { workoutId: true, programId: true },
    });
    sessionWorkoutId = session?.workoutId ?? null;
    sessionProgramId = session?.programId ?? null;
  }

  const program = await prisma.program.findFirst({
    where: {
      athleteProfileId: profile.id,
      kind: "athlete",
      status: "active",
      ...(sessionProgramId ? { id: sessionProgramId } : {}),
    },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              workout: {
                include: {
                  workoutExercises: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                      exercise: { select: { id: true, name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Collect unique workout exercises from active program (or session workout).
  type TargetLine = {
    workoutExerciseId: string;
    workoutId: string;
    exerciseId: string;
    exerciseName: string;
    targetLoadKg: number | null;
    targetSets: number | null;
    programId: string | null;
  };

  const targets: TargetLine[] = [];
  const seen = new Set<string>();

  if (sessionWorkoutId) {
    const workout = await prisma.workout.findFirst({
      where: { id: sessionWorkoutId },
      include: {
        workoutExercises: {
          orderBy: { sortOrder: "asc" },
          include: { exercise: { select: { id: true, name: true } } },
        },
      },
    });
    for (const line of workout?.workoutExercises ?? []) {
      if (seen.has(line.id)) continue;
      seen.add(line.id);
      targets.push({
        workoutExerciseId: line.id,
        workoutId: line.workoutId,
        exerciseId: line.exerciseId,
        exerciseName: line.exercise.name,
        targetLoadKg: line.targetLoadKg,
        targetSets: line.targetSets,
        programId: sessionProgramId ?? program?.id ?? null,
      });
    }
  }

  if (targets.length === 0 && program) {
    for (const week of program.weeks) {
      for (const day of week.days) {
        for (const line of day.workout?.workoutExercises ?? []) {
          if (seen.has(line.id)) continue;
          seen.add(line.id);
          targets.push({
            workoutExerciseId: line.id,
            workoutId: line.workoutId,
            exerciseId: line.exerciseId,
            exerciseName: line.exercise.name,
            targetLoadKg: line.targetLoadKg,
            targetSets: line.targetSets,
            programId: program.id,
          });
        }
      }
    }
  }

  if (targets.length === 0) {
    return {
      ok: true,
      createdIds: [],
      skippedReason:
        "No athlete workout exercises found to adapt. Assign an active program or complete a session first.",
    };
  }

  const goalTitle = profile.goals[0]?.title ?? null;
  const goalCategory = profile.goals[0]?.category ?? null;
  const createdIds: string[] = [];

  for (const target of targets.slice(0, 8)) {
    const signals = await buildSignalsForExercise({
      athleteProfileId: profile.id,
      exerciseId: target.exerciseId,
      exerciseName: target.exerciseName,
      currentLoadKg: target.targetLoadKg,
      currentSets: target.targetSets,
      goalTitle,
      goalCategory,
    });

    // Need at least some completed work for a meaningful proposal (except keep with reason).
    if (signals.completedSetCount === 0 && !input.trainingSessionId) {
      continue;
    }

    const suggestionRaw = proposeAdaptation(signals);
    const [painSafeActive, injuryModActive] = await Promise.all([
      isPainSafeModeActiveForAthlete(profile.id),
      isInjuryModificationActiveForAthlete(profile.id),
    ]);
    let suggestion = suggestionRaw;
    if (
      painSafeActive &&
      (suggestionRaw.changeKind === "increase_load" ||
        suggestionRaw.changeKind === "increase_volume")
    ) {
      const hold = painSafeAdaptationHold(target.exerciseName);
      suggestion = {
        ...suggestionRaw,
        changeKind: hold.changeKind,
        recommendedChange: hold.recommendedChange,
        reason: hold.reason,
        confidence: hold.confidence,
        params: hold.params,
        source: hold.source,
      };
    } else if (
      injuryModificationPrefersLowerLoading({
        planActive: injuryModActive,
        painSafeActive,
        changeKind: suggestionRaw.changeKind,
      })
    ) {
      const hold = injuryModificationAdaptationHold(target.exerciseName);
      suggestion = {
        ...suggestionRaw,
        changeKind: hold.changeKind,
        recommendedChange: hold.recommendedChange,
        reason: hold.reason,
        confidence: hold.confidence,
        params: { ...suggestionRaw.params, ...hold.params },
        source: hold.source,
      };
    }

    // Supersede prior pending for same exercise line
    const priorPending = await prisma.programAdaptation.findMany({
      where: {
        athleteProfileId: profile.id,
        workoutExerciseId: target.workoutExerciseId,
        status: "pending",
      },
    });
    for (const prior of priorPending) {
      await prisma.programAdaptation.update({
        where: { id: prior.id },
        data: { status: "superseded", decidedAt: new Date() },
      });
      await appendEvent({
        adaptationId: prior.id,
        eventType: "superseded",
        actorUserId: input.userId,
        detail: { replacedByEngine: ADAPTIVE_ENGINE_VERSION },
      });
    }

    const row = await prisma.programAdaptation.create({
      data: {
        athleteProfileId: profile.id,
        programId: target.programId,
        workoutExerciseId: target.workoutExerciseId,
        workoutId: target.workoutId,
        trainingSessionId: input.trainingSessionId ?? null,
        exerciseId: target.exerciseId,
        changeKind: suggestion.changeKind,
        recommendedChange: suggestion.recommendedChange,
        reason: suggestion.reason,
        confidence: suggestion.confidence,
        status: "pending",
        inputsJson: JSON.stringify(signals),
        proposedParamsJson: JSON.stringify(suggestion.params),
        source: suggestion.source,
        engineVersion: ADAPTIVE_ENGINE_VERSION,
        beforeStateJson: JSON.stringify({
          targetLoadKg: target.targetLoadKg,
          targetSets: target.targetSets,
        }),
      },
    });

    await appendEvent({
      adaptationId: row.id,
      eventType: "proposed",
      actorUserId: input.userId,
      detail: {
        changeKind: suggestion.changeKind,
        confidence: suggestion.confidence,
      },
    });

    createdIds.push(row.id);
  }

  return { ok: true, createdIds };
}

export async function listAdaptationsForUser(
  userId: string,
  status?: string,
): Promise<AdaptationView[]> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  const rows = await prisma.programAdaptation.findMany({
    where: {
      athleteProfileId: profile.id,
      ...(status ? { status } : {}),
    },
    include: {
      program: { select: { name: true } },
      workoutExercise: {
        include: { exercise: { select: { name: true } } },
      },
      events: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return rows.map((row) => {
    const proposed = parseParams(row.proposedParamsJson);
    const modified = row.modifiedParamsJson
      ? parseParams(row.modifiedParamsJson)
      : null;
    const applied = row.appliedParamsJson
      ? parseParams(row.appliedParamsJson)
      : null;
    const params = modified ?? proposed;
    const currentLoadKg = row.workoutExercise?.targetLoadKg ?? null;
    const currentSets = row.workoutExercise?.targetSets ?? null;
    const preview =
      row.status === "pending"
        ? previewAdaptedPrescription({
            currentLoadKg,
            currentSets,
            params,
          })
        : null;

    return {
      id: row.id,
      changeKind: row.changeKind,
      recommendedChange: row.recommendedChange,
      reason: row.reason,
      confidence: row.confidence,
      status: row.status,
      source: row.source,
      engineVersion: row.engineVersion,
      exerciseName: row.workoutExercise?.exercise.name ?? null,
      programName: row.program?.name ?? null,
      proposedParams: proposed,
      modifiedParams: modified,
      appliedParams: applied,
      preview,
      currentLoadKg,
      currentSets,
      createdAt: row.createdAt.toISOString(),
      decidedAt: row.decidedAt?.toISOString() ?? null,
      appliedAt: row.appliedAt?.toISOString() ?? null,
      decisionNote: row.decisionNote,
      events: row.events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        createdAt: e.createdAt.toISOString(),
        detailJson: e.detailJson,
      })),
    };
  });
}

async function applyParamsToWorkoutExercise(input: {
  workoutExerciseId: string;
  params: AdaptationParams;
}): Promise<
  | {
      ok: true;
      before: { targetLoadKg: number | null; targetSets: number | null };
      after: { targetLoadKg: number | null; targetSets: number | null };
    }
  | { ok: false; error: string }
> {
  const line = await prisma.workoutExercise.findUnique({
    where: { id: input.workoutExerciseId },
    include: {
      workout: { select: { kind: true, athleteProfileId: true } },
      workoutSets: true,
    },
  });
  if (!line) return { ok: false, error: "Workout exercise not found." };

  // Never silently mutate library templates.
  if (line.workout.kind === "template" && !line.workout.athleteProfileId) {
    return {
      ok: false,
      error: "Cannot apply adaptations to library workout templates.",
    };
  }

  const before = {
    targetLoadKg: line.targetLoadKg,
    targetSets: line.targetSets,
  };
  const preview = previewAdaptedPrescription({
    currentLoadKg: line.targetLoadKg,
    currentSets: line.targetSets,
    params: input.params,
  });

  await prisma.$transaction(async (tx) => {
    await tx.workoutExercise.update({
      where: { id: line.id },
      data: {
        targetLoadKg: preview.loadKg,
        targetSets: preview.sets,
      },
    });

    if (input.params.deltaKg != null || input.params.loadMultiplier != null) {
      for (const set of line.workoutSets) {
        const base = set.targetLoadKg ?? set.targetWeight ?? line.targetLoadKg;
        if (base == null) continue;
        const next = previewAdaptedPrescription({
          currentLoadKg: base,
          currentSets: null,
          params: {
            deltaKg: input.params.deltaKg,
            loadMultiplier: input.params.loadMultiplier,
          },
        });
        await tx.workoutSet.update({
          where: { id: set.id },
          data: { targetLoadKg: next.loadKg },
        });
      }
    }
  });

  return {
    ok: true,
    before,
    after: { targetLoadKg: preview.loadKg, targetSets: preview.sets },
  };
}

/**
 * Accept as proposed, or accept a modified param set. Applies to live athlete program only.
 */
export async function decideAdaptation(input: {
  userId: string;
  adaptationId: string;
  decision: "accept" | "modify" | "decline";
  modifiedParams?: AdaptationParams;
  decisionNote?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile not found." };

  const row = await prisma.programAdaptation.findFirst({
    where: { id: input.adaptationId, athleteProfileId: profile.id },
    include: { program: { select: { status: true, kind: true } } },
  });
  if (!row) return { ok: false, error: "Adaptation not found." };
  if (row.status !== "pending") {
    return { ok: false, error: `Adaptation is already ${row.status}.` };
  }

  if (input.decision === "decline") {
    await prisma.programAdaptation.update({
      where: { id: row.id },
      data: {
        status: "declined",
        decidedAt: new Date(),
        decisionNote: input.decisionNote?.trim() || null,
      },
    });
    await appendEvent({
      adaptationId: row.id,
      eventType: "declined",
      actorUserId: input.userId,
      detail: { note: input.decisionNote ?? null },
    });
    return { ok: true };
  }

  if (row.program && !isProgramEditable(row.program.status)) {
    return {
      ok: false,
      error: "Linked program is not editable; decline or wait until it is active/draft.",
    };
  }

  const params =
    input.decision === "modify"
      ? (input.modifiedParams ?? parseParams(row.proposedParamsJson))
      : parseParams(row.proposedParamsJson);

  if (input.decision === "modify") {
    await prisma.programAdaptation.update({
      where: { id: row.id },
      data: {
        modifiedParamsJson: JSON.stringify(params),
        decisionNote: input.decisionNote?.trim() || null,
      },
    });
    await appendEvent({
      adaptationId: row.id,
      eventType: "modified",
      actorUserId: input.userId,
      detail: { params },
    });
  } else {
    await appendEvent({
      adaptationId: row.id,
      eventType: "accepted",
      actorUserId: input.userId,
      detail: { params },
    });
  }

  // keep_load with empty params: record decision without mutating prescription
  const noop =
    row.changeKind === "keep_load" &&
    params.deltaKg == null &&
    params.loadMultiplier == null &&
    params.setsDelta == null;

  if (noop || !row.workoutExerciseId) {
    await prisma.programAdaptation.update({
      where: { id: row.id },
      data: {
        status: input.decision === "modify" ? "modified" : "accepted",
        decidedAt: new Date(),
        appliedAt: new Date(),
        appliedParamsJson: JSON.stringify(params),
        afterStateJson: row.beforeStateJson,
        decisionNote: input.decisionNote?.trim() || null,
      },
    });
    await appendEvent({
      adaptationId: row.id,
      eventType: "applied",
      actorUserId: input.userId,
      detail: { noop: true, reason: "No prescription fields changed." },
    });
    return { ok: true };
  }

  const applied = await applyParamsToWorkoutExercise({
    workoutExerciseId: row.workoutExerciseId,
    params,
  });
  if (!applied.ok) return applied;

  await prisma.programAdaptation.update({
    where: { id: row.id },
    data: {
      status: input.decision === "modify" ? "modified" : "accepted",
      decidedAt: new Date(),
      appliedAt: new Date(),
      appliedParamsJson: JSON.stringify(params),
      beforeStateJson: JSON.stringify(applied.before),
      afterStateJson: JSON.stringify(applied.after),
      decisionNote: input.decisionNote?.trim() || null,
      ...(input.decision === "modify"
        ? { modifiedParamsJson: JSON.stringify(params) }
        : {}),
    },
  });

  await appendEvent({
    adaptationId: row.id,
    eventType: "applied",
    actorUserId: input.userId,
    detail: {
      before: applied.before,
      after: applied.after,
      params,
    },
  });

  if (row.programId && featureFlags.programVersionControl) {
    const { createProgramVersion } = await import(
      "@/services/program-version"
    );
    await createProgramVersion({
      programId: row.programId,
      changedByUserId: input.userId,
      reason:
        input.decisionNote?.trim() ||
        `Applied ${row.changeKind} adaptation (${input.decision})`,
      source: "adaptation",
    });
  }

  return { ok: true };
}
