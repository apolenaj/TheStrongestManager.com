"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { prisma } from "@/lib/db";
import {
  createProgramVersion,
  restoreProgramVersion,
} from "@/services/program-version";

export type ProgramVersionActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

async function ownedProgramId(
  userId: string,
  programId: string,
): Promise<string | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;
  const program = await prisma.program.findFirst({
    where: { id: programId, athleteProfileId: profile.id },
    select: { id: true },
  });
  return program?.id ?? null;
}

export async function saveProgramVersionAction(
  _prev: ProgramVersionActionState,
  formData: FormData,
): Promise<ProgramVersionActionState> {
  const session = await requireSession();
  const programId = String(formData.get("programId") ?? "");
  const reason = String(formData.get("reason") ?? "");

  const owned = await ownedProgramId(session.user.id, programId);
  if (!owned) return { ok: false, error: "Program not found." };

  const result = await createProgramVersion({
    programId: owned,
    changedByUserId: session.user.id,
    reason,
    source: "save",
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/app/programs/${owned}/versions`);
  revalidatePath(`/app/programs/${owned}`);
  revalidatePath("/app/programs");

  return {
    ok: true,
    message: `Saved ${result.version.label}: ${result.version.reason}`,
  };
}

export async function restoreProgramVersionAction(
  _prev: ProgramVersionActionState,
  formData: FormData,
): Promise<ProgramVersionActionState> {
  const session = await requireSession();
  const programId = String(formData.get("programId") ?? "");
  const versionNumber = Number(formData.get("versionNumber") ?? 0);
  const reason = String(formData.get("reason") ?? "");

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile not found." };

  const result = await restoreProgramVersion({
    programId,
    athleteProfileId: profile.id,
    versionNumber,
    changedByUserId: session.user.id,
    reason,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/app/programs/${programId}/versions`);
  revalidatePath(`/app/programs/${programId}`);
  revalidatePath("/app/programs");

  return {
    ok: true,
    message: `Restored ${result.restoredToLabel} as v${result.newVersionNumber}. Protected completed sessions: ${result.protectedSessionCount}.`,
  };
}
