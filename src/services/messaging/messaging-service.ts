/**
 * Athlete–coach messaging service (Prompt 132).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  MESSAGE_BODY_MAX_CHARS,
  MESSAGE_ATTACHMENT_MAX_BYTES,
  MESSAGE_RELATED_TYPE_LABELS,
  MESSAGING_HONESTY,
  canSendOnThread,
  isMessageModerationAction,
  isMessageRelatedType,
  isVisibleToParticipants,
  nextMessageStatusAfterModeration,
  previewFromBody,
  type MessageRelatedType,
  type MessageModerationAction,
} from "@/domain/messaging";
import { assertCoachCanAccessAthlete } from "@/services/coach/coach-service";
import {
  buildMessageStorageKey,
  saveMessageAttachment,
} from "@/services/messaging/storage";

export type MessageThreadListItem = {
  id: string;
  coachUserId: string;
  athleteProfileId: string;
  athleteDisplayName: string | null;
  coachName: string | null;
  status: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unread: boolean;
  counterpartLabel: string;
};

export type MessageView = {
  id: string;
  senderRole: string;
  senderUserId: string;
  body: string | null;
  kind: string;
  relatedType: string | null;
  relatedId: string | null;
  relatedLabel: string | null;
  relatedHref: string | null;
  status: string;
  createdAt: string;
  attachments: Array<{
    id: string;
    mediaType: string;
    originalFileName: string | null;
    mimeType: string | null;
    fileSizeBytes: number | null;
  }>;
};

export type MessagingInboxView = {
  honesty: readonly string[];
  role: "athlete" | "coach" | "both";
  threads: MessageThreadListItem[];
};

export type MessageThreadDetailView = {
  honesty: readonly string[];
  thread: MessageThreadListItem;
  messages: MessageView[];
  canSend: boolean;
  viewerRole: "coach" | "athlete";
};

function relatedHref(
  type: string | null,
  id: string | null,
): string | null {
  if (!type || !id) return null;
  if (type === "technique_analysis") return `/app/technique/${id}`;
  if (type === "training_session") return `/app/today`;
  return null;
}

async function notifyAthleteOfCoachMessage(input: {
  athleteProfileId: string;
  threadId: string;
  messageId: string;
  preview: string;
}): Promise<void> {
  if (!featureFlags.smartNotifications) return;

  const prefs = await prisma.notificationPreference.findUnique({
    where: { athleteProfileId: input.athleteProfileId },
  });
  if (prefs && prefs.kindCoachMessage === false) return;
  if (prefs && prefs.inAppEnabled === false) return;
  if (prefs && prefs.frequency === "muted") return;

  const dedupeKey = `coach_message:${input.messageId}`;
  try {
    await prisma.athleteNotification.create({
      data: {
        athleteProfileId: input.athleteProfileId,
        kind: "coach_message",
        title: "New message from your coach",
        body: input.preview.slice(0, 200),
        href: `/app/messages?thread=${input.threadId}`,
        channelsJson: JSON.stringify(["in_app"]),
        dedupeKey,
        status: "unread",
        priority: 2,
        relatedType: "message_thread",
        relatedId: input.threadId,
      },
    });
  } catch {
    // unique dedupe — ignore
  }
}

async function validateRelatedRef(input: {
  athleteProfileId: string;
  relatedType: MessageRelatedType;
  relatedId: string;
  coachUserId: string | null;
  viewerIsCoach: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.relatedType === "training_session") {
    const session = await prisma.trainingSession.findFirst({
      where: {
        id: input.relatedId,
        athleteProfileId: input.athleteProfileId,
      },
      select: { id: true },
    });
    if (!session) return { ok: false, error: "Workout reference not found." };
    return { ok: true };
  }

  if (input.relatedType === "technique_analysis") {
    const analysis = await prisma.techniqueAnalysis.findFirst({
      where: {
        id: input.relatedId,
        athleteProfileId: input.athleteProfileId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!analysis) {
      return { ok: false, error: "Technique reference not found." };
    }
    if (input.viewerIsCoach && input.coachUserId) {
      const access = await assertCoachCanAccessAthlete({
        coachUserId: input.coachUserId,
        athleteProfileId: input.athleteProfileId,
        requiredScope: "technique_summary",
      });
      if (!access.ok) return access;
    }
    return { ok: true };
  }

  return { ok: false, error: "Unsupported reference type." };
}

export async function getMessagingInbox(input: {
  userId: string;
}): Promise<
  | { ok: true; view: MessagingInboxView }
  | { ok: false; error: string }
> {
  if (!featureFlags.messagingSystem) {
    return { ok: false, error: "Messaging System is not enabled." };
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      name: true,
      isCoach: true,
      athleteProfile: { select: { id: true, displayName: true } },
    },
  });
  if (!user) return { ok: false, error: "User not found." };

  const athleteProfileId = user.athleteProfile?.id ?? null;

  const [asAthlete, asCoach] = await Promise.all([
    athleteProfileId
      ? prisma.messageThread.findMany({
          where: { athleteProfileId },
          orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
          take: 40,
          include: {
            coachUser: { select: { id: true, name: true, email: true } },
            athleteProfile: { select: { id: true, displayName: true } },
          },
        })
      : Promise.resolve([]),
    user.isCoach
      ? prisma.messageThread.findMany({
          where: { coachUserId: input.userId },
          orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
          take: 40,
          include: {
            coachUser: { select: { id: true, name: true, email: true } },
            athleteProfile: { select: { id: true, displayName: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const byId = new Map<string, (typeof asAthlete)[number]>();
  for (const t of [...asAthlete, ...asCoach]) byId.set(t.id, t);

  const threads: MessageThreadListItem[] = [...byId.values()].map((t) => {
    const viewerIsCoach = t.coachUserId === input.userId;
    const lastRead = viewerIsCoach ? t.coachLastReadAt : t.athleteLastReadAt;
    const unread = Boolean(
      t.lastMessageAt &&
        (!lastRead || t.lastMessageAt.getTime() > lastRead.getTime()),
    );
    return {
      id: t.id,
      coachUserId: t.coachUserId,
      athleteProfileId: t.athleteProfileId,
      athleteDisplayName: t.athleteProfile.displayName,
      coachName: t.coachUser.name ?? t.coachUser.email,
      status: t.status,
      lastMessageAt: t.lastMessageAt?.toISOString() ?? null,
      lastMessagePreview: t.lastMessagePreview,
      unread,
      counterpartLabel: viewerIsCoach
        ? t.athleteProfile.displayName?.trim() ||
          `Athlete ${t.athleteProfileId.slice(-6)}`
        : t.coachUser.name ?? t.coachUser.email ?? "Coach",
    };
  });

  threads.sort((a, b) => {
    const at = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
    const bt = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
    return bt - at;
  });

  const role =
    user.isCoach && athleteProfileId
      ? "both"
      : user.isCoach
        ? "coach"
        : "athlete";

  return {
    ok: true,
    view: {
      honesty: MESSAGING_HONESTY,
      role,
      threads,
    },
  };
}

/**
 * Open or return the thread for an active coach↔athlete grant.
 */
