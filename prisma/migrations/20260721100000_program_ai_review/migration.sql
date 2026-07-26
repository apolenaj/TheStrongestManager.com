-- CreateTable
CREATE TABLE "ProgramAiReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "summary" TEXT,
    "reviewJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramAiReview_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramAiReview_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProgramAiReview_athleteProfileId_createdAt_idx" ON "ProgramAiReview"("athleteProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "ProgramAiReview_programId_createdAt_idx" ON "ProgramAiReview"("programId", "createdAt");
