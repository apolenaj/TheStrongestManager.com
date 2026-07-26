-- Prompt 88: Organization B2B billing
CREATE TABLE "OrgSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'org_free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "billingInterval" TEXT,
    "provider" TEXT,
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "coachSeatLimit" INTEGER,
    "athleteSeatLimit" INTEGER,
    "techniqueUsageCount" INTEGER NOT NULL DEFAULT 0,
    "techniqueUsagePeriodStart" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrgSubscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "OrgSubscription_organizationId_key" ON "OrgSubscription"("organizationId");
CREATE INDEX "OrgSubscription_plan_status_idx" ON "OrgSubscription"("plan", "status");
