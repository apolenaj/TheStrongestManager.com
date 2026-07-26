-- Video Privacy Controls (Prompt 178)
-- Private by default; expert review + anonymous model improvement require explicit opt-in.

ALTER TABLE "TechniqueAnalysis" ADD COLUMN "allowExpertReview" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "modelImprovementConsentAt" DATETIME;
ALTER TABLE "TechniqueAnalysis" ADD COLUMN "videoPrivacyVersion" TEXT NOT NULL DEFAULT 'video_privacy.v1';
