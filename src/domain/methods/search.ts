import {
  getPublishedMethods,
  getMethodBySlug,
} from "@/domain/methods/catalog";
import {
  METHOD_CATEGORIES,
  METHOD_CATEGORY_LABELS,
  type MethodCategory,
  type MethodListItem,
  type TrainingMethod,
} from "@/domain/methods/types";

export type MethodSearchParams = {
  q?: string;
  category?: string;
};

function isCategory(value: string): value is MethodCategory {
  return (METHOD_CATEGORIES as readonly string[]).includes(value);
}

export function listMethodCategories(): Array<{
  id: MethodCategory;
  label: string;
}> {
  return METHOD_CATEGORIES.map((id) => ({
    id,
    label: METHOD_CATEGORY_LABELS[id],
  }));
}

export function searchMethods(params: MethodSearchParams = {}): MethodListItem[] {
  const q = params.q?.trim().toLowerCase() ?? "";
  const category =
    params.category && isCategory(params.category) ? params.category : null;

  return getPublishedMethods()
    .filter((method) => {
      if (category && !method.categories.includes(category)) return false;
      if (!q) return true;
      const haystack = [
        method.name,
        method.summary,
        ...method.aliases,
        ...method.categories.map((c) => METHOD_CATEGORY_LABELS[c]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    .map((method) => ({
      slug: method.slug,
      name: method.name,
      summary: method.summary,
      categories: method.categories,
      fatigueProfile: method.fatigueProfile,
      aliases: method.aliases,
    }));
}

export function getMethodDetail(slug: string): TrainingMethod | null {
  return getMethodBySlug(slug) ?? null;
}

export function getRelatedMethods(
  method: TrainingMethod,
): MethodListItem[] {
  return method.relatedMethodSlugs
    .map((relatedSlug) => getMethodBySlug(relatedSlug))
    .filter((m): m is TrainingMethod => Boolean(m))
    .map((m) => ({
      slug: m.slug,
      name: m.name,
      summary: m.summary,
      categories: m.categories,
      fatigueProfile: m.fatigueProfile,
      aliases: m.aliases,
    }));
}

export function allMethodSlugs(): string[] {
  return getPublishedMethods().map((m) => m.slug);
}
