/**
 * Legendary Training Methods — strongly typed content model (Prompt 2 + 4).
 * Profiles live in a typed registry, not duplicated JSX pages.
 * Educational analysis only — not endorsement or official athlete content.
 *
 * Readable copy uses LocalizedString ({ en, cs }) — never raw English-only
 * strings for user-facing narrative fields.
 */

import type { LocalizedString } from "@/domain/legendary-methods/localized";

export type { LocalizedString } from "@/domain/legendary-methods/localized";

/** Integer suitability / demand scores used in the profile header. */
export type ScoreValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

export function isScoreValue(value: unknown): value is ScoreValue {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= SCORE_MIN &&
    value <= SCORE_MAX
  );
}

export type LegendaryMethodStatus = "draft" | "published";

export const LEGENDARY_METHOD_CATEGORIES = [
  "bodybuilding",
  "strongman",
  "powerlifting",
  "training-system",
] as const;

export type LegendaryMethodCategory =
  (typeof LEGENDARY_METHOD_CATEGORIES)[number];

export const LEGENDARY_METHOD_CATEGORY_LABELS: Record<
  LegendaryMethodCategory,
  string
> = {
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  powerlifting: "Powerlifting",
  "training-system": "Training system",
};

/**
 * Provenance layer — keep historical documentation, independent analysis,
 * and modernised adaptations visually and structurally distinct.
 */
export const LEGENDARY_CONTENT_LAYERS = [
  "documented_historical",
  "independent_analysis",
  "modernised_adaptation",
] as const;

export type LegendaryContentLayer = (typeof LEGENDARY_CONTENT_LAYERS)[number];

export const LEGENDARY_CONTENT_LAYER_LABELS: Record<
  LegendaryContentLayer,
  string
> = {
  documented_historical: "Documented historical information",
  independent_analysis: "The Strongest independent analysis",
  modernised_adaptation: "Modernised original adaptation",
};

export const LEGENDARY_METHOD_SECTION_IDS = [
  "athlete-and-era",
  "documented-training-method",
  "training-structure",
  "core-training-routine",
  "documented-nutritional-approach",
  "volume-intensity-frequency",
  "why-it-worked",
  "what-lifters-get-wrong",
  "risks-and-recovery",
  "verdict",
  "modernised-application",
  "example-training-week",
  "sources",
] as const;

export type LegendaryMethodSectionId =
  (typeof LEGENDARY_METHOD_SECTION_IDS)[number];

export type LegendaryMethodSection = {
  id: LegendaryMethodSectionId;
  title: LocalizedString;
  layer: LegendaryContentLayer;
  /** Empty until a sourced content pass fills it — never invent copy to publish. */
  body: LocalizedString;
  /** Optional inline source markers (1-based indices into profile.sources). */
  sourceRefs?: number[];
};

export type LegendaryMethodSourceType =
  | "official-athlete-source"
  | "book"
  | "interview"
  | "research-paper"
  | "competition-database"
  | "reputable-publication"
  | "archival-source";

export type LegendaryMethodSource = {
  title: string;
  publisher: string;
  author?: string;
  url: string;
  publicationDate?: string;
  accessDate: string;
  sourceType: LegendaryMethodSourceType;
  /** Claim ids / section ids this source supports. */
  supports: string[];
};

export type ExampleTrainingSession = {
  name: LocalizedString;
  prescription: LocalizedString;
};

export type ExampleTrainingDay = {
  dayLabel: LocalizedString;
  focus: LocalizedString;
  notes?: LocalizedString;
  sessions?: ExampleTrainingSession[];
};

export const EXAMPLE_WEEK_LABELS = [
  "documented-example",
  "reconstructed-from-public-sources",
  "original-modernised-example",
] as const;

export type ExampleWeekLabel = (typeof EXAMPLE_WEEK_LABELS)[number];

export const EXAMPLE_WEEK_LABEL_COPY: Record<
  ExampleWeekLabel,
  { title: string; caution: string }
> = {
  "documented-example": {
    title: "Documented example",
    caution:
      "Drawn from a publicly documented schedule. Still not a guarantee of every session the athlete ever ran.",
  },
  "reconstructed-from-public-sources": {
    title: "Reconstructed from multiple public sources",
    caution:
      "Reconstructed for educational clarity. Not presented as the athlete’s exact routine.",
  },
  "original-modernised-example": {
    title: "Original modernised example",
    caution:
      "An original The Strongest interpretation. Not the athlete’s exact programme.",
  },
};

export type ExampleTrainingWeek = {
  title: LocalizedString;
  label: ExampleWeekLabel;
  disclaimer: LocalizedString;
  days: ExampleTrainingDay[];
};

