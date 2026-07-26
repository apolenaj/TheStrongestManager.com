import { featureFlags } from "@/config/feature-flags";
import { normalizeSportFocuses } from "@/domain/multi-sport-mode";
import { prisma } from "@/lib/db";
import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  MAJOR_LIFTS,
  PRIMARY_GOALS,
  SPORTS,
  type EquipmentId,
  type ExperienceLevelId,
  type MajorLiftId,
  type SportId,
} from "@/services/onboarding/options";
import {
  formatLength,
  formatMass,
  fromCanonicalCm,
  fromCanonicalKg,
  normalizeMassUnit,
  parseLengthInput,
  parseMassInput,
  roundDisplay,
  toCanonicalCm,
  toCanonicalKg,
  type MassUnit,
} from "@/services/units/convert";
import { normalizeTimezone } from "@/domain/timezone-system";

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export type LiftHistoryEntry = {
  id: string;
  valueKg: number;
  displayValue: number;
  displayUnit: MassUnit;
  recordedAt: Date;
  notes: string | null;
  isBest: boolean;
};

export type LiftSummary = {
  liftId: MajorLiftId;
  label: string;
  metricKey: string;
  /** Best historical PR in preferred units */
  best: LiftHistoryEntry | null;
  /** Most recently logged value */
  current: LiftHistoryEntry | null;
  history: LiftHistoryEntry[];
};

export type AthleteProfileView = {
  id: string;
  displayName: string | null;
  units: MassUnit;
  /** IANA timezone — UTC storage, local display (Prompt 150). */
  timezone: string;
  primaryDiscipline: string | null;
  movementNotes: string | null;
  goal: {
    id: string;
    title: string;
    category: string;
    description: string | null;
  } | null;
  sports: SportId[];
  experience: {
    level: string | null;
    yearsTraining: number | null;
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    coachingStatus: string | null;
    recentHistory: string | null;
    recoveryHabits: string | null;
    equipment: EquipmentId[];
  };
  bodyweight: {
    kg: number;
    display: string;
    displayValue: number;
    recordedAt: Date;
  } | null;
  height: {
    cm: number;
    display: string;
    displayValue: number;
    recordedAt: Date;
  } | null;
  lifts: LiftSummary[];
};

