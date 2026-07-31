import { ensureL, type LocalizedString } from "@/domain/legendary-methods/localized";
import type {
  ExampleTrainingDay,
  ExampleTrainingWeek,
  LegendaryMethodProfile,
  LegendaryMethodSection,
  ModernAdaptation,
  QuickMethodProfile,
  RelatedProgramme,
  ScoredMetric,
  SystemComparison,
  TrainingStructureVisual,
  WhyItWorkedFactors,
} from "@/domain/legendary-methods/types";

type Str = string | LocalizedString;

/**
 * Deep-normalize a profile authored with plain English strings (or mixed
 * LocalizedString fields) into the canonical LocalizedString shape.
 * Czech falls back to English until a dedicated translation pass lands.
 */
export function fromEnglishProfile(
  input: EnglishLegendaryMethodProfile,
): LegendaryMethodProfile {
  return {
    ...input,
    profileTitle: ensureL(input.profileTitle),
    shortTitle: ensureL(input.shortTitle),
    era: input.era !== undefined ? ensureL(input.era) : undefined,
    nationality:
      input.nationality !== undefined ? ensureL(input.nationality) : undefined,
    sportLabel: ensureL(input.sportLabel),
    summary: ensureL(input.summary),
    introductoryDisclaimer: ensureL(input.introductoryDisclaimer),
    keyCharacteristics: input.keyCharacteristics.map(ensureL),
    bestFor: input.bestFor.map(ensureL),
    notRecommendedFor: input.notRecommendedFor.map(ensureL),
    trainingDays:
      input.trainingDays !== undefined ? ensureL(input.trainingDays) : undefined,
    quickProfile: localizeQuick(input.quickProfile),
    scores: {
      strengthPotential: localizeScore(input.scores.strengthPotential),
      hypertrophyPotential: localizeScore(input.scores.hypertrophyPotential),
      recoveryDemand: localizeScore(input.scores.recoveryDemand),
      technicalDifficulty: localizeScore(input.scores.technicalDifficulty),
      beginnerSuitability: localizeScore(input.scores.beginnerSuitability),
      advancedSuitability: localizeScore(input.scores.advancedSuitability),
    },
    evidenceQualityNote:
      input.evidenceQualityNote !== undefined
        ? ensureL(input.evidenceQualityNote)
        : undefined,
    sections: input.sections.map(localizeSection),
    trainingStructure: input.trainingStructure
      ? localizeStructure(input.trainingStructure)
      : undefined,
    whyItWorked: input.whyItWorked
      ? localizeWhy(input.whyItWorked)
      : undefined,
    whatLiftersGetWrong: input.whatLiftersGetWrong.map(ensureL),
    exampleWeek: input.exampleWeek
      ? localizeExampleWeek(input.exampleWeek)
      : undefined,
    modernAdaptation: input.modernAdaptation
      ? localizeModern(input.modernAdaptation)
      : undefined,
    systemComparison: input.systemComparison
      ? localizeComparison(input.systemComparison)
      : undefined,
    relatedProgrammes: input.relatedProgrammes.map(localizeRelated),
    seo: {
      title: ensureL(input.seo.title),
      description: ensureL(input.seo.description),
      canonicalPath: input.seo.canonicalPath,
      keywords: input.seo.keywords,
    },
  };
}

/** Authoring shape — strings or LocalizedString accepted per field. */
export type EnglishLegendaryMethodProfile = Omit<
  LegendaryMethodProfile,
  | "profileTitle"
  | "shortTitle"
  | "era"
  | "nationality"
  | "sportLabel"
  | "summary"
  | "introductoryDisclaimer"
  | "keyCharacteristics"
  | "bestFor"
  | "notRecommendedFor"
  | "trainingDays"
  | "quickProfile"
  | "scores"
  | "evidenceQualityNote"
  | "sections"
  | "trainingStructure"
  | "whyItWorked"
  | "whatLiftersGetWrong"
  | "exampleWeek"
  | "modernAdaptation"
  | "systemComparison"
  | "relatedProgrammes"
  | "seo"
