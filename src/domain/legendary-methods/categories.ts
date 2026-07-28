import {
  LEGENDARY_METHOD_CATEGORIES,
  LEGENDARY_METHOD_CATEGORY_LABELS,
  type LegendaryMethodCategory,
} from "@/domain/legendary-methods/types";

export function isLegendaryMethodCategory(
  value: string,
): value is LegendaryMethodCategory {
  return (LEGENDARY_METHOD_CATEGORIES as readonly string[]).includes(value);
}

export function listLegendaryMethodCategories(): Array<{
  id: LegendaryMethodCategory;
  label: string;
}> {
  return LEGENDARY_METHOD_CATEGORIES.map((id) => ({
    id,
    label: LEGENDARY_METHOD_CATEGORY_LABELS[id],
  }));
}

export function getLegendaryMethodCategoryLabel(
  category: LegendaryMethodCategory,
): string {
  return LEGENDARY_METHOD_CATEGORY_LABELS[category];
}
