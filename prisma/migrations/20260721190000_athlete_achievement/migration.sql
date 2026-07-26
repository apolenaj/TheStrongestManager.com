-- Prompt 79: Achievement System
CREATE TABLE "AthleteAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidenceJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AthleteAchievement_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AthleteAchievement_athleteProfileId_achievementId_key" ON "AthleteAchievement"("athleteProfileId", "achievementId");
CREATE INDEX "AthleteAchievement_athleteProfileId_earnedAt_idx" ON "AthleteAchievement"("athleteProfileId", "earnedAt");
