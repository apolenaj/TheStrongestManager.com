/**
 * Affiliate System (Prompt 136).
 * Tracking for creators, coaches, and partners — clicks, conversions, commission ledger.
 * Never display affiliate partnerships without disclosure.
 */

export const AFFILIATE_ENGINE_VERSION = "affiliate_system.v1" as const;

export const AFFILIATE_HONESTY = [
  "Affiliate tracking records clicks, conversions, and commission ledger rows — not guaranteed payouts.",
  "Commission entries are estimates for accounting; paid_external means settled outside this app.",
  "This is separate from the personal referral program (/app/referral).",
  "Income claims, residual payouts, and multi-level recruiting are not part of this system.",
] as const;

/**
 * Required disclosure copy — must appear before any affiliate partnership is shown.
 * FTC-style honesty: paid/promotional relationship.
 */
export const AFFILIATE_DISCLOSURE = [
  "Disclosure: Some links and partner listings are affiliate relationships. We may earn a commission if you sign up or purchase through an affiliate link.",
  "Affiliate partnerships are never shown without this disclosure on the same page.",
  "Rankings and recommendations are not secretly boosted by unpaid affiliate status — sponsored placements must stay labeled.",
] as const;

export const AFFILIATE_DISCLOSURE_SHORT =
  "Affiliate disclosure: this page includes affiliate links or partner listings. We may earn a commission." as const;

export const AFFILIATE_PARTNER_TYPES = [
  "creator",
  "coach",
  "partner",
] as const;

export type AffiliatePartnerType = (typeof AFFILIATE_PARTNER_TYPES)[number];

export const AFFILIATE_PARTNER_TYPE_LABELS: Record<
  AffiliatePartnerType,
  string
> = {
  creator: "Creator",
  coach: "Coach",
  partner: "Partner",
};

export const AFFILIATE_PARTNER_STATUSES = [
  "pending",
  "active",
  "suspended",
  "rejected",
] as const;

export type AffiliatePartnerStatus =
  (typeof AFFILIATE_PARTNER_STATUSES)[number];

export const AFFILIATE_PARTNER_STATUS_LABELS: Record<
  AffiliatePartnerStatus,
  string
> = {
  pending: "Pending review",
  active: "Active",
  suspended: "Suspended",
  rejected: "Rejected",
};

export const AFFILIATE_CONVERSION_EVENT_TYPES = [
  "signup",
  "subscription",
] as const;

export type AffiliateConversionEventType =
  (typeof AFFILIATE_CONVERSION_EVENT_TYPES)[number];

export const AFFILIATE_CONVERSION_STATUSES = [
  "attributed",
  "commissioned",
  "voided",
] as const;

export type AffiliateConversionStatus =
  (typeof AFFILIATE_CONVERSION_STATUSES)[number];

/** Commission ledger — never invents a bank payout inside the app. */
export const AFFILIATE_COMMISSION_STATUSES = [
  "pending",
  "accrued",
  "voided",
  "paid_external",
] as const;

export type AffiliateCommissionStatus =
  (typeof AFFILIATE_COMMISSION_STATUSES)[number];

export const AFFILIATE_COMMISSION_STATUS_LABELS: Record<
  AffiliateCommissionStatus,
  string
> = {
  pending: "Pending",
  accrued: "Accrued",
  voided: "Voided",
  paid_external: "Paid externally",
};

/**
 * Flat signup commission estimates (USD cents) by partner type.
 * Ledger only — not a payout promise.
 */
export const AFFILIATE_SIGNUP_COMMISSION_CENTS: Record<
  AffiliatePartnerType,
  number
> = {
  creator: 500,
  coach: 750,
  partner: 1000,
};

/** Optional subscription conversion estimate (USD cents). */
export const AFFILIATE_SUBSCRIPTION_COMMISSION_CENTS: Record<
  AffiliatePartnerType,
  number
> = {
  creator: 1500,
  coach: 2000,
  partner: 2500,
};

export function isAffiliatePartnerType(
  value: string,
): value is AffiliatePartnerType {
  return (AFFILIATE_PARTNER_TYPES as readonly string[]).includes(value);
}

export function isAffiliatePartnerStatus(
  value: string,
): value is AffiliatePartnerStatus {
  return (AFFILIATE_PARTNER_STATUSES as readonly string[]).includes(value);
}

export function isAffiliateCommissionStatus(
  value: string,
): value is AffiliateCommissionStatus {
  return (AFFILIATE_COMMISSION_STATUSES as readonly string[]).includes(value);
}

export function isAffiliateConversionEventType(
  value: string,
): value is AffiliateConversionEventType {
  return (AFFILIATE_CONVERSION_EVENT_TYPES as readonly string[]).includes(
    value,
  );
}
