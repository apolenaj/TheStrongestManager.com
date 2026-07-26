-- CreateTable
CREATE TABLE "CoachNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachUserId" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'notes',
    "body" TEXT NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachNote_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachNote_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachModification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachUserId" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'general',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "proposedChangeJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'open',
    "authorship" TEXT NOT NULL DEFAULT 'human_coach',
    "relatedType" TEXT,
    "relatedId" TEXT,
    "withdrawnAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachModification_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachModification_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachModificationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modificationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorUserId" TEXT,
    "detailJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachModificationEvent_modificationId_fkey" FOREIGN KEY ("modificationId") REFERENCES "CoachModification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CoachNote_athleteProfileId_section_createdAt_idx" ON "CoachNote"("athleteProfileId", "section", "createdAt");

-- CreateIndex
CREATE INDEX "CoachNote_coachUserId_createdAt_idx" ON "CoachNote"("coachUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CoachNote_relatedType_relatedId_idx" ON "CoachNote"("relatedType", "relatedId");

-- CreateIndex
CREATE INDEX "CoachModification_athleteProfileId_status_createdAt_idx" ON "CoachModification"("athleteProfileId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CoachModification_coachUserId_createdAt_idx" ON "CoachModification"("coachUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CoachModificationEvent_modificationId_createdAt_idx" ON "CoachModificationEvent"("modificationId", "createdAt");
