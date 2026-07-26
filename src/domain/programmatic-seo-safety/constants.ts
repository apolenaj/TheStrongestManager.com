/**
 * Programmatic SEO Safety (Prompt 165).
 * Scalable templates only for useful content — refuse thin page factories.
 */

export const PROGRAMMATIC_SEO_ENGINE_VERSION =
  "programmatic_seo_safety.v1" as const;

export const PROGRAMMATIC_SEO_HONESTY = [
  "Only allowlisted template instances may ship — never cartesian generators (exercise × sport × equipment × level).",
  "Every page must pass unique value, structured data eligibility, internal links, and quality checks before indexing.",
  "Do not generate thousands of thin pages. Fail closed: fail quality → noindex, omit from sitemap, prefer notFound.",
  "Deadlift variations, exercise comparisons, and method comparisons are curated examples — not open-ended factories.",
] as const;

/** Minimum unique overview length (characters). */
export const PROGRAMMATIC_SEO_MIN_OVERVIEW = 160;
/** Minimum section body length. */
export const PROGRAMMATIC_SEO_MIN_SECTION_BODY = 80;
/** Minimum number of substantive sections. */
export const PROGRAMMATIC_SEO_MIN_SECTIONS = 2;
/** Minimum internal links to existing deep pages. */
export const PROGRAMMATIC_SEO_MIN_INTERNAL_LINKS = 2;

export const PROGRAMMATIC_SEO_TEMPLATES = [
  {
    id: "deadlift_variations",
    label: "Deadlift variations",
    description:
      "Useful variation guidance anchored to real exercise pages — not one thin URL per label.",
  },
  {
    id: "exercise_comparison",
    label: "Exercise comparisons",
    description:
      "Allowlisted pairwise comparisons with unique coaching value.",
  },
  {
    id: "method_comparison",
    label: "Training method comparisons",
    description:
      "Allowlisted method comparisons — hub `/compare` stays the share surface; guides earn their own URL only when curated.",
  },
] as const;

export type ProgrammaticSeoTemplateId =
  (typeof PROGRAMMATIC_SEO_TEMPLATES)[number]["id"];

/** Explicitly refused generation patterns. */
export const PROGRAMMATIC_SEO_REFUSED = [
  {
    id: "cartesian_facets",
    label: "Cartesian facet pages",
    reason:
      "exercise × sport × equipment × level would mint thousands of near-duplicate URLs.",
  },
  {
    id: "variation_slug_factory",
    label: "Auto variation slugs",
    reason:
      "Minting /exercises/sumo-deadlift from a label string without a reviewed catalog row.",
  },
  {
    id: "all_compare_canonicals",
    label: "Every compare query as canonical",
    reason:
      "O(n³) unique canonicals from /compare?methods= explode thin index entries.",
  },
  {
    id: "ai_stub_bulk",
    label: "Bulk AI stubs",
    reason: "Thin auto-generated exercise/program pages without unique value.",
  },
] as const;
