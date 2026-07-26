import {
  PROGRAMMATIC_SEO_ENGINE_VERSION,
  PROGRAMMATIC_SEO_HONESTY,
  PROGRAMMATIC_SEO_REFUSED,
  PROGRAMMATIC_SEO_TEMPLATES,
} from "@/domain/programmatic-seo-safety/constants";
import {
  PROGRAMMATIC_SEO_PAGES,
  type ProgrammaticSeoPage,
} from "@/domain/programmatic-seo-safety/catalog";
import {
  evaluateProgrammaticSeoQuality,
  findDuplicateUniqueKeys,
  type ProgrammaticSeoQualityResult,
} from "@/domain/programmatic-seo-safety/quality";

export type ProgrammaticSeoSafetySnapshot = {
  engineVersion: typeof PROGRAMMATIC_SEO_ENGINE_VERSION;
  honesty: typeof PROGRAMMATIC_SEO_HONESTY;
  templates: typeof PROGRAMMATIC_SEO_TEMPLATES;
  refused: typeof PROGRAMMATIC_SEO_REFUSED;
  pages: Array<{
    page: ProgrammaticSeoPage;
    quality: ProgrammaticSeoQualityResult;
    href: string;
  }>;
  indexableCount: number;
  rejectedCount: number;
  duplicateKeys: string[];
  generatedAt: string;
};

export function buildProgrammaticSeoSafetySnapshot(
  generatedAt: string = new Date().toISOString(),
): ProgrammaticSeoSafetySnapshot {
  const duplicateKeys = findDuplicateUniqueKeys(PROGRAMMATIC_SEO_PAGES);
  const pages = PROGRAMMATIC_SEO_PAGES.map((page) => {
    let quality = evaluateProgrammaticSeoQuality(page);
    const isDupe = duplicateKeys.some((d) => d.startsWith(`${page.slug} `));
    if (isDupe) {
      quality = {
        ...quality,
        passed: false,
        checks: [
          ...quality.checks.filter((c) => c.id !== "unique_value" || c.ok),
          {
            id: "unique_value" as const,
            label: "Unique value",
            ok: false,
            detail: "uniqueValueKey collides with another allowlisted page.",
          },
        ],
      };
    }
    return {
      page,
      quality,
      href: `/guides/${page.slug}`,
    };
  });

  return {
    engineVersion: PROGRAMMATIC_SEO_ENGINE_VERSION,
    honesty: PROGRAMMATIC_SEO_HONESTY,
    templates: PROGRAMMATIC_SEO_TEMPLATES,
    refused: PROGRAMMATIC_SEO_REFUSED,
    pages,
    indexableCount: pages.filter((p) => p.quality.passed).length,
    rejectedCount: pages.filter((p) => !p.quality.passed).length,
    duplicateKeys,
    generatedAt,
  };
}

/** Paths safe for sitemap (quality gate passed). */
export function listIndexableProgrammaticSeoPaths(): string[] {
  return PROGRAMMATIC_SEO_PAGES.filter(
    (p) => evaluateProgrammaticSeoQuality(p).passed,
  ).map((p) => `/guides/${p.slug}`);
}
