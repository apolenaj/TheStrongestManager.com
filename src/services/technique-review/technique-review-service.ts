/**
 * Optional expert review of technique analyses (Prompt 95).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  TECHNIQUE_REVIEW_ENGINE_VERSION,
  TECHNIQUE_REVIEW_HONESTY,
  classifyTechniqueDisagreement,
  decisionToReviewStatus,
  isTechniqueExpertDecision,
  presentTechniqueAuthorship,
  type TechniqueExpertDecision,
} from "@/domain/technique-review";
import { isVerifiedExpertContributor } from "@/domain/expert-contributor";
import { prisma } from "@/lib/db";
import { buildSignedMediaPath } from "@/services/technique/media-signing";
import { recordTechniqueExpertReviewFeedback } from "@/services/model-feedback/model-feedback-service";

async function assertVerifiedExpert(userId: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const profile = await prisma.expertContributorProfile.findUnique({
    where: { userId },
    select: { verificationStatus: true },
  });
  if (!profile || !isVerifiedExpertContributor(profile.verificationStatus)) {
    return {
      ok: false,
      error: "Only verified Expert Contributors may review technique analyses.",
    };
  }
  return { ok: true };
}

export async function requestTechniqueExpertReview(input: {
  userId: string;
  analysisId: string;
  consent: boolean;
}): Promise<{ ok: true; reviewId: string } | { ok: false; error: string }> {
  if (!featureFlags.techniqueExpertReview) {
    return { ok: false, error: "Technique expert review is not enabled." };
  }
  if (!input.consent) {
    return {
      ok: false,
      error: "Consent is required to share this analysis with expert reviewers.",
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const analysis = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: input.analysisId,
      athleteProfileId: profile.id,
      deletedAt: null,
    },
    select: {
      id: true,
      status: true,
      expertReviewStatus: true,
      allowExpertReview: true,
      expertReviewConsentAt: true,
    },
  });
  if (!analysis) {
    return { ok: false, error: "Analysis not found." };
  }
  if (featureFlags.videoPrivacyControls) {
    const { videoAllowsExpertReview } = await import("@/domain/video-privacy");
    if (
      !videoAllowsExpertReview({
        allowExpertReview: analysis.allowExpertReview,
        expertReviewConsentAt: analysis.expertReviewConsentAt,
      })
    ) {
      return {
        ok: false,
        error:
          "Enable “Allow expert review” in video privacy controls before requesting a review.",
      };
    }
  }
  if (analysis.status === "deleted" || analysis.status === "failed") {
    return { ok: false, error: "This analysis cannot be reviewed." };
  }
  if (
    analysis.expertReviewStatus === "pending_review" ||
    analysis.expertReviewStatus === "confirmed" ||
    analysis.expertReviewStatus === "corrected" ||
    analysis.expertReviewStatus === "commented"
  ) {
    return {
      ok: false,
      error:
        analysis.expertReviewStatus === "pending_review"
          ? "Expert review already requested."
          : "This analysis already has an expert review.",
    };
  }

  const now = new Date();
  const review = await prisma.$transaction(async (tx) => {
    const row = await tx.techniqueExpertReview.create({
      data: {
        techniqueAnalysisId: analysis.id,
        athleteProfileId: profile.id,
        status: "pending_review",
        requestedByUserId: input.userId,
        requestedAt: now,
        engineVersion: TECHNIQUE_REVIEW_ENGINE_VERSION,
        autoRetrainBlocked: true,
        // Expert review rows do not silently enroll videos in model improvement.
        modelImprovementEligible: false,
      },
    });
    await tx.techniqueAnalysis.update({
      where: { id: analysis.id },
      data: {
        expertReviewStatus: "pending_review",
        expertReviewConsentAt: now,
        allowExpertReview: true,
      },
    });
    return row;
  });

  return { ok: true, reviewId: review.id };
}

export type TechniqueReviewQueueItem = {
  reviewId: string;
  analysisId: string;
  status: string;
  requestedAt: Date;
  exerciseName: string | null;
  cameraAngle: string | null;
  aiOverallScore: number | null;
  athleteLabel: string;
};

export async function listPendingTechniqueExpertReviews(input: {
  expertUserId: string;
}): Promise<
  | { ok: true; items: TechniqueReviewQueueItem[]; honesty: readonly string[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.techniqueExpertReview) {
    return { ok: false, error: "Technique expert review is not enabled." };
  }
  const gate = await assertVerifiedExpert(input.expertUserId);
  if (!gate.ok) return gate;

  const rows = await prisma.techniqueExpertReview.findMany({
    where: { status: "pending_review" },
    orderBy: { requestedAt: "asc" },
    take: 50,
    include: {
      techniqueAnalysis: {
        select: {
          id: true,
          overallScore: true,
          cameraAngle: true,
          exercise: { select: { name: true } },
          athleteProfile: { select: { displayName: true } },
        },
      },
    },
  });

  return {
    ok: true,
    honesty: TECHNIQUE_REVIEW_HONESTY,
    items: rows.map((r) => ({
      reviewId: r.id,
      analysisId: r.techniqueAnalysisId,
      status: r.status,
      requestedAt: r.requestedAt,
      exerciseName: r.techniqueAnalysis.exercise?.name ?? null,
      cameraAngle: r.techniqueAnalysis.cameraAngle,
      aiOverallScore: r.techniqueAnalysis.overallScore,
      athleteLabel:
        r.techniqueAnalysis.athleteProfile.displayName?.trim() || "Athlete",
    })),
  };
}

export type TechniqueReviewDetail = {
  reviewId: string;
  analysisId: string;
  status: string;
  decision: string | null;
  comment: string | null;
  correctedOverallScore: number | null;
  correctedSummary: string | null;
  disagreementKind: string;
  aiOverallScore: number | null;
  aiSummary: string | null;
  exerciseName: string | null;
  cameraAngle: string | null;
  signedMediaPath: string | null;
  authorship: ReturnType<typeof presentTechniqueAuthorship>;
};

export async function getTechniqueExpertReviewForExpert(input: {
  expertUserId: string;
  reviewId: string;
}): Promise<
  { ok: true; detail: TechniqueReviewDetail } | { ok: false; error: string }
> {
  if (!featureFlags.techniqueExpertReview) {
    return { ok: false, error: "Technique expert review is not enabled." };
  }
  const gate = await assertVerifiedExpert(input.expertUserId);
  if (!gate.ok) return gate;

  const row = await prisma.techniqueExpertReview.findUnique({
    where: { id: input.reviewId },
    include: {
      techniqueAnalysis: {
        select: {
          id: true,
          overallScore: true,
          summary: true,
          cameraAngle: true,
          storageKey: true,
          expertReviewStatus: true,
          exercise: { select: { name: true } },
        },
      },
    },
  });
  if (!row) return { ok: false, error: "Review not found." };

  return {
    ok: true,
    detail: {
      reviewId: row.id,
      analysisId: row.techniqueAnalysisId,
      status: row.status,
      decision: row.decision,
      comment: row.comment,
      correctedOverallScore: row.correctedOverallScore,
      correctedSummary: row.correctedSummary,
      disagreementKind: row.disagreementKind,
      aiOverallScore: row.techniqueAnalysis.overallScore,
      aiSummary: row.techniqueAnalysis.summary,
      exerciseName: row.techniqueAnalysis.exercise?.name ?? null,
      cameraAngle: row.techniqueAnalysis.cameraAngle,
      signedMediaPath: row.techniqueAnalysis.storageKey
        ? buildSignedMediaPath(row.techniqueAnalysis.id, input.expertUserId)
        : null,
      authorship: presentTechniqueAuthorship(
        row.techniqueAnalysis.expertReviewStatus,
      ),
    },
  };
}

export async function decideTechniqueExpertReview(input: {
  expertUserId: string;
  reviewId: string;
  decision: string;
  comment?: string;
  correctedOverallScore?: number | null;
  correctedSummary?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.techniqueExpertReview) {
    return { ok: false, error: "Technique expert review is not enabled." };
  }
  const gate = await assertVerifiedExpert(input.expertUserId);
  if (!gate.ok) return gate;

  if (!isTechniqueExpertDecision(input.decision)) {
    return { ok: false, error: "Choose Confirm, Correct, or Comment." };
  }
  const decision = input.decision as TechniqueExpertDecision;

  const comment = input.comment?.trim().slice(0, 2000) || null;
  const correctedSummary = input.correctedSummary?.trim().slice(0, 2000) || null;
  let correctedOverallScore =
    input.correctedOverallScore == null ||
    Number.isNaN(input.correctedOverallScore)
      ? null
      : Math.min(100, Math.max(0, input.correctedOverallScore));

  if (decision === "correct" && correctedOverallScore == null && !correctedSummary && !comment) {
    return {
      ok: false,
      error: "Corrections need a score, summary, and/or comment.",
    };
  }
  if (decision === "comment" && !comment) {
    return { ok: false, error: "Add a comment." };
  }
  if (decision === "confirm") {
    correctedOverallScore = null;
  }

  const row = await prisma.techniqueExpertReview.findUnique({
    where: { id: input.reviewId },
    include: {
      techniqueAnalysis: {
        select: { id: true, overallScore: true, summary: true },
      },
    },
  });
  if (!row || row.status !== "pending_review") {
    return { ok: false, error: "Review is not pending." };
  }

  const aiScore = row.techniqueAnalysis.overallScore;
  const aiSummary = row.techniqueAnalysis.summary;
  const disagreementKind = classifyTechniqueDisagreement({
    decision,
    aiOverallScore: aiScore,
    correctedOverallScore:
      decision === "correct" ? correctedOverallScore : null,
    aiSummary,
    correctedSummary: decision === "correct" ? correctedSummary : null,
    comment,
  });
  const status = decisionToReviewStatus(decision);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.techniqueExpertReview.update({
      where: { id: row.id },
      data: {
        status,
        decision,
        comment,
        correctedOverallScore:
          decision === "correct" ? correctedOverallScore : null,
        correctedSummary: decision === "correct" ? correctedSummary : null,
        disagreementKind,
        aiOverallScoreAtReview: aiScore,
        aiSummaryAtReview: aiSummary,
        expertUserId: input.expertUserId,
        decidedAt: now,
        autoRetrainBlocked: true,
        modelImprovementEligible: true,
      },
    });
    await tx.techniqueAnalysis.update({
      where: { id: row.techniqueAnalysisId },
      data: { expertReviewStatus: status },
    });
  });

  await recordTechniqueExpertReviewFeedback({
    expertUserId: input.expertUserId,
    athleteProfileId: row.athleteProfileId,
    reviewId: row.id,
    decision,
    reason: comment ?? undefined,
  });

  return { ok: true };
}

/** Athlete-facing review state for a owned analysis. */
export async function getTechniqueReviewStateForOwner(input: {
  userId: string;
  analysisId: string;
}): Promise<{
  enabled: boolean;
  expertReviewStatus: string;
  authorship: ReturnType<typeof presentTechniqueAuthorship>;
  latestReview: {
    id: string;
    status: string;
    decision: string | null;
    comment: string | null;
    correctedOverallScore: number | null;
    correctedSummary: string | null;
    disagreementKind: string;
  } | null;
  honesty: readonly string[];
}> {
  if (!featureFlags.techniqueExpertReview) {
    return {
      enabled: false,
      expertReviewStatus: "none",
      authorship: presentTechniqueAuthorship("none"),
      latestReview: null,
      honesty: TECHNIQUE_REVIEW_HONESTY,
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return {
      enabled: true,
      expertReviewStatus: "none",
      authorship: presentTechniqueAuthorship("none"),
      latestReview: null,
      honesty: TECHNIQUE_REVIEW_HONESTY,
    };
  }

  const analysis = await prisma.techniqueAnalysis.findFirst({
    where: { id: input.analysisId, athleteProfileId: profile.id },
    select: {
      expertReviewStatus: true,
      expertReviews: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          decision: true,
          comment: true,
          correctedOverallScore: true,
          correctedSummary: true,
          disagreementKind: true,
        },
      },
    },
  });

  const status = analysis?.expertReviewStatus ?? "none";
  const latest = analysis?.expertReviews[0] ?? null;

  return {
    enabled: true,
    expertReviewStatus: status,
    authorship: presentTechniqueAuthorship(status),
    latestReview: latest,
    honesty: TECHNIQUE_REVIEW_HONESTY,
  };
}