export async function openOrGetThread(input: {
  actorUserId: string;
  coachUserId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; threadId: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.messagingSystem) {
    return { ok: false, error: "Feature off." };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const athlete = await prisma.athleteProfile.findUnique({
    where: { id: input.athleteProfileId },
    select: { userId: true },
  });
  if (!athlete) return { ok: false, error: "Athlete not found." };

  const isParticipant =
    input.actorUserId === input.coachUserId ||
    input.actorUserId === athlete.userId;
  if (!isParticipant) {
    return { ok: false, error: "Not a participant in this conversation." };
  }

  const grant = await prisma.coachAthleteAccess.findFirst({
    where: {
      coachUserId: input.coachUserId,
      athleteProfileId: input.athleteProfileId,
      status: "active",
    },
    select: { id: true },
  });

  const existing = await prisma.messageThread.findUnique({
    where: {
      coachUserId_athleteProfileId: {
        coachUserId: input.coachUserId,
        athleteProfileId: input.athleteProfileId,
      },
    },
  });

  if (existing) {
    if (existing.status === "locked") {
      await prisma.messageThread.update({
        where: { id: existing.id },
        data: {
          status: "open",
          coachAthleteAccessId: grant?.id ?? existing.coachAthleteAccessId,
        },
      });
    }
    return { ok: true, threadId: existing.id };
  }

  const created = await prisma.messageThread.create({
    data: {
      coachUserId: input.coachUserId,
      athleteProfileId: input.athleteProfileId,
      coachAthleteAccessId: grant?.id ?? null,
      status: "open",
    },
  });
  return { ok: true, threadId: created.id };
}

export async function getMessageThread(input: {
  userId: string;
  threadId: string;
}): Promise<
  | { ok: true; view: MessageThreadDetailView }
  | { ok: false; error: string }
> {
  if (!featureFlags.messagingSystem) {
    return { ok: false, error: "Feature off." };
  }

  const thread = await prisma.messageThread.findUnique({
    where: { id: input.threadId },
    include: {
      coachUser: { select: { id: true, name: true, email: true } },
      athleteProfile: {
        select: { id: true, displayName: true, userId: true },
      },
      messages: {
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
        take: 200,
        include: {
          attachments: {
            where: { status: "ready" },
            select: {
              id: true,
              mediaType: true,
              originalFileName: true,
              mimeType: true,
              fileSizeBytes: true,
            },
          },
        },
      },
    },
  });
  if (!thread) return { ok: false, error: "Thread not found." };

  const viewerIsCoach = thread.coachUserId === input.userId;
  const viewerIsAthlete = thread.athleteProfile.userId === input.userId;
  if (!viewerIsCoach && !viewerIsAthlete) {
    return { ok: false, error: "Secure access denied." };
  }

  if (viewerIsCoach) {
    const access = await assertCoachCanAccessAthlete({
      coachUserId: input.userId,
      athleteProfileId: thread.athleteProfileId,
    });
    if (!access.ok) {
      if (thread.status === "open") {
        await prisma.messageThread.update({
          where: { id: thread.id },
          data: { status: "locked" },
        });
      }
      return {
        ok: false,
        error: "Coach access revoked — thread is locked for new messages.",
      };
    }
  }

  // Mark read
  await prisma.messageThread.update({
    where: { id: thread.id },
    data: viewerIsCoach
      ? { coachLastReadAt: new Date() }
      : { athleteLastReadAt: new Date() },
  });

  const listItem: MessageThreadListItem = {
    id: thread.id,
    coachUserId: thread.coachUserId,
    athleteProfileId: thread.athleteProfileId,
    athleteDisplayName: thread.athleteProfile.displayName,
    coachName: thread.coachUser.name ?? thread.coachUser.email,
    status: thread.status,
    lastMessageAt: thread.lastMessageAt?.toISOString() ?? null,
    lastMessagePreview: thread.lastMessagePreview,
    unread: false,
    counterpartLabel: viewerIsCoach
      ? thread.athleteProfile.displayName?.trim() ||
        `Athlete ${thread.athleteProfileId.slice(-6)}`
      : thread.coachUser.name ?? thread.coachUser.email ?? "Coach",
  };

  const messages: MessageView[] = thread.messages
    .filter((m) => isVisibleToParticipants(m.status))
    .map((m) => ({
      id: m.id,
      senderRole: m.senderRole,
      senderUserId: m.senderUserId,
      body: m.body,
      kind: m.kind,
      relatedType: m.relatedType,
      relatedId: m.relatedId,
      relatedLabel:
        m.relatedType && isMessageRelatedType(m.relatedType)
          ? MESSAGE_RELATED_TYPE_LABELS[m.relatedType]
          : null,
      relatedHref: relatedHref(m.relatedType, m.relatedId),
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      attachments: m.attachments,
    }));

  return {
    ok: true,
    view: {
      honesty: MESSAGING_HONESTY,
      thread: listItem,
      messages,
      canSend: canSendOnThread(thread.status),
      viewerRole: viewerIsCoach ? "coach" : "athlete",
    },
  };
}

export async function sendMessage(input: {
  userId: string;
  threadId: string;
  body?: string | null;
  relatedType?: string | null;
  relatedId?: string | null;
  attachment?: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  } | null;
}): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  if (!featureFlags.messagingSystem) {
    return { ok: false, error: "Feature off." };
  }

  const thread = await prisma.messageThread.findUnique({
    where: { id: input.threadId },
    include: {
      athleteProfile: { select: { id: true, userId: true } },
    },
  });
  if (!thread) return { ok: false, error: "Thread not found." };
  if (!canSendOnThread(thread.status)) {
    return { ok: false, error: "Thread is locked or archived." };
  }

  const viewerIsCoach = thread.coachUserId === input.userId;
  const viewerIsAthlete = thread.athleteProfile.userId === input.userId;
  if (!viewerIsCoach && !viewerIsAthlete) {
    return { ok: false, error: "Secure access denied." };
  }

  if (viewerIsCoach) {
    const access = await assertCoachCanAccessAthlete({
      coachUserId: input.userId,
      athleteProfileId: thread.athleteProfileId,
    });
    if (!access.ok) {
      await prisma.messageThread.update({
        where: { id: thread.id },
        data: { status: "locked" },
      });
      return { ok: false, error: access.error };
    }
  }

  const body = input.body?.trim() || null;
  if (body && body.length > MESSAGE_BODY_MAX_CHARS) {
    return { ok: false, error: "Message is too long." };
  }

  let relatedType: MessageRelatedType | null = null;
  let relatedId: string | null = null;
  if (input.relatedType && input.relatedId) {
    if (!isMessageRelatedType(input.relatedType)) {
      return { ok: false, error: "Invalid reference type." };
    }
    const validated = await validateRelatedRef({
      athleteProfileId: thread.athleteProfileId,
      relatedType: input.relatedType,
      relatedId: input.relatedId.trim(),
      coachUserId: viewerIsCoach ? input.userId : thread.coachUserId,
      viewerIsCoach,
    });
    if (!validated.ok) return validated;
    relatedType = input.relatedType;
    relatedId = input.relatedId.trim();
  }

  if (!body && !relatedType && !input.attachment) {
    return { ok: false, error: "Message cannot be empty." };
  }

  if (input.attachment && input.attachment.buffer.byteLength > MESSAGE_ATTACHMENT_MAX_BYTES) {
    return { ok: false, error: "Attachment exceeds size limit." };
  }

  let kind = "text";
  if (input.attachment && (body || relatedType)) kind = "mixed";
  else if (input.attachment) kind = "attachment";
  else if (relatedType && !body) kind = "reference";

  const senderRole = viewerIsCoach ? "coach" : "athlete";
  const preview = previewFromBody(body);

  const message = await prisma.$transaction(async (tx) => {
    const row = await tx.message.create({
      data: {
        threadId: thread.id,
        senderRole,
        senderUserId: input.userId,
        body,
        kind,
        relatedType,
        relatedId,
        status: "active",
      },
    });

    await tx.messageThread.update({
      where: { id: thread.id },
      data: {
        lastMessageAt: row.createdAt,
        lastMessagePreview: preview,
      },
    });

    return row;
  });

  if (input.attachment) {
    const ext =
      input.attachment.fileName.split(".").pop()?.toLowerCase() || "bin";
    const storageKey = buildMessageStorageKey({
      athleteProfileId: thread.athleteProfileId,
      threadId: thread.id,
      messageId: message.id,
      extension: ext,
    });
    const saved = await saveMessageAttachment(
      storageKey,
      input.attachment.buffer,
    );
    const mediaType = input.attachment.mimeType.startsWith("image/")
      ? "image"
      : input.attachment.mimeType.startsWith("video/")
        ? "video"
        : "file";
    await prisma.messageAttachment.create({
      data: {
        messageId: message.id,
        mediaType,
        storageKey,
        originalFileName: input.attachment.fileName.slice(0, 200),
        mimeType: input.attachment.mimeType.slice(0, 120),
        fileSizeBytes: saved.bytesWritten,
        status: "ready",
      },
    });
  }

  if (viewerIsCoach) {
    await notifyAthleteOfCoachMessage({
      athleteProfileId: thread.athleteProfileId,
      threadId: thread.id,
      messageId: message.id,
      preview,
    });
  }

  return { ok: true, messageId: message.id };
}

