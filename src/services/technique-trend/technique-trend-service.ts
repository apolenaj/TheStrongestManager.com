import { prisma } from "@/lib/db";
import { parseStoredMovementReport } from "@/services/movement/persist-report";
import {
  assembleTechniqueTrends,
  type TechniqueTrendResult,
  type TechniqueTrendSample,
} from "@/domain/technique-trend";
import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { DeadliftTechniqueComponentId } from "@/domain/movement/deadlift/score/thresholds";

const MAX_ANALYSES = 40;

function asConfidence(raw: string | undefined | null): ConfidenceLevel {
  if (raw === "none" || raw === "low" || raw === "medium" || raw === "high") {
    return raw;
  }
  return "low";
}

export type TechniqueTrendView = {
  result: TechniqueTrendResult;
  profileId: string;
};

/**
 * Load scored technique analyses and assemble longitudinal trends.
 * UI must not invent series client-side.
 */
export async function getTechniqueTrends(
  userId: string,
): Promise<TechniqueTrendView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const rows = await prisma.techniqueAnalysis.findMany({
    where: {
      athleteProfileId: profile.id,
      deletedAt: null,
      status: "completed",
      overallScore: { not: null },
    },
    orderBy: { createdAt: "asc" },
    take: MAX_ANALYSES,
    select: {
      id: true,
      createdAt: true,
      cameraAngle: true,
      overallScore: true,
      confidenceBasis: true,
      movementReportJson: true,
      exercise: { select: { name: true, slug: true } },
    },
  });

  const samples: TechniqueTrendSample[] = [];
  for (const row of rows) {
    if (row.overallScore == null || !row.exercise) continue;
    const report = parseStoredMovementReport(row.movementReportJson);
    const assessment = report?.techniqueAssessment;
    const components =
      assessment?.components
        ?.filter(
          (c) =>
            c.status === "observed" &&
            c.score != null &&
            Number.isFinite(c.score),
        )
        .map((c) => ({
          id: c.id as DeadliftTechniqueComponentId | string,
          label: c.label,
          score: c.score as number,
        })) ?? [];

    samples.push({
      analysisId: row.id,
      createdAtIso: row.createdAt.toISOString(),
      exerciseSlug: row.exercise.slug,
      exerciseName: row.exercise.name,
      cameraAngle: row.cameraAngle ?? "unknown",
      overallScore: row.overallScore,
      confidence: asConfidence(
        assessment?.confidence ?? row.confidenceBasis,
      ),
      components,
      href: `/app/technique/${row.id}`,
    });
  }

  return {
    profileId: profile.id,
    result: assembleTechniqueTrends(samples),
  };
}
