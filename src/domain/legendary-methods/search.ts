import {
  getPublishedLegendaryMethods,
  getPublishedLegendaryMethodBySlug,
} from "@/domain/legendary-methods/catalog";
import {
  isLegendaryMethodCategory,
  listLegendaryMethodCategories,
} from "@/domain/legendary-methods/categories";
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
        profile.profileTitle,
        profile.shortTitle,
        profile.athleteName,
        profile.sportLabel,
        profile.era ?? "",
        profile.summary,
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
