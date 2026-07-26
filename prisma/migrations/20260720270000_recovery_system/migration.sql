-- Recovery check-in fields + readiness estimate metadata (Prompt 26).
-- Sleep remains optional; never fabricate missing sleep.

ALTER TABLE "RecoveryEntry" ADD COLUMN "sleepQuality" REAL;
ALTER TABLE "RecoveryEntry" ADD COLUMN "motivation" REAL;
ALTER TABLE "RecoveryEntry" ADD COLUMN "fatigue" REAL;
ALTER TABLE "RecoveryEntry" ADD COLUMN "readinessInputsJson" TEXT;
ALTER TABLE "RecoveryEntry" ADD COLUMN "readinessConfidence" TEXT;
