/**
 * Training Methods Knowledge Engine — types & catalogs (Prompt 27).
 * Historical description ≠ modern evidence interpretation.
 * Do not invent citations; coaching_practice content is labeled as such.
 */

export const METHOD_CATEGORIES = [
  "powerlifting",
  "bodybuilding",
  "strongman",
  "weightlifting",
  "general_strength",
  "athletic_performance",
] as const;

export type MethodCategory = (typeof METHOD_CATEGORIES)[number];

export const METHOD_CATEGORY_LABELS: Record<MethodCategory, string> = {
  powerlifting: "Powerlifting",
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  weightlifting: "Weightlifting",
  general_strength: "General strength",
  athletic_performance: "Athletic performance",
};

/** Fatigue / recovery demand — qualitative coaching labels, not lab measures. */
export const FATIGUE_PROFILES = [
  "low_moderate",
  "moderate",
  "moderate_high",
  "high",
  "variable",
] as const;

export type FatigueProfile = (typeof FATIGUE_PROFILES)[number];

export const FATIGUE_PROFILE_LABELS: Record<FatigueProfile, string> = {
  low_moderate: "Low–moderate",
  moderate: "Moderate",
  moderate_high: "Moderate–high",
  high: "High",
  variable: "Variable (depends on dosing)",
};

/**
 * Content provenance for honesty banners.
 * historical_description — origins, classical framing, named systems as taught historically
 * modern_interpretation — how coaches/athletes use ideas today + evidence awareness (not invented RCTs)
 * coaching_practice — programming heuristics and mistakes
 */
export type MethodContentLayer =
  | "historical_description"
  | "modern_interpretation"
  | "coaching_practice";

export type TrainingMethod = {
  slug: string;
  name: string;
  aliases: string[];
  categories: MethodCategory[];
  /** One-line list blurb */
  summary: string;
  /** Historical / classical overview (not “what science proves today”). */
  overview: string;
  origins: string;
  corePrinciples: string[];
  bestUseCases: string[];
  limitations: string[];
  fatigueProfile: FatigueProfile;
  fatigueNotes: string;
  suitableAthletes: string[];
  /** Illustrative microcycle / template — coaching practice, not a prescription guarantee. */
  programmingExample: string;
  /**
   * Current coaching/evidence-aware framing.
   * Must stay separate from origins — do not collapse history into “studies say.”
   */
  modernInterpretation: string;
  commonMistakes: string[];
  relatedMethodSlugs: string[];
  /** Always state honesty about evidence base. */
  evidenceHonesty: string;
  contentStatus: "draft" | "reviewed";
  isPublished: boolean;
};

export type MethodListItem = Pick<
  TrainingMethod,
  "slug" | "name" | "summary" | "categories" | "fatigueProfile" | "aliases"
>;

export const METHOD_DETAIL_SECTIONS = [
  { id: "overview", label: "Overview", layer: "historical_description" as const },
  { id: "origins", label: "Origins", layer: "historical_description" as const },
  { id: "principles", label: "Core principles", layer: "historical_description" as const },
  { id: "use-cases", label: "Best use cases", layer: "coaching_practice" as const },
  { id: "limitations", label: "Limitations", layer: "coaching_practice" as const },
  { id: "fatigue", label: "Fatigue profile", layer: "coaching_practice" as const },
  { id: "athletes", label: "Suitable athletes", layer: "coaching_practice" as const },
  { id: "programming", label: "Programming example", layer: "coaching_practice" as const },
  { id: "modern", label: "Modern interpretation", layer: "modern_interpretation" as const },
  { id: "mistakes", label: "Common mistakes", layer: "coaching_practice" as const },
  { id: "related", label: "Related methods", layer: "coaching_practice" as const },
] as const;
