-- Prompt 136 — Affiliate System (clicks, conversions, commission ledger; disclosure-gated)
CREATE TABLE "AffiliatePartner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "disclosureAcknowledgedAt" DATETIME,
    "engineVersion" TEXT NOT NULL DEFAULT 'affiliate_system.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AffiliatePartner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AffiliatePartner_userId_key" ON "AffiliatePartner"("userId");
CREATE UNIQUE INDEX "AffiliatePartner_slug_key" ON "AffiliatePartner"("slug");
CREATE INDEX "AffiliatePartner_partnerType_status_idx" ON "AffiliatePartner"("partnerType", "status");
CREATE INDEX "AffiliatePartner_status_createdAt_idx" ON "AffiliatePartner"("status", "createdAt");

CREATE TABLE "AffiliateLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "destinationPath" TEXT NOT NULL DEFAULT '/signup',
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AffiliateLink_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "AffiliatePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AffiliateLink_code_key" ON "AffiliateLink"("code");
CREATE INDEX "AffiliateLink_partnerId_status_idx" ON "AffiliateLink"("partnerId", "status");

CREATE TABLE "AffiliateClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "visitorKey" TEXT,
    "destinationPath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateClick_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "AffiliatePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AffiliateClick_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "AffiliateLink" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "AffiliateClick_partnerId_createdAt_idx" ON "AffiliateClick"("partnerId", "createdAt");
CREATE INDEX "AffiliateClick_linkId_createdAt_idx" ON "AffiliateClick"("linkId", "createdAt");

CREATE TABLE "AffiliateConversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "linkId" TEXT,
    "clickId" TEXT,
    "convertedUserId" TEXT,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'attributed',
    "voidReason" TEXT,
    "attributedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "engineVersion" TEXT NOT NULL DEFAULT 'affiliate_system.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AffiliateConversion_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "AffiliatePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AffiliateConversion_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "AffiliateLink" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AffiliateConversion_convertedUserId_fkey" FOREIGN KEY ("convertedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AffiliateConversion_convertedUserId_eventType_key" ON "AffiliateConversion"("convertedUserId", "eventType");
CREATE INDEX "AffiliateConversion_partnerId_status_createdAt_idx" ON "AffiliateConversion"("partnerId", "status", "createdAt");
CREATE INDEX "AffiliateConversion_eventType_createdAt_idx" ON "AffiliateConversion"("eventType", "createdAt");

CREATE TABLE "AffiliateCommission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversionId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "idempotencyKey" TEXT NOT NULL,
    "accruedAt" DATETIME,
    "voidedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AffiliateCommission_conversionId_fkey" FOREIGN KEY ("conversionId") REFERENCES "AffiliateConversion" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AffiliateCommission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "AffiliatePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AffiliateCommission_conversionId_key" ON "AffiliateCommission"("conversionId");
CREATE UNIQUE INDEX "AffiliateCommission_idempotencyKey_key" ON "AffiliateCommission"("idempotencyKey");
CREATE INDEX "AffiliateCommission_partnerId_status_createdAt_idx" ON "AffiliateCommission"("partnerId", "status", "createdAt");
