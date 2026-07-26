-- CreateTable
CREATE TABLE "LeaderboardOptIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "optedIn" BOOLEAN NOT NULL DEFAULT false,
    "countryCode" TEXT,
    "bodyweightClassLabel" TEXT,
    "bodyweightClassMaxKg" REAL,
    "sport" TEXT,
    "categoriesJson" TEXT NOT NULL DEFAULT '{}',
    "showDisplayName" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaderboardOptIn_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardOptIn_athleteProfileId_key" ON "LeaderboardOptIn"("athleteProfileId");

-- CreateIndex
CREATE INDEX "LeaderboardOptIn_optedIn_sport_idx" ON "LeaderboardOptIn"("optedIn", "sport");

-- CreateIndex
CREATE INDEX "LeaderboardOptIn_optedIn_countryCode_idx" ON "LeaderboardOptIn"("optedIn", "countryCode");