export async function getAthleteProfileForUser(
  userId: string,
): Promise<AthleteProfileView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
      trainingExperience: true,
      bodyMetrics: { orderBy: { recordedAt: "desc" } },
      progressMetrics: {
        where: {
          metricKey: { in: MAJOR_LIFTS.map((lift) => lift.metricKey) },
        },
        orderBy: { recordedAt: "desc" },
      },
    },
  });

  if (!profile) return null;

  const units = normalizeMassUnit(profile.units);
  const experience = profile.trainingExperience;

  const latestBodyweight = profile.bodyMetrics.find(
    (item) => item.metricKey === "bodyweight",
  );
  const latestHeight = profile.bodyMetrics.find(
    (item) => item.metricKey === "height",
  );

  const lifts: LiftSummary[] = MAJOR_LIFTS.map((lift) => {
    const rows = profile.progressMetrics.filter(
      (item) => item.metricKey === lift.metricKey,
    );
    const historyCanonical = rows.map((row) => ({
      id: row.id,
      valueKg: toCanonicalKg(row.value, row.unit ?? "kg"),
      recordedAt: row.recordedAt,
      notes: row.notes,
    }));

    const bestCanonical =
      historyCanonical.length > 0
        ? historyCanonical.reduce((max, row) =>
            row.valueKg > max.valueKg ? row : max,
          )
        : null;

    const currentCanonical = historyCanonical[0] ?? null;

    const toEntry = (
      row: (typeof historyCanonical)[number],
      isBest: boolean,
    ): LiftHistoryEntry => ({
      id: row.id,
      valueKg: row.valueKg,
      displayValue: roundDisplay(fromCanonicalKg(row.valueKg, units)),
      displayUnit: units,
      recordedAt: row.recordedAt,
      notes: row.notes,
      isBest,
    });

    const history = historyCanonical.map((row) =>
      toEntry(row, bestCanonical?.id === row.id),
    );

    return {
      liftId: lift.id,
      label: lift.label,
      metricKey: lift.metricKey,
      best: bestCanonical ? toEntry(bestCanonical, true) : null,
      current: currentCanonical
        ? toEntry(currentCanonical, bestCanonical?.id === currentCanonical.id)
        : null,
      history,
    };
  });

  return {
    id: profile.id,
    displayName: profile.displayName,
    units,
    timezone: normalizeTimezone(profile.timezone),
    primaryDiscipline: profile.primaryDiscipline,
    movementNotes: profile.movementNotes,
    goal: profile.goals[0]
      ? {
          id: profile.goals[0].id,
          title: profile.goals[0].title,
          category: profile.goals[0].category,
          description: profile.goals[0].description,
        }
      : null,
    sports: parseJsonArray(experience?.preferredSports) as SportId[],
    experience: {
      level: experience?.level ?? null,
      yearsTraining: experience?.yearsTraining ?? null,
      daysPerWeek: experience?.daysPerWeek ?? null,
      sessionLengthMinutes: experience?.sessionLengthMinutes ?? null,
      coachingStatus: experience?.coachingStatus ?? null,
      recentHistory: experience?.recentHistory ?? null,
      recoveryHabits: experience?.recoveryHabits ?? null,
      equipment: parseJsonArray(experience?.availableEquipment) as EquipmentId[],
    },
    bodyweight: latestBodyweight
      ? (() => {
          const kg = toCanonicalKg(
            latestBodyweight.value,
            latestBodyweight.unit,
          );
          return {
            kg,
            display: formatMass(kg, units),
            displayValue: roundDisplay(fromCanonicalKg(kg, units)),
            recordedAt: latestBodyweight.recordedAt,
          };
        })()
      : null,
    height: latestHeight
      ? (() => {
          const cm = toCanonicalCm(latestHeight.value, latestHeight.unit);
          return {
            cm,
            display: formatLength(cm, units),
            displayValue: roundDisplay(
              fromCanonicalCm(cm, units),
              units === "lb" ? 1 : 0,
            ),
            recordedAt: latestHeight.recordedAt,
          };
        })()
      : null,
    lifts,
  };
}

export async function requireAthleteProfileId(userId: string): Promise<string> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    throw new Error("Athlete profile not found.");
  }
  return profile.id;
}

export const profileCatalog = {
  goals: PRIMARY_GOALS,
  experienceLevels: EXPERIENCE_LEVELS,
  sports: SPORTS,
  equipment: EQUIPMENT_OPTIONS,
  lifts: MAJOR_LIFTS,
};

export type UpdateUnitsInput = { units: MassUnit };

export async function updateUnitPreference(
  userId: string,
  input: UpdateUnitsInput,
) {
  await prisma.athleteProfile.update({
    where: { userId },
    data: { units: input.units },
  });
}

export async function updateTimezonePreference(
  userId: string,
  timezoneRaw: string,
) {
  const timezone = normalizeTimezone(timezoneRaw);
  await prisma.athleteProfile.update({
    where: { userId },
    data: { timezone },
  });
  return timezone;
}

