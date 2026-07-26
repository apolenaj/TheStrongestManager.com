export {
  PROGRAMMATIC_SEO_ENGINE_VERSION,
  PROGRAMMATIC_SEO_HONESTY,
  PROGRAMMATIC_SEO_MIN_OVERVIEW,
  PROGRAMMATIC_SEO_MIN_SECTION_BODY,
  PROGRAMMATIC_SEO_MIN_SECTIONS,
  PROGRAMMATIC_SEO_MIN_INTERNAL_LINKS,
  PROGRAMMATIC_SEO_TEMPLATES,
  PROGRAMMATIC_SEO_REFUSED,
} from "@/domain/programmatic-seo-safety/constants";
export type { ProgrammaticSeoTemplateId } from "@/domain/programmatic-seo-safety/constants";

export {
  PROGRAMMATIC_SEO_PAGES,
  getProgrammaticSeoPage,
  allProgrammaticSeoSlugs,
} from "@/domain/programmatic-seo-safety/catalog";
export type {
  ProgrammaticSeoPage,
  ProgrammaticSeoSection,
  ProgrammaticSeoInternalLink,
  ProgrammaticSeoFaq,
} from "@/domain/programmatic-seo-safety/catalog";

export {
  evaluateProgrammaticSeoQuality,
  findDuplicateUniqueKeys,
} from "@/domain/programmatic-seo-safety/quality";
export type {
  ProgrammaticSeoQualityCheck,
  ProgrammaticSeoQualityResult,
} from "@/domain/programmatic-seo-safety/quality";

export {
  buildProgrammaticSeoSafetySnapshot,
  listIndexableProgrammaticSeoPaths,
  type ProgrammaticSeoSafetySnapshot,
} from "@/domain/programmatic-seo-safety/snapshot";
