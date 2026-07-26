/**
 * Upsert runner for priority exercises.
 * Usage: npm run db:seed:exercises
 */
import { prisma } from "@/lib/db";
import { seedPriorityExercises } from "@/domain/exercises/seed-runner";

async function main() {
  const result = await seedPriorityExercises();
  console.log(
    `Seeded ${result.exercises} exercises, ${result.relations} relations, ${result.evidenceClaims} evidence claims (expected 0).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
