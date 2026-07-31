import {
  getPublishedLegendaryMethods,
  getPublishedLegendaryMethodBySlug,
} from "@/domain/legendary-methods/catalog";
import {
  isLegendaryMethodCategory,
  listLegendaryMethodCategories,
} from "@/domain/legendary-methods/categories";
import { pickLocalized } from "@/domain/legendary-methods/localized";
import {
  LEGENDARY_METHOD_CATEGORY_LABELS,
  type LegendaryMethodListItem,
  type LegendaryMethodProfile,
} from "@/domain/legendary-methods/types";

export type LegendaryMethodSearchParams = {
  q?: string;
  category?: string;
  /** @deprecated Use `category`. */
  sport?: string;
};

function toListItem(profile: LegendaryMethodProfile): LegendaryMethodListItem {
  return {
    slug: profile.slug,
    status: profile.status,
    athleteName: profile.athleteName,
    profileTitle: profile.profileTitle,
    shortTitle: profile.shortTitle,
    category: profile.category,
    sportLabel: profile.sportLabel,
    era: profile.era,
    summary: profile.summary,
  };
}

/** Published profiles only — drafts never appear in public filters. */
export function searchLegendaryMethods(
  params: LegendaryMethodSearchParams = {},
): LegendaryMethodListItem[] {
  const q = params.q?.trim().toLowerCase() ?? "";
  const categoryRaw = params.category ?? params.sport ?? "";
  const category = isLegendaryMethodCategory(categoryRaw)
    ? categoryRaw
    : null;

  return getPublishedLegendaryMethods()
    .filter((profile) => {
      if (category && profile.category !== category) return false;
      if (!q) return true;
      const haystack = [
        pickLocalized(profile.profileTitle, "en"),
        pickLocalized(profile.profileTitle, "cs"),
        pickLocalized(profile.shortTitle, "en"),
        pickLocalized(profile.shortTitle, "cs"),
        profile.athleteName,
        pickLocalized(profile.sportLabel, "en"),
        pickLocalized(profile.sportLabel, "cs"),
        profile.era ? pickLocalized(profile.era, "en") : "",
        profile.era ? pickLocalized(profile.era, "cs") : "",
        pickLocalized(profile.summary, "en"),
        pickLocalized(profile.summary, "cs"),
        LEGENDARY_METHOD_CATEGORY_LABELS[profile.category],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .map(toListItem);
}

export function getLegendaryMethodDetail(
  slug: string,
): LegendaryMethodProfile | null {
  return getPublishedLegendaryMethodBySlug(slug) ?? null;
}

/** @deprecated Prefer listLegendaryMethodCategories. */
export function listLegendaryMethodSports() {
  return listLegendaryMethodCategories().filter(
    (item) => item.id !== "training-system",
  );
}
