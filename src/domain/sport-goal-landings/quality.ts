/**
 * Quality gates for sport/goal landings (Prompt 167).
 */

import {
  SPORT_GOAL_FILLER_PHRASES,
  SPORT_GOAL_LANDING_MIN_OVERVIEW,
  SPORT_GOAL_LANDING_MIN_PRODUCT_LINKS,
  SPORT_GOAL_LANDING_MIN_SECTION_BODY,
  SPORT_GOAL_LANDING_MIN_SECTIONS,
  type SportGoalLanding,
} from "@/domain/sport-goal-landings/constants";
import { isIndexableSupportingHref } from "@/domain/seo/catalog";

export type SportGoalQualityCheck = {
  id:
    | "unique_value"
    | "no_filler"
    | "content_depth"
    | "product_links"
    | "structured_data";
  label: string;
  ok: boolean;
  detail: string;
};

export type SportGoalQualityResult = {
  slug: string;
  passed: boolean;
  checks: SportGoalQualityCheck[];
  structuredDataReady: boolean;
};

function blobOf(page: SportGoalLanding): string {
  return [
    page.overview,
    ...page.sections.map((s) => `${s.heading} ${s.body}`),
  ]
    .join(" ")
    .toLowerCase();
}

function hasUniqueValue(page: SportGoalLanding): boolean {
  if (!page.uniqueValueKey || page.uniqueValueKey.length < 8) return false;
  return page.overview.trim().length >= SPORT_GOAL_LANDING_MIN_OVERVIEW;
}

function hasNoFiller(page: SportGoalLanding): boolean {
  const blob = blobOf(page);
  return !SPORT_GOAL_FILLER_PHRASES.some((phrase) => blob.includes(phrase));
}

function hasContentDepth(page: SportGoalLanding): boolean {
  if (page.sections.length < SPORT_GOAL_LANDING_MIN_SECTIONS) return false;
  return page.sections.every(
    (s) =>
      s.heading.trim().length > 0 &&
      s.body.trim().length >= SPORT_GOAL_LANDING_MIN_SECTION_BODY,
  );
}

function isAllowedProductHref(href: string): boolean {
  if (href.startsWith("/app/")) {
    return href.length > 5 && !href.includes("?");
  }
  return isIndexableSupportingHref(href);
}

function hasProductLinks(page: SportGoalLanding): boolean {
  if (page.productLinks.length < SPORT_GOAL_LANDING_MIN_PRODUCT_LINKS) {
    return false;
  }
  const allValid = page.productLinks.every(
    (l) =>
      isAllowedProductHref(l.href) &&
      l.label.trim().length > 0 &&
      l.reason.trim().length >= 20,
  );
  const hasPublic = page.productLinks.some((l) => l.surface === "public");
  const hasApp = page.productLinks.some((l) => l.surface === "app");
  return allValid && hasPublic && hasApp;
}

function hasStructuredData(page: SportGoalLanding): boolean {
  const articleOk =
    page.title.trim().length >= 8 && page.description.trim().length >= 40;
  const faqOk =
    page.faqs.length === 0 ||
    page.faqs.every(
      (f) => f.question.trim().length > 0 && f.answer.trim().length >= 20,
    );
  return articleOk && faqOk;
}

export function evaluateSportGoalLandingQuality(
  page: SportGoalLanding,
): SportGoalQualityResult {
  const checks: SportGoalQualityCheck[] = [
    {
      id: "unique_value",
      label: "Unique value",
      ok: hasUniqueValue(page),
      detail: `Overview ≥${SPORT_GOAL_LANDING_MIN_OVERVIEW} chars with uniqueValueKey.`,
    },
    {
      id: "no_filler",
      label: "No generic SEO filler",
      ok: hasNoFiller(page),
      detail: "Refuses known filler phrases in overview/sections.",
    },
    {
      id: "content_depth",
      label: "Content depth",
      ok: hasContentDepth(page),
      detail: `≥${SPORT_GOAL_LANDING_MIN_SECTIONS} sections, body ≥${SPORT_GOAL_LANDING_MIN_SECTION_BODY} chars.`,
    },
    {
      id: "product_links",
      label: "Product feature links",
      ok: hasProductLinks(page),
      detail: `≥${SPORT_GOAL_LANDING_MIN_PRODUCT_LINKS} real hrefs including public + app surfaces.`,
    },
    {
      id: "structured_data",
      label: "Structured data readiness",
      ok: hasStructuredData(page),
      detail: "Title/description for Article; FAQs honest if present.",
    },
  ];

  const passed = checks.every((c) => c.ok);
  return {
    slug: page.slug,
    passed,
    checks,
    structuredDataReady: passed && hasStructuredData(page),
  };
}
