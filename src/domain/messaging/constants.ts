/**
 * Athlete–coach messaging (Prompt 132).
 * Threads, attachments, workout/technique refs, notifications, moderation, secure access.
 */

export const MESSAGING_ENGINE_VERSION = "messaging_system.v1" as const;

export const MESSAGING_HONESTY = [
  "Messages are private between an athlete and a coach with an active access grant.",
  "Org roles never bypass messaging access — only explicit CoachAthleteAccess.",
  "Attachments are stored privately and served only to thread participants.",
  "Anyone in a thread may report a message; admins can hide or remove content.",
] as const;

export const MESSAGE_THREAD_STATUSES = ["open", "archived", "locked"] as const;
export type MessageThreadStatus = (typeof MESSAGE_THREAD_STATUSES)[number];

export const MESSAGE_SENDER_ROLES = ["coach", "athlete"] as const;
export type MessageSenderRole = (typeof MESSAGE_SENDER_ROLES)[number];

export const MESSAGE_KINDS = ["text", "attachment", "reference", "mixed"] as const;
export type MessageKind = (typeof MESSAGE_KINDS)[number];

export const MESSAGE_STATUSES = [
  "active",
  "deleted",
  "hidden",
  "removed",
] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

/** Polymorphic refs — same vocabulary as CoachNote / notifications. */
export const MESSAGE_RELATED_TYPES = [
  "training_session",
  "technique_analysis",
] as const;
export type MessageRelatedType = (typeof MESSAGE_RELATED_TYPES)[number];

export const MESSAGE_RELATED_TYPE_LABELS: Record<MessageRelatedType, string> = {
  training_session: "Workout / session",
  technique_analysis: "Technique analysis",
};

export const MESSAGE_ATTACHMENT_MEDIA_TYPES = [
  "image",
  "video",
  "file",
] as const;
export type MessageAttachmentMediaType =
  (typeof MESSAGE_ATTACHMENT_MEDIA_TYPES)[number];

export const MESSAGE_MODERATION_ACTIONS = [
  "flag",
  "hide",
  "restore",
  "remove",
  "note",
] as const;
export type MessageModerationAction =
  (typeof MESSAGE_MODERATION_ACTIONS)[number];

export const MESSAGE_BODY_MAX_CHARS = 8000;
export const MESSAGE_ATTACHMENT_MAX_BYTES = 25 * 1024 * 1024;

export const MESSAGE_ALLOWED_MIME_PREFIXES = [
  "image/",
  "video/",
  "application/pdf",
  "text/plain",
] as const;

export function isMessageRelatedType(
  value: string,
): value is MessageRelatedType {
  return (MESSAGE_RELATED_TYPES as readonly string[]).includes(value);
}

export function isMessageModerationAction(
  value: string,
): value is MessageModerationAction {
  return (MESSAGE_MODERATION_ACTIONS as readonly string[]).includes(value);
}

export function isMessageSenderRole(
  value: string,
): value is MessageSenderRole {
  return value === "coach" || value === "athlete";
}
