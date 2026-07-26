import { prisma } from "@/lib/db";
import { parseStoredMovementReport } from "@/services/movement/persist-report";
import { buildSignedMediaPath } from "@/services/technique/media-signing";
import {
  assembleVideoComparison,
  VIDEO_COMPARISON_ENGINE_VERSION,
  VIDEO_COMPARISON_HONESTY,
  type VideoComparisonResult,
} from "@/domain/video-comparison";

export type VideoComparisonView = {
  result: VideoComparisonResult;
  profileId: string;
};

async function loadSide(input: {
  userId: string;
  profileId: string;
  analysisId: string;
}) {
  const row = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: input.analysisId,
      athleteProfileId: input.profileId,
      deletedAt: null,
      status: { not: "deleted" },
    },
    include: {
      exercise: { select: { name: true, slug: true } },
    },
  });
  if (!row) return null;

  return {
    analysisId: row.id,
    createdAtIso: row.createdAt.toISOString(),
    cameraAngle: row.cameraAngle,
    exerciseSlug: row.exercise?.slug ?? null,
    exerciseName: row.exercise?.name ?? null,
    overallScore: row.overallScore,
    confidence: row.confidenceBasis,
    durationSeconds: row.durationSeconds,
    signedMediaPath: row.storageKey
      ? buildSignedMediaPath(row.id, input.userId)
      : null,
    report: parseStoredMovementReport(row.movementReportJson),
    // Pose landmarks are not persisted after analysis — overlay stays honest.
    landmarkFrames: [],
  };
}

/**
 * Build old vs new side-by-side comparison for the athlete.
 */
export async function getVideoComparison(input: {
  userId: string;
  oldAnalysisId: string;
  newAnalysisId: string;
}): Promise<VideoComparisonView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return null;

  if (input.oldAnalysisId === input.newAnalysisId) {
    return {
      profileId: profile.id,
      result: {
        engineVersion: VIDEO_COMPARISON_ENGINE_VERSION,
        oldSide: {
          analysisId: input.oldAnalysisId,
          label: "Old lift",
          createdAtIso: new Date(0).toISOString(),
          cameraAngle: null,
          exerciseSlug: null,
          exerciseName: null,
          overallScore: null,
          confidence: null,
          durationSeconds: null,
          signedMediaPath: null,
          landmarkFrames: [],
          phases: [],
          components: [],
          metrics: [],
        },
        newSide: {
          analysisId: input.newAnalysisId,
          label: "New lift",
          createdAtIso: new Date(0).toISOString(),
          cameraAngle: null,
          exerciseSlug: null,
          exerciseName: null,
          overallScore: null,
          confidence: null,
          durationSeconds: null,
          signedMediaPath: null,
          landmarkFrames: [],
          phases: [],
          components: [],
          metrics: [],
        },
        metricsComparable: false,
        cameraWarning: null,
        startPositionRows: [],
        movementPathRows: [],
        techniqueMetricRows: [],
        phaseRows: [],
        landmarksAvailable: false,
        honesty: VIDEO_COMPARISON_HONESTY,
        emptyReason: "Pick two different analyses to compare.",
      } satisfies VideoComparisonResult,
    };
  }

  const [oldSide, newSide] = await Promise.all([
    loadSide({
      userId: input.userId,
      profileId: profile.id,
      analysisId: input.oldAnalysisId,
    }),
    loadSide({
      userId: input.userId,
      profileId: profile.id,
      analysisId: input.newAnalysisId,
    }),
  ]);

  if (!oldSide || !newSide) return null;

  // Chronological labels: ensure "old" is earlier when ids swapped
  let left = oldSide;
  let right = newSide;
  if (new Date(oldSide.createdAtIso) > new Date(newSide.createdAtIso)) {
    left = newSide;
    right = oldSide;
  }

  return {
    profileId: profile.id,
    result: assembleVideoComparison({ old: left, new: right }),
  };
}

/**
 * Resolve a previous analysis id for the same exercise to open compare from a report.
 */
export async function resolvePreviousAnalysisId(input: {
  userId: string;
  currentAnalysisId: string;
}): Promise<string | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return null;

  const current = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: input.currentAnalysisId,
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
      id: { not: input.currentAnalysisId },
      createdAt: { lt: current.createdAt },
      storageKey: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  return previous?.id ?? null;
}
