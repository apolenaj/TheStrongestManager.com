"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { prisma } from "@/lib/db";
import {
  PAIN_SAFE_CATEGORIES,
  type PainSafeCategory,
} from "@/domain/pain-safe-response-system";
import {
  clearPainSafeReport,
  createPainSafeReport,
} from "@/services/pain-safe-response-system";

async function profileIdForSession() {
  const session = await requireSession();
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return profile?.id ?? null;
}

export async function reportPainSafeSymptomAction(formData: FormData) {
  const athleteProfileId = await profileIdForSession();
  if (!athleteProfileId) return;

  const categoryRaw = String(formData.get("category") ?? "");
  if (!(PAIN_SAFE_CATEGORIES as readonly string[]).includes(categoryRaw)) {
    return;
  }
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await createPainSafeReport({
    athleteProfileId,
    category: categoryRaw as PainSafeCategory,
    notes,
  });
  revalidatePath("/app/pain-safe-response");
  revalidatePath("/app/adaptations");
}

export async function clearPainSafeReportAction(formData: FormData) {
  const athleteProfileId = await profileIdForSession();
  if (!athleteProfileId) return;
  const reportId = String(formData.get("reportId") ?? "");
  if (!reportId) return;
  await clearPainSafeReport({ athleteProfileId, reportId });
  revalidatePath("/app/pain-safe-response");
  revalidatePath("/app/adaptations");
}
