-- CreateTable
CREATE TABLE "CoachBrainAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "runId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "adapterId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailJson" TEXT NOT NULL DEFAULT '{}',
    "safetyFlagsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachBrainAuditLog_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CoachBrainAuditLog_athleteProfileId_createdAt_idx" ON "CoachBrainAuditLog"("athleteProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "CoachBrainAuditLog_runId_createdAt_idx" ON "CoachBrainAuditLog"("runId", "createdAt");

-- CreateIndex
CREATE INDEX "CoachBrainAuditLog_action_createdAt_idx" ON "CoachBrainAuditLog"("action", "createdAt");
