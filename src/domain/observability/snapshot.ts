import {
  OBSERVABILITY_CATEGORIES,
  OBSERVABILITY_ENGINE_VERSION,
  OBSERVABILITY_HONESTY,
  OBSERVABILITY_SIGNALS,
} from "@/domain/observability/constants";

export type ObservabilitySnapshot = {
  engineVersion: typeof OBSERVABILITY_ENGINE_VERSION;
  categories: typeof OBSERVABILITY_CATEGORIES;
  signals: typeof OBSERVABILITY_SIGNALS;
  honesty: typeof OBSERVABILITY_HONESTY;
  counts: {
    shipped: number;
    planned: number;
    byCategory: Record<string, number>;
  };
  generatedAt: string;
};

export function buildObservabilitySnapshot(
  generatedAt: string = new Date().toISOString(),
): ObservabilitySnapshot {
  const byCategory: Record<string, number> = {};
  for (const cat of OBSERVABILITY_CATEGORIES) {
    byCategory[cat] = OBSERVABILITY_SIGNALS.filter(
      (s) => s.category === cat,
    ).length;
  }
  return {
    engineVersion: OBSERVABILITY_ENGINE_VERSION,
    categories: OBSERVABILITY_CATEGORIES,
    signals: OBSERVABILITY_SIGNALS,
    honesty: OBSERVABILITY_HONESTY,
    counts: {
      shipped: OBSERVABILITY_SIGNALS.filter((s) => s.status === "shipped")
        .length,
      planned: OBSERVABILITY_SIGNALS.filter((s) => s.status === "planned")
        .length,
      byCategory,
    },
    generatedAt,
  };
}