export type DistributionSlice = {
  label: LocalizedString;
  /** Relative share 0–100 for visual bars — editorial estimate, not lab data. */
  share: number;
};

export type TrainingStructureVisual = {
  trainingDays: LocalizedString;
  exerciseFrequency: LocalizedString;
  volumeDistribution: DistributionSlice[];
  intensityDistribution: DistributionSlice[];
  primaryMovements: LocalizedString[];
  accessoryWork: LocalizedString[];
  progressionApproach: LocalizedString;
  recoveryStructure: LocalizedString;
};

export type WhyItWorkedFactors = {
  specificity: LocalizedString;
  volume: LocalizedString;
  intensity: LocalizedString;
  technicalPractice: LocalizedString;
  athleteExperience: LocalizedString;
  bodyweight: LocalizedString;
  recovery: LocalizedString;
  sportDemands: LocalizedString;
  longTermAdaptation: LocalizedString;
};

/** Score with required short written justification at publish time. */
export type ScoredMetric = {
  value: ScoreValue | null;
  justification: LocalizedString;
};

export type LegendaryMethodScores = {
  strengthPotential: ScoredMetric;
  hypertrophyPotential: ScoredMetric;
  recoveryDemand: ScoredMetric;
  technicalDifficulty: ScoredMetric;
  beginnerSuitability: ScoredMetric;
  advancedSuitability: ScoredMetric;
};

export type QuickMethodProfile = {
  primaryGoal: LocalizedString;
  typicalFrequency: LocalizedString;
  volumeLevel: LocalizedString;
  intensityProfile: LocalizedString;
  recoveryDemand: LocalizedString;
  technicalDifficulty: LocalizedString;
  bestSuitedFor: LocalizedString;
  evidenceQuality: EvidenceQuality;
};

export type ModernAdaptation = {
  summary: LocalizedString;
  beginnerAdjustment: LocalizedString;
  intermediateAdjustment: LocalizedString;
  advancedAdjustment: LocalizedString;
  recommendedFrequency: LocalizedString;
  recoveryControls: LocalizedString[];
  progressionRules: LocalizedString[];
  whenToReduceVolume: LocalizedString;
  whoShouldAvoid: LocalizedString[];
};

export type RelatedProgramme = {
  /** Commercial catalog product slug (`/programs/[slug]`). */
  slug: string;
  title: LocalizedString;
  href: string;
  relationship: LocalizedString;
  /**
   * Conversion hook shown before “Explore {title}”.
   * Must never imply the athlete created, approved, or used the programme.
   */
  conversionPrompt?: LocalizedString;
};

/** Optional structured comparison between related training systems (Prompt 5D). */
export type SystemComparisonRow = {
  dimension: LocalizedString;
  thisSystem: LocalizedString;
  otherSystem: LocalizedString;
};

export type SystemComparison = {
  title: LocalizedString;
  counterpartSlug: string;
  counterpartName: LocalizedString;
  /** Short framing paragraph — original analysis, not a copyrighted table reprint. */
  summary: LocalizedString;
  rows: SystemComparisonRow[];
};

export type LegendaryMethodSeo = {
  title: LocalizedString;
  description: LocalizedString;
  canonicalPath: string;
  keywords?: string[];
};

export type EvidenceQuality = "high" | "moderate" | "limited" | "mixed";

export type LegendaryLegalReviewStatus = "pending" | "passed";

/**
 * Canonical profile document for the Legendary Methods registry.
 * Draft entries may leave narrative fields empty; publish validation enforces completeness.
 */
export type LegendaryMethodProfile = {
  slug: string;
  status: LegendaryMethodStatus;
  /** Proper name — not localized. */
  athleteName: string;
  profileTitle: LocalizedString;
  shortTitle: LocalizedString;
  category: LegendaryMethodCategory;
  era?: LocalizedString;
  nationality?: LocalizedString;
  sportLabel: LocalizedString;
  summary: LocalizedString;
  introductoryDisclaimer: LocalizedString;
  keyCharacteristics: LocalizedString[];
  bestFor: LocalizedString[];
  notRecommendedFor: LocalizedString[];
  trainingDays?: LocalizedString;
  quickProfile: QuickMethodProfile;
  scores: LegendaryMethodScores;
  evidenceQuality: EvidenceQuality;
  /**
   * Required when evidenceQuality is "high".
   * Prevents labelling everything as high without justification.
   */
  evidenceQualityNote?: LocalizedString;
  lastReviewedAt?: string;
  /**
   * Legal/editorial review gate. Must be "passed" to publish.
   * Defaults to pending when omitted (treated as incomplete for publish).
   */
  legalReviewStatus?: LegendaryLegalReviewStatus;
  sections: LegendaryMethodSection[];
  trainingStructure?: TrainingStructureVisual;
  whyItWorked?: WhyItWorkedFactors;
  whatLiftersGetWrong: LocalizedString[];
  exampleWeek?: ExampleTrainingWeek;
  modernAdaptation?: ModernAdaptation;
  /** Present on system profiles that include an explicit comparison block. */
  systemComparison?: SystemComparison;
  relatedProgrammes: RelatedProgramme[];
  sources: LegendaryMethodSource[];
  seo: LegendaryMethodSeo;
  publishedAt?: string;
  updatedAt?: string;
};