export async function updateGoal(
  userId: string,
  input: { title: string; category: string },
) {
  const profileId = await requireAthleteProfileId(userId);
  const active = await prisma.goal.findFirst({
    where: { athleteProfileId: profileId, status: "active" },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  if (active) {
    await prisma.goal.update({
      where: { id: active.id },
      data: {
        title: input.title,
        category: input.category,
        description: "Updated from athlete profile editor.",
      },
    });
    return;
  }

  await prisma.goal.create({
    data: {
      athleteProfileId: profileId,
      title: input.title,
      category: input.category,
      status: "active",
      priority: 1,
      description: "Created from athlete profile editor.",
    },
  });
}

export async function updateSportFocus(
  userId: string,
  input: { primaryDiscipline: string; sports: SportId[] },
) {
  const profileId = await requireAthleteProfileId(userId);

  let primaryDiscipline = input.primaryDiscipline;
  if (featureFlags.multiSportAthleteMode && input.sports.length >= 2) {
    const focuses = normalizeSportFocuses({
      preferredSports: input.sports,
      primaryDiscipline,
    });
    const lead =
      primaryDiscipline === "general" ? "general_strength" : primaryDiscipline;
    // Keep an explicit lead if it is one of the focuses; otherwise mark hybrid.
    if (
      primaryDiscipline !== "hybrid" &&
      primaryDiscipline !== "coach" &&
      !focuses.includes(lead as (typeof focuses)[number])
    ) {
      primaryDiscipline = "hybrid";
    }
  }

  await prisma.athleteProfile.update({
    where: { id: profileId },
    data: { primaryDiscipline },
  });
  await prisma.trainingExperience.upsert({
    where: { athleteProfileId: profileId },
    create: {
      athleteProfileId: profileId,
      preferredSports: JSON.stringify(input.sports),
    },
    update: {
      preferredSports: JSON.stringify(input.sports),
    },
  });
}

export async function updateTrainingAge(
  userId: string,
  input: { level: ExperienceLevelId | null; yearsTraining: number | null },
) {
  const profileId = await requireAthleteProfileId(userId);
  await prisma.trainingExperience.upsert({
    where: { athleteProfileId: profileId },
    create: {
      athleteProfileId: profileId,
      level: input.level ?? undefined,
      yearsTraining: input.yearsTraining ?? undefined,
    },
    update: {
      level: input.level,
      yearsTraining: input.yearsTraining,
    },
  });
}

export async function updateTrainingPreferences(
  userId: string,
  input: {
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    coachingStatus: string | null;
    recentHistory: string | null;
  },
) {
  const profileId = await requireAthleteProfileId(userId);
  await prisma.trainingExperience.upsert({
    where: { athleteProfileId: profileId },
    create: {
      athleteProfileId: profileId,
      daysPerWeek: input.daysPerWeek ?? undefined,
      sessionLengthMinutes: input.sessionLengthMinutes ?? undefined,
      coachingStatus: input.coachingStatus ?? undefined,
      recentHistory: input.recentHistory ?? undefined,
    },
    update: {
      daysPerWeek: input.daysPerWeek,
      sessionLengthMinutes: input.sessionLengthMinutes,
      coachingStatus: input.coachingStatus,
      recentHistory: input.recentHistory,
    },
  });
}

export async function updateEquipment(
  userId: string,
  input: { equipment: EquipmentId[] },
) {
  const { featureFlags } = await import("@/config/feature-flags");
  if (featureFlags.travelTrainingMode) {
    const { isTravelModeActiveForUser } = await import(
      "@/services/travel-training-mode"
    );
    if (await isTravelModeActiveForUser(userId)) {
      throw new Error(
        "Travel Mode is active — end travel before changing your home equipment list.",
      );
    }
  }
  const profileId = await requireAthleteProfileId(userId);
  const { inferEquipmentProfileId } = await import(
    "@/domain/equipment-profiles"
  );
  const equipmentProfileId = inferEquipmentProfileId(input.equipment);
  await prisma.trainingExperience.upsert({
    where: { athleteProfileId: profileId },
    create: {
      athleteProfileId: profileId,
      availableEquipment: JSON.stringify(input.equipment),
      equipmentProfileId,
    },
    update: {
      availableEquipment: JSON.stringify(input.equipment),
      equipmentProfileId,
    },
  });
}

export async function updateRecoveryHabits(
  userId: string,
  input: { recoveryHabits: string | null; movementNotes: string | null },
) {
  const profileId = await requireAthleteProfileId(userId);
  await prisma.athleteProfile.update({
    where: { id: profileId },
    data: { movementNotes: input.movementNotes },
  });
  await prisma.trainingExperience.upsert({
    where: { athleteProfileId: profileId },
    create: {
      athleteProfileId: profileId,
      recoveryHabits: input.recoveryHabits ?? undefined,
    },
    update: {
      recoveryHabits: input.recoveryHabits,
    },
  });
}

/**
 * Append a body metric snapshot — never overwrite historical rows.
 */
export async function appendBodyMetric(
  userId: string,
  input: {
    metricKey: "bodyweight" | "height";
    rawValue: string;
  },
) {
  const profile = await prisma.athleteProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true, units: true },
  });
  const units = normalizeMassUnit(profile.units);

  if (input.metricKey === "bodyweight") {
    const kg = parseMassInput(input.rawValue, units);
    if (kg == null) {
      return { ok: false as const, error: "Enter a valid bodyweight." };
    }
    await prisma.bodyMetric.create({
      data: {
        athleteProfileId: profile.id,
        metricKey: "bodyweight",
        value: kg,
        unit: "kg",
        source: "reported",
        notes: "Updated from athlete profile (historical snapshot).",
      },
    });
    return { ok: true as const };
  }

  const cm = parseLengthInput(input.rawValue, units);
  if (cm == null) {
    return { ok: false as const, error: "Enter a valid height." };
  }
  await prisma.bodyMetric.create({
    data: {
      athleteProfileId: profile.id,
      metricKey: "height",
      value: cm,
      unit: "cm",
      source: "reported",
      notes: "Updated from athlete profile (historical snapshot).",
    },
  });
  return { ok: true as const };
}

