import { createEmptyRequiredSections } from "@/domain/legendary-methods/sections";
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

export const CONTENT_ACCESS_DATE = "2026-07-28";
