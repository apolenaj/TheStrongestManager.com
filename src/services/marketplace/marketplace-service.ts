import { featureFlags } from "@/config/feature-flags";
import {
  MARKETPLACE_FUTURE_CAPABILITIES,
  MARKETPLACE_HONESTY,
  MARKETPLACE_PAYMENTS_DISABLED,
  canAppearInMarketplaceBrowse,
  canCreateInquiry,
  matchesSportFilter,
  parseAvailability,
  parsePricing,
  parseStringArray,
  serializeAvailability,
  serializePricing,
  serializeStringArray,
  toPublicCredentialView,
  type MarketplaceAvailability,
  type MarketplaceAvailabilityStatus,
  type MarketplacePricing,
  type PublicCoachListingCard,
} from "@/domain/marketplace";
import { prisma } from "@/lib/db";
import { slugifyExpert } from "@/domain/expert-contributor";

export type MarketplacePublicState = {
  flagEnabled: boolean;
  publishedCount: number;
  /** True when browse UI should show Coming soon / empty — not a fake catalog. */
  showComingSoon: boolean;
  honesty: readonly string[];
  futureCapabilities: readonly string[];
  paymentsDisabled: boolean;
  sportFilter: string | null;
  listings: PublicCoachListingCard[];
};

function mapListingCard(p: {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  specializationsJson: string;
  languagesJson: string;
  experienceSummary: string | null;
  availabilityStatus: string;
  pricingJson: string;
  credentials: Array<{
    id: string;
    title: string;
    issuer: string | null;
    yearEarned: number | null;
    verificationStatus: string;
    expiresAt: Date | null;
  }>;
  reviews: Array<{ rating: number | null }>;
}): PublicCoachListingCard {
  const credentialViews = p.credentials.map((c) =>
    toPublicCredentialView({
      id: c.id,
      title: c.title,
      issuer: c.issuer,
      yearEarned: c.yearEarned,
      verificationStatus: c.verificationStatus,
      expiresAt: c.expiresAt,
    }),
  );
  const ratings = p.reviews
    .map((r) => r.rating)
    .filter((r): r is number => typeof r === "number");
  const averageRating =
    ratings.length > 0
      ? Math.round(
          (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
        ) / 10
      : null;

  return {
    id: p.id,
    slug: p.slug,
    displayName: p.displayName,
    bio: p.bio,
    specializations: parseStringArray(p.specializationsJson),
    languages: parseStringArray(p.languagesJson),
    experienceSummary: p.experienceSummary,
    availabilityStatus: (["closed", "limited", "open"] as const).includes(
      p.availabilityStatus as MarketplaceAvailabilityStatus,
    )
      ? (p.availabilityStatus as MarketplaceAvailabilityStatus)
      : "closed",
    pricing: parsePricing(p.pricingJson),
    verifiedCredentialCount: credentialViews.filter((c) => c.isVerified).length,
    credentialCount: credentialViews.length,
    reviewCount: p.reviews.length,
    averageRating,
  };
}

/**
 * Public marketplace browse state.
 * Never invents coaches. Flag off or zero published → coming soon / empty.
 */
export async function getMarketplacePublicState(
  sportFilter?: string | null,
): Promise<MarketplacePublicState> {
  const flagEnabled = featureFlags.coachMarketplace;
  const sport = sportFilter?.trim() || null;

  if (!flagEnabled) {
    return {
      flagEnabled: false,
      publishedCount: 0,
      showComingSoon: true,
      honesty: MARKETPLACE_HONESTY,
      futureCapabilities: [...MARKETPLACE_FUTURE_CAPABILITIES],
      paymentsDisabled: MARKETPLACE_PAYMENTS_DISABLED,
      sportFilter: sport,
      listings: [],
    };
  }

  const profiles = await prisma.coachMarketplaceProfile.findMany({
    where: { listingStatus: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: {
      credentials: {
        select: {
          id: true,
          title: true,
          issuer: true,
          yearEarned: true,
          verificationStatus: true,
          expiresAt: true,
        },
      },
      reviews: {
        where: { status: "published" },
        select: { rating: true },
      },
    },
  });

  const listings: PublicCoachListingCard[] = profiles
    .filter((p) => canAppearInMarketplaceBrowse(p.listingStatus))
    .map(mapListingCard)
    .filter((card) => matchesSportFilter(card.specializations, sport));

  return {
    flagEnabled: true,
    publishedCount: listings.length,
    showComingSoon: listings.length === 0 && !sport,
    honesty: MARKETPLACE_HONESTY,
    futureCapabilities: [...MARKETPLACE_FUTURE_CAPABILITIES],
    paymentsDisabled: MARKETPLACE_PAYMENTS_DISABLED,
    sportFilter: sport,
    listings,
  };
}

export type PublicCoachDetail = NonNullable<
  Awaited<ReturnType<typeof getPublishedCoachListingBySlug>>
>;

/** Detail fetch — only published profiles; drafts never leak publicly. */
export async function getPublishedCoachListingBySlug(slug: string) {
  if (!featureFlags.coachMarketplace) return null;

  const profile = await prisma.coachMarketplaceProfile.findFirst({
    where: { slug, listingStatus: "published" },
    include: {
      credentials: true,
      reviews: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 20,
      },
    },
  });
  if (!profile) return null;

  return {
    id: profile.id,
    slug: profile.slug,
    displayName: profile.displayName,
    bio: profile.bio,
    experienceSummary: profile.experienceSummary,
    availabilityStatus: profile.availabilityStatus,
    availability: parseAvailability(profile.availabilityJson),
    specializations: parseStringArray(profile.specializationsJson),
    languages: parseStringArray(profile.languagesJson),
    pricing: parsePricing(profile.pricingJson),
    credentials: profile.credentials.map((c) =>
      toPublicCredentialView({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        yearEarned: c.yearEarned,
        verificationStatus: c.verificationStatus,
        expiresAt: c.expiresAt,
      }),
    ),
    paymentsDisabled: MARKETPLACE_PAYMENTS_DISABLED,
    honesty: MARKETPLACE_HONESTY,
  };
}

export async function createMarketplaceInquiry(input: {
  slug: string;
  message: string;
  athleteUserId?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!featureFlags.coachMarketplace) {
    return { ok: false, error: "Marketplace is not available." };
  }

  const profile = await prisma.coachMarketplaceProfile.findFirst({
    where: { slug: input.slug },
    select: { id: true, listingStatus: true },
  });
  if (!profile) return { ok: false, error: "Coach not found." };

  const gate = canCreateInquiry({
    listingStatus: profile.listingStatus,
    message: input.message,
  });
  if (!gate.ok) return { ok: false, error: gate.reason };

  const row = await prisma.coachMarketplaceInquiry.create({
    data: {
      profileId: profile.id,
      athleteUserId: input.athleteUserId ?? null,
      message: input.message.trim(),
      status: "open",
    },
  });
  return { ok: true, id: row.id };
}

export type CoachMarketplaceWorkspace = {
  honesty: readonly string[];
  paymentsDisabled: boolean;
  profile: {
    id: string;
    slug: string;
    displayName: string;
    bio: string | null;
    specializations: string[];
    languages: string[];
    experienceSummary: string | null;
    goalTags: string[];
    experienceLevels: string[];
    coachingStyles: string[];
    timezone: string;
    locationLabel: string;
    sponsoredPlacement: boolean;
    availabilityStatus: string;
    availabilityNotes: string;
    pricingLabel: string;
    pricingAmount: string;
    pricingCurrency: string;
    pricingPeriod: string;
    listingStatus: string;
    publishedAt: string | null;
  } | null;
  inquiries: Array<{
    id: string;
    message: string | null;
    status: string;
    createdAt: string;
    athleteUserId: string | null;
  }>;
};

export async function getCoachMarketplaceWorkspace(
  userId: string,
): Promise<CoachMarketplaceWorkspace> {
  const profile = await prisma.coachMarketplaceProfile.findUnique({
    where: { userId },
    include: {
      inquiries: {
        orderBy: { createdAt: "desc" },
        take: 40,
      },
    },
  });

  const pricing = profile ? parsePricing(profile.pricingJson) : {};
  const availability = profile
    ? parseAvailability(profile.availabilityJson)
    : {};

  return {
    honesty: MARKETPLACE_HONESTY,
    paymentsDisabled: MARKETPLACE_PAYMENTS_DISABLED,
    profile: profile
      ? {
          id: profile.id,
          slug: profile.slug,
          displayName: profile.displayName,
          bio: profile.bio,
          specializations: parseStringArray(profile.specializationsJson),
          languages: parseStringArray(profile.languagesJson),
          experienceSummary: profile.experienceSummary,
          goalTags: parseStringArray(profile.goalTagsJson),
          experienceLevels: parseStringArray(profile.experienceLevelsJson),
          coachingStyles: parseStringArray(profile.coachingStylesJson),
          timezone: profile.timezone ?? "",
          locationLabel: profile.locationLabel ?? "",
          sponsoredPlacement: profile.sponsoredPlacement,
          availabilityStatus: profile.availabilityStatus,
          availabilityNotes: availability.notes ?? "",
          pricingLabel: pricing.label ?? "",
          pricingAmount:
            pricing.amountCents != null
              ? String(pricing.amountCents / 100)
              : "",
          pricingCurrency: pricing.currency ?? "USD",
          pricingPeriod: pricing.billingPeriod ?? "session",
          listingStatus: profile.listingStatus,
          publishedAt: profile.publishedAt?.toISOString() ?? null,
        }
      : null,
    inquiries:
      profile?.inquiries.map((i) => ({
        id: i.id,
        message: i.message,
        status: i.status,
        createdAt: i.createdAt.toISOString(),
        athleteUserId: i.athleteUserId,
      })) ?? [],
  };
}

export type UpsertCoachListingInput = {
  displayName: string;
  slug?: string | null;
  bio?: string | null;
  specializations: string[];
  languages: string[];
  experienceSummary?: string | null;
  goalTags: string[];
  experienceLevels: string[];
  coachingStyles: string[];
  timezone?: string | null;
  locationLabel?: string | null;
  /** Staff/ops may set; coaches typically leave false. Never boosts organic match. */
  sponsoredPlacement?: boolean;
  availabilityStatus: MarketplaceAvailabilityStatus;
  availabilityNotes?: string | null;
  pricing: MarketplacePricing;
  publish: boolean;
};

export async function upsertCoachMarketplaceListing(
  userId: string,
  input: UpsertCoachListingInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isCoach: true },
  });
  if (!user?.isCoach) {
    return { ok: false, error: "Coach Mode is required to manage a listing." };
  }

  const displayName = input.displayName.trim();
  if (displayName.length < 2) {
    return { ok: false, error: "Display name is required." };
  }

  const existing = await prisma.coachMarketplaceProfile.findUnique({
    where: { userId },
  });

  let slug =
    input.slug?.trim() ||
    existing?.slug ||
    slugifyExpert(displayName) ||
    `coach-${userId.slice(-6)}`;
  slug = slugifyExpert(slug) || slug;

  const clash = await prisma.coachMarketplaceProfile.findFirst({
    where: {
      slug,
      NOT: existing ? { id: existing.id } : undefined,
    },
    select: { id: true },
  });
  if (clash) {
    slug = `${slug}-${userId.slice(-4).toLowerCase()}`;
  }

  const availability: MarketplaceAvailability = {
    notes: input.availabilityNotes?.trim() || undefined,
  };
  const listingStatus = input.publish ? "published" : "draft";

  const data = {
    displayName,
    slug,
    bio: input.bio?.trim() || null,
    specializationsJson: serializeStringArray(input.specializations),
    languagesJson: serializeStringArray(input.languages),
    experienceSummary: input.experienceSummary?.trim() || null,
    goalTagsJson: serializeStringArray(input.goalTags),
    experienceLevelsJson: serializeStringArray(input.experienceLevels),
    coachingStylesJson: serializeStringArray(input.coachingStyles),
    timezone: input.timezone?.trim() || null,
    locationLabel: input.locationLabel?.trim() || null,
    sponsoredPlacement: input.sponsoredPlacement === true,
    availabilityStatus: input.availabilityStatus,
    availabilityJson: serializeAvailability(availability),
    pricingJson: serializePricing(input.pricing),
    listingStatus,
    publishedAt: input.publish
      ? existing?.publishedAt ?? new Date()
      : existing?.publishedAt ?? null,
  };

  if (existing) {
    await prisma.coachMarketplaceProfile.update({
      where: { id: existing.id },
      data: {
        ...data,
        publishedAt: input.publish
          ? existing.publishedAt ?? new Date()
          : null,
        suspendedAt: null,
      },
    });
  } else {
    await prisma.coachMarketplaceProfile.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  return { ok: true, slug };
}

export async function closeMarketplaceInquiry(
  coachUserId: string,
  inquiryId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.coachMarketplaceProfile.findUnique({
    where: { userId: coachUserId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No marketplace profile." };

  const inquiry = await prisma.coachMarketplaceInquiry.findFirst({
    where: { id: inquiryId, profileId: profile.id },
  });
  if (!inquiry) return { ok: false, error: "Inquiry not found." };

  await prisma.coachMarketplaceInquiry.update({
    where: { id: inquiry.id },
    data: { status: "closed", closedAt: new Date() },
  });
  return { ok: true };
}
