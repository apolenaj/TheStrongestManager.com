-- Normalize mass preference to kg | lb (from legacy metric | imperial).
UPDATE "AthleteProfile" SET "units" = 'kg' WHERE "units" IN ('metric', 'kg');
UPDATE "AthleteProfile" SET "units" = 'lb' WHERE "units" IN ('imperial', 'lb');

-- Fresh profiles default to kg.
-- SQLite: recreate default via table rebuild is heavy; Prisma client default covers new rows.
-- Keep existing column; application writes "kg" | "lb" explicitly.
