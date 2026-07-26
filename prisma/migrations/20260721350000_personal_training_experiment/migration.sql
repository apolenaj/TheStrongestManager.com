-- Personal Training Experiment Mode (Prompt 119)
CREATE TABLE "PersonalTrainingExperiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intervention" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "measuresJson" TEXT NOT NULL DEFAULT '[]',
    "durationWeeks" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "plannedStartAt" DATETIME,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "abandonedAt" DATETIME,
    "baselineSnapshotJson" TEXT NOT NULL DEFAULT '{}',
    "outcomeSnapshotJson" TEXT NOT NULL DEFAULT '{}',
    "athleteNotes" TEXT,
    "engineVersion" TEXT NOT NULL DEFAULT 'personal_training_experiment.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalTrainingExperiment_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PersonalTrainingExperiment_athleteProfileId_status_idx" ON "PersonalTrainingExperiment"("athleteProfileId", "status");
CREATE INDEX "PersonalTrainingExperiment_athleteProfileId_startedAt_idx" ON "PersonalTrainingExperiment"("athleteProfileId", "startedAt");
