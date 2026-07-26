-- Prompt 139 — Content Moderation (report, review, remove, suspend, audit log)
CREATE TABLE "ContentModerationReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target" TEXT NOT NULL,
    "relatedType" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reporterUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "reviewedAt" DATETIME,
    "resolutionAction" TEXT,
    "resolutionNote" TEXT,
    "engineVersion" TEXT NOT NULL DEFAULT 'content_moderation.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentModerationReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentModerationReport_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ContentModerationReport_status_createdAt_idx" ON "ContentModerationReport"("status", "createdAt");
CREATE INDEX "ContentModerationReport_target_status_createdAt_idx" ON "ContentModerationReport"("target", "status", "createdAt");
CREATE INDEX "ContentModerationReport_relatedType_relatedId_idx" ON "ContentModerationReport"("relatedType", "relatedId");
CREATE INDEX "ContentModerationReport_reporterUserId_createdAt_idx" ON "ContentModerationReport"("reporterUserId", "createdAt");

CREATE TABLE "ContentModerationAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "relatedType" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "reasonCode" TEXT,
    "note" TEXT,
    "actorUserId" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL DEFAULT 'content_moderation.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentModerationAuditLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ContentModerationReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentModerationAuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ContentModerationAuditLog_createdAt_idx" ON "ContentModerationAuditLog"("createdAt");
CREATE INDEX "ContentModerationAuditLog_actorUserId_createdAt_idx" ON "ContentModerationAuditLog"("actorUserId", "createdAt");
CREATE INDEX "ContentModerationAuditLog_target_relatedType_relatedId_idx" ON "ContentModerationAuditLog"("target", "relatedType", "relatedId");
CREATE INDEX "ContentModerationAuditLog_action_createdAt_idx" ON "ContentModerationAuditLog"("action", "createdAt");
CREATE INDEX "ContentModerationAuditLog_reportId_createdAt_idx" ON "ContentModerationAuditLog"("reportId", "createdAt");
