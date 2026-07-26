import { MOVEMENT_MVP_EXERCISE_SLUGS } from "@/domain/movement/constants";
import { DATABASE_SCALE_PAGE_SIZES } from "@/domain/database-scale";
import { prisma } from "@/lib/db";
import {
  TECHNIQUE_PRIVACY_COPY,
  type CameraAngleId,
} from "@/domain/technique/constants";
import {
  VIDEO_PRIVACY_POLICY_VERSION,
  buildVideoPrivacyNote,
  parseVideoPrivacyFromFlags,
} from "@/domain/video-privacy";
import { featureFlags } from "@/config/feature-flags";
import {
  sniffVideoContainer,
  validateTechniqueVideo,
} from "@/domain/technique/validation";
import { buildSignedMediaPath } from "@/services/technique/media-signing";
import { parseStoredMovementReport } from "@/services/movement/persist-report";
import {
  buildStorageKey,
  deleteTechniqueVideo,
  extensionForMime,
  saveTechniqueVideo,
} from "@/services/technique/storage";
import { toCanonicalKg } from "@/services/units/convert";
import { normalizeMassUnit } from "@/services/units/convert";
import {
  deductAnalysisCredit,
  refundAnalysisCredit,
} from "@/services/billing/credit-service";

/**
 * Honest backend availability when pose MVP does not apply.
 * Deadlift uploads use analysisBackendStatus=pose_mvp_ready instead.
 */
export function resolveAnalysisBackendStatus(
  env: {
    NODE_ENV?: string;
    TECHNIQUE_ANALYSIS_BACKEND?: string;
  } = process.env,
): "unavailable" | "development_stub" {
  if (env.TECHNIQUE_ANALYSIS_BACKEND === "enabled") {
    return "unavailable";
  }
  return env.NODE_ENV === "development" ? "development_stub" : "unavailable";
}

function awaitingSummary(backend: string): string {
  if (backend === "development_stub") {
    return "Development-only status: video was stored securely, but no analysis backend is configured. No technique score was generated.";
  }
  return "Analysis backend is unavailable. Your video was stored privately. No technique score was generated.";
}

function supportsMovementMvp(slug: string): boolean {
  return (MOVEMENT_MVP_EXERCISE_SLUGS as readonly string[]).includes(slug);
}

export type CreateTechniqueUploadInput = {
  userId: string;
  exerciseId: string;
  cameraAngle: CameraAngleId;
  loadRaw: string | null;
  loadUnitPreference: string | null;
  repsRaw: string | null;
  consent: boolean;
  /** Explicit opt-in — default false; never implied. */
  allowExpertReview?: boolean;
  /** Explicit opt-in — default false; never implied. */
  allowAnonymousModelImprovement?: boolean;
  file: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    size: number;
  };
  clientMeta: {
    durationSeconds: number;
    widthPx: number;
    heightPx: number;
  };
};

export async function createTechniqueUpload(input: CreateTechniqueUploadInput) {
  const privacy = parseVideoPrivacyFromFlags({
    analysisConsent: input.consent,
    allowExpertReview: Boolean(input.allowExpertReview),
    allowAnonymousModelImprovement: Boolean(
      input.allowAnonymousModelImprovement,
    ),
  });
  if (!privacy.ok) {
    return { ok: false as const, error: privacy.error };
  }

  const validation = validateTechniqueVideo({
    mimeType: input.file.mimeType,
    fileSizeBytes: input.file.size,
    durationSeconds: input.clientMeta.durationSeconds,
    widthPx: input.clientMeta.widthPx,
    heightPx: input.clientMeta.heightPx,
    fileName: input.file.fileName,
  });
  if (!validation.ok) {
    return validation;
  }

  const sniffed = sniffVideoContainer(input.file.buffer.subarray(0, 32));
  if (sniffed && sniffed !== validation.mimeType) {
    // Allow mp4/quicktime interchange when brands overlap.
    const compatible =
      (sniffed === "video/mp4" || sniffed === "video/quicktime") &&
      (validation.mimeType === "video/mp4" ||
        validation.mimeType === "video/quicktime");
    if (!compatible) {
      return {
        ok: false as const,
        error: "File contents do not match the declared video type.",
      };
    }
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true, units: true },
  });
  if (!profile) {
    return { ok: false as const, error: "Athlete profile required." };
  }

  const exercise = await prisma.exercise.findFirst({
    where: { id: input.exerciseId, isPublished: true },
    select: { id: true, name: true, slug: true },
  });
  if (!exercise) {
    return { ok: false as const, error: "Choose a published exercise." };
  }

  let loadKg: number | null = null;
  if (input.loadRaw && input.loadRaw.trim() !== "") {
    const units = normalizeMassUnit(
      input.loadUnitPreference ?? profile.units,
    );
    const parsed = Number(input.loadRaw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { ok: false as const, error: "Enter a valid optional load." };
    }
    loadKg = toCanonicalKg(parsed, units);
  }

  let reps: number | null = null;
  if (input.repsRaw && input.repsRaw.trim() !== "") {
    const parsed = Number(input.repsRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
      return { ok: false as const, error: "Reps must be a whole number 1–50." };
    }
    reps = parsed;
  }

  const movementMvp = supportsMovementMvp(exercise.slug);
  const backend = movementMvp ? "pose_mvp_ready" : resolveAnalysisBackendStatus();
  const status = movementMvp ? "awaiting_pose" : "awaiting_backend";
  const summary = movementMvp
    ? "Video stored privately. Deadlift movement analysis is ready: extract pose landmarks, then phases → observable metrics → heuristics. No Technique Score will be invented."
    : awaitingSummary(backend);

  const now = new Date();
  const privacyNote = featureFlags.videoPrivacyControls
    ? buildVideoPrivacyNote(privacy.choices)
    : TECHNIQUE_PRIVACY_COPY;

  const analysis = await prisma.techniqueAnalysis.create({
    data: {
      athleteProfileId: profile.id,
      exerciseId: exercise.id,
      status,
      overallScore: null,
      confidenceBasis: null,
      summary,
      analysisBackendStatus: backend,
      cameraAngle: input.cameraAngle,
      loadKg,
      reps,
      analysisConsentAt: now,
      allowExpertReview: privacy.choices.allowExpertReview,
      expertReviewConsentAt: privacy.choices.allowExpertReview ? now : null,
      modelImprovementConsentAt: privacy.choices.allowAnonymousModelImprovement
        ? now
        : null,
      videoPrivacyVersion: VIDEO_PRIVACY_POLICY_VERSION,
      privacyNote,
      originalFileName: input.file.fileName,
      mimeType: validation.mimeType,
      fileSizeBytes: input.file.size,
      durationSeconds: input.clientMeta.durationSeconds,
      widthPx: input.clientMeta.widthPx,
      heightPx: input.clientMeta.heightPx,
    },
  });

  const charge = await deductAnalysisCredit({
    userId: input.userId,
    analysisId: analysis.id,
  });
  if (!charge.ok) {
    await prisma.techniqueAnalysis.delete({ where: { id: analysis.id } });
    return { ok: false as const, error: charge.error };
  }

  const storageKey = buildStorageKey(
    profile.id,
    analysis.id,
    extensionForMime(validation.mimeType),
  );

  try {
    await saveTechniqueVideo(storageKey, input.file.buffer);
  } catch (error) {
    await refundAnalysisCredit({
      userId: input.userId,
      analysisId: analysis.id,
      reason: `Refund: storage system error on analysis ${analysis.id}`,
    });
    await prisma.techniqueAnalysis.delete({ where: { id: analysis.id } });
    throw error;
  }

  await prisma.techniqueAnalysis.update({
    where: { id: analysis.id },
    data: { storageKey },
  });

  const { trackProductEventSafe } = await import("@/services/analytics/track");
  trackProductEventSafe({
    name: "technique_analysis_uploaded",
    props: {
      analysisId: analysis.id,
      exerciseSlug: exercise.slug,
      movementMvp,
    },
    userId: input.userId,
  });

  return {
    ok: true as const,
    analysisId: analysis.id,
    status,
    analysisBackendStatus: backend,
    overallScore: null,
    creditsRemaining: charge.skippedUnlimited ? null : charge.balanceAfter,
  };
}

