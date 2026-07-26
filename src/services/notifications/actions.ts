"use server";

import { revalidatePath } from "next/cache";
import {
  NOTIFICATION_KINDS,
  isNotificationFrequency,
  type NotificationKind,
} from "@/domain/notifications";
import { requireSession } from "@/services/auth/session";
import {
  dismissNotification,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "@/services/notifications";

export type NotificationActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

function revalidateNotificationPaths() {
  revalidatePath("/app/notifications");
  revalidatePath("/app/settings");
}

export async function updateNotificationPreferencesAction(
  _prev: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> {
  const session = await requireSession();

  const frequencyRaw = String(formData.get("frequency") ?? "realtime");
  if (!isNotificationFrequency(frequencyRaw)) {
    return { ok: false, error: "Invalid frequency preference." };
  }

  const maxRaw = Number(formData.get("maxPerDay") ?? 5);
  if (!Number.isFinite(maxRaw)) {
    return { ok: false, error: "Invalid daily cap." };
  }

  const kinds = {} as Record<NotificationKind, boolean>;
  for (const kind of NOTIFICATION_KINDS) {
    kinds[kind] = formData.get(`kind_${kind}`) === "on";
  }

  const result = await updateNotificationPreferences({
    userId: session.user.id,
    inAppEnabled: formData.get("inAppEnabled") === "on",
    emailEnabled: formData.get("emailEnabled") === "on",
    pushEnabled: formData.get("pushEnabled") === "on",
    frequency: frequencyRaw,
    kinds,
    maxPerDay: maxRaw,
  });

  if (!result.ok) return { ok: false, error: result.error };
  revalidateNotificationPaths();
  return { ok: true, message: "Notification preferences saved." };
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const session = await requireSession();
  const result = await markNotificationRead({
    userId: session.user.id,
    notificationId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidateNotificationPaths();
  return { ok: true };
}

export async function dismissNotificationAction(
  notificationId: string,
): Promise<NotificationActionState> {
  const session = await requireSession();
  const result = await dismissNotification({
    userId: session.user.id,
    notificationId,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidateNotificationPaths();
  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  const session = await requireSession();
  const result = await markAllNotificationsRead({ userId: session.user.id });
  if (!result.ok) return { ok: false, error: result.error };
  revalidateNotificationPaths();
  return { ok: true };
}
