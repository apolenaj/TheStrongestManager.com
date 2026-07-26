-- Prompt 96: Paid Expert Technique Review (Human Analysis) orders
CREATE TABLE "HumanAnalysisOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'awaiting_purchase',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "amountCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "externalRef" TEXT,
    "techniqueAnalysisId" TEXT,
    "programId" TEXT,
    "competitionPrepId" TEXT,
    "athleteNote" TEXT,
    "expertReportJson" TEXT NOT NULL DEFAULT '{}',
    "expertSummary" TEXT,
    "expertUserId" TEXT,
    "purchasedAt" DATETIME,
    "queuedAt" DATETIME,
    "assignedAt" DATETIME,
    "reportReadyAt" DATETIME,
    "capacitySnapshotJson" TEXT NOT NULL DEFAULT '{}',
    "engineVersion" TEXT NOT NULL DEFAULT 'human_analysis.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HumanAnalysisOrder_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HumanAnalysisOrder_techniqueAnalysisId_fkey" FOREIGN KEY ("techniqueAnalysisId") REFERENCES "TechniqueAnalysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HumanAnalysisOrder_expertUserId_fkey" FOREIGN KEY ("expertUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "HumanAnalysisOrder_externalRef_key" ON "HumanAnalysisOrder"("externalRef");
CREATE INDEX "HumanAnalysisOrder_athleteProfileId_status_createdAt_idx" ON "HumanAnalysisOrder"("athleteProfileId", "status", "createdAt");
CREATE INDEX "HumanAnalysisOrder_status_queuedAt_idx" ON "HumanAnalysisOrder"("status", "queuedAt");
CREATE INDEX "HumanAnalysisOrder_productSku_status_idx" ON "HumanAnalysisOrder"("productSku", "status");
CREATE INDEX "HumanAnalysisOrder_paymentStatus_createdAt_idx" ON "HumanAnalysisOrder"("paymentStatus", "createdAt");
CREATE INDEX "HumanAnalysisOrder_expertUserId_status_idx" ON "HumanAnalysisOrder"("expertUserId", "status");
