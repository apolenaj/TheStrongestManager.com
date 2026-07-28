import { hasLegendaryLicensingException } from "@/domain/legendary-methods/licensing-records";

/**
 * Public-facing copy must not imply official affiliation, exact proprietary
 * programmes, or guaranteed outcomes — unless an explicit licensing record exists.
 */

export const LEGENDARY_PROHIBITED_PHRASES = [
  "official programme",
  "official program",
  "official plan",
  "endorsed by",
  "approved by",
  "exact programme",
  "exact program",
  "exact diet",
  "guaranteed results",
  "athlete-created programme",
  "athlete-created program",
  "athlete created programme",
  "athlete created program",
] as const;

export type ProhibitedWordingHit = {
  phrase: string;
  field: string;
  excerpt: string;
};

function normalizeForScan(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'");
}

function collectPublicTextFields(
  profile: {
    slug: string;
    summary: string;
    seo: { title: string; description: string };
    sections: Array<{ id: string; body: string }>;
    whatLiftersGetWrong: string[];
    keyCharacteristics: string[];
    bestFor: string[];
    notRecommendedFor: string[];
    exampleWeek?: { title: string; disclaimer: string; days: Array<{ focus: string; notes?: string }> };
    modernAdaptation?: {
      summary: string;
      beginnerAdjustment: string;
      intermediateAdjustment: string;
      advancedAdjustment: string;
    };
    systemComparison?: { summary: string; rows: Array<{ thisSystem: string; otherSystem: string }> };
  },
): Array<{ field: string; text: string }> {
  const fields: Array<{ field: string; text: string }> = [
    { field: "summary", text: profile.summary },
    { field: "seo.title", text: profile.seo.title },
    { field: "seo.description", text: profile.seo.description },
    ...profile.sections.map((section) => ({
      field: `sections.${section.id}`,
      text: section.body,
    })),
    ...profile.whatLiftersGetWrong.map((item, i) => ({
      field: `whatLiftersGetWrong[${i}]`,
      text: item,
    })),
    ...profile.keyCharacteristics.map((item, i) => ({
      field: `keyCharacteristics[${i}]`,
      text: item,
    })),
    ...profile.bestFor.map((item, i) => ({
      field: `bestFor[${i}]`,
      text: item,
    })),
    ...profile.notRecommendedFor.map((item, i) => ({
      field: `notRecommendedFor[${i}]`,
      text: item,
    })),
  ];

  if (profile.exampleWeek) {
    fields.push(
      { field: "exampleWeek.title", text: profile.exampleWeek.title },
      { field: "exampleWeek.disclaimer", text: profile.exampleWeek.disclaimer },
    );
    profile.exampleWeek.days.forEach((day, i) => {
      fields.push({ field: `exampleWeek.days[${i}].focus`, text: day.focus });
      if (day.notes) {
        fields.push({ field: `exampleWeek.days[${i}].notes`, text: day.notes });
      }
    });
  }

  if (profile.modernAdaptation) {
    fields.push(
      { field: "modernAdaptation.summary", text: profile.modernAdaptation.summary },
      {
        field: "modernAdaptation.beginnerAdjustment",
        text: profile.modernAdaptation.beginnerAdjustment,
      },
      {
        field: "modernAdaptation.intermediateAdjustment",
        text: profile.modernAdaptation.intermediateAdjustment,
      },
      {
        field: "modernAdaptation.advancedAdjustment",
        text: profile.modernAdaptation.advancedAdjustment,
      },
    );
  }

  if (profile.systemComparison) {
    fields.push({
      field: "systemComparison.summary",
      text: profile.systemComparison.summary,
    });
    profile.systemComparison.rows.forEach((row, i) => {
      fields.push(
        {
          field: `systemComparison.rows[${i}].thisSystem`,
          text: row.thisSystem,
        },
        {
          field: `systemComparison.rows[${i}].otherSystem`,
          text: row.otherSystem,
        },
      );
    });
  }

  return fields;
}

function isNegatedOccurrence(normalized: string, phraseIndex: number): boolean {
  // Educational disclaimers often place "never/not" early in a long clause
  // ("Never treat … as … exact programme").
  const windowStart = Math.max(0, phraseIndex - 96);
  const before = normalized.slice(windowStart, phraseIndex);
  return /\b(not|never|no|without|isn't|isnt|aren't|arent|nor)\b/.test(before);
}

function findPhraseIndex(
  normalized: string,
  phrase: string,
  from: number,
): number {
  let idx = normalized.indexOf(phrase, from);
  while (idx !== -1) {
    const after = idx + phrase.length;
    const next = normalized[after];
    // Require a boundary so "official program" does not match "official programming"
    // and "exact program" does not match inside "exact programme".
    if (!next || /[^a-z0-9]/.test(next)) {
      return idx;
    }
    idx = normalized.indexOf(phrase, idx + 1);
  }
  return -1;
}

/**
 * Scan public profile text for prohibited affiliation / exact-programme claims.
 * Negated educational disclaimers (e.g. “not … exact programme”) are allowed.
 * Affirmative uses require an explicit licensing record.
 */
export function findProhibitedWordingHits(
  profile: Parameters<typeof collectPublicTextFields>[0],
): ProhibitedWordingHit[] {
  const hits: ProhibitedWordingHit[] = [];

  for (const { field, text } of collectPublicTextFields(profile)) {
    if (!text?.trim()) continue;
    const normalized = normalizeForScan(text);
    for (const phrase of LEGENDARY_PROHIBITED_PHRASES) {
      let from = 0;
      while (from < normalized.length) {
        const idx = findPhraseIndex(normalized, phrase, from);
        if (idx === -1) break;
        from = idx + phrase.length;
        if (isNegatedOccurrence(normalized, idx)) continue;
        if (hasLegendaryLicensingException(phrase, profile.slug)) continue;
        if (hasLegendaryLicensingException(phrase, "*")) continue;
        const excerpt = text
          .slice(Math.max(0, idx - 24), Math.min(text.length, idx + phrase.length + 24))
          .trim();
        hits.push({ phrase, field, excerpt });
      }
    }
  }

  return hits;
}

export function publicTextContainsProhibitedWording(
  profile: Parameters<typeof collectPublicTextFields>[0],
): boolean {
  return findProhibitedWordingHits(profile).length > 0;
}
