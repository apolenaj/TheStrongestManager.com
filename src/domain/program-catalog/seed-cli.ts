/**
 * CLI: seed commercial program catalog (6 families × free/paid + bundle).
 * Usage: npm run db:seed:programs
 */
import { prisma } from "@/lib/db";
import { seedProgramCatalog } from "@/services/program-catalog/seed";

async function main() {
  const result = await seedProgramCatalog();
  console.info("[program-catalog-seed] ready", result);
}

main()
  .catch((error: unknown) => {
    console.error("[program-catalog-seed] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
