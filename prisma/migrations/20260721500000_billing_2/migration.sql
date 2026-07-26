-- Billing 2.0 (Prompt 157) — subscription lifecycle fields + webhook/invoice/coupon tables.

-- Subscription extensions
ALTER TABLE "Subscription" ADD COLUMN "billingInterval" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "providerPriceId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "trialEndsAt" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "graceEndsAt" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "pendingPlan" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "couponCode" TEXT;
CREATE INDEX IF NOT EXISTS "Subscription_status_currentPeriodEnd_idx" ON "Subscription"("status", "currentPeriodEnd");
CREATE INDEX IF NOT EXISTS "Subscription_providerSubscriptionId_idx" ON "Subscription"("providerSubscriptionId");

-- Webhook idempotency ledger
CREATE TABLE IF NOT EXISTS "BillingWebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "userId" TEXT,
    "resultJson" TEXT,
    "errorMessage" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "BillingWebhookEvent_providerEventId_key" ON "BillingWebhookEvent"("providerEventId");
CREATE INDEX IF NOT EXISTS "BillingWebhookEvent_eventType_createdAt_idx" ON "BillingWebhookEvent"("eventType", "createdAt");
CREATE INDEX IF NOT EXISTS "BillingWebhookEvent_status_createdAt_idx" ON "BillingWebhookEvent"("status", "createdAt");

-- Invoice mirror
CREATE TABLE IF NOT EXISTS "BillingInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "providerInvoiceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amountDueCents" INTEGER NOT NULL DEFAULT 0,
    "amountPaidCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "billingInterval" TEXT,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "hostedInvoiceUrl" TEXT,
    "invoicePdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BillingInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "BillingInvoice_providerInvoiceId_key" ON "BillingInvoice"("providerInvoiceId");
CREATE INDEX IF NOT EXISTS "BillingInvoice_userId_createdAt_idx" ON "BillingInvoice"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "BillingInvoice_status_createdAt_idx" ON "BillingInvoice"("status", "createdAt");

-- Coupon redemptions
CREATE TABLE IF NOT EXISTS "CouponRedemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "couponCode" TEXT NOT NULL,
    "providerPromotionCodeId" TEXT,
    "providerCouponId" TEXT,
    "discountLabel" TEXT,
    "redeemedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CouponRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CouponRedemption_userId_redeemedAt_idx" ON "CouponRedemption"("userId", "redeemedAt");
CREATE INDEX IF NOT EXISTS "CouponRedemption_couponCode_idx" ON "CouponRedemption"("couponCode");
CREATE UNIQUE INDEX IF NOT EXISTS "CouponRedemption_userId_couponCode_providerPromotionCodeId_key" ON "CouponRedemption"("userId", "couponCode", "providerPromotionCodeId");
