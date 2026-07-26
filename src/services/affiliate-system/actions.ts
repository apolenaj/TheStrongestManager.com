"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  activateAffiliatePartner,
  applyToAffiliateProgram,
  recordAffiliateClick,
} from "@/services/affiliate-system/affiliate-system-service";
import { isAffiliatePartnerType } from "@/domain/affiliate-system";
import { getRequestClientKey } from "@/lib/request-client-key";
import { createHash } from "crypto";

export type AffiliateActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function applyAffiliateAction(
  _prev: AffiliateActionState,
  formData: FormData,
): Promise<AffiliateActionState> {
  const session = await requireSession();
  const displayName = String(formData.get("displayName") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const partnerType = String(formData.get("partnerType") ?? "");
  const disclosureAcknowledged =
    String(formData.get("disclosureAcknowledged") ?? "") === "on" ||
    String(formData.get("disclosureAcknowledged") ?? "") === "true";

  if (!isAffiliatePartnerType(partnerType)) {
    return { ok: false, error: "Choose creator, coach, or partner." };
  }

  const result = await applyToAffiliateProgram({
    userId: session.user.id,
    displayName,
    slug,
    partnerType,
    disclosureAcknowledged,
  });

  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/affiliate");
  return {
    ok: true,
    message: "Application received. Partners stay pending until staff activate them.",
  };
}

export async function continueAffiliateClickAction(
  formData: FormData,
): Promise<{ ok: true; redirectPath: string } | { ok: false; error: string }> {
  const code = String(formData.get("code") ?? "").trim();
  const clientKey = await getRequestClientKey("affiliate_click");
  const visitorKey = createHash("sha256")
    .update(clientKey)
    .digest("hex")
    .slice(0, 32);

  const result = await recordAffiliateClick({ code, visitorKey });
  if (!result.ok) return result;
  return { ok: true, redirectPath: result.redirectPath };
}

export async function activateAffiliatePartnerAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  const partnerId = String(formData.get("partnerId") ?? "");
  await activateAffiliatePartner({
    partnerId,
    actorUserId: session.user.id,
  });
  revalidatePath("/app/affiliate/review");
}
