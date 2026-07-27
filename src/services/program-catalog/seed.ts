import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PROGRAM_CATALOG_SEED } from "@/domain/program-catalog/catalog";
import { envStripePriceIdForProgramSlug } from "@/domain/program-commerce/constants";
import type {
  ProgramBlocksJson,
  ProgramSessionsJson,
  ProgramWeeksJson,
} from "@/types/programs";

function skeletonWeeks(durationWeeks: number): ProgramWeeksJson {
  return Array.from({ length: durationWeeks }, (_, i) => ({
    week: i + 1,
    label: `Week ${i + 1}`,
    days: [],
    notes:
      "Prescription sessions are filled in a later content phase — structure only.",
  }));
}

function skeletonBlocks(durationWeeks: number): ProgramBlocksJson {
  return [
    {
      id: "main",
      name: "Main cycle",
      startWeek: 1,
      endWeek: durationWeeks,
      intent: "Catalog skeleton — not individualized coaching.",
    },
  ];
}

const EMPTY_SESSIONS: ProgramSessionsJson = [];

/**
 * Upsert catalog products, published v1 versions, and skeleton templates.
 * Idempotent by product slug + version label.
 */
export async function seedProgramCatalog(): Promise<{
  products: number;
  versions: number;
  templates: number;
}> {
  let products = 0;
  let versions = 0;
  let templates = 0;
  const idBySlug = new Map<string, string>();

  for (const def of PROGRAM_CATALOG_SEED) {
    const stripePriceId = def.isFree
      ? null
      : envStripePriceIdForProgramSlug(def.slug);

    const product = await prisma.programProduct.upsert({
      where: { slug: def.slug },
      create: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        methodId: def.methodId,
        durationWeeks: def.durationWeeks,
        availableSchedules: [...def.availableSchedules],
        difficulty: def.difficulty,
        recoveryDemand: def.recoveryDemand,
        isFree: def.isFree,
        status: "published",
        defaultCurrency: "gbp",
        displayPrice: def.displayPricePence,
        stripePriceId,
        bundleIds: [],
      },
      update: {
        name: def.name,
        description: def.description,
        methodId: def.methodId,
        durationWeeks: def.durationWeeks,
        availableSchedules: [...def.availableSchedules],
        difficulty: def.difficulty,
        recoveryDemand: def.recoveryDemand,
        isFree: def.isFree,
        status: "published",
        defaultCurrency: "gbp",
        displayPrice: def.displayPricePence,
        // Only set Stripe id from env when present — never invent ids.
        ...(stripePriceId ? { stripePriceId } : {}),
      },
    });
    idBySlug.set(def.slug, product.id);
    products += 1;

    const version = await prisma.catalogProgramVersion.upsert({
      where: {
        productId_version: {
          productId: product.id,
          version: "1.0.0",
        },
      },
      create: {
        productId: product.id,
        version: "1.0.0",
        status: "published",
        releaseNotes: "Initial catalog release.",
      },
      update: {
        status: "published",
        releaseNotes: "Initial catalog release.",
      },
    });
    versions += 1;

    const weeks = skeletonWeeks(def.durationWeeks);
    const blocks = skeletonBlocks(def.durationWeeks);

    for (const scheduleVariant of def.availableSchedules) {
      await prisma.programTemplate.upsert({
        where: {
          programVersionId_scheduleVariant: {
            programVersionId: version.id,
            scheduleVariant,
          },
        },
        create: {
          programVersionId: version.id,
          scheduleVariant,
          blocks: blocks as unknown as Prisma.InputJsonValue,
          weeks: weeks as unknown as Prisma.InputJsonValue,
          sessions: EMPTY_SESSIONS as unknown as Prisma.InputJsonValue,
        },
        update: {
          blocks: blocks as unknown as Prisma.InputJsonValue,
          weeks: weeks as unknown as Prisma.InputJsonValue,
          sessions: EMPTY_SESSIONS as unknown as Prisma.InputJsonValue,
        },
      });
      templates += 1;
    }
  }

  // Resolve bundleIds to product ids after all upserts.
  for (const def of PROGRAM_CATALOG_SEED) {
    if (def.variant !== "bundle" || !def.includesPaidSlugs?.length) continue;
    const productId = idBySlug.get(def.slug);
    if (!productId) continue;
    const bundleIds = def.includesPaidSlugs
      .map((slug) => idBySlug.get(slug))
      .filter((id): id is string => Boolean(id));
    await prisma.programProduct.update({
      where: { id: productId },
      data: { bundleIds },
    });
  }

  return { products, versions, templates };
}
