/**
 * JSON-LD builders (Prompt 39).
 * Emit schema only when content matches the type — never misuse structured data.
 */

import { absoluteUrl, siteConfig } from "@/config/site";
import type { SeoFaq, SeoTopicCluster } from "@/domain/seo/types";

export type JsonLd = Record<string, unknown>;

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  dateModified?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    ...(input.dateModified
      ? { dateModified: input.dateModified }
      : {}),
  };
}

/** Only call when the page visibly presents these Q&As. */
export function faqPageJsonLd(faqs: SeoFaq[]): JsonLd | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Only when a real video URL exists on the page. */
export function videoObjectJsonLd(input: {
  name: string;
  description: string;
  contentUrl: string;
  thumbnailUrl?: string;
  uploadDate?: string;
}): JsonLd | null {
  if (!input.contentUrl.trim()) return null;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    contentUrl: input.contentUrl,
    ...(input.thumbnailUrl ? { thumbnailUrl: input.thumbnailUrl } : {}),
    ...(input.uploadDate ? { uploadDate: input.uploadDate } : {}),
  };
}

/** Academy courses — Certificate of Completion education, not accredited cert claims. */
export function courseJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    educationalCredentialAwarded: "Certificate of Completion",
  };
}

export function pillarPageJsonLd(cluster: SeoTopicCluster): JsonLd[] {
  const path = `/learn/${cluster.slug}`;
  const graphs: JsonLd[] = [
    articleJsonLd({
      headline: cluster.title,
      description: cluster.description,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Learn", path: "/learn" },
      { name: cluster.title, path },
    ]),
  ];
  const faq = faqPageJsonLd(cluster.faqs);
  if (faq) graphs.push(faq);
  return graphs;
}

export function learnIndexJsonLd(
  clusters: Array<{ title: string; slug: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Strength training topic clusters",
    itemListElement: clusters.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: absoluteUrl(`/learn/${c.slug}`),
    })),
  };
}
