"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  createOrganization,
  createTeam,
  setAggregateOptIn,
} from "@/services/org/org-service";

export async function createOrganizationAction(
  formData: FormData,
): Promise<{ ok: true; organizationId: string } | { ok: false; error: string }> {
  const session = await requireSession();
  const result = await createOrganization({
    userId: session.user.id,
    name: String(formData.get("name") ?? ""),
    kind: String(formData.get("kind") ?? "gym"),
  });
  if (!result.ok) return result;
  revalidatePath("/app/org");
  revalidatePath(`/app/org/${result.organizationId}`);
  return { ok: true, organizationId: result.organizationId };
}

export async function createTeamAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const result = await createTeam({
    userId: session.user.id,
    organizationId,
    name: String(formData.get("name") ?? ""),
  });
  if (!result.ok) return result;
  revalidatePath(`/app/org/${organizationId}`);
  return { ok: true };
}

export async function setAggregateOptInAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const organizationId = String(formData.get("organizationId") ?? "");
  const aggregateOptIn = formData.get("aggregateOptIn") === "on";
  const result = await setAggregateOptIn({
    userId: session.user.id,
    organizationId,
    aggregateOptIn,
  });
  if (!result.ok) return result;
  revalidatePath(`/app/org/${organizationId}`);
  return { ok: true };
}
