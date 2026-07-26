"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  enableCoachRole,
  grantCoachAccess,
  revokeCoachAccess,
} from "@/services/coach/coach-service";
import {
  createCoachModification,
  createCoachNote,
  withdrawCoachModification,
} from "@/services/coach/coach-athlete-service";
import {
  DEFAULT_COACH_SCOPES,
  SENSITIVE_COACH_SCOPES,
  type CoachScope,
} from "@/domain/coach";

export async function enableCoachRoleAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const result = await enableCoachRole(session.user.id);
  if (result.ok) {
    revalidatePath("/app/coach");
    revalidatePath("/app/settings");
  }
  return result;
}

export async function grantCoachAccessAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const coachEmail = String(formData.get("coachEmail") ?? "");
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const includeRecovery = formData.get("scope_recovery") === "on";
  const includeBody = formData.get("scope_body") === "on";
  const includeMedia = formData.get("scope_media") === "on";

  const scopes: CoachScope[] = [...DEFAULT_COACH_SCOPES];
  if (includeRecovery) scopes.push("recovery");
  if (includeBody) scopes.push("body_metrics_detailed");
  if (includeMedia) scopes.push("technique_media");

  for (const s of SENSITIVE_COACH_SCOPES) {
    if (!scopes.includes(s) && formData.get(`scope_${s}`) === "on") {
      scopes.push(s);
    }
  }

  const result = await grantCoachAccess({
    athleteUserId: session.user.id,
    coachEmail,
    scopes,
    note,
  });
  if (result.ok) {
    revalidatePath("/app/settings");
    revalidatePath("/app/coach");
  }
  return result;
}

export async function revokeCoachAccessAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const accessId = String(formData.get("accessId") ?? "");
  if (!accessId) return { ok: false, error: "Missing access id." };
  const result = await revokeCoachAccess({
    athleteUserId: session.user.id,
    accessId,
    reason: "Revoked by athlete from Settings",
  });
  if (result.ok) {
    revalidatePath("/app/settings");
    revalidatePath("/app/coach");
  }
  return result;
}

function revalidateAthleteWorkspace(athleteProfileId: string) {
  revalidatePath("/app/coach");
  revalidatePath(`/app/coach/${athleteProfileId}`);
}

export async function createCoachNoteAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  if (!athleteProfileId) return { ok: false, error: "Missing athlete." };

  const result = await createCoachNote({
    coachUserId: session.user.id,
    athleteProfileId,
    section: String(formData.get("section") ?? "notes"),
    body: String(formData.get("body") ?? ""),
    relatedType: String(formData.get("relatedType") ?? "") || undefined,
    relatedId: String(formData.get("relatedId") ?? "") || undefined,
    isPrivate: formData.get("isPrivate") === "on" || formData.get("isPrivate") === "true",
  });
  if (result.ok) revalidateAthleteWorkspace(athleteProfileId);
  return result.ok ? { ok: true } : result;
}

export async function createCoachModificationAction(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await requireSession();
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  if (!athleteProfileId) return { ok: false, error: "Missing athlete." };

  const result = await createCoachModification({
    coachUserId: session.user.id,
    athleteProfileId,
    kind: String(formData.get("kind") ?? "general"),
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    proposedChangeJson:
      String(formData.get("proposedChangeJson") ?? "") || undefined,
    relatedType: String(formData.get("relatedType") ?? "") || undefined,
    relatedId: String(formData.get("relatedId") ?? "") || undefined,
  });
  if (result.ok) revalidateAthleteWorkspace(athleteProfileId);
  return result.ok ? { ok: true } : result;
}

export async function withdrawCoachModificationAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const modificationId = String(formData.get("modificationId") ?? "");
  const athleteProfileId = String(formData.get("athleteProfileId") ?? "");
  if (!modificationId) return { ok: false, error: "Missing modification." };

  const result = await withdrawCoachModification({
    coachUserId: session.user.id,
    modificationId,
    reason: String(formData.get("reason") ?? "") || undefined,
  });
  if (result.ok && athleteProfileId) {
    revalidateAthleteWorkspace(athleteProfileId);
  }
  return result;
}
