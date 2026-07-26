-- Messaging System (Prompt 132)
-- Athlete–coach threads, attachments, refs, moderation; notifications kindCoachMessage.

ALTER TABLE "NotificationPreference" ADD COLUMN "kindCoachMessage" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachUserId" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "coachAthleteAccessId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "lastMessageAt" DATETIME,
    "lastMessagePreview" TEXT,
    "athleteLastReadAt" DATETIME,
    "coachLastReadAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MessageThread_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageThread_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MessageThread_coachUserId_athleteProfileId_key" ON "MessageThread"("coachUserId", "athleteProfileId");
CREATE INDEX "MessageThread_athleteProfileId_lastMessageAt_idx" ON "MessageThread"("athleteProfileId", "lastMessageAt");
CREATE INDEX "MessageThread_coachUserId_lastMessageAt_idx" ON "MessageThread"("coachUserId", "lastMessageAt");
CREATE INDEX "MessageThread_status_lastMessageAt_idx" ON "MessageThread"("status", "lastMessageAt");

CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "body" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'text',
    "relatedType" TEXT,
    "relatedId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");
CREATE INDEX "Message_senderUserId_createdAt_idx" ON "Message"("senderUserId", "createdAt");
CREATE INDEX "Message_relatedType_relatedId_idx" ON "Message"("relatedType", "relatedId");
CREATE INDEX "Message_status_createdAt_idx" ON "Message"("status", "createdAt");

CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");
CREATE INDEX "MessageAttachment_storageKey_idx" ON "MessageAttachment"("storageKey");

CREATE TABLE "MessageModerationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT,
    "threadId" TEXT,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "actorUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageModerationEvent_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MessageModerationEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MessageModerationEvent_createdAt_idx" ON "MessageModerationEvent"("createdAt");
CREATE INDEX "MessageModerationEvent_messageId_createdAt_idx" ON "MessageModerationEvent"("messageId", "createdAt");
CREATE INDEX "MessageModerationEvent_threadId_createdAt_idx" ON "MessageModerationEvent"("threadId", "createdAt");
