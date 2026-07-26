export {
  MYTH_VS_REALITY_ENGINE_VERSION,
  MYTH_PAGE_SECTIONS,
  MYTH_PAGE_SECTION_LABELS,
  MYTH_VS_REALITY_HONESTY,
  MYTH_VS_REALITY_INDEX_DESCRIPTION,
  type MythPageSection,
} from "@/domain/myth-vs-reality/constants";

export { MYTH_VS_REALITY_ENTRIES } from "@/domain/myth-vs-reality/catalog";

export type {
  MythVsRealityEntry,
  MythPageSectionContent,
} from "@/domain/myth-vs-reality/types";

export { mythEntryToSections } from "@/domain/myth-vs-reality/types";

export {
  listMythVsRealityEntries,
  getMythVsRealityEntryBySlug,
  allMythVsRealitySlugs,
  mythVsRealityIndexPath,
  mythVsRealityEntryPath,
} from "@/domain/myth-vs-reality/access";

export {
  findClickbaitPhrases,
  entryHasRequiredSections,
  mythEntryUsesHonestEvidenceLabel,
} from "@/domain/myth-vs-reality/integrity";
