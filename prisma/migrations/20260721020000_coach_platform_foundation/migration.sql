-- AlterTable
ALTER TABLE "User" ADD COLUMN "isAthlete" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "isCoach" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CoachAthleteAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachUserId" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scopesJson" TEXT NOT NULL DEFAULT '[]',
    "invitedByUserId" TEXT,
    "inviteNote" TEXT,
    "grantedAt" DATETIME,
    "revokedAt" DATETIME,
    "revokedByUserId" TEXT,
    "revokeReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachAthleteAccess_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachAthleteAccess_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachAthleteAccess_coachUserId_athleteProfileId_key" ON "CoachAthleteAccess"("coachUserId", "athleteProfileId");

-- CreateIndex
CREATE INDEX "CoachAthleteAccess_coachUserId_status_idx" ON "CoachAthleteAccess"("coachUserId", "status");

-- CreateIndex
CREATE INDEX "CoachAthleteAccess_athleteProfileId_status_idx" ON "CoachAthleteAccess"("athleteProfileId", "status");
