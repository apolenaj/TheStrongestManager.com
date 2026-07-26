-- Prompt 77: Verified Lift System
CREATE TABLE "VerifiedLiftClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "liftKey" TEXT NOT NULL,
    "liftLabel" TEXT,
    "loadKg" REAL NOT NULL,
    "reps" INTEGER NOT NULL DEFAULT 1,
    "level" TEXT NOT NULL DEFAULT 'self_reported',
    "reviewStatus" TEXT NOT NULL DEFAULT 'none',
    "reviewTarget" TEXT,
    "techniqueAnalysisId" TEXT,
    "videoStorageKey" TEXT,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "athleteNote" TEXT,
    "reviewNote" TEXT,
    "submittedForReviewAt" DATETIME,
    "reviewedAt" DATETIME,
    "reviewedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VerifiedLiftClaim_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VerifiedLiftClaim_techniqueAnalysisId_fkey" FOREIGN KEY ("techniqueAnalysisId") REFERENCES "TechniqueAnalysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VerifiedLiftClaim_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "VerifiedLiftClaim_athleteProfileId_createdAt_idx" ON "VerifiedLiftClaim"("athleteProfileId", "createdAt");
CREATE INDEX "VerifiedLiftClaim_reviewStatus_submittedForReviewAt_idx" ON "VerifiedLiftClaim"("reviewStatus", "submittedForReviewAt");
CREATE INDEX "VerifiedLiftClaim_level_idx" ON "VerifiedLiftClaim"("level");
