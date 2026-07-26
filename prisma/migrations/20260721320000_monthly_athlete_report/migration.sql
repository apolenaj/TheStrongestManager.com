-- Prompt 98: Monthly athlete performance reports + shareable snapshots
CREATE TABLE "MonthlyAthleteReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "monthStart" DATETIME NOT NULL,
    "monthKey" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "summary" TEXT,
    "reportJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyAthleteReport_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MonthlyAthleteReport_athleteProfileId_monthKey_key" ON "MonthlyAthleteReport"("athleteProfileId", "monthKey");
CREATE INDEX "MonthlyAthleteReport_athleteProfileId_monthStart_idx" ON "MonthlyAthleteReport"("athleteProfileId", "monthStart");

CREATE TABLE "MonthlyReportShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "athleteProfileId" TEXT NOT NULL,
    "reportId" TEXT,
    "token" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "MonthlyReportShare_athleteProfileId_fkey" FOREIGN KEY ("athleteProfileId") REFERENCES "AthleteProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MonthlyReportShare_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MonthlyAthleteReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MonthlyReportShare_token_key" ON "MonthlyReportShare"("token");
CREATE INDEX "MonthlyReportShare_athleteProfileId_createdAt_idx" ON "MonthlyReportShare"("athleteProfileId", "createdAt");
