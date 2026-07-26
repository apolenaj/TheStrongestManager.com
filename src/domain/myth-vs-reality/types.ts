import type { EvidenceQualityLabel } from "@/domain/evidence-quality";
import type { MythPageSection } from "@/domain/myth-vs-reality/constants";

export type MythVsRealityEntry = {
  slug: string;
  /** Short claim / search-friendly question (page H1 focus). */
  claim: string;
  /** SEO title fragment (page title uses this). */
  seoTitle: string;
  seoDescription: string;
  whatPeopleSay: string;
  whatEvidenceSuggests: string;
  practicalAnswer: string;
  nuance: string;
  /** Label for the “what evidence suggests” section — never invent strong certainty. */
  evidenceLabel: EvidenceQualityLabel;
  /** Optional topic tags for index filtering / related links. */
  topics: readonly string[];
};

export type MythPageSectionContent = Record<MythPageSection, string>;

export function mythEntryToSections(
  entry: MythVsRealityEntry,
): MythPageSectionContent {
  return {
    claim: entry.claim,
    whatPeopleSay: entry.whatPeopleSay,
    whatEvidenceSuggests: entry.whatEvidenceSuggests,
    practicalAnswer: entry.practicalAnswer,
    nuance: entry.nuance,
  };
}
