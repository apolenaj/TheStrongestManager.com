import {
  HOMEPAGE_TRAFFIC_INTENTS,
  PERSONALIZED_HOMEPAGE_ENGINE_VERSION,
  PERSONALIZED_HOMEPAGE_HONESTY,
  type HomepageIntentVariant,
} from "@/domain/personalized-homepage/constants";
import { resolveHomepageIntentVariant } from "@/domain/personalized-homepage/resolve";
import { homeCopy } from "@/lib/content/home";
import { siteConfig } from "@/config/site";

export type PersonalizedHomepageSnapshot = {
  engineVersion: typeof PERSONALIZED_HOMEPAGE_ENGINE_VERSION;
  honesty: typeof PERSONALIZED_HOMEPAGE_HONESTY;
  intents: typeof HOMEPAGE_TRAFFIC_INTENTS;
  /** Locked SEO fields — never vary by intent. */
  lockedMetadata: {
    title: string;
    description: string;
    canonical: string;
  };
  /** Canonical brand signals that must appear for every variant. */
  brandIdentity: {
    brand: string;
    heroLines: readonly string[];
  };
  variants: HomepageIntentVariant[];
  generatedAt: string;
};

export function buildPersonalizedHomepageSnapshot(
  generatedAt: string = new Date().toISOString(),
): PersonalizedHomepageSnapshot {
  return {
    engineVersion: PERSONALIZED_HOMEPAGE_ENGINE_VERSION,
    honesty: PERSONALIZED_HOMEPAGE_HONESTY,
    intents: HOMEPAGE_TRAFFIC_INTENTS,
    lockedMetadata: {
      title: `${siteConfig.name} — Upload a lift. See what needs work.`,
      description: homeCopy.heroSupport,
      canonical: "/",
    },
    brandIdentity: {
      brand: homeCopy.brand,
      heroLines: homeCopy.heroLines,
    },
    variants: HOMEPAGE_TRAFFIC_INTENTS.map((i) =>
      resolveHomepageIntentVariant(i.id),
    ),
    generatedAt,
  };
}
