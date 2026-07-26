-- Prompt 81: Community Knowledge Q&A
CREATE TABLE "CommunityQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "score" INTEGER NOT NULL DEFAULT 0,
    "acceptedAnswerId" TEXT,
    "aiSummary" TEXT,
    "aiSummaryAt" DATETIME,
    "aiEngineVersion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityQuestion_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CommunityAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorship" TEXT NOT NULL DEFAULT 'human_athlete',
    "expertBadgeAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'published',
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CommunityQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityAnswer_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CommunityVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetKey" TEXT NOT NULL,
    "questionId" TEXT,
    "answerId" TEXT,
    "value" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityVote_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityVote_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CommunityQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityVote_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "CommunityAnswer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CommunityQaModerationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT,
    "answerId" TEXT,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "actorUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityQaModerationEvent_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CommunityQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityQaModerationEvent_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "CommunityAnswer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityQaModerationEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CommunityQuestion_category_status_createdAt_idx" ON "CommunityQuestion"("category", "status", "createdAt");
CREATE INDEX "CommunityQuestion_athleteProfileId_createdAt_idx" ON "CommunityQuestion"("athleteProfileId", "createdAt");
CREATE INDEX "CommunityQuestion_status_score_idx" ON "CommunityQuestion"("status", "score");

CREATE INDEX "CommunityAnswer_questionId_status_score_idx" ON "CommunityAnswer"("questionId", "status", "score");
CREATE INDEX "CommunityAnswer_athleteProfileId_createdAt_idx" ON "CommunityAnswer"("athleteProfileId", "createdAt");

CREATE UNIQUE INDEX "CommunityVote_athleteProfileId_targetKey_key" ON "CommunityVote"("athleteProfileId", "targetKey");
CREATE INDEX "CommunityVote_questionId_idx" ON "CommunityVote"("questionId");
CREATE INDEX "CommunityVote_answerId_idx" ON "CommunityVote"("answerId");

CREATE INDEX "CommunityQaModerationEvent_createdAt_idx" ON "CommunityQaModerationEvent"("createdAt");
CREATE INDEX "CommunityQaModerationEvent_questionId_createdAt_idx" ON "CommunityQaModerationEvent"("questionId", "createdAt");
CREATE INDEX "CommunityQaModerationEvent_answerId_createdAt_idx" ON "CommunityQaModerationEvent"("answerId", "createdAt");
