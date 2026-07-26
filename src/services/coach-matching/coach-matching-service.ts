import { featureFlags } from "@/config/feature-flags";
import {
  buildMatchExplanation,
  COACH_MATCHING_HONESTY,
  rankOrganicMatches,
  rankSponsoredMatches,
  type CoachMatchCandidate,
  type CoachMatchPreferences,
  type CoachMatchResult,
} from "@/domain/coach-matching";
import {
  parsePricing,
  parseStringArray,
} from "@/domain/marketplace";
import { prisma } from "@/lib/db";

export type CoachMatchPageView = {
  honesty: readonly string[];
  preferences: CoachMatchPreferences | null;
  organic: Array<CoachMatchResult & { explanation: string }>;
  sponsored: Array<CoachMatchResult & { explanation: string }>;
  empty: boolean;
};

function toCandidate(p: {
  id: string;
  slug: string;
  displayName: string;
  bio: string | null;
  specializationsJson: string;
  languagesJson: string;
  goalTagsJson: string;
  experienceLevelsJson: string;
  coachingStylesJson: string;
  timezone: string | null;
  locationLabel: string | null;
  pricingJson: string;
  availabilityStatus: string;
  sponsoredPlacement: boolean;
}): CoachMatchCandidate {
  const pricing = parsePricing(p.pricingJson);
  return {
    id: p.id,
    slug: p.slug,
    displayName: p.displayName,
    bio: p.bio,
    specializations: parseStringArray(p.specializationsJson),
    languages: parseStringArray(p.languagesJson),
    goalTags: parseStringArray(p.goalTagsJson),
    experienceLevels: parseStringArray(p.experienceLevelsJson),
    coachingStyles: parseStringArray(p.coachingStylesJson),
    timezone: p.timezone,
    locationLabel: p.locationLabel,
    priceMajor:
      pricing.amountCents != null
        ? Math.round(pricing.amountCents / 100)
        : null,
    availabilityStatus: p.availabilityStatus,
    isSponsored: p.sponsoredPlacement === true,
  };
}

export function parseMatchPreferences(
  input: Record<string, string | undefined>,
): CoachMatchPreferences {
  const budgetRaw = input.budgetMax?.trim();
  const budgetMax = budgetRaw ? Number(budgetRaw) : null;
  return {
    goal: input.goal?.trim() || "general_fitness",
    sport: input.sport?.trim() || "general",
    experience: input.experience?.trim() || "intermediate",
    budgetMax:
      budgetMax != null && Number.isFinite(budgetMax) && budgetMax > 0
        ? budgetMax
        : null,
    language: input.language?.trim() || "",
    locationOrTimezone: input.locationOrTimezone?.trim() || "",
    coachingStyle: input.coachingStyle?.trim() || "async_programming",
  };
}

/**
 * Match published coaches. Never invents coaches.
 * Organic rank ignores sponsoredPlacement; sponsored list is labeled separately.
 */
export async function matchCoaches(
  preferences: CoachMatchPreferences,
): Promise<CoachMatchPageView> {
  if (!featureFlags.coachMatching) {
    return {
      honesty: COACH_MATCHING_HONESTY,
      preferences,
      organic: [],
      sponsored: [],
      empty: true,
    };
  }

  const profiles = await prisma.coachMarketplaceProfile.findMany({
    where: { listingStatus: "published" },
    take: 100,
    orderBy: { publishedAt: "desc" },
  });

  const candidates = profiles.map(toCandidate);
  const organic = rankOrganicMatches(preferences, candidates, 5).map((r) => ({
    ...r,
    explanation: buildMatchExplanation(r),
  }));
  const sponsored = rankSponsoredMatches(preferences, candidates, 3).map(
    (r) => ({
      ...r,
      explanation: buildMatchExplanation(r),
    }),
  );

  return {
    honesty: COACH_MATCHING_HONESTY,
    preferences,
    organic,
    sponsored,
    empty: organic.length === 0 && sponsored.length === 0,
  };
}
