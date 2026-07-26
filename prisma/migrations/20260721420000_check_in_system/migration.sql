-- Check-in System (Prompt 133)
-- Customizable weekly check-in; coach-configurable allowlisted questions; AI summary.

CREATE TABLE "CoachCheckInTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachUserId" TEXT NOT NULL,
    "athleteProfileId" TEXT,
    "enabledQuestionKeysJson" TEXT NOT NULL DEFAULT '[]',
    "cadence" TEXT NOT NULL DEFAULT 'weekly',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachCheckInTemplate_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachCheckInTemplate_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CoachCheckInTemplate_coachUserId_status_idx" ON "CoachCheckInTemplate"("coachUserId", "status");
CREATE INDEX "CoachCheckInTemplate_athleteProfileId_status_idx" ON "CoachCheckInTemplate"("athleteProfileId", "status");
CREATE UNIQUE INDEX "CoachCheckInTemplate_coachUserId_athleteProfileId_key" ON "CoachCheckInTemplate"("coachUserId", "athleteProfileId");

CREATE TABLE "WeeklyCheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "weekKey" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "responsesJson" TEXT NOT NULL DEFAULT '{}',
    "templateSnapshotJson" TEXT NOT NULL DEFAULT '[]',
    "configuredByCoachUserId" TEXT,
    "submittedAt" DATETIME,
    "engineVersion" TEXT NOT NULL DEFAULT 'check_in_system.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyCheckIn_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WeeklyCheckIn_athleteProfileId_weekKey_key" ON "WeeklyCheckIn"("athleteProfileId", "weekKey");
CREATE INDEX "WeeklyCheckIn_athleteProfileId_submittedAt_idx" ON "WeeklyCheckIn"("athleteProfileId", "submittedAt");
CREATE INDEX "WeeklyCheckIn_weekKey_idx" ON "WeeklyCheckIn"("weekKey");

CREATE TABLE "WeeklyCheckInSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkInId" TEXT NOT NULL,
    "summaryBody" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ai_summary',
    "engineVersion" TEXT NOT NULL DEFAULT 'check_in_system.v1',
    "requestedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeeklyCheckInSummary_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "WeeklyCheckIn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeeklyCheckInSummary_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "WeeklyCheckInSummary_checkInId_createdAt_idx" ON "WeeklyCheckInSummary"("checkInId", "createdAt");