export async function flagMessage(input: {
  userId: string;
  messageId: string;
  reason?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.messagingSystem) {
    return { ok: false, error: "Feature off." };
  }

  const message = await prisma.message.findUnique({
    where: { id: input.messageId },
    include: {
      thread: {
        include: {
          athleteProfile: { select: { userId: true } },
        },
      },
    },
  });
  if (!message) return { ok: false, error: "Message not found." };

  const t = message.thread;
  const allowed =
    t.coachUserId === input.userId ||
    t.athleteProfile.userId === input.userId;
  if (!allowed) return { ok: false, error: "Secure access denied." };

  await prisma.messageModerationEvent.create({
    data: {
      messageId: message.id,
      threadId: t.id,
      action: "flag",
      reason: input.reason?.trim() || "User report",
      actorUserId: input.userId,
    },
  });

  return { ok: true };
}

export async function moderateMessage(input: {
  adminUserId: string;
  messageId: string;
  action: MessageModerationAction;
  reason?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.messagingSystem) {
    return { ok: false, error: "Feature off." };
  }
  if (!isMessageModerationAction(input.action)) {
    return { ok: false, error: "Invalid moderation action." };
  }
  if (input.action === "flag") {
    return flagMessage({
      userId: input.adminUserId,
      messageId: input.messageId,
      reason: input.reason,
    });
  }

  const admin = await prisma.user.findUnique({
    where: { id: input.adminUserId },
    select: { isAdmin: true },
  });
  if (!admin?.isAdmin) {
    return { ok: false, error: "Admin only." };
  }

  const message = await prisma.message.findUnique({
    where: { id: input.messageId },
  });
  if (!message) return { ok: false, error: "Message not found." };

  const next = nextMessageStatusAfterModeration(
    input.action,
    message.status,
  );

  await prisma.$transaction(async (tx) => {
    if (next) {
      await tx.message.update({
        where: { id: message.id },
        data: {
          status: next,
          deletedAt: next === "removed" ? new Date() : message.deletedAt,
        },
      });
    }
    await tx.messageModerationEvent.create({
      data: {
        messageId: message.id,
        threadId: message.threadId,
        action: input.action,
        reason: input.reason?.trim() || null,
        actorUserId: input.adminUserId,
      },
    });
  });

  return { ok: true };
}

