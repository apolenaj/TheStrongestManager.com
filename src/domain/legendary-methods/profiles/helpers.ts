import { createEmptyRequiredSections } from "@/domain/legendary-methods/sections";
import { historicalDocumentationForSlug } from "@/domain/legendary-methods/profiles/historical-documentation";
import { ensureL, type LocalizedString } from "@/domain/legendary-methods/localized";
import type {
  LegendaryMethodSection,
  LegendaryMethodSectionId,
} from "@/domain/legendary-methods/types";

type BodyInput = string | LocalizedString;

/** Merge narrative bodies into the required section shells. */
export function sectionsWithBodies(
  bodies: Partial<Record<LegendaryMethodSectionId, BodyInput>>,
  sourceRefs?: Partial<Record<LegendaryMethodSectionId, number[]>>,
): LegendaryMethodSection[] {
  return createEmptyRequiredSections().map((section) => {
    const raw = bodies[section.id];
    return {
      ...section,
      body: raw !== undefined ? ensureL(raw) : LEmpty(),
      sourceRefs: sourceRefs?.[section.id],
    };
  });
}

function LEmpty(): LocalizedString {
  return { en: "", cs: "" };
}

/**
 * Same as sectionsWithBodies, plus auto-injected historical diet/routine
 * documentation for the given profile slug when available.
 */
export function sectionsWithBodiesForSlug(
  slug: string,
  bodies: Partial<Record<LegendaryMethodSectionId, BodyInput>>,
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
