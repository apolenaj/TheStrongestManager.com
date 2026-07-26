-- Prompt 80: Optional Athlete Level System
CREATE TABLE "AthleteLevelOptIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "optedIn" BOOLEAN NOT NULL DEFAULT false,
    "lastLevelId" TEXT,
    "lastComposite" REAL,
    "lastComputedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AthleteLevelOptIn_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AthleteLevelOptIn_athleteProfileId_key" ON "AthleteLevelOptIn"("athleteProfileId");
