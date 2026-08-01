/**
 * Public DTO mappers for the commercial program catalog.
 * Never expose stripePriceId or unpublished drafts on public surfaces.
 */

import {
  PROGRAM_CATALOG_SEED,
  seedDefinitionBySlug,
  type ProgramCatalogSeedDefinition,
} from "@/domain/program-catalog/catalog";
import {
  categoryForFamily,
  type ProgramCatalogCategory,
} from "@/domain/program-catalog/categories";

export type PublicProgramProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  methodId: string | null;
  durationWeeks: number;
  availableSchedules: string[];
  difficulty: string;
  recoveryDemand: string;
  isFree: boolean;
  defaultCurrency: string;
  /** Minor units (pence when currency is gbp). */
  displayPrice: number;
  familyId: string | null;
  variant: "free" | "paid" | "bundle" | null;
  goals: string[];
  /** High-level marketing category for catalog filters. */
  category: ProgramCatalogCategory;
  /** Related product ids when this is a bundle (never Stripe ids). */
  bundleProductIds: string[];
};

export type PublicProgramVersionSummary = {
  id: string;
  version: string;
  releaseNotes: string | null;
  scheduleVariants: string[];
};

export type PublicProgramDetail = PublicProgramProduct & {
  versions: PublicProgramVersionSummary[];
};

export type PublicEntitlement = {
  id: string;
  source: string;
  grantedAt: string;
  expiresAt: string | null;
  product: PublicProgramProduct;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  methodId: string | null;
  durationWeeks: number;
  availableSchedules: string[];
  difficulty: string;
  recoveryDemand: string;
  isFree: boolean;
  status: string;
  defaultCurrency: string;
  displayPrice: number;
  bundleIds: string[];
};

function categoryFromSeed(
  seed: ProgramCatalogSeedDefinition | undefined,
  familyId: string | null,
): ProgramCatalogCategory {
  return categoryForFamily(familyId ?? seed?.familyId ?? "", null);
}

export function seedToPublicProgramProduct(
  seed: ProgramCatalogSeedDefinition,
): PublicProgramProduct {
  return {
    id: `seed:${seed.slug}`,
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    methodId: seed.methodId,
    durationWeeks: seed.durationWeeks,
    availableSchedules: [...seed.availableSchedules],
    difficulty: seed.difficulty,
    recoveryDemand: seed.recoveryDemand,
    isFree: seed.isFree,
    defaultCurrency: "gbp",
    displayPrice: seed.displayPricePence,
    familyId: seed.familyId,
    variant: seed.variant,
    goals: [...seed.goals],
    category: categoryForFamily(seed.familyId, null),
    bundleProductIds: [],
  };
}

/**
 * Overlay seed taxonomy onto DB rows and append seed-only products so the
 * expanded catalog appears before / without a full DB re-seed.
 */
export function mergeCatalogWithSeed(
  programs: PublicProgramProduct[],
): PublicProgramProduct[] {
  const bySlug = new Map(programs.map((p) => [p.slug, p]));
  const merged = programs.map((p) => {
    const seed = seedDefinitionBySlug(p.slug);
    if (!seed) return p;
    return {
      ...p,
      familyId: seed.familyId,
      variant: seed.variant,
      goals: [...seed.goals],
      category: categoryForFamily(seed.familyId, null),
    };
  });
  for (const seed of PROGRAM_CATALOG_SEED) {
    if (!bySlug.has(seed.slug)) {
      merged.push(seedToPublicProgramProduct(seed));
    }
  }
  return merged;
}

function mapProductRow(row: ProductRow): PublicProgramProduct {
  const seed = seedDefinitionBySlug(row.slug);
  const familyId = seed?.familyId ?? null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    methodId: row.methodId,
    durationWeeks: row.durationWeeks,
    availableSchedules: row.availableSchedules,
    difficulty: row.difficulty,
    recoveryDemand: row.recoveryDemand,
    isFree: row.isFree,
    defaultCurrency: row.defaultCurrency,
    displayPrice: row.displayPrice,
    familyId,
    variant: seed?.variant ?? null,
    goals: seed ? [...seed.goals] : [],
    category: categoryFromSeed(seed, familyId),
    bundleProductIds: row.bundleIds,
  };
}

/** Public catalog/detail — published only. */
export function toPublicProgramProduct(
  row: ProductRow,
): PublicProgramProduct | null {
  if (row.status !== "published") return null;
  return mapProductRow(row);
}

/**
 * Entitlement card for a product the user already owns.
 * Allows archived products so access history is not silently dropped;
 * still never exposes stripePriceId.
 */
export function toEntitledProgramProduct(
  row: ProductRow,
): PublicProgramProduct | null {
  if (row.status === "draft") return null;
  return mapProductRow(row);
}
