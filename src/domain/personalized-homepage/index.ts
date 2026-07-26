export {
  PERSONALIZED_HOMEPAGE_ENGINE_VERSION,
  PERSONALIZED_HOMEPAGE_HONESTY,
  HOMEPAGE_TRAFFIC_INTENTS,
  HOMEPAGE_INTENT_SUPPORT,
} from "@/domain/personalized-homepage/constants";
export type {
  HomepageTrafficIntentId,
  HomepageIntentVariant,
} from "@/domain/personalized-homepage/constants";

export {
  isHomepageTrafficIntentId,
  parseHomepageTrafficIntent,
  resolveHomepageIntentVariant,
  resolveHomepageVariantFromSearchParams,
} from "@/domain/personalized-homepage/resolve";

export {
  buildPersonalizedHomepageSnapshot,
  type PersonalizedHomepageSnapshot,
} from "@/domain/personalized-homepage/snapshot";
