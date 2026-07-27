-- CreateEnum
CREATE TYPE "ProgramProductStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "CatalogProgramVersionStatus" AS ENUM ('draft', 'published', 'deprecated');

-- CreateEnum
CREATE TYPE "ProgramEntitlementSource" AS ENUM ('free', 'purchase', 'bundle', 'admin');

-- CreateEnum
CREATE TYPE "UserProgramRunStatus" AS ENUM ('active', 'paused', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "ProgramOrderStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'voided');

-- CreateTable
CREATE TABLE "ProgramProduct" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "methodId" TEXT,
    "durationWeeks" INTEGER NOT NULL,
    "availableSchedules" TEXT[],
    "difficulty" TEXT NOT NULL,
    "recoveryDemand" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProgramProductStatus" NOT NULL DEFAULT 'draft',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'usd',
    "displayPrice" INTEGER NOT NULL DEFAULT 0,
    "stripePriceId" TEXT,
    "bundleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_program_versions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "CatalogProgramVersionStatus" NOT NULL DEFAULT 'draft',
    "releaseNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_program_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramTemplate" (
    "id" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "scheduleVariant" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "weeks" JSONB NOT NULL,
    "sessions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramEntitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "source" "ProgramEntitlementSource" NOT NULL,
    "orderId" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entitlementId" TEXT NOT NULL,
    "programVersionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "scheduleVariant" TEXT NOT NULL,
    "unitSystem" TEXT NOT NULL DEFAULT 'kg',
    "trainingMaxes" JSONB NOT NULL DEFAULT '{}',
    "status" "UserProgramRunStatus" NOT NULL DEFAULT 'active',
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "ProgramOrderStatus" NOT NULL DEFAULT 'pending',
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "providerMetaJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "ProgramOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userProgramId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summaryJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramProduct_slug_key" ON "ProgramProduct"("slug");

-- CreateIndex
CREATE INDEX "ProgramProduct_status_isFree_idx" ON "ProgramProduct"("status", "isFree");

-- CreateIndex
CREATE INDEX "ProgramProduct_methodId_idx" ON "ProgramProduct"("methodId");

-- CreateIndex
CREATE INDEX "ProgramProduct_stripePriceId_idx" ON "ProgramProduct"("stripePriceId");

-- CreateIndex
CREATE INDEX "catalog_program_versions_productId_status_idx" ON "catalog_program_versions"("productId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_program_versions_productId_version_key" ON "catalog_program_versions"("productId", "version");

-- CreateIndex
CREATE INDEX "ProgramTemplate_programVersionId_idx" ON "ProgramTemplate"("programVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramTemplate_programVersionId_scheduleVariant_key" ON "ProgramTemplate"("programVersionId", "scheduleVariant");

-- CreateIndex
CREATE INDEX "ProgramEntitlement_userId_productId_idx" ON "ProgramEntitlement"("userId", "productId");

-- CreateIndex
CREATE INDEX "ProgramEntitlement_productId_source_idx" ON "ProgramEntitlement"("productId", "source");

-- CreateIndex
CREATE INDEX "ProgramEntitlement_orderId_idx" ON "ProgramEntitlement"("orderId");

-- CreateIndex
CREATE INDEX "ProgramEntitlement_expiresAt_idx" ON "ProgramEntitlement"("expiresAt");

-- CreateIndex
CREATE INDEX "UserProgram_userId_status_idx" ON "UserProgram"("userId", "status");

-- CreateIndex
CREATE INDEX "UserProgram_entitlementId_idx" ON "UserProgram"("entitlementId");

-- CreateIndex
CREATE INDEX "UserProgram_programVersionId_idx" ON "UserProgram"("programVersionId");

-- CreateIndex
CREATE INDEX "ProgramOrder_userId_createdAt_idx" ON "ProgramOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProgramOrder_productId_status_idx" ON "ProgramOrder"("productId", "status");

-- CreateIndex
CREATE INDEX "ProgramOrder_stripeCheckoutSessionId_idx" ON "ProgramOrder"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "ProgramOrder_status_createdAt_idx" ON "ProgramOrder"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCompletion_userProgramId_key" ON "ProgramCompletion"("userProgramId");

-- CreateIndex
CREATE INDEX "ProgramCompletion_userId_completedAt_idx" ON "ProgramCompletion"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "ProgramCompletion_productId_completedAt_idx" ON "ProgramCompletion"("productId", "completedAt");

-- AddForeignKey
ALTER TABLE "catalog_program_versions" ADD CONSTRAINT "catalog_program_versions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProgramProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramTemplate" ADD CONSTRAINT "ProgramTemplate_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "catalog_program_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEntitlement" ADD CONSTRAINT "ProgramEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEntitlement" ADD CONSTRAINT "ProgramEntitlement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProgramProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEntitlement" ADD CONSTRAINT "ProgramEntitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ProgramOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_entitlementId_fkey" FOREIGN KEY ("entitlementId") REFERENCES "ProgramEntitlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgram" ADD CONSTRAINT "UserProgram_programVersionId_fkey" FOREIGN KEY ("programVersionId") REFERENCES "catalog_program_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramOrder" ADD CONSTRAINT "ProgramOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramOrder" ADD CONSTRAINT "ProgramOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProgramProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCompletion" ADD CONSTRAINT "ProgramCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCompletion" ADD CONSTRAINT "ProgramCompletion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProgramProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCompletion" ADD CONSTRAINT "ProgramCompletion_userProgramId_fkey" FOREIGN KEY ("userProgramId") REFERENCES "UserProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

