/**
 * Admin / sitemap snapshot for Calculator Suite.
 */

import { CALCULATOR_SUITE_ENGINE_VERSION, CALCULATOR_SUITE_HONESTY } from "@/domain/calculator-suite/constants";
import type { CalculatorDefinition } from "@/domain/calculator-suite/constants";
import { CALCULATOR_DEFINITIONS } from "@/domain/calculator-suite/catalog";
import {
  evaluateCalculatorQuality,
  type CalculatorQualityResult,
} from "@/domain/calculator-suite/quality";

export type CalculatorSuiteSnapshotPage = {
  definition: CalculatorDefinition;
  quality: CalculatorQualityResult;
  href: string;
};

export type CalculatorSuiteSnapshot = {
  engineVersion: typeof CALCULATOR_SUITE_ENGINE_VERSION;
  generatedAt: string;
  honesty: readonly string[];
  pages: CalculatorSuiteSnapshotPage[];
  indexableCount: number;
  rejectedCount: number;
};

export function buildCalculatorSuiteSnapshot(): CalculatorSuiteSnapshot {
  const pages = CALCULATOR_DEFINITIONS.map((definition) => ({
    definition,
    quality: evaluateCalculatorQuality(definition),
    href: `/tools/${definition.slug}`,
  }));
  const indexableCount = pages.filter((p) => p.quality.passed).length;
  return {
    engineVersion: CALCULATOR_SUITE_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    honesty: CALCULATOR_SUITE_HONESTY,
    pages,
    indexableCount,
    rejectedCount: pages.length - indexableCount,
  };
}

export function listIndexableCalculatorPaths(): string[] {
  return CALCULATOR_DEFINITIONS.filter(
    (d) => evaluateCalculatorQuality(d).passed,
  ).map((d) => `/tools/${d.slug}`);
}
