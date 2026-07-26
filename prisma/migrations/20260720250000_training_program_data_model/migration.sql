-- Prompt 21: Training program data model
-- Blocks, days, prescription fields, progression rules, session snapshots.
-- Templates (kind=template) stay separate from athlete programs (kind=athlete).
-- Completed sessions lock via prescriptionLockedAt + SessionExercise/SessionSet.

-- Workout / prescription enrichment
ALTER TABLE "Workout" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'template';

ALTER TABLE "WorkoutExercise" ADD COLUMN "targetRir" REAL;
ALTER TABLE "WorkoutExercise" ADD COLUMN "targetLoadKg" REAL;
ALTER TABLE "WorkoutExercise" ADD COLUMN "targetTempo" TEXT;

ALTER TABLE "WorkoutSet" ADD COLUMN "targetLoadKg" REAL;
ALTER TABLE "WorkoutSet" ADD COLUMN "targetPercent" REAL;
ALTER TABLE "WorkoutSet" ADD COLUMN "targetTempo" TEXT;
ALTER TABLE "WorkoutSet" ADD COLUMN "restSeconds" INTEGER;
ALTER TABLE "WorkoutSet" ADD COLUMN "notes" TEXT;

-- Program template vs athlete assignment
ALTER TABLE "Program" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'athlete';
ALTER TABLE "Program" ADD COLUMN "sourceTemplateId" TEXT;

-- Program weeks: optional block membership
ALTER TABLE "ProgramWeek" ADD COLUMN "blockId" TEXT;

-- Training session immutability hooks
ALTER TABLE "TrainingSession" ADD COLUMN "programDayId" TEXT;
ALTER TABLE "TrainingSession" ADD COLUMN "prescriptionLockedAt" DATETIME;
ALTER TABLE "TrainingSession" ADD COLUMN "workoutNameSnapshot" TEXT;

-- Blocks
CREATE TABLE "ProgramBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "name" TEXT,
    "focus" TEXT,
    "notes" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramBlock_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProgramBlock_programId_blockNumber_key" ON "ProgramBlock"("programId", "blockNumber");
CREATE INDEX "ProgramBlock_programId_idx" ON "ProgramBlock"("programId");

-- Days
CREATE TABLE "ProgramDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programWeekId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "name" TEXT,
    "notes" TEXT,
    "workoutId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramDay_programWeekId_fkey" FOREIGN KEY ("programWeekId") REFERENCES "ProgramWeek" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramDay_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProgramDay_programWeekId_dayIndex_key" ON "ProgramDay"("programWeekId", "dayIndex");
CREATE INDEX "ProgramDay_programWeekId_idx" ON "ProgramDay"("programWeekId");
CREATE INDEX "ProgramDay_workoutId_idx" ON "ProgramDay"("workoutId");

-- Progression rules
CREATE TABLE "ProgressionRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT,
    "workoutExerciseId" TEXT,
    "ruleKind" TEXT NOT NULL,
    "paramsJson" TEXT NOT NULL DEFAULT '{}',
    "source" TEXT NOT NULL DEFAULT 'recommended',
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgressionRule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressionRule_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProgressionRule_programId_idx" ON "ProgressionRule"("programId");
CREATE INDEX "ProgressionRule_workoutExerciseId_idx" ON "ProgressionRule"("workoutExerciseId");

-- Session ledger (immutable history when locked)
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "exerciseNameSnapshot" TEXT NOT NULL,
    "notes" TEXT,
    "prescribedSets" INTEGER,
    "prescribedReps" TEXT,
    "prescribedRpe" REAL,
    "prescribedRir" REAL,
    "prescribedPercent" REAL,
    "prescribedLoadKg" REAL,
    "prescribedTempo" TEXT,
    "prescribedRestSeconds" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionExercise_trainingSessionId_fkey" FOREIGN KEY ("trainingSessionId") REFERENCES "TrainingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "SessionExercise_trainingSessionId_sortOrder_idx" ON "SessionExercise"("trainingSessionId", "sortOrder");
CREATE INDEX "SessionExercise_exerciseId_idx" ON "SessionExercise"("exerciseId");

CREATE TABLE "SessionSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "setType" TEXT NOT NULL DEFAULT 'work',
    "prescribedReps" INTEGER,
    "prescribedLoadKg" REAL,
    "prescribedPercent" REAL,
    "prescribedRpe" REAL,
    "prescribedRir" REAL,
    "prescribedTempo" TEXT,
    "prescribedRestSeconds" INTEGER,
    "performedReps" INTEGER,
    "performedLoadKg" REAL,
    "performedRpe" REAL,
    "performedRir" REAL,
    "source" TEXT NOT NULL DEFAULT 'reported',
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionSet_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "SessionExercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SessionSet_sessionExerciseId_setNumber_key" ON "SessionSet"("sessionExerciseId", "setNumber");
CREATE INDEX "SessionSet_sessionExerciseId_idx" ON "SessionSet"("sessionExerciseId");

-- Indexes for new Program / Workout / Session columns
CREATE INDEX "Workout_kind_idx" ON "Workout"("kind");
CREATE INDEX "Program_kind_status_idx" ON "Program"("kind", "status");
CREATE INDEX "Program_sourceTemplateId_idx" ON "Program"("sourceTemplateId");
CREATE INDEX "ProgramWeek_blockId_idx" ON "ProgramWeek"("blockId");
CREATE INDEX "TrainingSession_programDayId_idx" ON "TrainingSession"("programDayId");
CREATE INDEX "TrainingSession_athleteProfileId_status_idx" ON "TrainingSession"("athleteProfileId", "status");

-- Backfill: legacy ProgramWeek.workoutId → ProgramDay dayIndex=1
INSERT INTO "ProgramDay" ("id", "programWeekId", "dayIndex", "name", "workoutId", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(12))),
  "id",
  1,
  'Day 1',
  "workoutId",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "ProgramWeek"
WHERE "workoutId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "ProgramDay" d WHERE d."programWeekId" = "ProgramWeek"."id" AND d."dayIndex" = 1
  );
