import { prisma } from "@/lib/db";
import {
  canSubmitForManualReview,
  displayLevelLabel,
  elevateLevelFromEvidence,
  isLiftReviewStatus,
  isLiftVerificationLevel,
  isOfficiallyVerified,
  levelAfterApproval,
  LIFT_KEY_LABELS,
  parseLiftClaimMetadata,
  parseLiftKey,
  resolveLiftVerificationBadges,
  serializeLiftClaimMetadata,
  VERIFIED_LIFT_HONESTY,
  type LiftClaimEvidenceInput,
  type LiftClaimMetadata,
  type LiftKey,
  type LiftReviewTarget,
  type LiftVerificationBadge,
  type LiftVerificationLevel,
} from "@/domain/verified-lift";

export type VerifiedLiftClaimView = {
  id: string;
  liftKey: LiftKey;
  liftLabel: string;
  loadKg: number;
  reps: number;
  level: LiftVerificationLevel;
  displayLabel: string;
  isOfficiallyVerified: boolean;
  reviewStatus: string;
  reviewTarget: string | null;
  badges: LiftVerificationBadge[];
  hasVideoEvidence: boolean;
  techniqueAnalysisId: string | null;
  metadata: LiftClaimMetadata;
  athleteNote: string | null;
  reviewNote: string | null;
  submittedForReviewAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type VerifiedLiftPageView = {
  claims: VerifiedLiftClaimView[];
  honesty: readonly string[];
  techniqueOptions: Array<{ id: string; label: string }>;
};

function toEvidence(row: {
  level: string;
  reviewStatus: string;
  techniqueAnalysisId: string | null;
  videoStorageKey: string | null;
  metadataJson: string;
  loadKg: number;
  reps: number;
}): LiftClaimEvidenceInput {
  const level = isLiftVerificationLevel(row.level)
    ? row.level
    : "self_reported";
  const reviewStatus = isLiftReviewStatus(row.reviewStatus)
    ? row.reviewStatus
    : "none";
  return {
    level,
    reviewStatus,
    hasVideoEvidence: Boolean(
      row.techniqueAnalysisId || row.videoStorageKey?.trim(),
    ),
    metadata: parseLiftClaimMetadata(row.metadataJson),
    loadKg: row.loadKg,
    reps: row.reps,
  };
}

function toView(row: {
  id: string;
  liftKey: string;
  liftLabel: string | null;
  loadKg: number;
  reps: number;
  level: string;
  reviewStatus: string;
  reviewTarget: string | null;
  techniqueAnalysisId: string | null;
  videoStorageKey: string | null;
  metadataJson: string;
  athleteNote: string | null;
  reviewNote: string | null;
  submittedForReviewAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
}): VerifiedLiftClaimView {
  const evidence = toEvidence(row);
  const liftKey = parseLiftKey(row.liftKey);
  return {
    id: row.id,
    liftKey,
    liftLabel: row.liftLabel?.trim() || LIFT_KEY_LABELS[liftKey],
    loadKg: row.loadKg,
    reps: row.reps,
    level: evidence.level,
    displayLabel: displayLevelLabel(evidence),
    isOfficiallyVerified: isOfficiallyVerified(evidence),
    reviewStatus: evidence.reviewStatus,
    reviewTarget: row.reviewTarget,
    badges: resolveLiftVerificationBadges(evidence),
    hasVideoEvidence: evidence.hasVideoEvidence,
    techniqueAnalysisId: row.techniqueAnalysisId,
    metadata: evidence.metadata,
    athleteNote: row.athleteNote,
    reviewNote: row.reviewNote,
    submittedForReviewAt: row.submittedForReviewAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getVerifiedLiftPage(
  userId: string,
): Promise<VerifiedLiftPageView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      verifiedLiftClaims: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      techniqueAnalyses: {
        where: {
          deletedAt: null,
          OR: [
            { storageKey: { not: null } },
            { mediaUrl: { not: null } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          originalFileName: true,
          loadKg: true,
          createdAt: true,
          cameraAngle: true,
        },
      },
    },
  });
  if (!profile) return null;

  return {
    claims: profile.verifiedLiftClaims.map(toView),
    honesty: VERIFIED_LIFT_HONESTY,
    techniqueOptions: profile.techniqueAnalyses.map((t) => ({
      id: t.id,
      label: [
        t.originalFileName ?? "Technique video",
        t.loadKg != null ? `${t.loadKg} kg` : null,
        t.cameraAngle,
        t.createdAt.toISOString().slice(0, 10),
      ]
        .filter(Boolean)
        .join(" · "),
    })),
  };
}

export type CreateVerifiedLiftInput = {
  liftKey: string;
  liftLabel?: string | null;
  loadKg: number;
  reps: number;
  techniqueAnalysisId?: string | null;
  videoStorageKey?: string | null;
  metadata: LiftClaimMetadata;
  athleteNote?: string | null;
};

export async function createVerifiedLiftClaim(
  userId: string,
  input: CreateVerifiedLiftInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  if (!Number.isFinite(input.loadKg) || input.loadKg <= 0) {
    return { ok: false, error: "Enter a valid load in kg." };
  }
  if (!Number.isFinite(input.reps) || input.reps < 1 || input.reps > 100) {
    return { ok: false, error: "Reps must be between 1 and 100." };
  }

  const liftKey = parseLiftKey(input.liftKey);
  const techniqueAnalysisId = input.techniqueAnalysisId?.trim() || null;
  if (techniqueAnalysisId) {
    const tech = await prisma.techniqueAnalysis.findFirst({
      where: {
        id: techniqueAnalysisId,
        athleteProfileId: profile.id,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!tech) {
      return { ok: false, error: "Technique video not found for this athlete." };
    }
  }

  const evidence = toEvidence({
    level: "self_reported",
    reviewStatus: "none",
    techniqueAnalysisId,
    videoStorageKey: input.videoStorageKey ?? null,
    metadataJson: serializeLiftClaimMetadata(input.metadata),
    loadKg: input.loadKg,
    reps: input.reps,
  });
  const level = elevateLevelFromEvidence(evidence);

  const row = await prisma.verifiedLiftClaim.create({
    data: {
      athleteProfileId: profile.id,
      liftKey,
      liftLabel:
        input.liftLabel?.trim() ||
        (liftKey === "other" ? null : LIFT_KEY_LABELS[liftKey]),
      loadKg: input.loadKg,
      reps: input.reps,
      level,
      reviewStatus: "none",
      techniqueAnalysisId,
      videoStorageKey: input.videoStorageKey?.trim() || null,
      metadataJson: serializeLiftClaimMetadata(input.metadata),
      athleteNote: input.athleteNote?.trim() || null,
    },
  });

  return { ok: true, id: row.id };
}

export async function submitVerifiedLiftForReview(
  userId: string,
  claimId: string,
  target: LiftReviewTarget,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const claim = await prisma.verifiedLiftClaim.findFirst({
    where: { id: claimId, athleteProfileId: profile.id },
  });
  if (!claim) return { ok: false, error: "Claim not found." };

  const evidence = toEvidence(claim);
  const gate = canSubmitForManualReview(evidence, target);
  if (!gate.ok) return { ok: false, error: gate.reason };

  const nextLevel =
    target === "video_submitted" && evidence.hasVideoEvidence
      ? elevateLevelFromEvidence({
          ...evidence,
          level: "video_submitted",
        })
      : evidence.level === "self_reported" && evidence.hasVideoEvidence
        ? "video_submitted"
        : evidence.level;

  await prisma.verifiedLiftClaim.update({
    where: { id: claim.id },
    data: {
      reviewStatus: "pending_review",
      reviewTarget: target,
      submittedForReviewAt: new Date(),
      level: nextLevel,
      reviewNote: null,
      reviewedAt: null,
      reviewedByUserId: null,
    },
  });

  return { ok: true };
}

export type AdminLiftReviewQueueItem = VerifiedLiftClaimView & {
  athleteDisplayName: string | null;
  athleteProfileId: string;
};

export async function listPendingLiftReviews(): Promise<
  AdminLiftReviewQueueItem[]
> {
  const rows = await prisma.verifiedLiftClaim.findMany({
    where: { reviewStatus: "pending_review" },
    orderBy: { submittedForReviewAt: "asc" },
    take: 100,
    include: {
      athleteProfile: { select: { id: true, displayName: true } },
    },
  });

  return rows.map((row) => ({
    ...toView(row),
    athleteDisplayName: row.athleteProfile.displayName,
    athleteProfileId: row.athleteProfile.id,
  }));
}

export async function reviewVerifiedLiftClaim(
  adminUserId: string,
  claimId: string,
  decision: "approve" | "reject" | "revoke",
  note?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const claim = await prisma.verifiedLiftClaim.findUnique({
    where: { id: claimId },
  });
  if (!claim) return { ok: false, error: "Claim not found." };

  if (decision === "revoke") {
    await prisma.verifiedLiftClaim.update({
      where: { id: claimId },
      data: {
        reviewStatus: "revoked",
        level: "self_reported",
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
        reviewNote: note?.trim() || "Verification revoked.",
      },
    });
    return { ok: true };
  }

  if (claim.reviewStatus !== "pending_review") {
    return { ok: false, error: "Claim is not pending review." };
  }

  if (decision === "reject") {
    await prisma.verifiedLiftClaim.update({
      where: { id: claimId },
      data: {
        reviewStatus: "rejected",
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId,
        reviewNote: note?.trim() || "Rejected after review.",
      },
    });
    return { ok: true };
  }

  const target: LiftReviewTarget =
    claim.reviewTarget === "competition_verified"
      ? "competition_verified"
      : "video_submitted";
  const evidence = toEvidence(claim);
  const nextLevel = levelAfterApproval(evidence, target);

  await prisma.verifiedLiftClaim.update({
    where: { id: claimId },
    data: {
      reviewStatus: "approved",
      level: nextLevel,
      reviewedAt: new Date(),
      reviewedByUserId: adminUserId,
      reviewNote:
        note?.trim() ||
        (nextLevel === "competition_verified"
          ? "Approved — competition criteria met."
          : "Approved — video path only (not officially verified)."),
    },
  });

  return { ok: true };
}
