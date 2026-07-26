/**
 * Personalized Homepage (Prompt 164).
 * Traffic-intent variants — canonical brand identity, no search-engine cloaking.
 */

import { homeCopy } from "@/lib/content/home";

export const PERSONALIZED_HOMEPAGE_ENGINE_VERSION =
  "personalized_homepage.v1" as const;

export const PERSONALIZED_HOMEPAGE_HONESTY = [
  "Brand name and core hero headline stay identical for every intent — soft support and secondary CTA may adapt.",
  "Document title, meta description, canonical URL, and JSON-LD never change with traffic intent.",
  "Never serve different HTML based on User-Agent or bot vs human — no misleading cloaking for search engines.",
  "Intent is an allowlisted query param only; unknown intents fall back to the default homepage.",
] as const;

/** Allowlisted traffic intents (Prompt 164 examples). */
export const HOMEPAGE_TRAFFIC_INTENTS = [
  {
    id: "default",
    label: "Default",
    description: "Canonical homepage — no intent param or unknown value.",
    aliases: [] as readonly string[],
  },
  {
    id: "powerlifting",
    label: "Powerlifting visitor",
    description: "Traffic interested in powerlifting training context.",
    aliases: ["powerlifting", "powerlifter", "pl"] as const,
  },
  {
    id: "technique",
    label: "Technique analysis search",
    description: "Traffic from technique / lift analysis intent.",
    aliases: [
      "technique",
      "technique_analysis",
      "lift_analysis",
      "bar_path",
    ] as const,
  },
  {
    id: "coach",
    label: "Coach search",
    description: "Traffic looking for coaching / coach tools.",
    aliases: ["coach", "coaching", "coach_search"] as const,
  },
  {
    id: "seo",
    label: "SEO landing",
    description:
      "Generic SEO entry — support stays close to the indexed meta description.",
    aliases: ["seo", "landing", "organic"] as const,
  },
] as const;

export type HomepageTrafficIntentId =
  (typeof HOMEPAGE_TRAFFIC_INTENTS)[number]["id"];

export type HomepageIntentVariant = {
  intentId: HomepageTrafficIntentId;
  /** Always homeCopy.brand — never swapped. */
  brand: string;
  /** Always homeCopy.heroLines — never swapped. */
  heroLines: readonly string[];
  /** Soft support line by intent. */
  heroSupport: string;
  secondaryHref: string;
  secondaryLabel: string;
  /** Never used for metadata — documentation only. */
  metadataLocked: true;
};

const DEFAULT_SECONDARY = {
  href: "/features",
  label: "See what's included",
} as const;

/**
 * Soft copy variants — brand + headline lines stay canonical.
 */
export const HOMEPAGE_INTENT_SUPPORT: Record<
  HomepageTrafficIntentId,
  {
    heroSupport: string;
    secondaryHref: string;
    secondaryLabel: string;
  }
> = {
  default: {
    heroSupport: homeCopy.heroSupport,
    secondaryHref: DEFAULT_SECONDARY.href,
    secondaryLabel: DEFAULT_SECONDARY.label,
  },
  powerlifting: {
    heroSupport:
      "Built for powerlifting athletes who want clearer squat, bench, and deadlift decisions from the sessions they already train — profile, programming, technique, and progress in one place.",
    secondaryHref: "/methods",
    secondaryLabel: "Explore training methods",
  },
  technique: {
    heroSupport:
      "Upload a lift for technique review. Insights are labeled observed, estimated, or recommended — we do not invent medical certainty or fake strength-loss percentages.",
    secondaryHref: "/#technique",
    secondaryLabel: "See technique capabilities",
  },
  coach: {
    heroSupport:
      "For coaches who need athlete context, session follow-through, and technique notes without dark-pattern retention. Coach tools unlock with a coach account.",
    secondaryHref: "/coaching",
    secondaryLabel: "Explore coaching",
  },
  seo: {
    // Stay close to indexed description — anti-cloaking.
    heroSupport: homeCopy.heroSupport,
    secondaryHref: DEFAULT_SECONDARY.href,
    secondaryLabel: DEFAULT_SECONDARY.label,
  },
};
