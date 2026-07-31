import {
  pickLocalized,
  resolveLocale,
  type LocalizedString,
} from "@/domain/legendary-methods/localized";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

type Resolved<T> = T extends LocalizedString
  ? string
  : T extends Array<infer U>
    ? Array<Resolved<U>>
    : T extends object
      ? { [K in keyof T]: Resolved<T[K]> }
      : T;

/** Profile with all LocalizedString fields flattened for the active locale. */
export type ResolvedLegendaryMethodProfile = Resolved<LegendaryMethodProfile>;

function pick(value: LocalizedString, locale: string): string {
  return pickLocalized(value, locale);
}

/**
 * Extract locale-specific strings from a registry profile for rendering/SEO.
 */
export function resolveLegendaryProfile(
  profile: LegendaryMethodProfile,
  localeInput: string,
): ResolvedLegendaryMethodProfile {
  const locale = resolveLocale(localeInput);
  const p = pick;

  return {
    ...profile,
    profileTitle: p(profile.profileTitle, locale),
    shortTitle: p(profile.shortTitle, locale),
    era: profile.era ? p(profile.era, locale) : undefined,
    nationality: profile.nationality
      ? p(profile.nationality, locale)
      : undefined,
    sportLabel: p(profile.sportLabel, locale),
    summary: p(profile.summary, locale),
    introductoryDisclaimer: p(profile.introductoryDisclaimer, locale),
    keyCharacteristics: profile.keyCharacteristics.map((s) => p(s, locale)),
    bestFor: profile.bestFor.map((s) => p(s, locale)),
    notRecommendedFor: profile.notRecommendedFor.map((s) => p(s, locale)),
    trainingDays: profile.trainingDays
      ? p(profile.trainingDays, locale)
      : undefined,
    quickProfile: {
      ...profile.quickProfile,
      primaryGoal: p(profile.quickProfile.primaryGoal, locale),
      typicalFrequency: p(profile.quickProfile.typicalFrequency, locale),
      volumeLevel: p(profile.quickProfile.volumeLevel, locale),
      intensityProfile: p(profile.quickProfile.intensityProfile, locale),
      recoveryDemand: p(profile.quickProfile.recoveryDemand, locale),
      technicalDifficulty: p(profile.quickProfile.technicalDifficulty, locale),
      bestSuitedFor: p(profile.quickProfile.bestSuitedFor, locale),
    },
    scores: {
      strengthPotential: {
        value: profile.scores.strengthPotential.value,
        justification: p(profile.scores.strengthPotential.justification, locale),
      },
      hypertrophyPotential: {
        value: profile.scores.hypertrophyPotential.value,
        justification: p(
          profile.scores.hypertrophyPotential.justification,
          locale,
        ),
      },
      recoveryDemand: {
        value: profile.scores.recoveryDemand.value,
        justification: p(profile.scores.recoveryDemand.justification, locale),
      },
      technicalDifficulty: {
        value: profile.scores.technicalDifficulty.value,
        justification: p(
          profile.scores.technicalDifficulty.justification,
          locale,
        ),
      },
      beginnerSuitability: {
        value: profile.scores.beginnerSuitability.value,
        justification: p(
          profile.scores.beginnerSuitability.justification,
          locale,
        ),
      },
      advancedSuitability: {
        value: profile.scores.advancedSuitability.value,
        justification: p(
          profile.scores.advancedSuitability.justification,
          locale,
        ),
      },
    },
    evidenceQualityNote: profile.evidenceQualityNote
      ? p(profile.evidenceQualityNote, locale)
      : undefined,
    sections: profile.sections.map((section) => ({
      ...section,
      title: p(section.title, locale),
      body: p(section.body, locale),
    })),
    trainingStructure: profile.trainingStructure
      ? {
          trainingDays: p(profile.trainingStructure.trainingDays, locale),
          exerciseFrequency: p(
            profile.trainingStructure.exerciseFrequency,
            locale,
          ),
          volumeDistribution: profile.trainingStructure.volumeDistribution.map(
            (slice) => ({
              label: p(slice.label, locale),
              share: slice.share,
            }),
          ),
          intensityDistribution:
            profile.trainingStructure.intensityDistribution.map((slice) => ({
              label: p(slice.label, locale),
              share: slice.share,
            })),
          primaryMovements: profile.trainingStructure.primaryMovements.map(
            (item) => p(item, locale),
          ),
          accessoryWork: profile.trainingStructure.accessoryWork.map((item) =>
            p(item, locale),
          ),
          progressionApproach: p(
            profile.trainingStructure.progressionApproach,
            locale,
          ),
          recoveryStructure: p(
            profile.trainingStructure.recoveryStructure,
            locale,
          ),
        }
      : undefined,
    whyItWorked: profile.whyItWorked
      ? {
          specificity: p(profile.whyItWorked.specificity, locale),
          volume: p(profile.whyItWorked.volume, locale),
          intensity: p(profile.whyItWorked.intensity, locale),
          technicalPractice: p(profile.whyItWorked.technicalPractice, locale),
          athleteExperience: p(profile.whyItWorked.athleteExperience, locale),
          bodyweight: p(profile.whyItWorked.bodyweight, locale),
          recovery: p(profile.whyItWorked.recovery, locale),
          sportDemands: p(profile.whyItWorked.sportDemands, locale),
          longTermAdaptation: p(profile.whyItWorked.longTermAdaptation, locale),
        }
      : undefined,
    whatLiftersGetWrong: profile.whatLiftersGetWrong.map((s) => p(s, locale)),
    exampleWeek: profile.exampleWeek
      ? {
          title: p(profile.exampleWeek.title, locale),
          label: profile.exampleWeek.label,
          disclaimer: p(profile.exampleWeek.disclaimer, locale),
          days: profile.exampleWeek.days.map((day) => ({
            dayLabel: p(day.dayLabel, locale),
            focus: p(day.focus, locale),
            notes: day.notes ? p(day.notes, locale) : undefined,
            sessions: day.sessions?.map((session) => ({
              name: p(session.name, locale),
              prescription: p(session.prescription, locale),
            })),
          })),
        }
      : undefined,
    modernAdaptation: profile.modernAdaptation
      ? {
          summary: p(profile.modernAdaptation.summary, locale),
          beginnerAdjustment: p(
            profile.modernAdaptation.beginnerAdjustment,
            locale,
          ),
          intermediateAdjustment: p(
            profile.modernAdaptation.intermediateAdjustment,
            locale,
          ),
          advancedAdjustment: p(
            profile.modernAdaptation.advancedAdjustment,
            locale,
          ),
          recommendedFrequency: p(
            profile.modernAdaptation.recommendedFrequency,
            locale,
          ),
          recoveryControls: profile.modernAdaptation.recoveryControls.map((s) =>
            p(s, locale),
          ),
          progressionRules: profile.modernAdaptation.progressionRules.map((s) =>
            p(s, locale),
          ),
          whenToReduceVolume: p(
            profile.modernAdaptation.whenToReduceVolume,
            locale,
          ),
          whoShouldAvoid: profile.modernAdaptation.whoShouldAvoid.map((s) =>
            p(s, locale),
          ),
        }
      : undefined,
    systemComparison: profile.systemComparison
      ? {
          title: p(profile.systemComparison.title, locale),
          counterpartSlug: profile.systemComparison.counterpartSlug,
          counterpartName: p(profile.systemComparison.counterpartName, locale),
          summary: p(profile.systemComparison.summary, locale),
          rows: profile.systemComparison.rows.map((row) => ({
            dimension: p(row.dimension, locale),
            thisSystem: p(row.thisSystem, locale),
            otherSystem: p(row.otherSystem, locale),
          })),
        }
      : undefined,
    relatedProgrammes: profile.relatedProgrammes.map((programme) => ({
      slug: programme.slug,
      title: p(programme.title, locale),
      href: programme.href,
      relationship: p(programme.relationship, locale),
      conversionPrompt: programme.conversionPrompt
        ? p(programme.conversionPrompt, locale)
        : undefined,
    })),
    seo: {
      title: p(profile.seo.title, locale),
      description: p(profile.seo.description, locale),
      canonicalPath: profile.seo.canonicalPath,
      keywords: profile.seo.keywords,
    },
  };
}
