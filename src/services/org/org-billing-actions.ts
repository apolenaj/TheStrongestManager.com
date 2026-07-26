"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { requestOrgPlanUpgrade } from "@/services/org/org-billing-service";

export async function requestOrgPlanUpgradeAction(
  formData: FormData,
): Promise<
  | { ok: true; applied: boolean; message: string }
  | { ok: false; error: string }
> {
  const session = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const targetPlanId = String(formData.get("targetPlanId") ?? "");
  const intervalRaw = String(formData.get("interval") ?? "monthly");
  const interval = intervalRaw === "annual" ? "annual" : "monthly";

  const result = await requestOrgPlanUpgrade({
    userId: session.user.id,
    organizationId,
    targetPlanId,
    interval,
  });
  if (!result.ok) return result;
  revalidatePath(`/app/org/${organizationId}/billing`);
  revalidatePath(`/app/org/${organizationId}`);
  return result;
}