export async function listTechniqueAnalysesForUser(
  userId: string,
  options?: { take?: number },
) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return [];

  return prisma.techniqueAnalysis.findMany({
    where: {
      athleteProfileId: profile.id,
      deletedAt: null,
      status: { not: "deleted" },
    },
    orderBy: { createdAt: "desc" },
    take: options?.take ?? DATABASE_SCALE_PAGE_SIZES.techniqueList,
    include: {
      exercise: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getTechniqueAnalysisForUser(
  userId: string,
  analysisId: string,
) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const row = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: analysisId,
      athleteProfileId: profile.id,
      deletedAt: null,
    },
    include: {
      exercise: { select: { id: true, name: true, slug: true } },
      metrics: true,
    },
  });
  if (!row) return null;

  return {
    ...row,
    // Never imply a score when backend did not produce one.
    overallScore: row.overallScore,
    signedMediaPath: row.storageKey
      ? buildSignedMediaPath(row.id, userId)
      : null,
    movementReport: parseStoredMovementReport(row.movementReportJson),
  };
}

export async function deleteTechniqueAnalysisForUser(
  userId: string,
  analysisId: string,
) {
  const row = await getTechniqueAnalysisForUser(userId, analysisId);
  if (!row) {
    return { ok: false as const, error: "Analysis not found." };
  }

  if (row.storageKey) {
    await deleteTechniqueVideo(row.storageKey);
  }

  await prisma.techniqueAnalysis.update({
    where: { id: analysisId },
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

  return { ok: true as const };
}

/**
 * Athlete updates optional video privacy opts — never implies consent.
 * Analysis-only remains required (already recorded at upload).
 */
export async function updateVideoPrivacyForUser(input: {
  userId: string;
  analysisId: string;
  allowExpertReview: boolean;
  allowAnonymousModelImprovement: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const row = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: input.analysisId,
      athleteProfileId: profile.id,
      deletedAt: null,
    },
    select: {
      id: true,
      analysisConsentAt: true,
      allowExpertReview: true,
      expertReviewConsentAt: true,
      modelImprovementConsentAt: true,
    },
  });
  if (!row) {
    return { ok: false, error: "Analysis not found." };
  }
  if (!row.analysisConsentAt) {
    return {
      ok: false,
      error: "This upload has no analysis consent on file.",
    };
  }

  const now = new Date();
  const choices = {
    analysisOnly: true as const,
    allowExpertReview: Boolean(input.allowExpertReview),
    allowAnonymousModelImprovement: Boolean(
      input.allowAnonymousModelImprovement,
    ),
  };

  await prisma.techniqueAnalysis.update({
    where: { id: row.id },
    data: {
      allowExpertReview: choices.allowExpertReview,
      expertReviewConsentAt: choices.allowExpertReview
        ? row.expertReviewConsentAt ?? now
        : null,
      modelImprovementConsentAt: choices.allowAnonymousModelImprovement
        ? row.modelImprovementConsentAt ?? now
        : null,
      videoPrivacyVersion: VIDEO_PRIVACY_POLICY_VERSION,
      privacyNote: buildVideoPrivacyNote(choices),
    },
  });

  return { ok: true };
}
