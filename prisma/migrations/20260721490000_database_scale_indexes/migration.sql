-- Database Scale Audit (Prompt 153) — hot-path indexes for 100k+ users.
-- No premature sharding; SQLite-compatible CREATE INDEX.

CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "TrainingSession_athleteProfileId_completedAt_idx" ON "TrainingSession"("athleteProfileId", "completedAt");
CREATE INDEX IF NOT EXISTS "SessionSet_completedAt_idx" ON "SessionSet"("completedAt");
CREATE INDEX IF NOT EXISTS "TechniqueAnalysis_athleteProfileId_deletedAt_createdAt_idx" ON "TechniqueAnalysis"("athleteProfileId", "deletedAt", "createdAt");
CREATE INDEX IF NOT EXISTS "TechniqueAnalysis_storageKey_idx" ON "TechniqueAnalysis"("storageKey");
