-- Injury-Modification Architecture (Prompt 130)
-- User-declared limitations — NOT injury diagnosis.
CREATE TABLE "InjuryModification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "declarationKind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "affectedArea" TEXT,
    "instructionSource" TEXT,
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME,
    "clearedAt" DATETIME,
    "engineVersion" TEXT NOT NULL DEFAULT 'injury_modification.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InjuryModification_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "InjuryModification_athleteProfileId_status_startsAt_idx" ON "InjuryModification"("athleteProfileId", "status", "startsAt");
CREATE INDEX "InjuryModification_athleteProfileId_status_idx" ON "InjuryModification"("athleteProfileId", "status");
