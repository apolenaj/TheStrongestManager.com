/**
 * Purge private technique video files for an athlete before account deletion.
 */

import { prisma } from "@/lib/db";
import { deleteTechniqueVideo } from "@/services/technique/storage";

export async function purgeTechniqueVideosForUser(
  userId: string,
): Promise<{ deletedFiles: number }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      techniqueAnalyses: {
        select: { storageKey: true },
        where: { storageKey: { not: null } },
      },
    },
  });

  let deletedFiles = 0;
  for (const row of profile?.techniqueAnalyses ?? []) {
    if (!row.storageKey) continue;
    await deleteTechniqueVideo(row.storageKey);
    deletedFiles += 1;
  }

  return { deletedFiles };
}

/**
 * Soft-delete all remaining technique analyses and clear media fields for a user.
 * Used when the athlete chooses “delete all uploaded videos” without full account wipe.
 */
export async function deleteAllTechniqueVideosForUser(
  userId: string,
): Promise<{ ok: true; deletedCount: number } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile not found." };
  }

  const rows = await prisma.techniqueAnalysis.findMany({
    where: {
      athleteProfileId: profile.id,
      deletedAt: null,
    },
    select: { id: true, storageKey: true },
  });

  for (const row of rows) {
    if (row.storageKey) {
      await deleteTechniqueVideo(row.storageKey);
    }
    await prisma.techniqueAnalysis.update({
      where: { id: row.id },
      data: {
        status: "deleted",
        deletedAt: new Date(),
        storageKey: null,
        mediaUrl: null,
        summary: "Upload deleted by athlete. Media removed from private storage.",
        overallScore: null,
        confidenceBasis: null,
        movementReportJson: null,
        poseProvider: null,
        poseFrameCount: null,
      },
    });
  }

  return { ok: true, deletedCount: rows.length };
}
