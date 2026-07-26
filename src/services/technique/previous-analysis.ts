import { prisma } from "@/lib/db";
import { parseStoredMovementReport } from "@/services/movement/persist-report";
import type { MovementReport } from "@/domain/movement/types";

export type PreviousTechniqueAnalysis = {
  id: string;
  createdAt: Date;
  overallScore: number | null;
  confidenceBasis: string | null;
  cameraAngle: string | null;
  movementReport: MovementReport | null;
};

/**
 * Most recent prior analysis for the same exercise (same athlete), for comparison UX.
 */
export async function getPreviousTechniqueAnalysisForUser(
  userId: string,
  currentAnalysisId: string,
): Promise<PreviousTechniqueAnalysis | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const current = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: currentAnalysisId,
      athleteProfileId: profile.id,
      deletedAt: null,
    },
    select: { exerciseId: true, createdAt: true },
  });
  if (!current?.exerciseId) return null;

  const previous = await prisma.techniqueAnalysis.findFirst({
    where: {
      athleteProfileId: profile.id,
      exerciseId: current.exerciseId,
      deletedAt: null,
      status: { not: "deleted" },
      id: { not: currentAnalysisId },
      createdAt: { lt: current.createdAt },
      OR: [
        { overallScore: { not: null } },
        { movementReportJson: { not: null } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      overallScore: true,
      confidenceBasis: true,
      cameraAngle: true,
      movementReportJson: true,
    },
  });

  if (!previous) return null;

  return {
    id: previous.id,
    createdAt: previous.createdAt,
    overallScore: previous.overallScore,
    confidenceBasis: previous.confidenceBasis,
    cameraAngle: previous.cameraAngle,
    movementReport: parseStoredMovementReport(previous.movementReportJson),
  };
}
