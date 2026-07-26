export {
  AFFILIATE_ENGINE_VERSION,
  AFFILIATE_HONESTY,
  AFFILIATE_DISCLOSURE,
  AFFILIATE_DISCLOSURE_SHORT,
  AFFILIATE_PARTNER_TYPES,
  AFFILIATE_PARTNER_TYPE_LABELS,
  AFFILIATE_PARTNER_STATUSES,
  AFFILIATE_PARTNER_STATUS_LABELS,
  AFFILIATE_CONVERSION_EVENT_TYPES,
  AFFILIATE_CONVERSION_STATUSES,
  AFFILIATE_COMMISSION_STATUSES,
  AFFILIATE_COMMISSION_STATUS_LABELS,
  AFFILIATE_SIGNUP_COMMISSION_CENTS,
  AFFILIATE_SUBSCRIPTION_COMMISSION_CENTS,
  isAffiliatePartnerType,
  isAffiliatePartnerStatus,
  isAffiliateCommissionStatus,
  isAffiliateConversionEventType,
  type AffiliatePartnerType,
  type AffiliatePartnerStatus,
  type AffiliateConversionEventType,
  type AffiliateConversionStatus,
  type AffiliateCommissionStatus,
} from "@/domain/affiliate-system/constants";

export {
  isValidAffiliateTrackingCode,
  generateAffiliateTrackingCode,
  buildAffiliateLandingPath,
  buildAffiliateSignupPath,
  canDisplayAffiliatePartnerships,
  filterPartnersForDisplay,
} from "@/domain/affiliate-system/tracking";

export {
  estimateCommissionCents,
  commissionIdempotencyKey,
  normalizeAffiliateSlug,
} from "@/domain/affiliate-system/commission";
