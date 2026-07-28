import { createEmptyRequiredSections } from "@/domain/legendary-methods/sections";
import { historicalDocumentationForSlug } from "@/domain/legendary-methods/profiles/historical-documentation";
import type {
  LegendaryMethodSection,
  LegendaryMethodSectionId,
} from "@/domain/legendary-methods/types";

/** Merge narrative bodies into the required section shells. */
export function sectionsWithBodies(
  bodies: Partial<Record<LegendaryMethodSectionId, string>>,
  sourceRefs?: Partial<Record<LegendaryMethodSectionId, number[]>>,
): LegendaryMethodSection[] {
  return createEmptyRequiredSections().map((section) => ({
    ...section,
    body: bodies[section.id]?.trim() ?? "",
    sourceRefs: sourceRefs?.[section.id],
  }));
}

/**
 * Same as sectionsWithBodies, plus auto-injected historical diet/routine
 * documentation for the given profile slug when available.
 */
export function sectionsWithBodiesForSlug(
  slug: string,
  bodies: Partial<Record<LegendaryMethodSectionId, string>>,
  sourceRefs?: Partial<Record<LegendaryMethodSectionId, number[]>>,
): LegendaryMethodSection[] {
  const historical = historicalDocumentationForSlug(slug);
  return sectionsWithBodies(
    {
      ...bodies,
      ...(historical
        ? {
            "core-training-routine": historical.coreTrainingRoutine,
            "documented-nutritional-approach":
              historical.documentedNutritionalApproach,
          }
        : {}),
    },
    sourceRefs,
  );
}

export const CONTENT_ACCESS_DATE = "2026-07-28";
export const LEGENDARY_PUBLISH_DATE = "2026-07-28";
