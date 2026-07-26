import { getMethodBySlug, getPublishedMethods } from "@/domain/methods/catalog";
import {
  COMPARISON_DIMENSIONS,
  COMPARE_MAX_METHODS,
  COMPARE_MIN_METHODS,
  METHOD_COMPARISON_PROFILES,
  QUALITATIVE_BAND_LABELS,
  type ComparisonDimensionId,
  type MethodComparisonProfile,
  type QualitativeBand,
} from "@/domain/methods/comparison-profiles";
import type { TrainingMethod } from "@/domain/methods/types";

export type ComparedMethod = {
  method: TrainingMethod;
  profile: MethodComparisonProfile;
};

export type ComparisonCell = {
  slug: string;
  name: string;
  primary: string;
  note?: string;
  band?: QualitativeBand;
  bandLabel?: string;
};

export type ComparisonRow = {
  dimensionId: ComparisonDimensionId;
  label: string;
  description: string;
  cells: ComparisonCell[];
};

export type MethodComparisonView = {
  methods: ComparedMethod[];
  rows: ComparisonRow[];
  sharePath: string;
  title: string;
  warnings: string[];
};

function profileForSlug(slug: string): MethodComparisonProfile | undefined {
  return METHOD_COMPARISON_PROFILES.find((p) => p.slug === slug);
}

/**
 * Parse shareable compare query.
 * Accepts `methods=slug-a,slug-b,slug-c` (preferred) or repeated `m=`.
 */
export function parseMethodCompareParam(
  raw: string | string[] | undefined,
): string[] {
  const values: string[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      values.push(...item.split(","));
    }
  } else if (typeof raw === "string" && raw.trim()) {
    values.push(...raw.split(","));
  }

  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const value of values) {
    const slug = value.trim().toLowerCase();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
    if (slugs.length >= COMPARE_MAX_METHODS) break;
  }
  return slugs;
}

export function buildSharePath(slugs: string[]): string {
  if (slugs.length === 0) return "/compare";
  return `/compare?methods=${slugs.map(encodeURIComponent).join(",")}`;
}

export function listComparableMethods(): Array<{
  slug: string;
  name: string;
}> {
  return getPublishedMethods()
    .filter((m) => profileForSlug(m.slug))
    .map((m) => ({ slug: m.slug, name: m.name }));
}

function cellForDimension(
  dimensionId: ComparisonDimensionId,
  compared: ComparedMethod,
): ComparisonCell {
  const { method, profile } = compared;
  const bandValue = (band: QualitativeBand, note: string): ComparisonCell => ({
    slug: method.slug,
    name: method.name,
    primary: QUALITATIVE_BAND_LABELS[band],
    note,
    band,
    bandLabel: QUALITATIVE_BAND_LABELS[band],
  });

  switch (dimensionId) {
    case "primaryPurpose":
      return {
        slug: method.slug,
        name: method.name,
        primary: profile.primaryPurpose,
      };
    case "complexity":
      return bandValue(profile.complexity, profile.complexityNote);
    case "frequency":
      return bandValue(profile.frequency, profile.frequencyNote);
    case "volume":
      return bandValue(profile.volume, profile.volumeNote);
    case "intensity":
      return bandValue(profile.intensity, profile.intensityNote);
    case "fatigue":
      return bandValue(profile.fatigue, profile.fatigueNote);
    case "skillRequirement":
      return bandValue(profile.skillRequirement, profile.skillNote);
    case "bestSuitedFor":
      return {
        slug: method.slug,
        name: method.name,
        primary: profile.bestSuitedFor,
      };
    case "limitations":
      return {
        slug: method.slug,
        name: method.name,
        primary: profile.limitations,
      };
    default: {
      const _exhaustive: never = dimensionId;
      return _exhaustive;
    }
  }
}

/**
 * Build a 2–3 method qualitative comparison.
 * Returns warnings instead of inventing filler methods.
 */
export function buildMethodComparison(
  slugsInput: string[],
): MethodComparisonView {
  const warnings: string[] = [];
  const unique = [...new Set(slugsInput.map((s) => s.trim()).filter(Boolean))];

  if (unique.length > COMPARE_MAX_METHODS) {
    warnings.push(
      `Only the first ${COMPARE_MAX_METHODS} methods are compared.`,
    );
  }

  const limited = unique.slice(0, COMPARE_MAX_METHODS);
  const methods: ComparedMethod[] = [];

  for (const slug of limited) {
    const method = getMethodBySlug(slug);
    const profile = profileForSlug(slug);
    if (!method || !profile) {
      warnings.push(`Unknown or unpublished method “${slug}” was skipped.`);
      continue;
    }
    methods.push({ method, profile });
  }

  if (methods.length < COMPARE_MIN_METHODS && methods.length > 0) {
    warnings.push(
      `Select at least ${COMPARE_MIN_METHODS} methods for a side-by-side comparison.`,
    );
  }

  if (methods.length === 0 && limited.length === 0) {
    warnings.push(
      `Choose ${COMPARE_MIN_METHODS}–${COMPARE_MAX_METHODS} methods to compare. Example: DUP vs Block Periodization.`,
    );
  }

  const rows: ComparisonRow[] = COMPARISON_DIMENSIONS.map((dim) => ({
    dimensionId: dim.id,
    label: dim.label,
    description: dim.description,
    cells: methods.map((m) => cellForDimension(dim.id, m)),
  }));

  const title =
    methods.length >= 2
      ? methods.map((m) => m.method.name).join(" vs ")
      : "Compare training methods";

  return {
    methods,
    rows,
    sharePath: buildSharePath(methods.map((m) => m.method.slug)),
    title,
    warnings,
  };
}
