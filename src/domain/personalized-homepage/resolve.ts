/**
 * Resolve allowlisted homepage traffic intent (Prompt 164).
 */

import { homeCopy } from "@/lib/content/home";
import {
  HOMEPAGE_INTENT_SUPPORT,
  HOMEPAGE_TRAFFIC_INTENTS,
  type HomepageIntentVariant,
  type HomepageTrafficIntentId,
} from "@/domain/personalized-homepage/constants";

export function isHomepageTrafficIntentId(
  value: string,
): value is HomepageTrafficIntentId {
  return HOMEPAGE_TRAFFIC_INTENTS.some((i) => i.id === value);
}

/**
 * Map raw query values (intent, utm_campaign aliases) to an allowlisted id.
 */
export function parseHomepageTrafficIntent(
  raw: string | string[] | undefined | null,
): HomepageTrafficIntentId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== "string") return "default";
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (!normalized) return "default";

  for (const intent of HOMEPAGE_TRAFFIC_INTENTS) {
    if (intent.id === normalized) return intent.id;
    if ((intent.aliases as readonly string[]).includes(normalized)) {
      return intent.id;
    }
  }
  return "default";
}

/**
 * Build the soft homepage variant. Brand + heroLines always from homeCopy.
 */
export function resolveHomepageIntentVariant(
  intentId: HomepageTrafficIntentId,
  options?: { demoMode?: boolean },
): HomepageIntentVariant {
  const support = HOMEPAGE_INTENT_SUPPORT[intentId];
  let secondaryHref = support.secondaryHref;
  let secondaryLabel = support.secondaryLabel;

  if (options?.demoMode && intentId === "default") {
    secondaryHref = "/demo";
    secondaryLabel = "Explore example dashboard";
  }
  if (options?.demoMode && intentId === "seo") {
    secondaryHref = "/demo";
    secondaryLabel = "Explore example dashboard";
  }

  return {
    intentId,
    brand: homeCopy.brand,
    heroLines: homeCopy.heroLines,
    heroSupport: support.heroSupport,
    secondaryHref,
    secondaryLabel,
    metadataLocked: true,
  };
}

/**
 * Parse search params object used by the marketing homepage.
 */
export function resolveHomepageVariantFromSearchParams(
  searchParams: {
    intent?: string | string[];
    utm_campaign?: string | string[];
  },
  options?: { demoMode?: boolean },
): HomepageIntentVariant {
  const fromIntent = parseHomepageTrafficIntent(searchParams.intent);
  const intentId =
    fromIntent !== "default"
      ? fromIntent
      : parseHomepageTrafficIntent(searchParams.utm_campaign);
  return resolveHomepageIntentVariant(intentId, options);
}
