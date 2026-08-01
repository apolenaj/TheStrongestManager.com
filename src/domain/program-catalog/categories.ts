/**
 * High-level program catalog categories for marketing filters.
 */

export const PROGRAM_CATALOG_CATEGORIES = [
  "powerlifting",
  "bodybuilding",
  "strongman",
  "lift_specific",
  "transformation",
  "athletic",
  "weightlifting",
] as const;

export type ProgramCatalogCategory =
  (typeof PROGRAM_CATALOG_CATEGORIES)[number];

export function isProgramCatalogCategory(
  value: string,
): value is ProgramCatalogCategory {
  return (PROGRAM_CATALOG_CATEGORIES as readonly string[]).includes(value);
}

/** Default category for legacy families when seed.category is omitted. */
export const PROGRAM_FAMILY_DEFAULT_CATEGORY: Record<
  string,
  ProgramCatalogCategory
> = {
  "linear-strength-builder": "powerlifting",
  "dup-powerlifting-system": "powerlifting",
  "block-periodisation": "powerlifting",
  "conjugate-strength-system": "powerlifting",
  "high-frequency-sbd": "powerlifting",
  "powerbuilding-hybrid": "bodybuilding",
  "complete-method-collection": "powerlifting",
  "golden-era-hypertrophy": "bodybuilding",
  "deadlift-310-peak": "lift_specific",
  "squat-overload-base": "lift_specific",
  "bench-press-blueprint": "lift_specific",
  "loglift-mastery": "lift_specific",
  "strongman-base-builder": "strongman",
  "iron-cut-aggressive": "transformation",
  "iron-recomp-medium": "transformation",
  "sustainable-lean-quality": "transformation",
  "explosive-power-speed": "athletic",
  "olympic-weightlifting-base": "weightlifting",
};

export function categoryForFamily(
  familyId: string,
  explicit?: ProgramCatalogCategory | null,
): ProgramCatalogCategory {
  if (explicit) return explicit;
  return PROGRAM_FAMILY_DEFAULT_CATEGORY[familyId] ?? "powerlifting";
}
