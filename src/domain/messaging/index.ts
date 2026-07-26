export {
  MESSAGING_ENGINE_VERSION,
  MESSAGING_HONESTY,
  MESSAGE_THREAD_STATUSES,
  MESSAGE_SENDER_ROLES,
  MESSAGE_KINDS,
  MESSAGE_STATUSES,
  MESSAGE_RELATED_TYPES,
  MESSAGE_RELATED_TYPE_LABELS,
  MESSAGE_ATTACHMENT_MEDIA_TYPES,
  MESSAGE_MODERATION_ACTIONS,
  MESSAGE_BODY_MAX_CHARS,
  MESSAGE_ATTACHMENT_MAX_BYTES,
  MESSAGE_ALLOWED_MIME_PREFIXES,
  isMessageRelatedType,
  isMessageModerationAction,
  isMessageSenderRole,
  type MessageThreadStatus,
  type MessageSenderRole,
  type MessageKind,
  type MessageStatus,
  type MessageRelatedType,
  type MessageAttachmentMediaType,
  type MessageModerationAction,
} from "@/domain/messaging/constants";

export {
  resolveMessagingRole,
  canSendOnThread,
  canViewMessageStatus,
  previewFromBody,
} from "@/domain/messaging/access";

export {
  nextMessageStatusAfterModeration,
  isVisibleToParticipants,
} from "@/domain/messaging/moderation";
