-- Prompt 135 — Referral Program (single-level; abuse caps; no pyramid)
CREATE TABLE "UserReferralCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserReferralCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserReferralCode_userId_key" ON "UserReferralCode"("userId");
CREATE UNIQUE INDEX "UserReferralCode_code_key" ON "UserReferralCode"("code");
CREATE INDEX "UserReferralCode_code_idx" ON "UserReferralCode"("code");

CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referrerUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'attributed',
    "voidReason" TEXT,
    "attributedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qualifiedAt" DATETIME,
    "rewardedAt" DATETIME,
    "engineVersion" TEXT NOT NULL DEFAULT 'referral_program.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Referral_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "UserReferralCode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Referral_referrerUserId_fkey" FOREIGN KEY ("referrerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Referral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Referral_referredUserId_key" ON "Referral"("referredUserId");
CREATE INDEX "Referral_referrerUserId_status_createdAt_idx" ON "Referral"("referrerUserId", "status", "createdAt");
CREATE INDEX "Referral_status_createdAt_idx" ON "Referral"("status", "createdAt");
CREATE INDEX "Referral_code_createdAt_idx" ON "Referral"("code", "createdAt");

CREATE TABLE "ReferralReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referralId" TEXT NOT NULL,
    "beneficiaryUserId" TEXT NOT NULL,
    "beneficiaryRole" TEXT NOT NULL,
    "rewardKind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "creditsAmount" INT,
    "idempotencyKey" TEXT NOT NULL,
    "grantedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReferralReward_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReferralReward_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ReferralReward_idempotencyKey_key" ON "ReferralReward"("idempotencyKey");
CREATE INDEX "ReferralReward_referralId_status_idx" ON "ReferralReward"("referralId", "status");
CREATE INDEX "ReferralReward_beneficiaryUserId_createdAt_idx" ON "ReferralReward"("beneficiaryUserId", "createdAt");
CREATE INDEX "ReferralReward_rewardKind_status_idx" ON "ReferralReward"("rewardKind", "status");

CREATE TABLE "ReferralAccessGrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "referralRewardId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReferralAccessGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReferralAccessGrant_referralRewardId_fkey" FOREIGN KEY ("referralRewardId") REFERENCES "ReferralReward" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ReferralAccessGrant_referralRewardId_key" ON "ReferralAccessGrant"("referralRewardId");
CREATE INDEX "ReferralAccessGrant_userId_status_endsAt_idx" ON "ReferralAccessGrant"("userId", "status", "endsAt");
