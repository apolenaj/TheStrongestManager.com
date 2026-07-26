-- Prompt 101: Smart notification preferences + in-app inbox
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT NOT NULL DEFAULT 'realtime',
    "kindWorkoutToday" BOOLEAN NOT NULL DEFAULT true,
    "kindTechniqueReanalysis" BOOLEAN NOT NULL DEFAULT true,
    "kindCompetitionCountdown" BOOLEAN NOT NULL DEFAULT true,
    "kindWeeklyReview" BOOLEAN NOT NULL DEFAULT true,
    "kindRecoveryTrend" BOOLEAN NOT NULL DEFAULT true,
    "kindPrAchieved" BOOLEAN NOT NULL DEFAULT true,
    "maxPerDay" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationPreference_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "NotificationPreference_athleteProfileId_key" ON "NotificationPreference"("athleteProfileId");

CREATE TABLE "AthleteNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "channelsJson" TEXT NOT NULL DEFAULT '["in_app"]',
    "dedupeKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "engineVersion" TEXT NOT NULL DEFAULT 'smart_notifications.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    "emailSentAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AthleteNotification_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AthleteNotification_athleteProfileId_dedupeKey_key" ON "AthleteNotification"("athleteProfileId", "dedupeKey");
CREATE INDEX "AthleteNotification_athleteProfileId_status_createdAt_idx" ON "AthleteNotification"("athleteProfileId", "status", "createdAt");
CREATE INDEX "AthleteNotification_athleteProfileId_kind_createdAt_idx" ON "AthleteNotification"("athleteProfileId", "kind", "createdAt");
