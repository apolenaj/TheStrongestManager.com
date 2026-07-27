/**
 * Public DTO mappers for the commercial program catalog.
 * Never expose stripePriceId or unpublished drafts on public surfaces.
 */

import { seedDefinitionBySlug } from "@/domain/program-catalog/catalog";

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

function mapProductRow(row: ProductRow): PublicProgramProduct {
  const seed = seedDefinitionBySlug(row.slug);
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
    familyId: seed?.familyId ?? null,
    variant: seed?.variant ?? null,
    goals: seed ? [...seed.goals] : [],
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
