-- CreateTable
CREATE TABLE "CompetitionPrep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "name" TEXT,
    "competitionDate" DATETIME NOT NULL,
    "weightClassLabel" TEXT,
    "weightClassLimitKg" REAL,
    "targetLiftsJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompetitionPrep_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CompetitionPrep_athleteProfileId_status_idx" ON "CompetitionPrep"("athleteProfileId", "status");

-- CreateIndex
CREATE INDEX "CompetitionPrep_athleteProfileId_competitionDate_idx" ON "CompetitionPrep"("athleteProfileId", "competitionDate");
