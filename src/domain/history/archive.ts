/**
 * Historical Training Archive accessors (Prompt 111).
 */

import {
  ARCHIVE_PROFILE_KINDS,
  type ArchiveProfileKind,
} from "@/domain/history/archive-constants";
import { HISTORICAL_ARCHIVE_PROFILES } from "@/domain/history/archive-profiles";
import type { HistoricalArchiveProfile } from "@/domain/history/archive-types";
import { getHistoryEraBySlug } from "@/domain/history/timeline";
import { getMethodBySlug } from "@/domain/methods/catalog";

export function listArchiveProfiles(
  kind?: ArchiveProfileKind,
): HistoricalArchiveProfile[] {
  const all = [...HISTORICAL_ARCHIVE_PROFILES];
  if (!kind) return all;
  return all.filter((p) => p.kind === kind);
}

export function getArchiveProfileBySlug(
  slug: string,
): HistoricalArchiveProfile | undefined {
  return HISTORICAL_ARCHIVE_PROFILES.find((p) => p.slug === slug);
}

export function allArchiveProfileSlugs(): string[] {
  return HISTORICAL_ARCHIVE_PROFILES.map((p) => p.slug);
}

export function archiveProfilePath(slug: string): string {
  return `/history/archive/${slug}`;
}

export function archiveIndexPath(): string {
  return "/history/archive";
}

export function listArchiveProfilesByKind(): Record<
  ArchiveProfileKind,
  HistoricalArchiveProfile[]
> {
  return Object.fromEntries(
    ARCHIVE_PROFILE_KINDS.map((kind) => [kind, listArchiveProfiles(kind)]),
  ) as Record<ArchiveProfileKind, HistoricalArchiveProfile[]>;
}

/** Validate related method slugs resolve to published catalog entries. */
export function archiveRelatedMethodsValid(
  profile: HistoricalArchiveProfile,
): boolean {
  return profile.relatedMethodSlugs.every((slug) => {
    const method = getMethodBySlug(slug);
    return Boolean(method?.isPublished);
  });
}

/** Validate related era slugs exist on the timeline. */
export function archiveRelatedErasValid(
  profile: HistoricalArchiveProfile,
): boolean {
  return profile.relatedEraSlugs.every((slug) =>
    Boolean(getHistoryEraBySlug(slug)),
  );
}
