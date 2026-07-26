-- Prompt 89: White-label branding profile stub (not a full product)
CREATE TABLE "BrandingProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "displayName" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "colorsJson" TEXT NOT NULL DEFAULT '{}',
    "customHostname" TEXT,
    "pathPrefix" TEXT,
    "emailJson" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BrandingProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "BrandingProfile_organizationId_key" ON "BrandingProfile"("organizationId");
