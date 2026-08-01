import type { LocalizedString } from "@/domain/legendary-methods/localized";
import type {
  LegendaryMethodProfile,
  LegendaryMethodScores,
  LegendaryMethodSectionId,
  WhyItWorkedFactors,
} from "@/domain/legendary-methods/types";

/** Czech overlay for a single distribution slice — label only; share stays as authored in English. */
export type CzechDistributionSliceOverlay = {
  label: string;
  share: number;
};

export type CzechTrainingStructureOverlay = Partial<{
  trainingDays: string;
  exerciseFrequency: string;
  volumeDistribution: CzechDistributionSliceOverlay[];
  intensityDistribution: CzechDistributionSliceOverlay[];
  primaryMovements: string[];
  accessoryWork: string[];
  progressionApproach: string;
  recoveryStructure: string;
}>;

export type CzechExampleWeekDayOverlay = {
  dayLabel: string;
  focus: string;
  notes?: string;
};

export type CzechExampleWeekOverlay = Partial<{
  title: string;
  disclaimer: string;
  days: CzechExampleWeekDayOverlay[];
}>;

export type CzechModernAdaptationOverlay = Partial<{
  summary: string;
  beginnerAdjustment: string;
  intermediateAdjustment: string;
  advancedAdjustment: string;
  recommendedFrequency: string;
  recoveryControls: string[];
  progressionRules: string[];
  whenToReduceVolume: string;
  whoShouldAvoid: string[];
}>;

export type CzechRelatedProgrammeOverlay = Partial<{
  title: string;
  relationship: string;
  conversionPrompt: string;
}>;

export type CzechProfileOverlay = {
  profileTitle: string;
  shortTitle: string;
  sportLabel: string;
  era?: string;
  nationality?: string;
  summary: string;
  introductoryDisclaimer: string;
  seoTitle: string;
  seoDescription: string;
  keyCharacteristics?: string[];
  bestFor?: string[];
  notRecommendedFor?: string[];
  trainingDays?: string;
  evidenceQualityNote?: string;
  quickProfile?: Partial<{
    primaryGoal: string;
    typicalFrequency: string;
    volumeLevel: string;
    intensityProfile: string;
    recoveryDemand: string;
    technicalDifficulty: string;
    bestSuitedFor: string;
  }>;
  /** Czech bodies keyed by section id — merged onto existing English. */
  sections?: Partial<Record<LegendaryMethodSectionId, string>>;
  /** Czech justifications for the score cards, keyed by score metric. */
  scores?: Partial<Record<keyof LegendaryMethodScores, { justification: string }>>;
  whatLiftersGetWrong?: string[];
  trainingStructure?: CzechTrainingStructureOverlay;
  whyItWorked?: Partial<Record<keyof WhyItWorkedFactors, string>>;
  exampleWeek?: CzechExampleWeekOverlay;
  modernAdaptation?: CzechModernAdaptationOverlay;
  /** Keyed by array order — must line up with profile.relatedProgrammes. */
  relatedProgrammes?: CzechRelatedProgrammeOverlay[];
};

function withCs(current: LocalizedString, cs: string | undefined): LocalizedString {
  if (!cs?.trim()) return current;
  return { en: current.en, cs };
}

function withCsList(
  current: LocalizedString[],
  csList: string[] | undefined,
): LocalizedString[] {
  if (!csList?.length) return current;
  return current.map((item, index) => withCs(item, csList[index]));
}

/**
 * Merge Czech overlay copy onto a localized profile.
 * English remains the publish/validation canonical; Czech drives `/cs` UI.
 */
