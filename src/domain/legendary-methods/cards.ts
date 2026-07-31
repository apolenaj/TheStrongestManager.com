import {
  LEGENDARY_METHOD_CATEGORY_LABELS,
  type EvidenceQuality,
  type LegendaryMethodCategory,
  type LegendaryMethodProfile,
  type ScoreValue,
} from "@/domain/legendary-methods/types";
import {
  pickLocalized,
  resolveLocale,
  type LocalizedString,
} from "@/domain/legendary-methods/localized";

/** Card payload for the /legendary-methods library (published profiles only). */
export type LegendaryMethodCardModel = {
  slug: string;
  href: string;
  athleteName: string;
  profileTitle: string;
  category: LegendaryMethodCategory;
  categoryLabel: string;
  sportLabel: string;
  shortDescription: string;
  /** Method focus label — derived from shortTitle / characteristics, not inventing training facts. */
  methodFocus: string;
  recoveryDemand: ScoreValue | null;
  beginnerSuitability: ScoreValue | null;
  evidenceQuality: EvidenceQuality;
  readingTimeMinutes: number;
};

const WORDS_PER_MINUTE = 220;

function text(value: LocalizedString | string, locale: string): string {
  return pickLocalized(value, locale);
}

export function estimateLegendaryMethodReadingTimeMinutes(
  profile: LegendaryMethodProfile,
  localeInput: string = "en",
): number {
  const locale = resolveLocale(localeInput);
  const text = [
    profile.summary,
    profile.introductoryDisclaimer,
    ...profile.keyCharacteristics,
    ...profile.bestFor,
    ...profile.notRecommendedFor,
    ...profile.sections.map((section) => section.body),
    profile.modernAdaptation?.summary,
    profile.modernAdaptation?.beginnerAdjustment,
    profile.modernAdaptation?.intermediateAdjustment,
    profile.modernAdaptation?.advancedAdjustment,
    ...(profile.modernAdaptation?.recoveryControls ?? []),
    ...(profile.modernAdaptation?.progressionRules ?? []),
  ]
    .filter(Boolean)
    .map((value) => pickLocalized(value as LocalizedString, locale))
    .join(" ")
    .trim();

  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  if (words === 0) return 8;
  return Math.max(5, Math.ceil(words / WORDS_PER_MINUTE));
}

export function toLegendaryMethodCardModel(
  profile: LegendaryMethodProfile,
  localeInput: string = "en",
): LegendaryMethodCardModel {
  const locale = resolveLocale(localeInput);
  const shortTitle = text(profile.shortTitle, locale).trim();
  const firstCharacteristic = profile.keyCharacteristics[0]
    ? text(profile.keyCharacteristics[0], locale).trim()
    : "";
  const sportLabel = text(profile.sportLabel, locale);
  const methodFocus = shortTitle || firstCharacteristic || sportLabel;
  const summary = text(profile.summary, locale);

  return {
    slug: profile.slug,
    href: `/legendary-methods/${profile.slug}`,
    athleteName: profile.athleteName,
    profileTitle: text(profile.profileTitle, locale),
    category: profile.category,
    categoryLabel: LEGENDARY_METHOD_CATEGORY_LABELS[profile.category],
    sportLabel,
    shortDescription: legendaryMethodOneSentenceInsight(summary.trim()),
    methodFocus,
    recoveryDemand: profile.scores.recoveryDemand.value,
    beginnerSuitability: profile.scores.beginnerSuitability.value,
    evidenceQuality: profile.evidenceQuality,
    readingTimeMinutes: estimateLegendaryMethodReadingTimeMinutes(
      profile,
      locale,
    ),
  };
}

export function listLegendaryMethodCards(
  profiles: readonly LegendaryMethodProfile[],
  localeInput: string = "en",
): LegendaryMethodCardModel[] {
  return profiles.map((profile) =>
    toLegendaryMethodCardModel(profile, localeInput),
  );
}

/**
 * Recommended homepage featured order (Prompt 7).
 * Only published profiles are returned; unpublished slugs are skipped.
 */
export const HOMEPAGE_FEATURED_LEGENDARY_SLUGS = [
  "arnold-schwarzenegger-golden-era-volume",
  "tom-platz-extreme-leg-training",
  "eddie-hall-500kg-deadlift",
  "john-haack-relative-strength",
  "boris-sheiko-russian-powerlifting",
  "louie-simmons-conjugate-method",
] as const;

/** First sentence for compact editorial cards (homepage / teasers). */
export function legendaryMethodOneSentenceInsight(summary: string): string {
  const trimmed = summary.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/);
  if (match?.[1]) return match[1];
  return trimmed.length > 160 ? `${trimmed.slice(0, 157).trimEnd()}…` : trimmed;
}

/**
 * Up to `limit` published cards in the recommended homepage order,
 * then remaining published cards by registry order.
 */
export function listFeaturedLegendaryMethodCards(
  published: readonly LegendaryMethodProfile[],
  limit = 6,
  localeInput: string = "en",
): LegendaryMethodCardModel[] {
  const eligible = published.filter((profile) => profile.status === "published");
  if (eligible.length === 0 || limit <= 0) return [];

  const bySlug = new Map(eligible.map((profile) => [profile.slug, profile]));
  const selected: LegendaryMethodProfile[] = [];

  for (const slug of HOMEPAGE_FEATURED_LEGENDARY_SLUGS) {
    const profile = bySlug.get(slug);
    if (profile) {
      selected.push(profile);
      bySlug.delete(slug);
    }
    if (selected.length >= limit) {
      return listLegendaryMethodCards(selected.slice(0, limit), localeInput);
    }
  }

  for (const profile of eligible) {
    if (!bySlug.has(profile.slug)) continue;
    selected.push(profile);
    bySlug.delete(profile.slug);
    if (selected.length >= limit) break;
  }

  return listLegendaryMethodCards(selected.slice(0, limit), localeInput);
}

export const LIBRARY_CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "bodybuilding", label: "Bodybuilding" },
  { id: "strongman", label: "Strongman" },
  { id: "powerlifting", label: "Powerlifting" },
  { id: "training-system", label: "Training Systems" },
] as const;

export type LibraryCategoryFilterId =
  (typeof LIBRARY_CATEGORY_FILTERS)[number]["id"];

export const LIBRARY_CATEGORY_ORDER: LegendaryMethodCategory[] = [
  "bodybuilding",
  "strongman",
  "powerlifting",
  "training-system",
];

export function filterLegendaryMethodCards(
  cards: readonly LegendaryMethodCardModel[],
  filter: LibraryCategoryFilterId,
): LegendaryMethodCardModel[] {
  if (filter === "all") return [...cards];
  return cards.filter((card) => card.category === filter);
}

export function groupLegendaryMethodCards(
  cards: readonly LegendaryMethodCardModel[],
): Array<{
  category: LegendaryMethodCategory;
  label: string;
  cards: LegendaryMethodCardModel[];
}> {
  return LIBRARY_CATEGORY_ORDER.map((category) => ({
    category,
    label: LEGENDARY_METHOD_CATEGORY_LABELS[category],
    cards: cards.filter((card) => card.category === category),
  })).filter((group) => group.cards.length > 0);
}
