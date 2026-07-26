-- CreateTable
CREATE TABLE "CoachMarketplaceProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "specializationsJson" TEXT NOT NULL DEFAULT '[]',
    "languagesJson" TEXT NOT NULL DEFAULT '[]',
    "experienceSummary" TEXT,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'closed',
    "availabilityJson" TEXT NOT NULL DEFAULT '{}',
    "pricingJson" TEXT NOT NULL DEFAULT '{}',
    "listingStatus" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "suspendedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachMarketplaceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "yearEarned" INTEGER,
    "evidenceUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "verifiedAt" DATETIME,
    "verifiedByUserId" TEXT,
    "verificationNote" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachCredential_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CoachMarketplaceProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CoachCredential_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachMarketplaceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "athleteProfileId" TEXT,
    "rating" INTEGER,
    "body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "relatedType" TEXT,
    "relatedId" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachMarketplaceReview_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CoachMarketplaceProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CoachMarketplaceInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "athleteUserId" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    CONSTRAINT "CoachMarketplaceInquiry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CoachMarketplaceProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachMarketplaceProfile_userId_key" ON "CoachMarketplaceProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachMarketplaceProfile_slug_key" ON "CoachMarketplaceProfile"("slug");

-- CreateIndex
CREATE INDEX "CoachMarketplaceProfile_listingStatus_publishedAt_idx" ON "CoachMarketplaceProfile"("listingStatus", "publishedAt");

-- CreateIndex
CREATE INDEX "CoachMarketplaceProfile_availabilityStatus_idx" ON "CoachMarketplaceProfile"("availabilityStatus");

-- CreateIndex
CREATE INDEX "CoachCredential_profileId_verificationStatus_idx" ON "CoachCredential"("profileId", "verificationStatus");

-- CreateIndex
CREATE INDEX "CoachCredential_verificationStatus_idx" ON "CoachCredential"("verificationStatus");

-- CreateIndex
CREATE INDEX "CoachMarketplaceReview_profileId_status_publishedAt_idx" ON "CoachMarketplaceReview"("profileId", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "CoachMarketplaceInquiry_profileId_status_createdAt_idx" ON "CoachMarketplaceInquiry"("profileId", "status", "createdAt");
