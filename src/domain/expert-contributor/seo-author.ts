/**
 * SEO author schema for expert-written articles (Prompt 82).
 * Person author only when explicitly verified — else Organization fallback.
 */

import { absoluteUrl, siteConfig } from "@/config/site";
import { isVerifiedExpertContributor } from "@/domain/expert-contributor/roles";
import type { JsonLd } from "@/domain/seo/schema";

export type ExpertAuthorSeoInput = {
  displayName: string;
  /** Public profile path e.g. /experts/jane-doe */
  profilePath: string;
  bio?: string | null;
  specializations?: string[];
  /** Must be verified to emit Person author. */
  expertVerificationStatus: string;
};

export type ExpertArticleSeoInput = {
  headline: string;
  description: string;
  /** Public article path. */
  path: string;
  datePublished?: string;
  dateModified?: string;
  author: ExpertAuthorSeoInput;
};

/**
 * schema.org Person for a verified Expert Contributor.
 * Returns null if not verified — callers must not invent Person markup.
 */
export function expertPersonJsonLd(
  author: ExpertAuthorSeoInput,
): JsonLd | null {
  if (!isVerifiedExpertContributor(author.expertVerificationStatus)) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.displayName,
    url: absoluteUrl(author.profilePath),
    ...(author.bio?.trim() ? { description: author.bio.trim() } : {}),
    ...(author.specializations && author.specializations.length > 0
      ? { knowsAbout: author.specializations }
      : {}),
  };
}

/**
 * Article JSON-LD with Person author when verified; otherwise Organization only.
 */
export function expertArticleJsonLd(input: ExpertArticleSeoInput): JsonLd {
  const person = expertPersonJsonLd(input.author);
  const organizationAuthor = {
    "@type": "Organization",
    name: siteConfig.name,
  };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    author: person
      ? {
          "@type": "Person",
          name: input.author.displayName,
          url: absoluteUrl(input.author.profilePath),
        }
      : organizationAuthor,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

export function parseSpecializationsJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

export function serializeSpecializations(list: string[]): string {
  return JSON.stringify(list.map((s) => s.trim()).filter(Boolean));
}

export function slugifyExpert(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}
