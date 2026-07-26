-- Travel Training Mode (Prompt 129)
CREATE TABLE "TravelTrainingMode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "preset" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "equipmentOverrideJson" TEXT NOT NULL DEFAULT '[]',
    "homeEquipmentSnapshotJson" TEXT NOT NULL DEFAULT '{}',
    "programId" TEXT,
    "preTravelVersionNumber" INTEGER,
    "notes" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "engineVersion" TEXT NOT NULL DEFAULT 'travel_training_mode.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TravelTrainingMode_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TravelTrainingMode_athleteProfileId_status_startedAt_idx" ON "TravelTrainingMode"("athleteProfileId", "status", "startedAt");
CREATE INDEX "TravelTrainingMode_athleteProfileId_status_idx" ON "TravelTrainingMode"("athleteProfileId", "status");
