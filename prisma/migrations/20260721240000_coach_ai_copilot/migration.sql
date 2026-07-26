-- Prompt 85: Coach AI Copilot suggestions + decision audit
CREATE TABLE "CoachAiSuggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coachUserId" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "authorship" TEXT NOT NULL DEFAULT 'ai_engine',
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "suggestedChange" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "supportingDataJson" TEXT NOT NULL DEFAULT '[]',
    "confidence" TEXT NOT NULL DEFAULT 'low',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "engineVersion" TEXT NOT NULL,
    "proposedChangeJson" TEXT NOT NULL DEFAULT '{}',
    "editedChange" TEXT,
    "decisionNote" TEXT,
    "decidedAt" DATETIME,
    "decidedByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CoachAiSuggestion_coachUserId_fkey" FOREIGN KEY ("coachUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachAiSuggestion_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachAiSuggestion_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "CoachAiSuggestionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "suggestionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorUserId" TEXT,
    "detailJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachAiSuggestionEvent_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "CoachAiSuggestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CoachAiSuggestion_coachUserId_athleteProfileId_status_createdAt_idx" ON "CoachAiSuggestion"("coachUserId", "athleteProfileId", "status", "createdAt");
CREATE INDEX "CoachAiSuggestion_athleteProfileId_status_idx" ON "CoachAiSuggestion"("athleteProfileId", "status");
CREATE INDEX "CoachAiSuggestionEvent_suggestionId_createdAt_idx" ON "CoachAiSuggestionEvent"("suggestionId", "createdAt");
