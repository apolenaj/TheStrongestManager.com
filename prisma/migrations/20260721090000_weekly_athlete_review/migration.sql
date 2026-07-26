-- CreateTable
CREATE TABLE "WeeklyAthleteReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "weekKey" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "summary" TEXT,
    "reviewJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyAthleteReview_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WeeklyAthleteReview_athleteProfileId_weekStart_idx" ON "WeeklyAthleteReview"("athleteProfileId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyAthleteReview_athleteProfileId_weekKey_key" ON "WeeklyAthleteReview"("athleteProfileId", "weekKey");
