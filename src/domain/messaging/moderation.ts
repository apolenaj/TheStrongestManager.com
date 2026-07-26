/**
 * Message moderation status transitions (mirror community QA).
 */

import type { MessageModerationAction } from "@/domain/messaging/constants";

export function nextMessageStatusAfterModeration(
  action: MessageModerationAction,
  current: string,
): string | null {
  switch (action) {
    case "hide":
      return "hidden";
    case "remove":
      return "removed";
    case "restore":
      return current === "hidden" || current === "removed" ? "active" : null;
    case "flag":
    case "note":
      return null;
    default:
      return null;
  }
}

export function isVisibleToParticipants(status: string): boolean {
  return status === "active";
}
