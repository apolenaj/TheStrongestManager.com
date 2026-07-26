/**
 * Travel Training Mode service (Prompt 129).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  TRAVEL_PRESETS,
  TRAVEL_TRAINING_ENGINE_VERSION,
  TRAVEL_TRAINING_HONESTY,
  isTravelPresetId,
  parseHomeEquipmentSnapshot,
  resolveTravelCatalogKeys,
  resolveTravelFitEquipment,
  resolveTravelOnboardingIds,
  serializeHomeEquipmentSnapshot,
  travelAdaptationLines,
  type TravelPresetId,
} from "@/domain/travel-training-mode";
import type { EquipmentKey } from "@/domain/exercises/types";
import type { FitEquipment } from "@/domain/fit/types";
import type { EquipmentId } from "@/services/onboarding/options";

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export type TravelModeView = {
  active: boolean;
  honesty: readonly string[];
  presets: Array<{
    id: TravelPresetId;
    label: string;
    description: string;
    adaptationSummary: string;
  }>;
  current: null | {
    id: string;
    preset: TravelPresetId;
    label: string;
    catalogKeys: EquipmentKey[];
    fitEquipment: FitEquipment;
    onboardingIds: string[];
    adaptationLines: string[];
    programId: string | null;
    preTravelVersionNumber: number | null;
    startedAt: string;
    notes: string | null;
  };
  recentEnded: Array<{
    id: string;
    preset: TravelPresetId;
    label: string;
    startedAt: string;
    endedAt: string | null;
  }>;
};

async function requireAthlete(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: { trainingExperience: true },
  });
  return profile;
}

export async function getTravelModeView(input: {
  userId: string;
}): Promise<
  | { ok: true; view: TravelModeView }
  | { ok: false; error: string }
> {
  if (!featureFlags.travelTrainingMode) {
    return { ok: false, error: "Travel Training Mode is not enabled." };
  }

  const profile = await requireAthlete(input.userId);
  if (!profile) return { ok: false, error: "No athlete profile." };

  const [active, recent] = await Promise.all([
    prisma.travelTrainingMode.findFirst({
      where: { athleteProfileId: profile.id, status: "active" },
      orderBy: { startedAt: "desc" },
    }),
    prisma.travelTrainingMode.findMany({
      where: { athleteProfileId: profile.id, status: "ended" },
      orderBy: { endedAt: "desc" },
      take: 5,
    }),
  ]);

  let current: TravelModeView["current"] = null;
  if (active && isTravelPresetId(active.preset)) {
    const onboardingIds = parseJsonArray(active.equipmentOverrideJson);
    const catalogKeys = resolveTravelCatalogKeys({
      preset: active.preset,
      limitedEquipment: onboardingIds,
    });
    current = {
      id: active.id,
      preset: active.preset,
      label: TRAVEL_PRESETS[active.preset].label,
      catalogKeys,
      fitEquipment: resolveTravelFitEquipment(active.preset),
      onboardingIds,
      adaptationLines: travelAdaptationLines({
        preset: active.preset,
        hasProgramCheckpoint:
          Boolean(active.programId) &&
          active.preTravelVersionNumber != null,
        catalogKeys,
      }),
      programId: active.programId,
      preTravelVersionNumber: active.preTravelVersionNumber,
      startedAt: active.startedAt.toISOString(),
      notes: active.notes,
    };
  }

  return {
    ok: true,
    view: {
      active: current != null,
      honesty: TRAVEL_TRAINING_HONESTY,
      presets: Object.values(TRAVEL_PRESETS).map((p) => ({
        id: p.id,
        label: p.label,
        description: p.description,
        adaptationSummary: p.adaptationSummary,
      })),
      current,
      recentEnded: recent
        .filter((r) => isTravelPresetId(r.preset))
        .map((r) => ({
          id: r.id,
          preset: r.preset as TravelPresetId,
          label: TRAVEL_PRESETS[r.preset as TravelPresetId].label,
          startedAt: r.startedAt.toISOString(),
          endedAt: r.endedAt?.toISOString() ?? null,
        })),
    },
  };
}

export async function isTravelModeActiveForUser(
  userId: string,
): Promise<boolean> {
  if (!featureFlags.travelTrainingMode) return false;
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return false;
  const active = await prisma.travelTrainingMode.findFirst({
    where: { athleteProfileId: profile.id, status: "active" },
    select: { id: true },
  });
  return Boolean(active);
}

/**
 * Start travel: snapshot home gear, checkpoint active program, overlay travel equipment.
 */
