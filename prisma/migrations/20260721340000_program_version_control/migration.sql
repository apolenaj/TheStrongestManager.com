-- Program Version Control (Prompt 118)
ALTER TABLE "Program" ADD COLUMN "currentVersionNumber" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ProgramVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "label" TEXT,
    "changedByUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "snapshotJson" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'save',
    "restoredFromVersionNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramVersion_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgramVersion_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProgramVersion_programId_versionNumber_key" ON "ProgramVersion"("programId", "versionNumber");
CREATE INDEX "ProgramVersion_programId_createdAt_idx" ON "ProgramVersion"("programId", "createdAt");
CREATE INDEX "ProgramVersion_changedByUserId_idx" ON "ProgramVersion"("changedByUserId");
