-- Prompt 92: Model feedback loop
CREATE TABLE "ModelFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "relatedType" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "reason" TEXT,
    "engineVersion" TEXT NOT NULL DEFAULT 'model_feedback.v1',
    "autoRetrainBlocked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelFeedback_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelFeedback_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ModelFeedback_actorUserId_relatedType_relatedId_key" ON "ModelFeedback"("actorUserId", "relatedType", "relatedId");
CREATE INDEX "ModelFeedback_athleteProfileId_relatedType_createdAt_idx" ON "ModelFeedback"("athleteProfileId", "relatedType", "createdAt");
CREATE INDEX "ModelFeedback_relatedType_relatedId_idx" ON "ModelFeedback"("relatedType", "relatedId");
CREATE INDEX "ModelFeedback_verdict_createdAt_idx" ON "ModelFeedback"("verdict", "createdAt");
