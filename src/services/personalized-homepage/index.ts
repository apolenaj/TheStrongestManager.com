/**
 * Personalized Homepage service (Prompt 164).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  buildPersonalizedHomepageSnapshot,
  resolveHomepageVariantFromSearchParams,
  type HomepageIntentVariant,
  type PersonalizedHomepageSnapshot,
} from "@/domain/personalized-homepage";

export function getPersonalizedHomepageSnapshot(): PersonalizedHomepageSnapshot {
  return buildPersonalizedHomepageSnapshot();
}

/**
 * Resolve soft homepage variant from allowlisted traffic intent.
 * Returns default when the feature flag is off.
 */
export function resolvePersonalizedHomepageVariant(searchParams: {
  intent?: string | string[];
  utm_campaign?: string | string[];
}): HomepageIntentVariant {
  if (!featureFlags.personalizedHomepage) {
    return resolveHomepageVariantFromSearchParams(
      {},
      { demoMode: featureFlags.demoMode },
    );
  }
  return resolveHomepageVariantFromSearchParams(searchParams, {
    demoMode: featureFlags.demoMode,
  });
}
