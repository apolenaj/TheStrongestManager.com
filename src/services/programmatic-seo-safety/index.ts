/**
 * Programmatic SEO Safety service (Prompt 165).
 */

import {
  buildProgrammaticSeoSafetySnapshot,
  evaluateProgrammaticSeoQuality,
  getProgrammaticSeoPage,
  listIndexableProgrammaticSeoPaths,
  type ProgrammaticSeoPage,
  type ProgrammaticSeoSafetySnapshot,
} from "@/domain/programmatic-seo-safety";
import { featureFlags } from "@/config/feature-flags";

export function getProgrammaticSeoSafetySnapshot(): ProgrammaticSeoSafetySnapshot {
  return buildProgrammaticSeoSafetySnapshot();
}

export function getIndexableProgrammaticSeoPaths(): string[] {
  if (!featureFlags.programmaticSeoSafety) return [];
  return listIndexableProgrammaticSeoPaths();
}

/**
 * Resolve a guide page only when it exists and passes quality gates.
 */
export function resolveIndexableProgrammaticSeoPage(
  slug: string,
): ProgrammaticSeoPage | null {
  if (!featureFlags.programmaticSeoSafety) return null;
  const page = getProgrammaticSeoPage(slug);
  if (!page) return null;
  const quality = evaluateProgrammaticSeoQuality(page);
  return quality.passed ? page : null;
}
