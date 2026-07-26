-- AlterTable
ALTER TABLE "AthleteProfile" ADD COLUMN "movementNotes" TEXT;
ALTER TABLE "AthleteProfile" ADD COLUMN "onboardingCompletedAt" DATETIME;
ALTER TABLE "AthleteProfile" ADD COLUMN "painCautionAcknowledgedAt" DATETIME;

-- AlterTable
ALTER TABLE "TrainingExperience" ADD COLUMN "availableEquipment" TEXT;
ALTER TABLE "TrainingExperience" ADD COLUMN "preferredSports" TEXT;
ALTER TABLE "TrainingExperience" ADD COLUMN "recentHistory" TEXT;
ALTER TABLE "TrainingExperience" ADD COLUMN "recoveryHabits" TEXT;
