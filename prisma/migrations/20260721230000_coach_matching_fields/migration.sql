-- Prompt 84: Coach matching fields + explicit sponsored placement
ALTER TABLE "CoachMarketplaceProfile" ADD COLUMN "goalTagsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "CoachMarketplaceProfile" ADD COLUMN "experienceLevelsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "CoachMarketplaceProfile" ADD COLUMN "coachingStylesJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "CoachMarketplaceProfile" ADD COLUMN "timezone" TEXT;
ALTER TABLE "CoachMarketplaceProfile" ADD COLUMN "locationLabel" TEXT;
ALTER TABLE "CoachMarketplaceProfile" ADD COLUMN "sponsoredPlacement" BOOLEAN NOT NULL DEFAULT false;
