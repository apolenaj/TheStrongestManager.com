-- Exercise Intelligence architecture (Prompt 13)
-- Expand Exercise; add relations + evidence claims (empty of fabricated citations).

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'compound',
    "movementPattern" TEXT NOT NULL DEFAULT 'other',
    "primaryMuscles" TEXT NOT NULL DEFAULT '[]',
    "secondaryMuscles" TEXT NOT NULL DEFAULT '[]',
    "equipment" TEXT NOT NULL DEFAULT '[]',
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "laterality" TEXT,
    "sportRelevance" TEXT NOT NULL DEFAULT '{}',
    "executionOverview" TEXT,
    "setup" TEXT,
    "execution" TEXT,
    "breathingBracing" TEXT,
    "commonMistakes" TEXT NOT NULL DEFAULT '[]',
    "regressions" TEXT NOT NULL DEFAULT '[]',
    "progressions" TEXT NOT NULL DEFAULT '[]',
    "variations" TEXT NOT NULL DEFAULT '[]',
    "programmingUses" TEXT,
    "safetyNotes" TEXT,
    "contentKind" TEXT NOT NULL DEFAULT 'coaching_practice',
    "contentStatus" TEXT NOT NULL DEFAULT 'draft',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Exercise" (
    "id", "slug", "name", "description", "movementPattern", "equipment",
    "laterality", "isPublished", "createdAt", "updatedAt",
    "category", "difficulty"
)
SELECT
    "id",
    "slug",
    "name",
    "description",
    COALESCE("movementPattern", 'other'),
    CASE
      WHEN "equipment" IS NULL OR "equipment" = '' THEN '[]'
      ELSE '["' || "equipment" || '"]'
    END,
    "laterality",
    "isPublished",
    "createdAt",
    "updatedAt",
    'compound',
    'intermediate'
FROM "Exercise";

DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";

CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");
CREATE INDEX "Exercise_isPublished_category_idx" ON "Exercise"("isPublished", "category");
CREATE INDEX "Exercise_movementPattern_idx" ON "Exercise"("movementPattern");

CREATE TABLE "ExerciseRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromExerciseId" TEXT NOT NULL,
    "toExerciseId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExerciseRelation_fromExerciseId_fkey" FOREIGN KEY ("fromExerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseRelation_toExerciseId_fkey" FOREIGN KEY ("toExerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ExerciseRelation_fromExerciseId_toExerciseId_relationType_key"
  ON "ExerciseRelation"("fromExerciseId", "toExerciseId", "relationType");
CREATE INDEX "ExerciseRelation_fromExerciseId_relationType_idx"
  ON "ExerciseRelation"("fromExerciseId", "relationType");
CREATE INDEX "ExerciseRelation_toExerciseId_idx" ON "ExerciseRelation"("toExerciseId");

CREATE TABLE "ExerciseEvidenceClaim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "citationLabel" TEXT NOT NULL,
    "citationUrl" TEXT,
    "supportLevel" TEXT NOT NULL DEFAULT 'limited',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExerciseEvidenceClaim_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ExerciseEvidenceClaim_exerciseId_idx" ON "ExerciseEvidenceClaim"("exerciseId");

PRAGMA foreign_keys=ON;
