-- Prompt 137 — Creator Program (capabilities unlock only when approved)
CREATE TABLE "CreatorPartnership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "handle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedCapabilitiesJson" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" DATETIME,
    "reviewNote" TEXT,
    "affiliatePartnerId" TEXT,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "engineVersion" TEXT NOT NULL DEFAULT 'creator_program.v1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreatorPartnership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreatorPartnership_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CreatorPartnership_affiliatePartnerId_fkey" FOREIGN KEY ("affiliatePartnerId") REFERENCES "AffiliatePartner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CreatorPartnership_userId_key" ON "CreatorPartnership"("userId");
CREATE INDEX "CreatorPartnership_status_createdAt_idx" ON "CreatorPartnership"("status", "createdAt");
CREATE INDEX "CreatorPartnership_affiliatePartnerId_idx" ON "CreatorPartnership"("affiliatePartnerId");
