-- Technique analysis upload pipeline fields (Prompt 16).
-- Never invent scores; overallScore stays null until a real backend writes it.

ALTER TABLE "TechniqueAnalysis" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "originalFileName" TEXT;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "fileSizeBytes" INTEGER;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "durationSeconds" REAL;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "widthPx" INTEGER;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "heightPx" INTEGER;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "cameraAngle" TEXT;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "loadKg" REAL;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "reps" INTEGER;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "analysisConsentAt" DATETIME;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "analysisBackendStatus" TEXT NOT NULL DEFAULT 'unavailable';
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "privacyNote" TEXT;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "deletedAt" DATETIME;

CREATE INDEX "TechniqueAnalysis_athleteProfileId_status_idx" ON "TechniqueAnalysis"("athleteProfileId", "status");
