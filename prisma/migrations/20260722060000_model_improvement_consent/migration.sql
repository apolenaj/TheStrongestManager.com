-- Model Improvement Consent (Prompt 179) — account expert preference (separate from research).

CREATE TABLE "AthleteConsentPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "expertReviewOptIn" BOOLEAN NOT NULL DEFAULT false,
    "expertReviewUpdatedAt" DATETIME,
    "expertReviewPolicyVersion" TEXT NOT NULL DEFAULT 'model_improvement_consent.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AthleteConsentPreference_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AthleteConsentPreference_athleteProfileId_key" ON "AthleteConsentPreference"("athleteProfileId");