> & {
  profileTitle: Str;
  shortTitle: Str;
  era?: Str;
  nationality?: Str;
  sportLabel: Str;
  summary: Str;
  introductoryDisclaimer: Str;
  keyCharacteristics: Str[];
  bestFor: Str[];
  notRecommendedFor: Str[];
  trainingDays?: Str;
  quickProfile: {
    primaryGoal: Str;
    typicalFrequency: Str;
    volumeLevel: Str;
    intensityProfile: Str;
    recoveryDemand: Str;
    technicalDifficulty: Str;
    bestSuitedFor: Str;
    evidenceQuality: QuickMethodProfile["evidenceQuality"];
  };
  scores: {
    strengthPotential: { value: ScoredMetric["value"]; justification: Str };
    hypertrophyPotential: { value: ScoredMetric["value"]; justification: Str };
    recoveryDemand: { value: ScoredMetric["value"]; justification: Str };
    technicalDifficulty: { value: ScoredMetric["value"]; justification: Str };
    beginnerSuitability: { value: ScoredMetric["value"]; justification: Str };
    advancedSuitability: { value: ScoredMetric["value"]; justification: Str };
  };
  evidenceQualityNote?: Str;
  sections: Array<{
    id: LegendaryMethodSection["id"];
    title: Str;
    layer: LegendaryMethodSection["layer"];
    body: Str;
    sourceRefs?: number[];
  }>;
  trainingStructure?: {
    trainingDays: Str;
    exerciseFrequency: Str;
    volumeDistribution: Array<{ label: Str; share: number }>;
    intensityDistribution: Array<{ label: Str; share: number }>;
    primaryMovements: Str[];
    accessoryWork: Str[];
    progressionApproach: Str;
    recoveryStructure: Str;
  };
  whyItWorked?: {
    specificity: Str;
    volume: Str;
    intensity: Str;
    technicalPractice: Str;
    athleteExperience: Str;
    bodyweight: Str;
    recovery: Str;
    sportDemands: Str;
    longTermAdaptation: Str;
  };
  whatLiftersGetWrong: Str[];
  exampleWeek?: {
    title: Str;
    label: ExampleTrainingWeek["label"];
    disclaimer: Str;
    days: Array<{
      dayLabel: Str;
      focus: Str;
      notes?: Str;
      sessions?: Array<{ name: Str; prescription: Str }>;
    }>;
  };
  modernAdaptation?: {
    summary: Str;
    beginnerAdjustment: Str;
    intermediateAdjustment: Str;
    advancedAdjustment: Str;
    recommendedFrequency: Str;
    recoveryControls: Str[];
    progressionRules: Str[];
    whenToReduceVolume: Str;
    whoShouldAvoid: Str[];
  };
  systemComparison?: {
    title: Str;
    counterpartSlug: string;
    counterpartName: Str;
    summary: Str;
    rows: Array<{ dimension: Str; thisSystem: Str; otherSystem: Str }>;
  };
  relatedProgrammes: Array<{
    slug: string;
    title: Str;
    href: string;
    relationship: Str;
    conversionPrompt?: Str;
  }>;
  seo: {
    title: Str;
    description: Str;
    canonicalPath: string;
    keywords?: string[];
  };
};

function localizeScore(metric: {
  value: ScoredMetric["value"];
  justification: Str;
}): ScoredMetric {
  return { value: metric.value, justification: ensureL(metric.justification) };
}

function localizeQuick(
  quick: EnglishLegendaryMethodProfile["quickProfile"],
): QuickMethodProfile {
  return {
    primaryGoal: ensureL(quick.primaryGoal),
    typicalFrequency: ensureL(quick.typicalFrequency),
    volumeLevel: ensureL(quick.volumeLevel),
    intensityProfile: ensureL(quick.intensityProfile),
    recoveryDemand: ensureL(quick.recoveryDemand),
    technicalDifficulty: ensureL(quick.technicalDifficulty),
    bestSuitedFor: ensureL(quick.bestSuitedFor),
    evidenceQuality: quick.evidenceQuality,
  };
}

