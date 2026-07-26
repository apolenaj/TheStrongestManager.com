import type { LocaleId, TerminologyEntry } from "@/domain/i18n/types";

/**
 * Technical fitness terminology — do NOT machine-translate.
 * reviewedTranslations stays empty until a human reviewer signs off.
 */
export const FITNESS_TERMINOLOGY: readonly TerminologyEntry[] = [
  {
    id: "term.rpe",
    canonicalEn: "RPE",
    category: "metric",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.rir",
    canonicalEn: "RIR",
    category: "metric",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.1rm",
    canonicalEn: "1RM",
    category: "metric",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.e1rm",
    canonicalEn: "e1RM",
    category: "metric",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.volume_load",
    canonicalEn: "volume load",
    category: "metric",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.deload",
    canonicalEn: "deload",
    category: "coaching",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.squat",
    canonicalEn: "squat",
    category: "lift",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.bench_press",
    canonicalEn: "bench press",
    category: "lift",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.deadlift",
    canonicalEn: "deadlift",
    category: "lift",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.overhead_press",
    canonicalEn: "overhead press",
    category: "lift",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.rmm",
    canonicalEn: "RMM",
    category: "method",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.conjugate",
    canonicalEn: "conjugate",
    category: "method",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
  {
    id: "term.barbell",
    canonicalEn: "barbell",
    category: "equipment",
    requiresHumanReview: true,
    reviewedTranslations: {},
  },
] as const;

const BY_ID = new Map(FITNESS_TERMINOLOGY.map((t) => [t.id, t]));

export function getTerminologyEntry(id: string): TerminologyEntry | undefined {
  return BY_ID.get(id);
}

export function isTerminologyKey(key: string): boolean {
  return key.startsWith("term.") || BY_ID.has(key);
}

/**
 * Resolve a fitness term for a locale.
 * Unreviewed locales always keep the English canonical form.
 */
export function resolveTerminology(
  id: string,
  locale: LocaleId,
): string | null {
  const entry = BY_ID.get(id);
  if (!entry) return null;
  if (locale === "en") return entry.canonicalEn;
  const reviewed = entry.reviewedTranslations[locale];
  if (typeof reviewed === "string" && reviewed.trim()) return reviewed;
  return entry.canonicalEn;
}

export function countTerminologyReviewStatus(locale: Exclude<LocaleId, "en">): {
  reviewed: number;
  pending: number;
} {
  let reviewed = 0;
  let pending = 0;
  for (const entry of FITNESS_TERMINOLOGY) {
    const t = entry.reviewedTranslations[locale];
    if (typeof t === "string" && t.trim()) reviewed += 1;
    else pending += 1;
  }
  return { reviewed, pending };
}
