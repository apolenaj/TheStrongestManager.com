/**
 * Quality gates for calculator suite pages (Prompt 168).
 */

import {
  CALCULATOR_SUITE_MIN_OVERVIEW,
  CALCULATOR_SUITE_MIN_PRODUCT_LINKS,
  type CalculatorDefinition,
} from "@/domain/calculator-suite/constants";
import { isIndexableSupportingHref } from "@/domain/seo/catalog";

export type CalculatorQualityCheck = {
  id:
    | "unique_value"
    | "precision_honesty"
    | "formula_citation"
    | "product_links"
    | "structured_data";
  label: string;
  ok: boolean;
  detail: string;
};

export type CalculatorQualityResult = {
  slug: string;
  passed: boolean;
  checks: CalculatorQualityCheck[];
  structuredDataReady: boolean;
};

function isAllowedProductHref(href: string): boolean {
  if (href.startsWith("/app/")) {
    return href.length > 5 && !href.includes("?");
  }
  if (href.startsWith("/tools/")) {
    return href.length > 7;
  }
  return isIndexableSupportingHref(href);
}

function hasProductLinks(calc: CalculatorDefinition): boolean {
  if (calc.productLinks.length < CALCULATOR_SUITE_MIN_PRODUCT_LINKS) {
    return false;
  }
  const allValid = calc.productLinks.every(
    (l) =>
      isAllowedProductHref(l.href) &&
      l.label.trim().length > 0 &&
      l.reason.trim().length >= 20,
  );
  const hasPublic = calc.productLinks.some((l) => l.surface === "public");
  const hasApp = calc.productLinks.some((l) => l.surface === "app");
  return allValid && hasPublic && hasApp;
}

function hasPrecisionHonesty(calc: CalculatorDefinition): boolean {
  const note = calc.precisionNote.toLowerCase();
  const overview = calc.overview.toLowerCase();
  const markers = [
    "estimate",
    "not",
    "never",
    "only",
    "construct",
    "sketch",
    "assum",
    "not a",
    "does not",
  ];
  return (
    calc.precisionNote.trim().length >= 40 &&
    markers.some((m) => note.includes(m) || overview.includes(m))
  );
}

export function evaluateCalculatorQuality(
  calc: CalculatorDefinition,
): CalculatorQualityResult {
  const checks: CalculatorQualityCheck[] = [
    {
      id: "unique_value",
      label: "Unique value + overview depth",
      ok:
        Boolean(calc.uniqueValueKey && calc.uniqueValueKey.length >= 8) &&
        calc.overview.trim().length >= CALCULATOR_SUITE_MIN_OVERVIEW,
      detail: `overview ${calc.overview.trim().length} chars`,
    },
    {
      id: "precision_honesty",
      label: "Precision honesty note",
      ok: hasPrecisionHonesty(calc),
      detail: "Must refuse overclaiming precision",
    },
    {
      id: "formula_citation",
      label: "Formula citation",
      ok: calc.formulaCitation.trim().length >= 24,
      detail: calc.formulaCitation.slice(0, 80),
    },
    {
      id: "product_links",
      label: "Product CTAs (public + app)",
      ok: hasProductLinks(calc),
      detail: `${calc.productLinks.length} links`,
    },
    {
      id: "structured_data",
      label: "FAQ + description ready for JSON-LD",
      ok:
        calc.description.trim().length >= 40 &&
        calc.faqs.length >= 1 &&
        calc.faqs.every(
          (f) => f.question.trim().length > 0 && f.answer.trim().length >= 20,
        ),
      detail: `${calc.faqs.length} FAQs`,
    },
  ];

  const passed = checks.every((c) => c.ok);
  return {
    slug: calc.slug,
    passed,
    checks,
    structuredDataReady: checks.find((c) => c.id === "structured_data")?.ok ?? false,
  };
}
