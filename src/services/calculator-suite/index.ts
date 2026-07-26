/**
 * Calculator Suite service (Prompt 168).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  buildCalculatorSuiteSnapshot,
  evaluateCalculatorQuality,
  getCalculatorDefinition,
  listIndexableCalculatorPaths,
  type CalculatorDefinition,
  type CalculatorSuiteSnapshot,
} from "@/domain/calculator-suite";

export function getCalculatorSuiteSnapshot(): CalculatorSuiteSnapshot {
  return buildCalculatorSuiteSnapshot();
}

export function getIndexableCalculatorPaths(): string[] {
  if (!featureFlags.calculatorSuite) return [];
  return listIndexableCalculatorPaths();
}

export function resolveIndexableCalculator(
  slug: string,
): CalculatorDefinition | null {
  if (!featureFlags.calculatorSuite) return null;
  const calc = getCalculatorDefinition(slug);
  if (!calc) return null;
  return evaluateCalculatorQuality(calc).passed ? calc : null;
}
