-- CreateTable
CREATE TABLE "AthletePublicProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "bio" TEXT,
    "visibilityJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AthletePublicProfile_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AthletePublicProfile_athleteProfileId_key" ON "AthletePublicProfile"("athleteProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AthletePublicProfile_slug_key" ON "AthletePublicProfile"("slug");

-- CreateIndex
CREATE INDEX "AthletePublicProfile_isPublic_slug_idx" ON "AthletePublicProfile"("isPublic", "slug");
