import { REQUIRED_LEGENDARY_SECTION_DEFINITIONS } from "@/domain/legendary-methods/sections";
import { findProhibitedWordingHits } from "@/domain/legendary-methods/prohibited-wording";
import {
  isScoreValue,
  type LegendaryMethodProfile,
  type LegendaryMethodSource,
} from "@/domain/legendary-methods/types";

export type LegendaryMethodValidationIssue = {
  code: string;
  message: string;
  path?: string;
};

export type LegendaryMethodValidationResult =
  | { ok: true }
  | { ok: false; issues: LegendaryMethodValidationIssue[] };

const HTTP_URL_PATTERN = /^https:\/\/[^\s/$.?#].[^\s]*$/i;

function issue(
  code: string,
  message: string,
  path?: string,
): LegendaryMethodValidationIssue {
  return { code, message, path };
}

export function isValidLegendarySourceUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return HTTP_URL_PATTERN.test(url);
  } catch {
    return false;
  }
}

function athleteNameTokens(athleteName: string): string[] {
  return athleteName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9þð]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

/**
 * Paid / related programme titles and slugs must not be named after the athlete.
 */
export function relatedProgrammeUsesAthleteName(
  profile: Pick<LegendaryMethodProfile, "athleteName" | "relatedProgrammes">,
): boolean {
  const tokens = athleteNameTokens(profile.athleteName);
  if (tokens.length === 0) return false;

  for (const programme of profile.relatedProgrammes) {
    const haystack = `${en(programme.title)} ${programme.slug}`.toLowerCase();
    for (const token of tokens) {
      if (haystack.includes(token)) return true;
    }
  }
  return false;
}

function validateSource(
  source: LegendaryMethodSource,
  index: number,
): LegendaryMethodValidationIssue[] {
  const issues: LegendaryMethodValidationIssue[] = [];
  const base = `sources[${index}]`;

  if (!source.title.trim()) {
    issues.push(issue("source_title_empty", "Source title is required.", `${base}.title`));
  }
  if (!source.publisher.trim()) {
    issues.push(
      issue("source_publisher_empty", "Source publisher is required.", `${base}.publisher`),
    );
  }
  if (!isValidLegendarySourceUrl(source.url)) {
    issues.push(
      issue(
        "source_url_invalid",
        "Source URL must be a valid https URL.",
        `${base}.url`,
      ),
    );
  }
  if (!source.accessDate.trim()) {
    issues.push(
      issue("source_access_date_empty", "Source accessDate is required.", `${base}.accessDate`),
    );
  }
  if (!Array.isArray(source.supports) || source.supports.length === 0) {
    issues.push(
      issue(
        "source_supports_empty",
        "Each source must declare at least one supports[] claim/section id.",
        `${base}.supports`,
      ),
    );
  }
  return issues;
}

const SCORE_FIELDS = [
  "strengthPotential",
  "hypertrophyPotential",
  "recoveryDemand",
  "technicalDifficulty",
  "beginnerSuitability",
  "advancedSuitability",
] as const;

/**
 * Development / publish gate for Legendary Method profiles.
 * Drafts may fail these checks; published profiles must not.
 */

function en(value: { en: string; cs: string } | string | undefined | null): string {
  if (value == null) return "";
  return typeof value === "string" ? value : value.en;
}

