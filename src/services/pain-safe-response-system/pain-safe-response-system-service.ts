/**
 * Pain-Safe Response System service (Prompt 126).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  analyzePainSafeResponse,
  detectionsFromExplicitReports,
  detectionsFromText,
  type PainSafeAnalysis,
  type PainSafeCategory,
} from "@/domain/pain-safe-response-system";

export async function getPainSafeAnalysis(input: {
  athleteProfileId: string;
}): Promise<
  | { ok: true; analysis: PainSafeAnalysis }
  | { ok: false; error: string }
> {
  if (!featureFlags.painSafeResponseSystem) {
    return { ok: false, error: "Pain-Safe Response System is not enabled." };
  }

  const [reports, profile] = await Promise.all([
    prisma.painSafeReport.findMany({
      where: { athleteProfileId: input.athleteProfileId, active: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.athleteProfile.findUnique({
      where: { id: input.athleteProfileId },
      select: { movementNotes: true },
    }),
  ]);

  const detections = [
    ...detectionsFromExplicitReports(
      reports.map((r) => ({
        category: r.category as PainSafeCategory,
        notes: r.notes,
        source: r.source === "inferred" ? "inferred" : "user_report",
        active: r.active,
      })),
    ),
    ...(profile?.movementNotes
      ? detectionsFromText({
          text: profile.movementNotes,
          source: "inferred",
        })
      : []),
  ];

  return {
    ok: true,
    analysis: analyzePainSafeResponse({ detections }),
  };
}

export async function isPainSafeModeActiveForAthlete(
  athleteProfileId: string,
): Promise<boolean> {
  if (!featureFlags.painSafeResponseSystem) return false;
  const result = await getPainSafeAnalysis({ athleteProfileId });
  return result.ok && result.analysis.active;
}

export async function createPainSafeReport(input: {
  athleteProfileId: string;
  category: PainSafeCategory;
  notes?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!featureFlags.painSafeResponseSystem) {
    return { ok: false, error: "Pain-Safe Response System is not enabled." };
  }
  const row = await prisma.painSafeReport.create({
    data: {
      athleteProfileId: input.athleteProfileId,
      category: input.category,
      notes: input.notes?.trim() || null,
      source: "user_report",
      active: true,
    },
  });
  return { ok: true, id: row.id };
}

export async function clearPainSafeReport(input: {
  athleteProfileId: string;
  reportId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.painSafeResponseSystem) {
    return { ok: false, error: "Pain-Safe Response System is not enabled." };
  }
  const existing = await prisma.painSafeReport.findFirst({
    where: {
      id: input.reportId,
      athleteProfileId: input.athleteProfileId,
      active: true,
    },
  });
  if (!existing) {
    return { ok: false, error: "Active report not found." };
  }
  await prisma.painSafeReport.update({
    where: { id: existing.id },
    data: { active: false, clearedAt: new Date() },
  });
  return { ok: true };
}

export async function listActivePainSafeReports(athleteProfileId: string) {
  return prisma.painSafeReport.findMany({
    where: { athleteProfileId, active: true },
    orderBy: { createdAt: "desc" },
  });
}
