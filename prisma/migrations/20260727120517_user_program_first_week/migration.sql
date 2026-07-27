-- AlterTable
ALTER TABLE "UserProgram" ADD COLUMN     "competitionDate" TIMESTAMP(3),
ADD COLUMN     "firstWeekJson" JSONB NOT NULL DEFAULT '{}';