export function validateLegendaryMethodForPublish(
  profile: LegendaryMethodProfile,
): LegendaryMethodValidationResult {
  const issues: LegendaryMethodValidationIssue[] = [];

  if (!en(profile.summary).trim()) {
    issues.push(issue("summary_empty", "Summary is required to publish.", "summary"));
  }

  if (!en(profile.introductoryDisclaimer).trim()) {
    issues.push(
      issue(
        "disclaimer_missing",
        "Introductory disclaimer is required to publish.",
        "introductoryDisclaimer",
      ),
    );
  }

  if (profile.sources.length === 0) {
    issues.push(
      issue("sources_missing", "At least one factual source is required to publish.", "sources"),
    );
  } else {
    if (profile.sources.length < 3) {
      issues.push(
        issue(
          "sources_insufficient",
          "Published profiles require at least three cited sources.",
          "sources",
        ),
      );
    }
    profile.sources.forEach((source, index) => {
      issues.push(...validateSource(source, index));
    });
  }

  const presentIds = new Set(profile.sections.map((s) => s.id));
  for (const required of REQUIRED_LEGENDARY_SECTION_DEFINITIONS) {
    if (!presentIds.has(required.id)) {
      issues.push(
        issue(
          "required_section_missing",
          `Required section “${required.title}” is missing.`,
          `sections.${required.id}`,
        ),
      );
      continue;
    }
    const section = profile.sections.find((s) => s.id === required.id);
    if (required.id === "sources") continue;
    if (!en(section?.body).trim()) {
      issues.push(
        issue(
          "required_section_empty",
          `Required section “${required.title}” has empty body.`,
          `sections.${required.id}.body`,
        ),
      );
    }
  }

  for (const field of SCORE_FIELDS) {
    const metric = profile.scores[field];
    if (!isScoreValue(metric.value)) {
      issues.push(
        issue(
          "score_invalid",
          `scores.${field}.value must be an integer score from 1–10 to publish.`,
          `scores.${field}.value`,
        ),
      );
    }
    if (!en(metric.justification).trim()) {
      issues.push(
        issue(
          "score_justification_missing",
          `scores.${field}.justification is required to publish.`,
          `scores.${field}.justification`,
        ),
      );
    }
  }

  if (profile.evidenceQuality === "high") {
    if (!en(profile.evidenceQualityNote).trim()) {
      issues.push(
        issue(
          "evidence_high_unjustified",
          "evidenceQuality “high” requires evidenceQualityNote justification.",
          "evidenceQualityNote",
        ),
      );
    }
  }

  if (relatedProgrammeUsesAthleteName(profile)) {
    issues.push(
      issue(
        "related_programme_athlete_name",
        "Related paid programmes must not use athlete names in title or slug.",
        "relatedProgrammes",
      ),
    );
  }

  if (profile.keyCharacteristics.length === 0) {
    issues.push(
      issue(
        "key_characteristics_empty",
        "keyCharacteristics must include at least one item to publish.",
        "keyCharacteristics",
      ),
    );
  }

  const wordingHits = findProhibitedWordingHits(profile);
  for (const hit of wordingHits) {
    issues.push(
      issue(
        "prohibited_wording",
        `Public copy contains prohibited phrase “${hit.phrase}” (${hit.field}). Add a licensing record or rephrase.`,
        hit.field,
      ),
    );
  }

  if (profile.legalReviewStatus !== "passed") {
    issues.push(
      issue(
        "legal_review_incomplete",
        "legalReviewStatus must be “passed” before publish (drafts remain draft until legal review completes).",
        "legalReviewStatus",
      ),
    );
  }

  if (!profile.publishedAt?.trim()) {
    issues.push(
      issue(
        "published_at_missing",
        "publishedAt is required before publish (ISO date for Article schema and sitemap).",
        "publishedAt",
      ),
    );
  }

  if (!en(profile.seo.title).trim() || en(profile.seo.title).trim().length < 12) {
    issues.push(
      issue(
        "seo_title_weak",
        "seo.title must be a unique, descriptive page title.",
        "seo.title",
      ),
    );
  }
  if (
    !en(profile.seo.description).trim() ||
    en(profile.seo.description).trim().length < 50
  ) {
    issues.push(
      issue(
        "seo_description_weak",
        "seo.description must be a unique meta description (50+ characters).",
        "seo.description",
      ),
    );
  }

  for (const required of REQUIRED_LEGENDARY_SECTION_DEFINITIONS) {
    const section = profile.sections.find((s) => s.id === required.id);
    if (!section) continue;
    if (section.layer !== required.layer) {
      issues.push(
        issue(
          "section_layer_mismatch",
          `Section “${required.title}” layer must be “${required.layer}” (facts vs analysis separation).`,
          `sections.${required.id}.layer`,
        ),
      );
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true };
}

export function canPublishLegendaryMethod(
  profile: LegendaryMethodProfile,
): boolean {
  return validateLegendaryMethodForPublish(profile).ok;
}

/**
 * Registry integrity: no profile may claim status "published" unless it passes validation.
 */
export function assertLegendaryMethodRegistryIntegrity(
  profiles: readonly LegendaryMethodProfile[],
): LegendaryMethodValidationResult {
  const issues: LegendaryMethodValidationIssue[] = [];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const canonicals = new Map<string, string>();

  for (const profile of profiles) {
    const titleKey = en(profile.seo.title).trim().toLowerCase();
    const descKey = en(profile.seo.description).trim().toLowerCase();
    const canonicalKey = profile.seo.canonicalPath.trim().toLowerCase();

    if (titleKey) {
      const existing = titles.get(titleKey);
      if (existing && existing !== profile.slug) {
        issues.push(
          issue(
            "seo_title_duplicate",
            `Duplicate seo.title between “${existing}” and “${profile.slug}”.`,
            `${profile.slug}.seo.title`,
          ),
        );
      } else {
        titles.set(titleKey, profile.slug);
      }
    }

    if (descKey) {
      const existing = descriptions.get(descKey);
      if (existing && existing !== profile.slug) {
        issues.push(
          issue(
            "seo_description_duplicate",
            `Duplicate seo.description between “${existing}” and “${profile.slug}”.`,
            `${profile.slug}.seo.description`,
          ),
        );
      } else {
        descriptions.set(descKey, profile.slug);
      }
    }

    if (canonicalKey) {
      const existing = canonicals.get(canonicalKey);
      if (existing && existing !== profile.slug) {
        issues.push(
          issue(
            "seo_canonical_duplicate",
            `Duplicate seo.canonicalPath between “${existing}” and “${profile.slug}”.`,
            `${profile.slug}.seo.canonicalPath`,
          ),
        );
      } else {
        canonicals.set(canonicalKey, profile.slug);
      }
    }

    if (profile.status !== "published") continue;
    const result = validateLegendaryMethodForPublish(profile);
    if (!result.ok) {
      for (const item of result.issues) {
        issues.push({
          ...item,
          message: `[${profile.slug}] ${item.message}`,
          path: item.path ? `${profile.slug}.${item.path}` : profile.slug,
        });
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true };
}