/** Coaches the athlete can message (active grants). */
export async function listMessageableCoaches(input: {
  athleteUserId: string;
}): Promise<
  | {
      ok: true;
      coaches: Array<{
        coachUserId: string;
        name: string;
        athleteProfileId: string;
      }>;
    }
  | { ok: false; error: string }
> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.athleteUserId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const grants = await prisma.coachAthleteAccess.findMany({
    where: { athleteProfileId: profile.id, status: "active" },
    include: {
      coachUser: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    ok: true,
    coaches: grants.map((g) => ({
      coachUserId: g.coachUserId,
      name: g.coachUser.name ?? g.coachUser.email ?? "Coach",
      athleteProfileId: profile.id,
    })),
  };
}

/** Athletes the coach can message (active grants). */
export async function listMessageableAthletes(input: {
  coachUserId: string;
}): Promise<
  | {
      ok: true;
      athletes: Array<{
        athleteProfileId: string;
        displayName: string;
        coachUserId: string;
      }>;
    }
  | { ok: false; error: string }
> {
  const grants = await prisma.coachAthleteAccess.findMany({
    where: { coachUserId: input.coachUserId, status: "active" },
    include: {
      athleteProfile: { select: { id: true, displayName: true } },
    },
  });

  return {
    ok: true,
    athletes: grants.map((g) => ({
      athleteProfileId: g.athleteProfileId,
      displayName:
        g.athleteProfile.displayName?.trim() ||
        `Athlete ${g.athleteProfileId.slice(-6)}`,
      coachUserId: input.coachUserId,
    })),
  };
}
