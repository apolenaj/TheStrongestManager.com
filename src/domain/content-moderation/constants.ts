/**
 * Content Moderation (Prompt 139).
 * Unified report → review → remove/suspend architecture for community,
 * marketplace, coach profiles, and other user-generated content.
 */

export const CONTENT_MODERATION_ENGINE_VERSION =
  "content_moderation.v1" as const;

export const CONTENT_MODERATION_HONESTY = [
  "Moderation never invents reports — an empty queue means nothing is pending.",
  "Report, review, remove, and suspend decisions are append-only audit logged.",
  "Staff actions fail closed when the feature flag is off or the actor is not admin.",
  "Domain-specific status changes (community hide, marketplace suspend) run through adapters — this queue does not silently invent content removals.",
] as const;

/** High-level surfaces covered by the unified queue. */
export const CONTENT_MODERATION_TARGETS = [
  "community",
  "marketplace",
  "coach_profile",
  "user_generated_content",
] as const;

export type ContentModerationTarget =
  (typeof CONTENT_MODERATION_TARGETS)[number];

export const CONTENT_MODERATION_TARGET_LABELS: Record<
  ContentModerationTarget,
  string
> = {
  community: "Community",
  marketplace: "Marketplace",
  coach_profile: "Coach profile",
  user_generated_content: "User-generated content",
};

/**
 * Polymorphic related types within each target.
 * Keep as string enums for persistence + analytics.
 */
export const CONTENT_MODERATION_RELATED_TYPES = [
  "community_question",
  "community_answer",
  "program_listing",
  "coach_marketplace_profile",
  "message",
  "message_thread",
  "expert_article",
  "other_ugc",
] as const;

export type ContentModerationRelatedType =
  (typeof CONTENT_MODERATION_RELATED_TYPES)[number];

export const CONTENT_MODERATION_REPORT_REASONS = [
  "spam",
  "harassment",
  "copyright",
  "misinformation",
  "inappropriate",
  "impersonation",
  "other",
] as const;

export type ContentModerationReportReason =
  (typeof CONTENT_MODERATION_REPORT_REASONS)[number];

export const CONTENT_MODERATION_REPORT_REASON_LABELS: Record<
  ContentModerationReportReason,
  string
> = {
  spam: "Spam",
  harassment: "Harassment",
  copyright: "Copyright / unauthorized content",
  misinformation: "Misinformation",
  inappropriate: "Inappropriate",
  impersonation: "Impersonation",
  other: "Other",
};

export const CONTENT_MODERATION_REPORT_STATUSES = [
  "open",
  "in_review",
  "resolved",
  "dismissed",
] as const;

export type ContentModerationReportStatus =
  (typeof CONTENT_MODERATION_REPORT_STATUSES)[number];

export const CONTENT_MODERATION_REPORT_STATUS_LABELS: Record<
  ContentModerationReportStatus,
  string
> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

/** Features: Report · Review · Remove · Suspend (+ restore / note for audit). */
export const CONTENT_MODERATION_ACTIONS = [
  "report",
  "review",
  "remove",
  "suspend",
  "restore",
  "dismiss",
  "note",
] as const;

export type ContentModerationAction =
  (typeof CONTENT_MODERATION_ACTIONS)[number];

export const CONTENT_MODERATION_ACTION_LABELS: Record<
  ContentModerationAction,
  string
> = {
  report: "Report",
  review: "Review",
  remove: "Remove",
  suspend: "Suspend",
  restore: "Restore",
  dismiss: "Dismiss",
  note: "Note",
};

export function isContentModerationTarget(
  value: string,
): value is ContentModerationTarget {
  return (CONTENT_MODERATION_TARGETS as readonly string[]).includes(value);
}

export function isContentModerationRelatedType(
  value: string,
): value is ContentModerationRelatedType {
  return (CONTENT_MODERATION_RELATED_TYPES as readonly string[]).includes(
    value,
  );
}

export function isContentModerationReportReason(
  value: string,
): value is ContentModerationReportReason {
  return (CONTENT_MODERATION_REPORT_REASONS as readonly string[]).includes(
    value,
  );
}

export function isContentModerationReportStatus(
  value: string,
): value is ContentModerationReportStatus {
  return (CONTENT_MODERATION_REPORT_STATUSES as readonly string[]).includes(
    value,
  );
}

export function isContentModerationAction(
  value: string,
): value is ContentModerationAction {
  return (CONTENT_MODERATION_ACTIONS as readonly string[]).includes(value);
}

/** Map relatedType → target surface. */
export function targetForRelatedType(
  relatedType: ContentModerationRelatedType,
): ContentModerationTarget {
  switch (relatedType) {
    case "community_question":
    case "community_answer":
      return "community";
    case "program_listing":
      return "marketplace";
    case "coach_marketplace_profile":
      return "coach_profile";
    case "message":
    case "message_thread":
    case "expert_article":
    case "other_ugc":
      return "user_generated_content";
  }
}

/** Staff decision actions that close a report. */
export function isTerminalModerationAction(
  action: ContentModerationAction,
): boolean {
  return (
    action === "remove" ||
    action === "suspend" ||
    action === "dismiss" ||
    action === "restore"
  );
}

export function nextReportStatusAfterAction(
  action: ContentModerationAction,
  current: ContentModerationReportStatus,
): ContentModerationReportStatus | null {
  switch (action) {
    case "report":
      return current;
    case "review":
      return current === "open" ? "in_review" : null;
    case "remove":
    case "suspend":
    case "restore":
      return "resolved";
    case "dismiss":
      return "dismissed";
    case "note":
      return null;
    default:
      return null;
  }
}
