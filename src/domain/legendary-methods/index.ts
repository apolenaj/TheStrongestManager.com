export {
  LEGENDARY_METHODS_DISCLAIMER,
  DEFAULT_INTRODUCTORY_DISCLAIMER,
  LEGENDARY_METHODS_INDEX_INTRO,
  LEGENDARY_DISCLAIMER_SHORT,
  LEGENDARY_DISCLAIMER_COMPLETE,
  LEGENDARY_RELATED_PROGRAMME_INDEPENDENCE,
} from "@/domain/legendary-methods/disclaimer";
export {
  LEGENDARY_EDITORIAL_LABELS,
  LEGENDARY_EDITORIAL_LABEL_IDS,
  editorialLabelForContentLayer,
  type LegendaryEditorialLabelId,
  type LegendaryEditorialLabel,
} from "@/domain/legendary-methods/editorial-labels";
export {
  LEGENDARY_PROHIBITED_PHRASES,
  findProhibitedWordingHits,
  publicTextContainsProhibitedWording,
} from "@/domain/legendary-methods/prohibited-wording";
export {
  LEGENDARY_ASSET_LICENCE_REGISTRY,
  LEGENDARY_PROHIBITED_IMAGE_CATEGORIES,
  isLegendaryAssetRegistered,
  assertNonOriginalAssetIsLicensed,
} from "@/domain/legendary-methods/asset-licence-registry";
export {
  LEGENDARY_LICENSING_RECORDS,
  hasLegendaryLicensingException,
} from "@/domain/legendary-methods/licensing-records";
export {
  allowLegendaryDraftPreview,
  canServeLegendaryMethodProfile,
} from "@/domain/legendary-methods/draft-access";
export {
  findAthleteNamesInPaidProgrammeCatalog,
  paidProgrammeCatalogUsesAthleteNames,
} from "@/domain/legendary-methods/paid-product-separation";
export { defaultLegendaryProgrammeConversionPrompt } from "@/domain/legendary-methods/conversion";
export * from "@/domain/legendary-methods/types";
export * from "@/domain/legendary-methods/sections";
export * from "@/domain/legendary-methods/categories";
export * from "@/domain/legendary-methods/cards";
export * from "@/domain/legendary-methods/seo";
export {
  validateLegendaryMethodForPublish,
  canPublishLegendaryMethod,
  assertLegendaryMethodRegistryIntegrity,
  relatedProgrammeUsesAthleteName,
  isValidLegendarySourceUrl,
  type LegendaryMethodValidationIssue,
  type LegendaryMethodValidationResult,
} from "@/domain/legendary-methods/validation";
export {
  LEGENDARY_METHOD_PROFILES,
  getLegendaryMethodBySlug,
  getPublishedLegendaryMethods,
  getPublishedLegendaryMethodBySlug,
  allLegendaryMethodSlugs,
  allPublishedLegendaryMethodSlugs,
} from "@/domain/legendary-methods/catalog";
export {
  searchLegendaryMethods,
  getLegendaryMethodDetail,
  listLegendaryMethodSports,
  type LegendaryMethodSearchParams,
} from "@/domain/legendary-methods/search";
