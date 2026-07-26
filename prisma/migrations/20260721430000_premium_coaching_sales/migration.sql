-- Premium Coaching Sales Flow (Prompt 134)
CREATE TABLE "PremiumCoachingApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicantUserId" TEXT NOT NULL,
    "athleteProfileId" TEXT,
    "goal" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStartedAt" DATETIME,
    "consultationAt" DATETIME,
    "offerPresentedAt" DATETIME,
    "declinedAt" DATETIME,
    "withdrawnAt" DATETIME,
    "stageChangedByUserId" TEXT,
    "offerJson" TEXT,
    "engineVersion" TEXT NOT NULL DEFAULT 'premium_coaching_sales.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PremiumCoachingApplication_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PremiumCoachingApplication_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PremiumCoachingApplication_stageChangedByUserId_fkey" FOREIGN KEY ("stageChangedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "PremiumCoachingApplication_applicantUserId_createdAt_idx" ON "PremiumCoachingApplication"("applicantUserId", "createdAt");
CREATE INDEX "PremiumCoachingApplication_status_createdAt_idx" ON "PremiumCoachingApplication"("status", "createdAt");
CREATE INDEX "PremiumCoachingApplication_athleteProfileId_createdAt_idx" ON "PremiumCoachingApplication"("athleteProfileId", "createdAt");
