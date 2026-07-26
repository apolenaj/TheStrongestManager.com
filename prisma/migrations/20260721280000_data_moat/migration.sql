-- Prompt 91: Data moat consent + aggregation job stubs
CREATE TABLE "DataMoatConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "optedIn" BOOLEAN NOT NULL DEFAULT false,
    "scopesJson" TEXT NOT NULL DEFAULT '{}',
    "policyVersion" TEXT NOT NULL DEFAULT 'data_moat_policy.v1',
    "consentedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DataMoatConsent_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DataMoatConsent_athleteProfileId_key" ON "DataMoatConsent"("athleteProfileId");
CREATE INDEX "DataMoatConsent_optedIn_policyVersion_idx" ON "DataMoatConsent"("optedIn", "policyVersion");

CREATE TABLE "AggregationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobKey" TEXT NOT NULL,
    "insightKind" TEXT NOT NULL,
    "windowStart" DATETIME NOT NULL,
    "windowEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "cohortFiltersJson" TEXT NOT NULL DEFAULT '{}',
    "minCohortSize" INTEGER NOT NULL DEFAULT 5,
    "sourcePolicyVersion" TEXT NOT NULL DEFAULT 'data_moat_policy.v1',
    "rowsConsidered" INTEGER NOT NULL DEFAULT 0,
    "rowsIncluded" INTEGER NOT NULL DEFAULT 0,
    "rowsSuppressed" INTEGER NOT NULL DEFAULT 0,
    "resultJson" TEXT,
    "errorMessage" TEXT,
    "engineVersion" TEXT NOT NULL DEFAULT 'data_moat.v1',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "AggregationJob_jobKey_status_idx" ON "AggregationJob"("jobKey", "status");
CREATE INDEX "AggregationJob_insightKind_windowStart_idx" ON "AggregationJob"("insightKind", "windowStart");
CREATE INDEX "AggregationJob_status_createdAt_idx" ON "AggregationJob"("status", "createdAt");
