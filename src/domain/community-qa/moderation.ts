/**
 * Moderation state transitions for community Q&A.
 */

import type { QaModerationAction } from "@/domain/community-qa/constants";

export type ModeratableStatus = "open" | "closed" | "hidden" | "removed" | "published";

export function nextQuestionStatusAfterModeration(
  action: QaModerationAction,
  current: string,
): string | null {
  switch (action) {
    case "hide":
      return "hidden";
    case "remove":
      return "removed";
    case "restore":
      return current === "hidden" || current === "removed" ? "open" : null;
    case "flag":
    case "note":
      return null; // no status change — event only
    default:
      return null;
  }
}

export function nextAnswerStatusAfterModeration(
  action: QaModerationAction,
  current: string,
): string | null {
  switch (action) {
    case "hide":
      return "hidden";
    case "remove":
      return "removed";
    case "restore":
      return current === "hidden" || current === "removed" ? "published" : null;
    case "flag":
    case "note":
      return null;
    default:
      return null;
  }
}

export function isVisibleQuestionStatus(status: string): boolean {
  return status === "open" || status === "closed";
}

export function isVisibleAnswerStatus(status: string): boolean {
  return status === "published";
}