export function applyCzechOverlay(
  profile: LegendaryMethodProfile,
  overlay: CzechProfileOverlay | undefined,
): LegendaryMethodProfile {
  if (!overlay) return profile;

  const quick = overlay.quickProfile;
  return {
    ...profile,
    profileTitle: withCs(profile.profileTitle, overlay.profileTitle),
    shortTitle: withCs(profile.shortTitle, overlay.shortTitle),
    sportLabel: withCs(profile.sportLabel, overlay.sportLabel),
    era: profile.era ? withCs(profile.era, overlay.era) : profile.era,
    nationality: profile.nationality
      ? withCs(profile.nationality, overlay.nationality)
      : profile.nationality,
    summary: withCs(profile.summary, overlay.summary),
    introductoryDisclaimer: withCs(
      profile.introductoryDisclaimer,
      overlay.introductoryDisclaimer,
    ),
    keyCharacteristics: withCsList(
      profile.keyCharacteristics,
      overlay.keyCharacteristics,
    ),
    bestFor: withCsList(profile.bestFor, overlay.bestFor),
    notRecommendedFor: withCsList(
      profile.notRecommendedFor,
      overlay.notRecommendedFor,
    ),
    trainingDays: profile.trainingDays
      ? withCs(profile.trainingDays, overlay.trainingDays)
      : profile.trainingDays,
    evidenceQualityNote: profile.evidenceQualityNote
      ? withCs(profile.evidenceQualityNote, overlay.evidenceQualityNote)
      : profile.evidenceQualityNote,
    quickProfile: {
      ...profile.quickProfile,
      primaryGoal: withCs(
        profile.quickProfile.primaryGoal,
        quick?.primaryGoal,
      ),
      typicalFrequency: withCs(
        profile.quickProfile.typicalFrequency,
        quick?.typicalFrequency,
      ),
      volumeLevel: withCs(
        profile.quickProfile.volumeLevel,
        quick?.volumeLevel,
      ),
      intensityProfile: withCs(
        profile.quickProfile.intensityProfile,
        quick?.intensityProfile,
      ),
      recoveryDemand: withCs(
        profile.quickProfile.recoveryDemand,
        quick?.recoveryDemand,
      ),
      technicalDifficulty: withCs(
        profile.quickProfile.technicalDifficulty,
        quick?.technicalDifficulty,
      ),
      bestSuitedFor: withCs(
        profile.quickProfile.bestSuitedFor,
        quick?.bestSuitedFor,
      ),
    },
    sections: profile.sections.map((section) => ({
      ...section,
      body: withCs(section.body, overlay.sections?.[section.id]),
    })),
    scores: {
      strengthPotential: {
        ...profile.scores.strengthPotential,
        justification: withCs(
          profile.scores.strengthPotential.justification,
          overlay.scores?.strengthPotential?.justification,
        ),
      },
      hypertrophyPotential: {
        ...profile.scores.hypertrophyPotential,
        justification: withCs(
          profile.scores.hypertrophyPotential.justification,
          overlay.scores?.hypertrophyPotential?.justification,
        ),
      },
      recoveryDemand: {
        ...profile.scores.recoveryDemand,
        justification: withCs(
          profile.scores.recoveryDemand.justification,
          overlay.scores?.recoveryDemand?.justification,
        ),
      },
      technicalDifficulty: {
        ...profile.scores.technicalDifficulty,
        justification: withCs(
          profile.scores.technicalDifficulty.justification,
          overlay.scores?.technicalDifficulty?.justification,
        ),
      },
      beginnerSuitability: {
        ...profile.scores.beginnerSuitability,
        justification: withCs(
          profile.scores.beginnerSuitability.justification,
          overlay.scores?.beginnerSuitability?.justification,
        ),
      },
      advancedSuitability: {
        ...profile.scores.advancedSuitability,
        justification: withCs(
          profile.scores.advancedSuitability.justification,
          overlay.scores?.advancedSuitability?.justification,
        ),
      },
    },
    whatLiftersGetWrong: withCsList(
      profile.whatLiftersGetWrong,
      overlay.whatLiftersGetWrong,
    ),
    trainingStructure: profile.trainingStructure
      ? {
          ...profile.trainingStructure,
          trainingDays: withCs(
            profile.trainingStructure.trainingDays,
            overlay.trainingStructure?.trainingDays,
          ),
          exerciseFrequency: withCs(
            profile.trainingStructure.exerciseFrequency,
            overlay.trainingStructure?.exerciseFrequency,
          ),
          volumeDistribution: profile.trainingStructure.volumeDistribution.map(
            (slice, index) => ({
              ...slice,
              label: withCs(
                slice.label,
                overlay.trainingStructure?.volumeDistribution?.[index]?.label,
              ),
            }),
          ),
          intensityDistribution:
            profile.trainingStructure.intensityDistribution.map(
              (slice, index) => ({
                ...slice,
                label: withCs(
                  slice.label,
                  overlay.trainingStructure?.intensityDistribution?.[index]
                    ?.label,
                ),
              }),
            ),
          primaryMovements: withCsList(
            profile.trainingStructure.primaryMovements,
            overlay.trainingStructure?.primaryMovements,
          ),
          accessoryWork: withCsList(
            profile.trainingStructure.accessoryWork,
            overlay.trainingStructure?.accessoryWork,
          ),
          progressionApproach: withCs(
            profile.trainingStructure.progressionApproach,
            overlay.trainingStructure?.progressionApproach,
          ),
          recoveryStructure: withCs(
            profile.trainingStructure.recoveryStructure,
            overlay.trainingStructure?.recoveryStructure,
          ),
        }
      : profile.trainingStructure,
    whyItWorked: profile.whyItWorked
      ? {
          specificity: withCs(
            profile.whyItWorked.specificity,
            overlay.whyItWorked?.specificity,
          ),
          volume: withCs(profile.whyItWorked.volume, overlay.whyItWorked?.volume),
          intensity: withCs(
            profile.whyItWorked.intensity,
            overlay.whyItWorked?.intensity,
          ),
          technicalPractice: withCs(
            profile.whyItWorked.technicalPractice,
            overlay.whyItWorked?.technicalPractice,
          ),
          athleteExperience: withCs(
            profile.whyItWorked.athleteExperience,
            overlay.whyItWorked?.athleteExperience,
          ),
          bodyweight: withCs(
            profile.whyItWorked.bodyweight,
            overlay.whyItWorked?.bodyweight,
          ),
          recovery: withCs(
            profile.whyItWorked.recovery,
            overlay.whyItWorked?.recovery,
          ),
          sportDemands: withCs(
            profile.whyItWorked.sportDemands,
            overlay.whyItWorked?.sportDemands,
          ),
          longTermAdaptation: withCs(
            profile.whyItWorked.longTermAdaptation,
            overlay.whyItWorked?.longTermAdaptation,
          ),
        }
      : profile.whyItWorked,
    exampleWeek: profile.exampleWeek
      ? {
          ...profile.exampleWeek,
          title: withCs(profile.exampleWeek.title, overlay.exampleWeek?.title),
          disclaimer: withCs(
            profile.exampleWeek.disclaimer,
            overlay.exampleWeek?.disclaimer,
          ),
          days: profile.exampleWeek.days.map((day, index) => {
            const csDay = overlay.exampleWeek?.days?.[index];
            return {
              ...day,
              dayLabel: withCs(day.dayLabel, csDay?.dayLabel),
              focus: withCs(day.focus, csDay?.focus),
              notes: day.notes ? withCs(day.notes, csDay?.notes) : day.notes,
            };
          }),
        }
      : profile.exampleWeek,
    modernAdaptation: profile.modernAdaptation
      ? {
          summary: withCs(
            profile.modernAdaptation.summary,
            overlay.modernAdaptation?.summary,
          ),
          beginnerAdjustment: withCs(
            profile.modernAdaptation.beginnerAdjustment,
            overlay.modernAdaptation?.beginnerAdjustment,
          ),
          intermediateAdjustment: withCs(
            profile.modernAdaptation.intermediateAdjustment,
            overlay.modernAdaptation?.intermediateAdjustment,
          ),
          advancedAdjustment: withCs(
            profile.modernAdaptation.advancedAdjustment,
            overlay.modernAdaptation?.advancedAdjustment,
          ),
          recommendedFrequency: withCs(
            profile.modernAdaptation.recommendedFrequency,
            overlay.modernAdaptation?.recommendedFrequency,
          ),
          recoveryControls: withCsList(
            profile.modernAdaptation.recoveryControls,
            overlay.modernAdaptation?.recoveryControls,
          ),
          progressionRules: withCsList(
            profile.modernAdaptation.progressionRules,
            overlay.modernAdaptation?.progressionRules,
          ),
          whenToReduceVolume: withCs(
            profile.modernAdaptation.whenToReduceVolume,
            overlay.modernAdaptation?.whenToReduceVolume,
          ),
          whoShouldAvoid: withCsList(
            profile.modernAdaptation.whoShouldAvoid,
            overlay.modernAdaptation?.whoShouldAvoid,
          ),
        }
      : profile.modernAdaptation,
    relatedProgrammes: profile.relatedProgrammes.map((programme, index) => {
      const csProgramme = overlay.relatedProgrammes?.[index];
      return {
        ...programme,
        title: withCs(programme.title, csProgramme?.title),
        relationship: withCs(programme.relationship, csProgramme?.relationship),
        conversionPrompt: programme.conversionPrompt
          ? withCs(programme.conversionPrompt, csProgramme?.conversionPrompt)
          : programme.conversionPrompt,
      };
    }),
    seo: {
      ...profile.seo,
      title: withCs(profile.seo.title, overlay.seoTitle),
      description: withCs(profile.seo.description, overlay.seoDescription),
    },
  };
}
