-- Prompt 82: Expert Contributor System
CREATE TABLE "ExpertContributorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "specializationsJson" TEXT NOT NULL DEFAULT '[]',
    "credentialsSummary" TEXT,
    "experienceSummary" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'none',
    "verifiedAt" DATETIME,
    "verifiedByUserId" TEXT,
    "verificationNote" TEXT,
    "seoSlug" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpertContributorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExpertContributorProfile_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ExpertArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contributorId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpertArticle_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "ExpertContributorProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ExpertContributorProfile_userId_key" ON "ExpertContributorProfile"("userId");
CREATE UNIQUE INDEX "ExpertContributorProfile_seoSlug_key" ON "ExpertContributorProfile"("seoSlug");
CREATE INDEX "ExpertContributorProfile_verificationStatus_idx" ON "ExpertContributorProfile"("verificationStatus");
CREATE INDEX "ExpertContributorProfile_seoSlug_idx" ON "ExpertContributorProfile"("seoSlug");

CREATE UNIQUE INDEX "ExpertArticle_slug_key" ON "ExpertArticle"("slug");
CREATE INDEX "ExpertArticle_contributorId_status_publishedAt_idx" ON "ExpertArticle"("contributorId", "status", "publishedAt");
CREATE INDEX "ExpertArticle_status_publishedAt_idx" ON "ExpertArticle"("status", "publishedAt");
