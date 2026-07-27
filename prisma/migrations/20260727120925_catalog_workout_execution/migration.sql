-- CreateEnum
CREATE TYPE "CatalogWorkoutSessionStatus" AS ENUM ('planned', 'in_progress', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "CatalogTmAdjustmentStatus" AS ENUM ('pending', 'approved', 'dismissed');

-- CreateTable
CREATE TABLE "CatalogWorkoutSession" (
    "id" TEXT NOT NULL,
    "userProgramId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayKey" TEXT NOT NULL,
    "dayLabel" TEXT,
    "status" "CatalogWorkoutSessionStatus" NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogWorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogWorkoutSetLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "setIndex" INTEGER NOT NULL,
    "prescribedReps" INTEGER,
    "prescribedPercent" DOUBLE PRECISION,
    "prescribedRpe" DOUBLE PRECISION,
    "suggestedWeight" DOUBLE PRECISION,
    "actualWeight" DOUBLE PRECISION,
    "actualRpe" DOUBLE PRECISION,
    "actualRir" DOUBLE PRECISION,
    "notes" TEXT,
    "painFlag" BOOLEAN NOT NULL DEFAULT false,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogWorkoutSetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogTmAdjustment" (
    "id" TEXT NOT NULL,
    "userProgramId" TEXT NOT NULL,
    "liftKey" TEXT NOT NULL,
    "fromTm" DOUBLE PRECISION NOT NULL,
    "toTm" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "CatalogTmAdjustmentStatus" NOT NULL DEFAULT 'pending',
    "triggerSetLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "CatalogTmAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogWorkoutSession_userProgramId_status_idx" ON "CatalogWorkoutSession"("userProgramId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogWorkoutSession_userProgramId_weekNumber_dayKey_key" ON "CatalogWorkoutSession"("userProgramId", "weekNumber", "dayKey");

-- CreateIndex
CREATE INDEX "CatalogWorkoutSetLog_sessionId_idx" ON "CatalogWorkoutSetLog"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogWorkoutSetLog_sessionId_exerciseId_setIndex_key" ON "CatalogWorkoutSetLog"("sessionId", "exerciseId", "setIndex");

-- CreateIndex
CREATE INDEX "CatalogTmAdjustment_userProgramId_status_idx" ON "CatalogTmAdjustment"("userProgramId", "status");

-- AddForeignKey
ALTER TABLE "CatalogWorkoutSession" ADD CONSTRAINT "CatalogWorkoutSession_userProgramId_fkey" FOREIGN KEY ("userProgramId") REFERENCES "UserProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogWorkoutSetLog" ADD CONSTRAINT "CatalogWorkoutSetLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CatalogWorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogTmAdjustment" ADD CONSTRAINT "CatalogTmAdjustment_userProgramId_fkey" FOREIGN KEY ("userProgramId") REFERENCES "UserProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

