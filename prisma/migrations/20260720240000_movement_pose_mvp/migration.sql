-- Prompt 17: movement / pose analysis report persistence

ALTER TABLE "TechniqueAnalysis" ADD COLUMN "movementReportJson" TEXT;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "poseProvider" TEXT;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "poseFrameCount" INTEGER;
