import { hasLegendaryLicensingException } from "@/domain/legendary-methods/licensing-records";
import { isLocalizedString } from "@/domain/legendary-methods/localized";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Public-facing copy must not imply official affiliation, exact proprietary
 * programmes, or guaranteed outcomes — unless an explicit licensing record exists.
 */

function flatText(value: unknown): string {
  if (typeof value === "string") return value;
  if (isLocalizedString(value)) return `${value.en}\n${value.cs}`;
  return "";
}

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

type ProhibitedScanProfile = Pick<
  LegendaryMethodProfile,
  | "slug"
  | "summary"
  | "seo"
  | "sections"
  | "whatLiftersGetWrong"
  | "keyCharacteristics"
  | "bestFor"
  | "notRecommendedFor"
> &
  Partial<
    Pick<
      LegendaryMethodProfile,
      "exampleWeek" | "modernAdaptation" | "systemComparison"
    >
  >;

/** Accept full profiles or lightweight fixtures (string or LocalizedString fields). */
function collectPublicTextFields(
  profile: ProhibitedScanProfile | Record<string, unknown>,
): Array<{ field: string; text: string }> {
  const p = profile as ProhibitedScanProfile;
  const fields: Array<{ field: string; text: string }> = [
    { field: "summary", text: flatText(p.summary) },
    { field: "seo.title", text: flatText(p.seo.title) },
    { field: "seo.description", text: flatText(p.seo.description) },
    ...(p.sections ?? []).map((section) => ({
      field: `sections.${section.id}`,
      text: flatText(section.body),
    })),
    ...(p.whatLiftersGetWrong ?? []).map((item, i) => ({
      field: `whatLiftersGetWrong[${i}]`,
      text: flatText(item),
    })),
    ...(p.keyCharacteristics ?? []).map((item, i) => ({
      field: `keyCharacteristics[${i}]`,
      text: flatText(item),
    })),
    ...(p.bestFor ?? []).map((item, i) => ({
      field: `bestFor[${i}]`,
      text: flatText(item),
    })),
    ...(p.notRecommendedFor ?? []).map((item, i) => ({
      field: `notRecommendedFor[${i}]`,
      text: flatText(item),
    })),
  ];

  if (p.exampleWeek) {
    fields.push(
      { field: "exampleWeek.title", text: flatText(p.exampleWeek.title) },
      {
        field: "exampleWeek.disclaimer",
        text: flatText(p.exampleWeek.disclaimer),
      },
    );
    p.exampleWeek.days.forEach((day, i) => {
      fields.push({
        field: `exampleWeek.days[${i}].focus`,
        text: flatText(day.focus),
      });
      if (day.notes) {
        fields.push({
          field: `exampleWeek.days[${i}].notes`,
          text: flatText(day.notes),
        });
      }
    });
  }

  if (p.modernAdaptation) {
    fields.push(
      {
        field: "modernAdaptation.summary",
        text: flatText(p.modernAdaptation.summary),
      },
      {
        field: "modernAdaptation.beginnerAdjustment",
        text: flatText(p.modernAdaptation.beginnerAdjustment),
      },
      {
        field: "modernAdaptation.intermediateAdjustment",
        text: flatText(p.modernAdaptation.intermediateAdjustment),
      },
      {
        field: "modernAdaptation.advancedAdjustment",
        text: flatText(p.modernAdaptation.advancedAdjustment),
      },
    );
  }

  if (p.systemComparison) {
    fields.push({
      field: "systemComparison.summary",
      text: flatText(p.systemComparison.summary),
    });
    p.systemComparison.rows.forEach((row, i) => {
      fields.push(
        {
          field: `systemComparison.rows[${i}].thisSystem`,
          text: flatText(row.thisSystem),
        },
        {
          field: `systemComparison.rows[${i}].otherSystem`,
          text: flatText(row.otherSystem),
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

/** Labelled historical documentation sections may recount publicly reported diets/routines. */
const HISTORICAL_DOCUMENTATION_FIELDS = new Set([
  "sections.core-training-routine",
  "sections.documented-nutritional-approach",
]);

const HISTORICAL_DOCUMENTATION_ALLOWED_PHRASES = new Set([
  "exact programme",
  "exact program",
  "exact diet",
]);

/**
 * Scan public profile text for prohibited affiliation / exact-programme claims.
 * Negated educational disclaimers (e.g. “not … exact programme”) are allowed.
 * Affirmative uses require an explicit licensing record — except labelled
 * historical documentation sections, which may recount public historical diets/routines.
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
        if (
          HISTORICAL_DOCUMENTATION_FIELDS.has(field) &&
          HISTORICAL_DOCUMENTATION_ALLOWED_PHRASES.has(phrase)
        ) {
          continue;
        }
        if (
          hasLegendaryLicensingException(
            phrase,
            typeof (profile as { slug?: unknown }).slug === "string"
              ? (profile as { slug: string }).slug
              : "",
          )
        )
          continue;
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
