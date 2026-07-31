import type { LocalizedString } from "@/domain/legendary-methods/localized";
import type {
  LegendaryMethodProfile,
  LegendaryMethodSectionId,
} from "@/domain/legendary-methods/types";

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
    seo: {
      ...profile.seo,
      title: withCs(profile.seo.title, overlay.seoTitle),
      description: withCs(profile.seo.description, overlay.seoDescription),
    },
  };
}
