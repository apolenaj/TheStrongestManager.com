/**
 * One-time program commerce — strictly separate from recurring platform subscriptions.
 */

export const PROGRAM_COMMERCE_ENGINE_VERSION = "program_commerce.v1" as const;

/** Metadata key on Stripe Checkout sessions for this channel. */
export const PROGRAM_COMMERCE_KIND = "program_product" as const;

export const PROGRAM_COMMERCE_HONESTY = [
  "Program purchases are one-time payments — not platform subscriptions.",
  "Prices and Stripe Price IDs are validated server-side from ProgramProduct rows. Client price data is never trusted.",
  "Entitlements are granted only after a verified Stripe webhook (checkout.session.completed), never from the success page alone.",
] as const;

/**
 * Env → slug map for Stripe Price ids (one-time).
 * Set these before enabling program checkout.
 */
export const PROGRAM_STRIPE_PRICE_ENV_BY_SLUG: Record<string, string> = {
  "linear-strength-builder": "STRIPE_PRICE_PROGRAM_LINEAR_STRENGTH_BUILDER",
  "dup-powerlifting-system": "STRIPE_PRICE_PROGRAM_DUP_POWERLIFTING",
  "block-periodisation": "STRIPE_PRICE_PROGRAM_BLOCK_PERIODISATION",
  "conjugate-strength-system": "STRIPE_PRICE_PROGRAM_CONJUGATE",
  "high-frequency-sbd": "STRIPE_PRICE_PROGRAM_HIGH_FREQUENCY_SBD",
  "powerbuilding-hybrid": "STRIPE_PRICE_PROGRAM_POWERBUILDING_HYBRID",
  "complete-method-collection": "STRIPE_PRICE_PROGRAM_COMPLETE_METHOD_COLLECTION",
};

export function envStripePriceIdForProgramSlug(slug: string): string | null {
  const key = PROGRAM_STRIPE_PRICE_ENV_BY_SLUG[slug];
  if (!key) return null;
  const value = process.env[key]?.trim();
  return value || null;
}

export function isProgramCommerceConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
