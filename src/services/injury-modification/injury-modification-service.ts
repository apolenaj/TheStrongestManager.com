/**
 * Injury-Modification Architecture service (Prompt 130).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  INJURY_DECLARATION_DESCRIPTIONS,
  INJURY_DECLARATION_KINDS,
  INJURY_DECLARATION_LABELS,
  INJURY_MODIFICATION_ENGINE_VERSION,
  INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
  isInjuryDeclarationKind,
  resolveInjuryModificationPlan,
  type InjuryDeclarationKind,
  type InjuryModificationPlan,
  type InjuryModificationRecord,
} from "@/domain/injury-modification";
import { isPainSafeModeActiveForAthlete } from "@/services/pain-safe-response-system";

function toRecord(row: {
  id: string;
  declarationKind: string;
  status: string;
  notes: string | null;
  affectedArea: string | null;
  instructionSource: string | null;
  startsAt: Date;
  endsAt: Date | null;
  clearedAt: Date | null;
}): InjuryModificationRecord | null {
  if (!isInjuryDeclarationKind(row.declarationKind)) return null;
  if (row.status !== "active" && row.status !== "cleared") return null;
  return {
    id: row.id,
    declarationKind: row.declarationKind,
    status: row.status,
    notes: row.notes,
    affectedArea: row.affectedArea,
    instructionSource: row.instructionSource,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    clearedAt: row.clearedAt?.toISOString() ?? null,
  };
}

export type InjuryModificationView = {
  plan: InjuryModificationPlan;
  records: InjuryModificationRecord[];
  declarationOptions: Array<{
    id: InjuryDeclarationKind;
    label: string;
    description: string;
  }>;
  healthcareDisclaimer: string;
};

export async function getInjuryModificationView(input: {
  userId: string;
}): Promise<
  | { ok: true; view: InjuryModificationView }
  | { ok: false; error: string }
> {
  if (!featureFlags.injuryModification) {
    return {
      ok: false,
      error: "Injury-Modification Architecture is not enabled.",
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const [rows, painSafeActive] = await Promise.all([
    prisma.injuryModification.findMany({
      where: { athleteProfileId: profile.id },
      orderBy: [{ status: "asc" }, { startsAt: "desc" }],
      take: 30,
    }),
    isPainSafeModeActiveForAthlete(profile.id),
  ]);

  const records = rows
    .map(toRecord)
    .filter((r): r is InjuryModificationRecord => r != null);

  const plan = resolveInjuryModificationPlan({
    records,
    painSafeActive,
  });

  return {
    ok: true,
    view: {
      plan,
      records,
      declarationOptions: INJURY_DECLARATION_KINDS.map((id) => ({
        id,
        label: INJURY_DECLARATION_LABELS[id],
        description: INJURY_DECLARATION_DESCRIPTIONS[id],
      })),
      healthcareDisclaimer: INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
    },
  };
}

export async function isInjuryModificationActiveForAthlete(
  athleteProfileId: string,
): Promise<boolean> {
  if (!featureFlags.injuryModification) return false;
  const row = await prisma.injuryModification.findFirst({
    where: { athleteProfileId, status: "active" },
    select: { id: true },
  });
  return Boolean(row);
}

export async function isInjuryModificationActiveForUser(
  userId: string,
): Promise<boolean> {
  if (!featureFlags.injuryModification) return false;
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return false;
  return isInjuryModificationActiveForAthlete(profile.id);
}

export async function createInjuryModification(input: {
  userId: string;
  declarationKind: InjuryDeclarationKind;
  notes?: string | null;
  affectedArea?: string | null;
  instructionSource?: string | null;
  endsAt?: Date | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!featureFlags.injuryModification) {
    return { ok: false, error: "Feature off." };
  }
  if (!isInjuryDeclarationKind(input.declarationKind)) {
    return { ok: false, error: "Choose a valid limitation type." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const row = await prisma.injuryModification.create({
    data: {
      athleteProfileId: profile.id,
      declarationKind: input.declarationKind,
      status: "active",
      notes: input.notes?.trim() || null,
      affectedArea: input.affectedArea?.trim() || null,
      instructionSource:
        input.declarationKind === "professional_instruction"
          ? input.instructionSource?.trim() || null
          : null,
      endsAt: input.endsAt ?? null,
      engineVersion: INJURY_MODIFICATION_ENGINE_VERSION,
    },
  });

  return { ok: true, id: row.id };
}

export async function clearInjuryModification(input: {
  userId: string;
  modificationId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.injuryModification) {
    return { ok: false, error: "Feature off." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const existing = await prisma.injuryModification.findFirst({
    where: {
      id: input.modificationId,
      athleteProfileId: profile.id,
      status: "active",
    },
  });
  if (!existing) {
    return { ok: false, error: "Active limitation not found." };
  }

  await prisma.injuryModification.update({
    where: { id: existing.id },
    data: {
      status: "cleared",
      clearedAt: new Date(),
    },
  });

  return { ok: true };
}
