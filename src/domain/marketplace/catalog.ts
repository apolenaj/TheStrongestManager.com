/**
 * Coach marketplace domain (Prompt 37).
 * Schema + rules for future supply — never invent coaches or imply unverified credentials are verified.
 */

export const MARKETPLACE_LISTING_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "suspended",
  "archived",
] as const;
export type MarketplaceListingStatus =
  (typeof MARKETPLACE_LISTING_STATUSES)[number];

export const MARKETPLACE_AVAILABILITY_STATUSES = [
  "closed",
  "limited",
  "open",
] as const;
export type MarketplaceAvailabilityStatus =
  (typeof MARKETPLACE_AVAILABILITY_STATUSES)[number];

export const CREDENTIAL_VERIFICATION_STATUSES = [
  "unverified",
  "pending_review",
  "verified",
  "rejected",
  "expired",
  "revoked",
] as const;
export type CredentialVerificationStatus =
  (typeof CREDENTIAL_VERIFICATION_STATUSES)[number];

export const MARKETPLACE_REVIEW_STATUSES = [
  "pending",
  "published",
  "hidden",
  "removed",
] as const;
export type MarketplaceReviewStatus =
  (typeof MARKETPLACE_REVIEW_STATUSES)[number];

export const MARKETPLACE_HONESTY = [
  "The marketplace does not list coaches until real profiles are published.",
  "Credentials are only labeled Verified when verificationStatus is verified — never by default.",
  "Coach Mode grants (data access) are separate from marketplace discovery and pricing.",
  "Consultation requests are a workflow only — payments are not processed until payment architecture is ready.",
] as const;

/** Sport / specialization filter keys for browse (Prompt 83). */
export const MARKETPLACE_SPORT_FILTERS = [
  "powerlifting",
  "bodybuilding",
  "strongman",
  "weightlifting",
  "technique",
  "general",
] as const;
export type MarketplaceSportFilter =
  (typeof MARKETPLACE_SPORT_FILTERS)[number];

export const MARKETPLACE_INQUIRY_STATUSES = [
  "open",
  "closed",
  "converted",
  "spam",
] as const;
export type MarketplaceInquiryStatus =
  (typeof MARKETPLACE_INQUIRY_STATUSES)[number];

/** Still future — inquiry request workflow is live; these are not. */
export const MARKETPLACE_FUTURE_CAPABILITIES = [
  "bookings_calendar",
  "messaging_threads",
  "checkout_and_payouts",
  "engagement_to_coach_access_grant",
] as const;


export type MarketplaceFutureCapability =
  (typeof MARKETPLACE_FUTURE_CAPABILITIES)[number];

export type MarketplacePricing = {
  currency?: string;
  /** Minor units (cents) when known — null means “contact for pricing”. */
  amountCents?: number | null;
  /** session | month | package | custom */
  billingPeriod?: string;
  label?: string;
  notes?: string;
};

export type MarketplaceAvailability = {
  timezone?: string;
  /** Free-form windows for future booking UI. */
  weeklyWindows?: Array<{ day: string; start: string; end: string }>;
  notes?: string;
};

export type PublicCredentialView = {
  id: string;
  title: string;
  issuer: string | null;
  yearEarned: number | null;
  /** True only when verificationStatus === "verified" and not past expiresAt. */
  isVerified: boolean;
  /** Human label — never says Verified unless isVerified. */
  verificationLabel: string;
  verificationStatus: CredentialVerificationStatus;
};

export type PublicCoachListingCard = {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  specializations: string[];
  languages: string[];
  experienceSummary: string | null;
  availabilityStatus: MarketplaceAvailabilityStatus;
  pricing: MarketplacePricing;
  verifiedCredentialCount: number;
  /** Total credentials shown (verified + claimed). */
  credentialCount: number;
  reviewCount: number;
  averageRating: number | null;
};

export function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw || raw.trim() === "" || raw === "[]") return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim() !== "");
  } catch {
    return [];
  }
}

