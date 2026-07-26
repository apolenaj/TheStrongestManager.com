-- Activity Feed MVP visibility preferences (Prompt 195)
CREATE TABLE "ActivityFeedPreference" (
    "id" TEXT NOT NULL,
    "athleteProfileId" TEXT NOT NULL,
    "feedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "showPrs" BOOLEAN NOT NULL DEFAULT true,
    "showCompetitionResults" BOOLEAN NOT NULL DEFAULT true,
    "showAchievements" BOOLEAN NOT NULL DEFAULT true,
    "showSharedTechnique" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityFeedPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ActivityFeedPreference_athleteProfileId_key" ON "ActivityFeedPreference"("athleteProfileId");

ALTER TABLE "ActivityFeedPreference" ADD CONSTRAINT "ActivityFeedPreference_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
