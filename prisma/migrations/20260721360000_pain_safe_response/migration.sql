-- Pain-Safe Response System (Prompt 126)
CREATE TABLE "PainSafeReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'user_report',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clearedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PainSafeReport_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PainSafeReport_athleteProfileId_active_createdAt_idx" ON "PainSafeReport"("athleteProfileId", "active", "createdAt");
CREATE INDEX "PainSafeReport_athleteProfileId_category_idx" ON "PainSafeReport"("athleteProfileId", "category");
