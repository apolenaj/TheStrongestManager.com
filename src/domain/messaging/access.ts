/**
 * Secure access helpers for athlete–coach messaging.
 */

import type { MessageSenderRole } from "@/domain/messaging/constants";

export type MessagingParticipant = {
  userId: string;
  role: MessageSenderRole;
  athleteProfileId: string;
  coachUserId: string;
};

/**
 * Decide if a user may participate in a thread given ownership + active grant.
 */
export function resolveMessagingRole(input: {
  actorUserId: string;
  threadCoachUserId: string;
  threadAthleteUserId: string;
  hasActiveCoachGrant: boolean;
}): MessageSenderRole | null {
  if (input.actorUserId === input.threadCoachUserId) {
    return input.hasActiveCoachGrant ? "coach" : null;
  }
  if (input.actorUserId === input.threadAthleteUserId) {
    return "athlete";
  }
  return null;
}

export function canSendOnThread(status: string): boolean {
  return status === "open";
}

export function canViewMessageStatus(
  status: string,
  viewerIsAdmin: boolean,
): boolean {
  if (status === "active") return true;
  if (status === "deleted") return false;
  if (status === "hidden" || status === "removed") return viewerIsAdmin;
  return false;
}

export function previewFromBody(body: string | null | undefined): string {
  const trimmed = (body ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed) return "(attachment or reference)";
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed;
}
