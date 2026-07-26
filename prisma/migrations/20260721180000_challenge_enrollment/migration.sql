-- Prompt 78: Challenge Engine enrollments
CREATE TABLE "ChallengeEnrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "progressValue" REAL NOT NULL DEFAULT 0,
    "progressJson" TEXT NOT NULL DEFAULT '{}',
    "badgeAwardedAt" DATETIME,
    "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChallengeEnrollment_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ChallengeEnrollment_athleteProfileId_challengeId_key" ON "ChallengeEnrollment"("athleteProfileId", "challengeId");
CREATE INDEX "ChallengeEnrollment_challengeId_status_idx" ON "ChallengeEnrollment"("challengeId", "status");
CREATE INDEX "ChallengeEnrollment_athleteProfileId_status_idx" ON "ChallengeEnrollment"("athleteProfileId", "status");
