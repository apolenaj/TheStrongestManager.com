"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/admin/require-admin";
import { requireSession } from "@/services/auth/session";
import {
  createVerifiedLiftClaim,
  reviewVerifiedLiftClaim,
  submitVerifiedLiftForReview,
} from "@/services/verified-lift";
import type { LiftClaimMetadata, LiftReviewTarget } from "@/domain/verified-lift";

export type VerifiedLiftActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

function parseMetadata(formData: FormData): LiftClaimMetadata {
  const bodyweightRaw = String(formData.get("bodyweightKg") ?? "");
  const bodyweightKg = bodyweightRaw ? Number(bodyweightRaw) : undefined;
  const attemptRaw = String(formData.get("attemptNumber") ?? "");
  const attemptNumber = attemptRaw ? Number(attemptRaw) : undefined;

  return {
    performedAt: String(formData.get("performedAt") ?? "").trim() || undefined,
    bodyweightKg:
      bodyweightKg != null && Number.isFinite(bodyweightKg)
        ? bodyweightKg
        : undefined,
    equipment: String(formData.get("equipment") ?? "").trim() || undefined,
    cameraAngle: String(formData.get("cameraAngle") ?? "").trim() || undefined,
    federation: String(formData.get("federation") ?? "").trim() || undefined,
    meetName: String(formData.get("meetName") ?? "").trim() || undefined,
    meetDate: String(formData.get("meetDate") ?? "").trim() || undefined,
    attemptNumber:
      attemptNumber != null && Number.isFinite(attemptNumber)
        ? attemptNumber
        : undefined,
    notes: String(formData.get("metaNotes") ?? "").trim() || undefined,
  };
}

export async function createVerifiedLiftAction(
  _prev: VerifiedLiftActionState,
  formData: FormData,
): Promise<VerifiedLiftActionState> {
  const session = await requireSession();
  const loadKg = Number(formData.get("loadKg"));
  const reps = Number(formData.get("reps") || 1);

  const result = await createVerifiedLiftClaim(session.user.id, {
    liftKey: String(formData.get("liftKey") ?? "other"),
    liftLabel: String(formData.get("liftLabel") ?? "") || null,
    loadKg,
    reps,
    techniqueAnalysisId: String(formData.get("techniqueAnalysisId") ?? "") || null,
    metadata: parseMetadata(formData),
    athleteNote: String(formData.get("athleteNote") ?? "") || null,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/verified-lifts");
  return { ok: true, message: "Lift claim saved." };
}

export async function submitLiftReviewAction(
  _prev: VerifiedLiftActionState,
  formData: FormData,
): Promise<VerifiedLiftActionState> {
  const session = await requireSession();
  const claimId = String(formData.get("claimId") ?? "");
  const targetRaw = String(formData.get("reviewTarget") ?? "video_submitted");
  const target: LiftReviewTarget =
    targetRaw === "competition_verified"
      ? "competition_verified"
      : "video_submitted";

  const result = await submitVerifiedLiftForReview(
    session.user.id,
    claimId,
    target,
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/verified-lifts");
  revalidatePath("/app/admin/verified-lifts");
  return { ok: true, message: "Submitted for manual review." };
}

export async function adminReviewLiftAction(
  _prev: VerifiedLiftActionState,
  formData: FormData,
): Promise<VerifiedLiftActionState> {
  const admin = await requireAdmin();
  const claimId = String(formData.get("claimId") ?? "");
  const decisionRaw = String(formData.get("decision") ?? "");
  const decision =
    decisionRaw === "approve" ||
    decisionRaw === "reject" ||
    decisionRaw === "revoke"
      ? decisionRaw
      : null;
  if (!decision) return { ok: false, error: "Invalid decision." };

  const result = await reviewVerifiedLiftClaim(
    admin.user.id,
    claimId,
    decision,
    String(formData.get("reviewNote") ?? "") || null,
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/admin/verified-lifts");
  revalidatePath("/app/verified-lifts");
  return { ok: true, message: `Claim ${decision}d.` };
}
