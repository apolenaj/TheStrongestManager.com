-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "expiresAt" DATETIME,
    "settlesGrantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_kind_idx" ON "CreditTransaction"("userId", "kind");

-- CreateIndex
CREATE INDEX "CreditTransaction_relatedType_relatedId_idx" ON "CreditTransaction"("relatedType", "relatedId");

-- CreateIndex
CREATE INDEX "CreditTransaction_expiresAt_idx" ON "CreditTransaction"("expiresAt");
