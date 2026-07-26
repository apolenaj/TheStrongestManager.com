import { prisma } from "@/lib/db";
import {
  PRIORITY_EXERCISE_RELATIONS,
  PRIORITY_EXERCISES,
} from "@/domain/exercises/priority-seed";

function json(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Upsert the priority Exercise Intelligence catalog.
 * Does not create ExerciseEvidenceClaim rows (no fabricated citations).
 */
export async function seedPriorityExercises() {
  const now = new Date();

  for (const exercise of PRIORITY_EXERCISES) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      create: {
        slug: exercise.slug,
        name: exercise.name,
        aliases: json(exercise.aliases),
        description: exercise.description,
        category: exercise.category,
        movementPattern: exercise.movementPattern,
        primaryMuscles: json(exercise.primaryMuscles),
        secondaryMuscles: json(exercise.secondaryMuscles),
        equipment: json(exercise.equipment),
        difficulty: exercise.difficulty,
        laterality: exercise.laterality,
        sportRelevance: json(exercise.sportRelevance),
        executionOverview: exercise.executionOverview,
        setup: exercise.setup,
        execution: exercise.execution,
        breathingBracing: exercise.breathingBracing,
        commonMistakes: json(exercise.commonMistakes),
        regressions: json(exercise.regressions),
        progressions: json(exercise.progressions),
        variations: json(exercise.variations),
        programmingUses: exercise.programmingUses,
        safetyNotes: exercise.safetyNotes,
        contentKind: "coaching_practice",
        contentStatus: "reviewed",
        isPublished: true,
        publishedAt: now,
      },
      update: {
        name: exercise.name,
        aliases: json(exercise.aliases),
        description: exercise.description,
        category: exercise.category,
        movementPattern: exercise.movementPattern,
        primaryMuscles: json(exercise.primaryMuscles),
        secondaryMuscles: json(exercise.secondaryMuscles),
        equipment: json(exercise.equipment),
        difficulty: exercise.difficulty,
        laterality: exercise.laterality,
        sportRelevance: json(exercise.sportRelevance),
        executionOverview: exercise.executionOverview,
        setup: exercise.setup,
        execution: exercise.execution,
        breathingBracing: exercise.breathingBracing,
        commonMistakes: json(exercise.commonMistakes),
        regressions: json(exercise.regressions),
        progressions: json(exercise.progressions),
        variations: json(exercise.variations),
        programmingUses: exercise.programmingUses,
        safetyNotes: exercise.safetyNotes,
        contentKind: "coaching_practice",
        contentStatus: "reviewed",
        isPublished: true,
        publishedAt: now,
      },
    });
  }

  const bySlug = await prisma.exercise.findMany({
    where: { slug: { in: PRIORITY_EXERCISES.map((e) => e.slug) } },
    select: { id: true, slug: true },
  });
  const idBySlug = new Map(bySlug.map((e) => [e.slug, e.id]));

  for (const relation of PRIORITY_EXERCISE_RELATIONS) {
    const fromId = idBySlug.get(relation.fromSlug);
    const toId = idBySlug.get(relation.toSlug);
    if (!fromId || !toId) continue;

    await prisma.exerciseRelation.upsert({
      where: {
        fromExerciseId_toExerciseId_relationType: {
          fromExerciseId: fromId,
          toExerciseId: toId,
          relationType: relation.relationType,
        },
      },
      create: {
        fromExerciseId: fromId,
        toExerciseId: toId,
        relationType: relation.relationType,
        note: relation.note,
      },
      update: {
        note: relation.note,
      },
    });
  }

  const evidenceCount = await prisma.exerciseEvidenceClaim.count({
    where: {
      exerciseId: { in: [...idBySlug.values()] },
    },
  });

  return {
    exercises: PRIORITY_EXERCISES.length,
    relations: PRIORITY_EXERCISE_RELATIONS.length,
    evidenceClaims: evidenceCount,
  };
}