export type LegendaryMethodListItem = {
  slug: string;
  status: LegendaryMethodStatus;
  athleteName: string;
  profileTitle: LocalizedString;
  shortTitle: LocalizedString;
  category: LegendaryMethodCategory;
  sportLabel: LocalizedString;
  era?: LocalizedString;
  summary: LocalizedString;
};

/** @deprecated Prefer LEGENDARY_METHOD_CATEGORIES — kept for Prompt 1 SportCategoryMark mapping. */
export type LegendaryMethodSport = Exclude<
  LegendaryMethodCategory,
  "training-system"
>;

export const LEGENDARY_METHOD_SPORTS = [
  "bodybuilding",
  "strongman",
  "powerlifting",
] as const satisfies readonly LegendaryMethodSport[];

export const LEGENDARY_METHOD_SPORT_LABELS: Record<
  LegendaryMethodSport,
  string
> = {
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  powerlifting: "Powerlifting",
};

export function categoryToSportMark(
  category: LegendaryMethodCategory,
): LegendaryMethodSport {
  if (category === "training-system") return "powerlifting";
  return category;
}

export function emptyScoredMetric(): ScoredMetric {
  return { value: null, justification: { en: "", cs: "" } };
}

export function emptyScores(): LegendaryMethodScores {
  return {
    strengthPotential: emptyScoredMetric(),
    hypertrophyPotential: emptyScoredMetric(),
    recoveryDemand: emptyScoredMetric(),
    technicalDifficulty: emptyScoredMetric(),
    beginnerSuitability: emptyScoredMetric(),
    advancedSuitability: emptyScoredMetric(),
  };
}

export function emptyQuickProfile(
  evidenceQuality: EvidenceQuality = "limited",
): QuickMethodProfile {
  const empty = { en: "", cs: "" };
  return {
    primaryGoal: empty,
    typicalFrequency: empty,
    volumeLevel: empty,
    intensityProfile: empty,
    recoveryDemand: empty,
    technicalDifficulty: empty,
    bestSuitedFor: empty,
    evidenceQuality,
  };
}

/** Template TOC — page structure for the reusable profile layout. */
export const LEGENDARY_PROFILE_TOC = [
  { id: "quick-method-profile", label: "Quick Method Profile" },
  { id: "athlete-and-era", label: "The Athlete and the Era" },
  { id: "documented-training-method", label: "The Documented Training Method" },
  { id: "training-structure", label: "Training Structure" },
  { id: "core-training-routine", label: "Core Training Routine" },
  { id: "documented-nutritional-approach", label: "Documented Diet" },
  { id: "volume-intensity-frequency", label: "Volume, Intensity and Frequency" },
  { id: "example-training-week", label: "Example Training Week" },
  { id: "why-it-worked", label: "Why It Worked" },
  { id: "what-lifters-get-wrong", label: "What Most Lifters Get Wrong" },
  { id: "risks-and-recovery", label: "Risks and Recovery" },
  { id: "scores", label: "The Strongest Score" },
  { id: "verdict", label: "Verdict" },
  { id: "system-comparison", label: "System Comparison" },
  { id: "modernised-application", label: "Modernised Application" },
  { id: "sources", label: "Sources" },
  { id: "related-programmes", label: "Related Programmes" },
] as const;

export const PROFILE_INDEPENDENT_BADGE = "Independent educational analysis";

export const PROFILE_AFFILIATION_STATEMENT =
  "Independent educational analysis. Not affiliated with or endorsed by the featured athlete.";

export const PROFILE_FINAL_DISCLAIMER =
  "This article is an independent educational analysis based on publicly available and cited material. The Strongest is not affiliated with, authorised by, sponsored by or endorsed by the featured athlete. Any modernised training examples are original interpretations and are not presented as the athlete’s exact programme.";
