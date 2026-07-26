-- Adaptive programming proposals + append-only audit events (Prompt 23).
-- Suggestions are never applied without explicit athlete Accept / Modify.

CREATE TABLE "ProgramAdaptation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "programId" TEXT,
    "workoutExerciseId" TEXT,
    "workoutId" TEXT,
    "trainingSessionId" TEXT,
    "exerciseId" TEXT,
    "changeKind" TEXT NOT NULL,
    "recommendedChange" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inputsJson" TEXT NOT NULL DEFAULT '{}',
    "proposedParamsJson" TEXT NOT NULL DEFAULT '{}',
    "modifiedParamsJson" TEXT,
    "appliedParamsJson" TEXT,
    "beforeStateJson" TEXT,
    "afterStateJson" TEXT,
    "source" TEXT NOT NULL DEFAULT 'recommended',
    "engineVersion" TEXT NOT NULL DEFAULT 'adaptive.v1',
    "decidedAt" DATETIME,
    "appliedAt" DATETIME,
    "decisionNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramAdaptation_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramAdaptation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProgramAdaptation_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProgramAdaptation_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ProgramAdaptationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adaptationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorUserId" TEXT,
    "detailJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramAdaptationEvent_adaptationId_fkey" FOREIGN KEY ("adaptationId") REFERENCES "ProgramAdaptation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProgramAdaptation_athleteProfileId_status_createdAt_idx" ON "ProgramAdaptation"("athleteProfileId", "status", "createdAt");
CREATE INDEX "ProgramAdaptation_programId_status_idx" ON "ProgramAdaptation"("programId", "status");
CREATE INDEX "ProgramAdaptation_workoutExerciseId_status_idx" ON "ProgramAdaptation"("workoutExerciseId", "status");
CREATE INDEX "ProgramAdaptation_trainingSessionId_idx" ON "ProgramAdaptation"("trainingSessionId");
CREATE INDEX "ProgramAdaptationEvent_adaptationId_createdAt_idx" ON "ProgramAdaptationEvent"("adaptationId", "createdAt");
