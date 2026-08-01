import type { CzechProfileOverlay } from "@/domain/legendary-methods/profiles/apply-czech";
import { CZECH_OVERLAYS_PART1 } from "@/domain/legendary-methods/profiles/czech-overlays-part1";
import { CZECH_OVERLAYS_PART2 } from "@/domain/legendary-methods/profiles/czech-overlays-part2";
import { CZECH_NESTED_OVERLAYS } from "@/domain/legendary-methods/profiles/czech-nested-overlays";

const CZECH_SECTION_OVERLAYS: Record<string, CzechProfileOverlay> = {
  ...CZECH_OVERLAYS_PART1,
  ...CZECH_OVERLAYS_PART2,
};

/**
 * Czech copy overlays for all Legendary Methods profiles (except Arnold, which is authored inline).
 * Merges the section-body overlays with the nested structured-field overlays
 * (scores, trainingStructure, whyItWorked, exampleWeek, modernAdaptation, relatedProgrammes)
 * so `applyCzechOverlay` receives one combined overlay per slug.
 */
const ALL_OVERLAY_SLUGS = new Set([
  ...Object.keys(CZECH_SECTION_OVERLAYS),
  ...Object.keys(CZECH_NESTED_OVERLAYS),
]);

export const CZECH_PROFILE_OVERLAYS: Record<string, CzechProfileOverlay> =
  Object.fromEntries(
    [...ALL_OVERLAY_SLUGS].map((slug) => [
      slug,
      {
        ...(CZECH_SECTION_OVERLAYS[slug] ?? {}),
        ...(CZECH_NESTED_OVERLAYS[slug] ?? {}),
      } as CzechProfileOverlay,
    ]),
  );
