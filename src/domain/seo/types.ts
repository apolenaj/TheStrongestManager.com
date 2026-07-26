/**
 * SEO content engine types (Prompt 39).
 * Topic → pillar → supporting pages. Supporting URLs must be real, valuable pages — never thin stubs.
 */

export type SeoSupportingPage = {
  href: string;
  title: string;
  reason: string;
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoPillarSection = {
  heading: string;
  body: string;
};

export type SeoTopicCluster = {
  /** URL slug under /learn/[slug] */
  slug: string;
  title: string;
  /** Short cluster label for hubs */
  clusterLabel: string;
  description: string;
  /** Substantive intro — indexed pillars must earn their URL */
  overview: string;
  sections: SeoPillarSection[];
  faqs: SeoFaq[];
  /** Existing deep pages only — no invented thin URLs */
  supportingPages: SeoSupportingPage[];
  /** Related cluster slugs for internal linking */
  relatedClusterSlugs: string[];
};

export const SEO_HONESTY = [
  "We index topic pillars and real product content — not thousands of thin auto-generated pages.",
  "Structured data is emitted only when the page content matches the schema type.",
  "Supporting links point at existing exercises, methods, history, academy, and tools.",
] as const;
