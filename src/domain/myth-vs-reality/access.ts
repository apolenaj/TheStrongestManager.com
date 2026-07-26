/**
 * Myth vs Reality accessors.
 */

import { MYTH_VS_REALITY_ENTRIES } from "@/domain/myth-vs-reality/catalog";
import type { MythVsRealityEntry } from "@/domain/myth-vs-reality/types";

export function listMythVsRealityEntries(): MythVsRealityEntry[] {
  return [...MYTH_VS_REALITY_ENTRIES];
}

export function getMythVsRealityEntryBySlug(
  slug: string,
): MythVsRealityEntry | undefined {
  return MYTH_VS_REALITY_ENTRIES.find((e) => e.slug === slug);
}

export function allMythVsRealitySlugs(): string[] {
  return MYTH_VS_REALITY_ENTRIES.map((e) => e.slug);
}

export function mythVsRealityIndexPath(): string {
  return "/myths";
}

export function mythVsRealityEntryPath(slug: string): string {
  return `/myths/${slug}`;
}