export async function startTravelMode(input: {
  userId: string;
  preset: TravelPresetId;
  limitedEquipment?: EquipmentId[];
  notes?: string | null;
}): Promise<
  | { ok: true; travelModeId: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.travelTrainingMode) {
    return { ok: false, error: "Travel Training Mode is not enabled." };
  }
  if (!isTravelPresetId(input.preset)) {
    return { ok: false, error: "Choose hotel gym, no gym, or limited equipment." };
  }

  const profile = await requireAthlete(input.userId);
  if (!profile) return { ok: false, error: "No athlete profile." };

  const existing = await prisma.travelTrainingMode.findFirst({
    where: { athleteProfileId: profile.id, status: "active" },
  });
  if (existing) {
    return {
      ok: false,
      error: "Travel Mode is already active — end it before starting another trip.",
    };
  }

  const onboardingIds = resolveTravelOnboardingIds({
    preset: input.preset,
    limitedEquipment:
      input.preset === "limited" ? input.limitedEquipment : null,
  });
  if (input.preset === "limited" && onboardingIds.length === 0) {
    return {
      ok: false,
      error: "Limited equipment requires at least one item on the checklist.",
    };
  }

  const homeAvailable = parseJsonArray(
    profile.trainingExperience?.availableEquipment,
  );
  const homeSnapshot = serializeHomeEquipmentSnapshot({
    availableEquipment: homeAvailable,
    equipmentProfileId:
      profile.trainingExperience?.equipmentProfileId ?? null,
  });

  let programId: string | null = null;
  let preTravelVersionNumber: number | null = null;

  const activeProgram = await prisma.program.findFirst({
    where: {
      athleteProfileId: profile.id,
      kind: "athlete",
      status: "active",
    },
    select: { id: true, currentVersionNumber: true },
    orderBy: { updatedAt: "desc" },
  });

  if (activeProgram && featureFlags.programVersionControl) {
    const { createProgramVersion } = await import(
      "@/services/program-version"
    );
    const checkpoint = await createProgramVersion({
      programId: activeProgram.id,
      changedByUserId: input.userId,
      reason: `Pre-travel checkpoint (${TRAVEL_PRESETS[input.preset].label})`,
      source: "checkpoint",
    });
    if (checkpoint.ok) {
      programId = activeProgram.id;
      preTravelVersionNumber = checkpoint.version.versionNumber;
    } else {
      // Still allow travel — home equipment restores even if versioning fails.
      programId = activeProgram.id;
      preTravelVersionNumber = null;
    }
  } else if (activeProgram) {
    programId = activeProgram.id;
    preTravelVersionNumber = null;
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.trainingExperience.upsert({
      where: { athleteProfileId: profile.id },
      create: {
        athleteProfileId: profile.id,
        availableEquipment: JSON.stringify(onboardingIds),
        equipmentProfileId: "custom",
      },
      update: {
        availableEquipment: JSON.stringify(onboardingIds),
        equipmentProfileId: "custom",
      },
    });

    return tx.travelTrainingMode.create({
      data: {
        athleteProfileId: profile.id,
        preset: input.preset,
        status: "active",
        equipmentOverrideJson: JSON.stringify(onboardingIds),
        homeEquipmentSnapshotJson: homeSnapshot,
        programId,
        preTravelVersionNumber,
        notes: input.notes?.trim() || null,
        engineVersion: TRAVEL_TRAINING_ENGINE_VERSION,
      },
    });
  });

  return { ok: true, travelModeId: row.id };
}

/**
 * End travel: restore home equipment + pre-travel program version.
 */
export async function endTravelMode(input: {
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.travelTrainingMode) {
    return { ok: false, error: "Travel Training Mode is not enabled." };
  }

  const profile = await requireAthlete(input.userId);
  if (!profile) return { ok: false, error: "No athlete profile." };

  const active = await prisma.travelTrainingMode.findFirst({
    where: { athleteProfileId: profile.id, status: "active" },
  });
  if (!active) {
    return { ok: false, error: "No active Travel Mode to end." };
  }

  const home = parseHomeEquipmentSnapshot(active.homeEquipmentSnapshotJson) ?? {
    availableEquipment: [],
    equipmentProfileId: null,
  };

  // Restore program first (while still marked traveling), then equipment + status.
  if (
    active.programId &&
    active.preTravelVersionNumber != null &&
    featureFlags.programVersionControl
  ) {
    const { restoreProgramVersion } = await import(
      "@/services/program-version"
    );
    await restoreProgramVersion({
      programId: active.programId,
      athleteProfileId: profile.id,
      versionNumber: active.preTravelVersionNumber,
      changedByUserId: input.userId,
      reason: "End travel — return to pre-travel program",
    });
  }

  await prisma.$transaction(async (tx) => {
    await tx.trainingExperience.upsert({
      where: { athleteProfileId: profile.id },
      create: {
        athleteProfileId: profile.id,
        availableEquipment: JSON.stringify(home.availableEquipment),
        equipmentProfileId: home.equipmentProfileId,
      },
      update: {
        availableEquipment: JSON.stringify(home.availableEquipment),
        equipmentProfileId: home.equipmentProfileId,
      },
    });

    await tx.travelTrainingMode.update({
      where: { id: active.id },
      data: {
        status: "ended",
        endedAt: new Date(),
      },
    });
  });

  return { ok: true };
}

export async function getActiveTravelCatalogEquipment(
  userId: string,
): Promise<EquipmentKey[] | null> {
  if (!featureFlags.travelTrainingMode) return null;
  const view = await getTravelModeView({ userId });
  if (!view.ok || !view.view.current) return null;
  return view.view.current.catalogKeys;
}
