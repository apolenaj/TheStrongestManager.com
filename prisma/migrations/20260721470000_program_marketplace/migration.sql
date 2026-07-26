-- Prompt 138 — Program Marketplace
CREATE TABLE "ProgramMarketplaceListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorUserId" TEXT NOT NULL,
    "programId" TEXT,
    "title" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "durationWeeks" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "equipmentJson" TEXT NOT NULL DEFAULT '[]',
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "listingStatus" TEXT NOT NULL DEFAULT 'draft',
    "copyrightAttestedAt" DATETIME,
    "copyrightAttestationVersion" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" DATETIME,
    "reviewNote" TEXT,
    "publishedAt" DATETIME,
    "engineVersion" TEXT NOT NULL DEFAULT 'program_marketplace.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramMarketplaceListing_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramMarketplaceListing_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProgramMarketplaceListing_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ProgramMarketplaceListing_listingStatus_createdAt_idx" ON "ProgramMarketplaceListing"("listingStatus", "createdAt");
CREATE INDEX "ProgramMarketplaceListing_creatorUserId_createdAt_idx" ON "ProgramMarketplaceListing"("creatorUserId", "createdAt");
CREATE INDEX "ProgramMarketplaceListing_sport_goal_difficulty_idx" ON "ProgramMarketplaceListing"("sport", "goal", "difficulty");
CREATE INDEX "ProgramMarketplaceListing_programId_idx" ON "ProgramMarketplaceListing"("programId");

CREATE TABLE "ProgramMarketplacePurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "externalRef" TEXT,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramMarketplacePurchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProgramMarketplaceListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramMarketplacePurchase_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProgramMarketplacePurchase_listingId_buyerUserId_key" ON "ProgramMarketplacePurchase"("listingId", "buyerUserId");
CREATE INDEX "ProgramMarketplacePurchase_buyerUserId_createdAt_idx" ON "ProgramMarketplacePurchase"("buyerUserId", "createdAt");
CREATE INDEX "ProgramMarketplacePurchase_status_createdAt_idx" ON "ProgramMarketplacePurchase"("status", "createdAt");

CREATE TABLE "ProgramMarketplaceRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramMarketplaceRating_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProgramMarketplaceListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramMarketplaceRating_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "ProgramMarketplacePurchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramMarketplaceRating_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProgramMarketplaceRating_purchaseId_key" ON "ProgramMarketplaceRating"("purchaseId");
CREATE INDEX "ProgramMarketplaceRating_listingId_createdAt_idx" ON "ProgramMarketplaceRating"("listingId", "createdAt");

CREATE TABLE "ProgramMarketplaceCommission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "platformCents" INTEGER NOT NULL,
    "creatorCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramMarketplaceCommission_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProgramMarketplaceListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramMarketplaceCommission_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "ProgramMarketplacePurchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProgramMarketplaceCommission_purchaseId_key" ON "ProgramMarketplaceCommission"("purchaseId");
CREATE UNIQUE INDEX "ProgramMarketplaceCommission_idempotencyKey_key" ON "ProgramMarketplaceCommission"("idempotencyKey");
CREATE INDEX "ProgramMarketplaceCommission_listingId_status_createdAt_idx" ON "ProgramMarketplaceCommission"("listingId", "status", "createdAt");
