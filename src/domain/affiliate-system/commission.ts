/**
 * Pure commission / conversion helpers (Prompt 136).
 */

import {
  AFFILIATE_SIGNUP_COMMISSION_CENTS,
  AFFILIATE_SUBSCRIPTION_COMMISSION_CENTS,
  type AffiliateConversionEventType,
  type AffiliatePartnerType,
} from "@/domain/affiliate-system/constants";

export function estimateCommissionCents(input: {
  partnerType: AffiliatePartnerType;
  eventType: AffiliateConversionEventType;
}): number {
  if (input.eventType === "subscription") {
    return AFFILIATE_SUBSCRIPTION_COMMISSION_CENTS[input.partnerType];
  }
  return AFFILIATE_SIGNUP_COMMISSION_CENTS[input.partnerType];
}

export function commissionIdempotencyKey(input: {
  conversionId: string;
  eventType: AffiliateConversionEventType;
}): string {
  return `aff_commission:${input.conversionId}:${input.eventType}`;
}

/** Slug for public directory — lowercase kebab, no spaces. */
export function normalizeAffiliateSlug(raw: string): string | null {
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  if (slug.length < 2) return null;
  return slug;
}
