/**
 * Paid-product separation: commercial programme titles/slugs
 * must not include Legendary Methods athlete name tokens.
 */

import { LEGENDARY_METHOD_PROFILES } from "@/domain/legendary-methods/catalog";
import { PROGRAM_CATALOG_SEED } from "@/domain/program-catalog";

function athleteNameTokens(athleteName: string): string[] {
  return athleteName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9þð]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

export type PaidProductAthleteNameHit = {
  athleteName: string;
  productSlug: string;
  productField: string;
  token: string;
};

/**
 * Scan commercial catalog seed names against Legendary Methods athlete tokens.
 */
export function findAthleteNamesInPaidProgrammeCatalog(
  products: ReadonlyArray<{ slug: string; name: string }> = PROGRAM_CATALOG_SEED,
  profiles = LEGENDARY_METHOD_PROFILES,
): PaidProductAthleteNameHit[] {
  const hits: PaidProductAthleteNameHit[] = [];

  for (const profile of profiles) {
    const tokens = athleteNameTokens(profile.athleteName);
    for (const product of products) {
      const fields: Array<[string, string]> = [
        ["slug", product.slug],
        ["name", product.name],
      ];
      for (const [field, value] of fields) {
        const haystack = value.toLowerCase();
        for (const token of tokens) {
          if (haystack.includes(token)) {
            hits.push({
              athleteName: profile.athleteName,
              productSlug: product.slug,
              productField: field,
              token,
            });
          }
        }
      }
    }
  }

  return hits;
}

export function paidProgrammeCatalogUsesAthleteNames(): boolean {
  return findAthleteNamesInPaidProgrammeCatalog().length > 0;
}
