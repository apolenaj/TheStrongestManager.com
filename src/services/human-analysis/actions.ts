"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  activateHumanAnalysisPaymentForDevelopment,
  attachHumanAnalysisArtifacts,
  claimHumanAnalysisOrder,
  createHumanAnalysisOrder,
  submitHumanAnalysisExpertReport,
  submitHumanAnalysisToQueue,
} from "@/services/human-analysis/human-analysis-service";

export type HumanAnalysisActionState = {
  ok: boolean;
  error?: string;
  orderId?: string;
};

export async function createHumanAnalysisOrderAction(
  _prev: HumanAnalysisActionState,
  formData: FormData,
): Promise<HumanAnalysisActionState> {
  const session = await requireSession();
  const productSku = String(formData.get("productSku") ?? "").trim();
  const techniqueAnalysisId =
    String(formData.get("techniqueAnalysisId") ?? "").trim() || null;
  const programId = String(formData.get("programId") ?? "").trim() || null;
  const competitionPrepId =
    String(formData.get("competitionPrepId") ?? "").trim() || null;
  const athleteNote = String(formData.get("athleteNote") ?? "");

  const result = await createHumanAnalysisOrder({
    userId: session.user.id,
    productSku,
    techniqueAnalysisId,
    programId,
    competitionPrepId,
    athleteNote,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/human-analysis");
  revalidatePath(`/app/human-analysis/${result.orderId}`);
  return { ok: true, orderId: result.orderId };
}

export async function activateHumanAnalysisDevPaymentAction(
  _prev: HumanAnalysisActionState,
  formData: FormData,
): Promise<HumanAnalysisActionState> {
  const session = await requireSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const result = await activateHumanAnalysisPaymentForDevelopment({
    userId: session.user.id,
    orderId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/app/human-analysis/${orderId}`);
  revalidatePath("/app/human-analysis");
  return { ok: true, orderId };
}

export async function attachHumanAnalysisArtifactsAction(
  _prev: HumanAnalysisActionState,
  formData: FormData,
): Promise<HumanAnalysisActionState> {
  const session = await requireSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const techniqueAnalysisId =
    String(formData.get("techniqueAnalysisId") ?? "").trim() || null;
  const programId = String(formData.get("programId") ?? "").trim() || null;
  const competitionPrepId =
    String(formData.get("competitionPrepId") ?? "").trim() || null;
  const athleteNote = String(formData.get("athleteNote") ?? "");

  const result = await attachHumanAnalysisArtifacts({
    userId: session.user.id,
    orderId,
    techniqueAnalysisId,
    programId,
    competitionPrepId,
    athleteNote,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/app/human-analysis/${orderId}`);
  return { ok: true, orderId };
}

export async function submitHumanAnalysisToQueueAction(
  _prev: HumanAnalysisActionState,
  formData: FormData,
): Promise<HumanAnalysisActionState> {
  const session = await requireSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const result = await submitHumanAnalysisToQueue({
    userId: session.user.id,
    orderId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/app/human-analysis/${orderId}`);
  revalidatePath("/app/human-analysis/expert");
  return { ok: true, orderId };
}

export async function claimHumanAnalysisOrderAction(
  _prev: HumanAnalysisActionState,
  formData: FormData,
): Promise<HumanAnalysisActionState> {
  const session = await requireSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const result = await claimHumanAnalysisOrder({
    expertUserId: session.user.id,
    orderId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/human-analysis/expert");
  revalidatePath(`/app/human-analysis/expert/${orderId}`);
  return { ok: true, orderId };
}

export async function submitHumanAnalysisExpertReportAction(
  _prev: HumanAnalysisActionState,
  formData: FormData,
): Promise<HumanAnalysisActionState> {
  const session = await requireSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const summary = String(formData.get("summary") ?? "");
  const result = await submitHumanAnalysisExpertReport({
    expertUserId: session.user.id,
    orderId,
    summary,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/app/human-analysis/${orderId}`);
  revalidatePath("/app/human-analysis/expert");
  revalidatePath(`/app/human-analysis/expert/${orderId}`);
  return { ok: true, orderId };
}
