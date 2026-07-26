-- CreateTable
CREATE TABLE "PrShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "PrShare_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PrShare_token_key" ON "PrShare"("token");

-- CreateIndex
CREATE INDEX "PrShare_athleteProfileId_createdAt_idx" ON "PrShare"("athleteProfileId", "createdAt");