function localizeSection(
  section: EnglishLegendaryMethodProfile["sections"][number],
): LegendaryMethodSection {
  return {
    id: section.id,
    title: ensureL(section.title),
    layer: section.layer,
    body: ensureL(section.body),
    sourceRefs: section.sourceRefs,
  };
}

function localizeStructure(
  structure: NonNullable<EnglishLegendaryMethodProfile["trainingStructure"]>,
): TrainingStructureVisual {
  return {
    trainingDays: ensureL(structure.trainingDays),
    exerciseFrequency: ensureL(structure.exerciseFrequency),
    volumeDistribution: structure.volumeDistribution.map((s) => ({
      label: ensureL(s.label),
      share: s.share,
    })),
    intensityDistribution: structure.intensityDistribution.map((s) => ({
      label: ensureL(s.label),
      share: s.share,
    })),
    primaryMovements: structure.primaryMovements.map(ensureL),
    accessoryWork: structure.accessoryWork.map(ensureL),
    progressionApproach: ensureL(structure.progressionApproach),
    recoveryStructure: ensureL(structure.recoveryStructure),
  };
}

function localizeWhy(
  why: NonNullable<EnglishLegendaryMethodProfile["whyItWorked"]>,
): WhyItWorkedFactors {
  return {
    specificity: ensureL(why.specificity),
    volume: ensureL(why.volume),
    intensity: ensureL(why.intensity),
    technicalPractice: ensureL(why.technicalPractice),
    athleteExperience: ensureL(why.athleteExperience),
    bodyweight: ensureL(why.bodyweight),
    recovery: ensureL(why.recovery),
    sportDemands: ensureL(why.sportDemands),
    longTermAdaptation: ensureL(why.longTermAdaptation),
  };
}

function localizeExampleWeek(
  week: NonNullable<EnglishLegendaryMethodProfile["exampleWeek"]>,
): ExampleTrainingWeek {
  return {
    title: ensureL(week.title),
    label: week.label,
    disclaimer: ensureL(week.disclaimer),
    days: week.days.map(
      (day): ExampleTrainingDay => ({
        dayLabel: ensureL(day.dayLabel),
        focus: ensureL(day.focus),
        notes: day.notes !== undefined ? ensureL(day.notes) : undefined,
        sessions: day.sessions?.map((s) => ({
          name: ensureL(s.name),
          prescription: ensureL(s.prescription),
        })),
      }),
    ),
  };
}

function localizeModern(
  modern: NonNullable<EnglishLegendaryMethodProfile["modernAdaptation"]>,
): ModernAdaptation {
  return {
    summary: ensureL(modern.summary),
    beginnerAdjustment: ensureL(modern.beginnerAdjustment),
    intermediateAdjustment: ensureL(modern.intermediateAdjustment),
    advancedAdjustment: ensureL(modern.advancedAdjustment),
    recommendedFrequency: ensureL(modern.recommendedFrequency),
    recoveryControls: modern.recoveryControls.map(ensureL),
    progressionRules: modern.progressionRules.map(ensureL),
    whenToReduceVolume: ensureL(modern.whenToReduceVolume),
    whoShouldAvoid: modern.whoShouldAvoid.map(ensureL),
  };
}

function localizeComparison(
  comparison: NonNullable<EnglishLegendaryMethodProfile["systemComparison"]>,
): SystemComparison {
  return {
    title: ensureL(comparison.title),
    counterpartSlug: comparison.counterpartSlug,
    counterpartName: ensureL(comparison.counterpartName),
    summary: ensureL(comparison.summary),
    rows: comparison.rows.map((row) => ({
      dimension: ensureL(row.dimension),
      thisSystem: ensureL(row.thisSystem),
      otherSystem: ensureL(row.otherSystem),
    })),
  };
}

function localizeRelated(
  programme: EnglishLegendaryMethodProfile["relatedProgrammes"][number],
): RelatedProgramme {
  return {
    slug: programme.slug,
    title: ensureL(programme.title),
    href: programme.href,
    relationship: ensureL(programme.relationship),
    conversionPrompt:
      programme.conversionPrompt !== undefined
        ? ensureL(programme.conversionPrompt)
        : undefined,
  };
}
