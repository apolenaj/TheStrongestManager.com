-- Prompt 95: Optional expert review of technique analyses
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "expertReviewStatus" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "expertReviewConsentAt" DATETIME;

CREATE TABLE "TechniqueExpertReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "techniqueAnalysisId" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "decision" TEXT,
    "comment" TEXT,
    "correctedOverallScore" REAL,
    "correctedSummary" TEXT,
    "correctionJson" TEXT NOT NULL DEFAULT '{}',
    "disagreementKind" TEXT NOT NULL DEFAULT 'none',
    "aiOverallScoreAtReview" REAL,
    "aiSummaryAtReview" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedByUserId" TEXT NOT NULL,
    "expertUserId" TEXT,
    "decidedAt" DATETIME,
    "modelImprovementEligible" BOOLEAN NOT NULL DEFAULT true,
    "autoRetrainBlocked" BOOLEAN NOT NULL DEFAULT true,
    "engineVersion" TEXT NOT NULL DEFAULT 'technique_review.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TechniqueExpertReview_techniqueAnalysisId_fkey" FOREIGN KEY ("techniqueAnalysisId") REFERENCES "TechniqueAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TechniqueExpertReview_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TechniqueExpertReview_expertUserId_fkey" FOREIGN KEY ("expertUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "TechniqueAnalysis_expertReviewStatus_updatedAt_idx" ON "TechniqueAnalysis"("expertReviewStatus", "updatedAt");
CREATE INDEX "TechniqueExpertReview_status_requestedAt_idx" ON "TechniqueExpertReview"("status", "requestedAt");
CREATE INDEX "TechniqueExpertReview_techniqueAnalysisId_status_idx" ON "TechniqueExpertReview"("techniqueAnalysisId", "status");
CREATE INDEX "TechniqueExpertReview_expertUserId_status_idx" ON "TechniqueExpertReview"("expertUserId", "status");
CREATE INDEX "TechniqueExpertReview_athleteProfileId_status_idx" ON "TechniqueExpertReview"("athleteProfileId", "status");
CREATE INDEX "TechniqueExpertReview_disagreementKind_decidedAt_idx" ON "TechniqueExpertReview"("disagreementKind", "decidedAt");
