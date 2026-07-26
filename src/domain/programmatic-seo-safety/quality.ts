/**
 * Quality gates for programmatic SEO pages (Prompt 165).
 */

import {
  PROGRAMMATIC_SEO_MIN_INTERNAL_LINKS,
  PROGRAMMATIC_SEO_MIN_OVERVIEW,
  PROGRAMMATIC_SEO_MIN_SECTION_BODY,
  PROGRAMMATIC_SEO_MIN_SECTIONS,
} from "@/domain/programmatic-seo-safety/constants";
import type { ProgrammaticSeoPage } from "@/domain/programmatic-seo-safety/catalog";
import { isIndexableSupportingHref } from "@/domain/seo/catalog";

export type ProgrammaticSeoQualityCheck = {
  id:
    | "unique_value"
    | "structured_data"
    | "internal_links"
    | "content_depth";
  label: string;
  ok: boolean;
  detail: string;
};

export type ProgrammaticSeoQualityResult = {
  slug: string;
  passed: boolean;
  checks: ProgrammaticSeoQualityCheck[];
  /** Eligible for Article + FAQ JSON-LD when passed. */
  structuredDataReady: boolean;
};

function hasUniqueValue(page: ProgrammaticSeoPage): boolean {
  if (!page.uniqueValueKey || page.uniqueValueKey.length < 8) return false;
  // Boilerplate trap: overview must not be mostly the title repeated.
  const normalized = page.overview.toLowerCase().replace(/\s+/g, " ");
  const titleBits = page.title.toLowerCase().split(/\s+/).filter(Boolean);
  const titleOnly =
    titleBits.length > 0 &&
    titleBits.every((w) => normalized.includes(w)) &&
    page.overview.length < PROGRAMMATIC_SEO_MIN_OVERVIEW;
  return !titleOnly && page.overview.length >= PROGRAMMATIC_SEO_MIN_OVERVIEW;
}

function hasContentDepth(page: ProgrammaticSeoPage): boolean {
  if (page.sections.length < PROGRAMMATIC_SEO_MIN_SECTIONS) return false;
  return page.sections.every(
    (s) =>
      s.heading.trim().length > 0 &&
      s.body.trim().length >= PROGRAMMATIC_SEO_MIN_SECTION_BODY,
  );
}

function hasInternalLinks(page: ProgrammaticSeoPage): boolean {
  if (page.internalLinks.length < PROGRAMMATIC_SEO_MIN_INTERNAL_LINKS) {
    return false;
  }
  return page.internalLinks.every((l) => {
    // Allow one interactive compare query link; other links must be indexable paths.
    if (l.href.startsWith("/compare?")) return true;
    return isIndexableSupportingHref(l.href);
  });
}

function hasStructuredDataEligibility(page: ProgrammaticSeoPage): boolean {
  // Article needs headline + description; FAQ only when answers exist.
  const articleOk =
    page.title.trim().length >= 8 && page.description.trim().length >= 40;
  const faqOk =
    page.faqs.length === 0 ||
    page.faqs.every(
      (f) => f.question.trim().length > 0 && f.answer.trim().length >= 20,
    );
  return articleOk && faqOk;
}

export function evaluateProgrammaticSeoQuality(
  page: ProgrammaticSeoPage,
): ProgrammaticSeoQualityResult {
  const checks: ProgrammaticSeoQualityCheck[] = [
    {
      id: "unique_value",
      label: "Unique value",
      ok: hasUniqueValue(page),
      detail: `Overview ≥${PROGRAMMATIC_SEO_MIN_OVERVIEW} chars with uniqueValueKey.`,
    },
    {
      id: "content_depth",
      label: "Content depth",
      ok: hasContentDepth(page),
      detail: `≥${PROGRAMMATIC_SEO_MIN_SECTIONS} sections, each body ≥${PROGRAMMATIC_SEO_MIN_SECTION_BODY} chars.`,
    },
    {
      id: "internal_links",
      label: "Internal links",
      ok: hasInternalLinks(page),
      detail: `≥${PROGRAMMATIC_SEO_MIN_INTERNAL_LINKS} links to real deep pages.`,
    },
    {
      id: "structured_data",
      label: "Structured data readiness",
      ok: hasStructuredDataEligibility(page),
      detail: "Title/description suitable for Article; FAQs honest if present.",
    },
  ];

  const passed = checks.every((c) => c.ok);
  return {
    slug: page.slug,
    passed,
    checks,
    structuredDataReady: passed && hasStructuredDataEligibility(page),
  };
}

/**
 * Near-duplicate guard across the allowlist (same uniqueValueKey → fail).
 */
export function findDuplicateUniqueKeys(
  pages: readonly ProgrammaticSeoPage[],
): string[] {
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const page of pages) {
    const prev = seen.get(page.uniqueValueKey);
    if (prev) dupes.push(`${page.slug} duplicates ${prev}`);
    else seen.set(page.uniqueValueKey, page.slug);
  }
  return dupes;
}
