-- CreateTable
CREATE TABLE "TechniqueShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "techniqueAnalysisId" TEXT,
    "token" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "TechniqueShare_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TechniqueShare_token_key" ON "TechniqueShare"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TechniqueShare_referralCode_key" ON "TechniqueShare"("referralCode");

-- CreateIndex
CREATE INDEX "TechniqueShare_athleteProfileId_createdAt_idx" ON "TechniqueShare"("athleteProfileId", "createdAt");
