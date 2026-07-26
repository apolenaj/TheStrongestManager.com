-- Coaching Notes Intelligence (Prompt 131)
-- Private notes excluded from AI + unrelated product use; AI summaries separately sourced.

ALTER TABLE "CoachNote" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CoachNote" ADD COLUMN "allowAiSummarize" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "CoachNote_athleteProfileId_isPrivate_status_idx" ON "CoachNote"("athleteProfileId", "isPrivate", "status");

CREATE TABLE "CoachNoteSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "sourceNoteIdsJson" TEXT NOT NULL DEFAULT '[]',
    "summaryBody" TEXT NOT NULL,
    "excludedPrivateCount" INTEGER NOT NULL DEFAULT 0,
    "engineVersion" TEXT NOT NULL DEFAULT 'coaching_notes_intelligence.v1',
    "source" TEXT NOT NULL DEFAULT 'ai_summary',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachNoteSummary_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachNoteSummary_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CoachNoteSummary_athleteProfileId_createdAt_idx" ON "CoachNoteSummary"("athleteProfileId", "createdAt");
CREATE INDEX "CoachNoteSummary_requestedByUserId_createdAt_idx" ON "CoachNoteSummary"("requestedByUserId", "createdAt");