/**
 * Record a personal record / lift log as a NEW progress row.
 * Existing PR history is preserved.
 */
export async function appendPersonalRecord(
  userId: string,
  input: { liftId: MajorLiftId; rawValue: string; reps?: number | null },
) {
  const lift = MAJOR_LIFTS.find((item) => item.id === input.liftId);
  if (!lift) {
    return { ok: false as const, error: "Unknown lift." };
  }

  const profile = await prisma.athleteProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true, units: true },
  });
  const units = normalizeMassUnit(profile.units);
  const kg = parseMassInput(input.rawValue, units);
  if (kg == null) {
    return { ok: false as const, error: "Enter a valid lift load." };
  }

  let reps: number | null = null;
  if (input.reps != null && input.reps !== undefined) {
    if (!Number.isInteger(input.reps) || input.reps < 1 || input.reps > 12) {
      return {
        ok: false as const,
        error: "Reps must be a whole number from 1 to 12.",
      };
    }
    reps = input.reps;
  }

  const previous = await prisma.progressMetric.findMany({
    where: {
      athleteProfileId: profile.id,
      metricKey: lift.metricKey,
    },
  });
  const previousBestKg = previous.reduce((max, row) => {
    const value = toCanonicalKg(row.value, row.unit ?? "kg");
    return value > max ? value : max;
  }, 0);

  const isNewBest = kg >= previousBestKg || previous.length === 0;
  const repsNote =
    reps != null && reps >= 2
      ? ` Multi-rep log (${reps}); Estimated 1RM may be derived — not a verified PR.`
      : "";

  await prisma.progressMetric.create({
    data: {
      athleteProfileId: profile.id,
      metricKey: lift.metricKey,
      value: kg,
      unit: "kg",
      reps,
      source: "reported",
      notes: isNewBest
        ? `Personal record entry for ${lift.label} (historical; previous rows kept).${repsNote}`
        : `Logged ${lift.label} (below current best; history preserved).${repsNote}`,
    },
  });

  if (isNewBest) {
    const { enqueueDomainEventSafe } = await import("@/services/event-driven");
    enqueueDomainEventSafe({
      name: "strength.pr_achieved",
      payload: {
        userId,
        liftId: lift.id,
        metricKey: lift.metricKey,
      },
      dedupeParts: [profile.id, lift.metricKey, String(Math.round(kg * 100))],
    });
  }

  return { ok: true as const, isNewBest };
}