export function parsePricing(raw: string | null | undefined): MarketplacePricing {
  if (!raw || raw.trim() === "" || raw === "{}") return {};
  try {
    const parsed = JSON.parse(raw) as MarketplacePricing;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function parseAvailability(
  raw: string | null | undefined,
): MarketplaceAvailability {
  if (!raw || raw.trim() === "" || raw === "{}") return {};
  try {
    const parsed = JSON.parse(raw) as MarketplaceAvailability;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Only `verified` (and not past expiresAt) counts as verified.
 * Pending / unverified / rejected / revoked never get a Verified label.
 */
export function isCredentialVerified(input: {
  verificationStatus: string;
  expiresAt?: Date | string | null;
  now?: Date;
}): boolean {
  if (input.verificationStatus !== "verified") return false;
  if (input.expiresAt) {
    const exp =
      typeof input.expiresAt === "string"
        ? new Date(input.expiresAt)
        : input.expiresAt;
    if (Number.isFinite(exp.getTime()) && exp.getTime() < (input.now ?? new Date()).getTime()) {
      return false;
    }
  }
  return true;
}

export function credentialVerificationLabel(
  status: string,
  options?: { expiresAt?: Date | string | null; now?: Date },
): string {
  if (
    isCredentialVerified({
      verificationStatus: status,
      expiresAt: options?.expiresAt,
      now: options?.now,
    })
  ) {
    return "Verified";
  }
  switch (status) {
    case "pending_review":
      return "Verification pending";
    case "rejected":
      return "Not verified";
    case "expired":
      return "Expired";
    case "revoked":
      return "Revoked";
    case "verified":
      // verified status but past expiresAt
      return "Expired";
    default:
      return "Unverified";
  }
}

export function toPublicCredentialView(input: {
  id: string;
  title: string;
  issuer: string | null;
  yearEarned: number | null;
  verificationStatus: string;
  expiresAt?: Date | string | null;
  now?: Date;
}): PublicCredentialView {
  const status = (
    CREDENTIAL_VERIFICATION_STATUSES as readonly string[]
  ).includes(input.verificationStatus)
    ? (input.verificationStatus as CredentialVerificationStatus)
    : "unverified";
  const isVerified = isCredentialVerified({
    verificationStatus: status,
    expiresAt: input.expiresAt,
    now: input.now,
  });
  return {
    id: input.id,
    title: input.title,
    issuer: input.issuer,
    yearEarned: input.yearEarned,
    isVerified,
    verificationLabel: credentialVerificationLabel(status, {
      expiresAt: input.expiresAt,
      now: input.now,
    }),
    verificationStatus: status,
  };
}

export function isPublishedListing(status: string): boolean {
  return status === "published";
}

/** Listing may go public only when status is published — drafts never appear in browse. */
export function canAppearInMarketplaceBrowse(listingStatus: string): boolean {
  return isPublishedListing(listingStatus);
}

export function matchesSportFilter(
  specializations: string[],
  sport: string | null | undefined,
): boolean {
  if (!sport?.trim()) return true;
  const needle = sport.trim().toLowerCase();
  return specializations.some((s) => s.toLowerCase().includes(needle));
}

export function serializeStringArray(values: string[]): string {
  return JSON.stringify(
    values.map((v) => v.trim()).filter((v) => v.length > 0),
  );
}

export function serializePricing(pricing: MarketplacePricing): string {
  return JSON.stringify(pricing);
}

export function serializeAvailability(
  availability: MarketplaceAvailability,
): string {
  return JSON.stringify(availability);
}

export function canCreateInquiry(input: {
  listingStatus: string;
  message: string;
}): { ok: true } | { ok: false; reason: string } {
  if (!isPublishedListing(input.listingStatus)) {
    return { ok: false, reason: "Coach is not published on the marketplace." };
  }
  if (input.message.trim().length < 20) {
    return { ok: false, reason: "Message must be at least 20 characters." };
  }
  return { ok: true };
}

/** Payments are never started from marketplace MVP. */
export const MARKETPLACE_PAYMENTS_DISABLED = true;

