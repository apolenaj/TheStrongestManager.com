/**
 * Program Marketplace (Prompt 138).
 * Training program listings — ratings only from verified purchasers.
 * Copyright attestation + review hold. Platform commission ledger (not fake payouts).
 */

export const PROGRAM_MARKETPLACE_ENGINE_VERSION =
  "program_marketplace.v1" as const;

export const PROGRAM_MARKETPLACE_HONESTY = [
  "The program marketplace does not invent listings — empty catalogs stay empty until creators publish real programs.",
  "Ratings appear only from verified purchasers — never from guests or unpaid accounts.",
  "Platform commission is ledgered as an estimate — not a guaranteed bank payout.",
  "Submitting a listing does not mean it is live; copyright review may hold or reject it.",
] as const;

export const PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION = [
  "You may only list programs you created or have rights to distribute.",
  "Unauthorized uploads of copyrighted commercial programs are prohibited and may be rejected or suspended.",
  "Attestation is required before staff review. False attestation can lead to permanent suspension.",
] as const;

export const PROGRAM_MARKETPLACE_LISTING_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "suspended",
  "archived",
] as const;

export type ProgramMarketplaceListingStatus =
  (typeof PROGRAM_MARKETPLACE_LISTING_STATUSES)[number];

export const PROGRAM_MARKETPLACE_LISTING_STATUS_LABELS: Record<
  ProgramMarketplaceListingStatus,
  string
> = {
  draft: "Draft",
  pending_review: "Pending copyright review",
  published: "Published",
  rejected: "Rejected",
  suspended: "Suspended",
  archived: "Archived",
};

export const PROGRAM_MARKETPLACE_SPORTS = [
  "powerlifting",
  "bodybuilding",
  "strongman",
  "weightlifting",
  "technique",
  "general",
] as const;

export type ProgramMarketplaceSport =
  (typeof PROGRAM_MARKETPLACE_SPORTS)[number];

export const PROGRAM_MARKETPLACE_SPORT_LABELS: Record<
  ProgramMarketplaceSport,
  string
> = {
  powerlifting: "Powerlifting",
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  weightlifting: "Weightlifting",
  technique: "Technique",
  general: "General strength",
};

export const PROGRAM_MARKETPLACE_GOALS = [
  "strength",
  "hypertrophy",
  "competition_prep",
  "technique",
  "general_fitness",
  "weight_management",
] as const;

export type ProgramMarketplaceGoal = (typeof PROGRAM_MARKETPLACE_GOALS)[number];

export const PROGRAM_MARKETPLACE_GOAL_LABELS: Record<
  ProgramMarketplaceGoal,
  string
> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  competition_prep: "Competition prep",
  technique: "Technique",
  general_fitness: "General fitness",
  weight_management: "Weight management",
};

export const PROGRAM_MARKETPLACE_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type ProgramMarketplaceDifficulty =
  (typeof PROGRAM_MARKETPLACE_DIFFICULTIES)[number];

export const PROGRAM_MARKETPLACE_DIFFICULTY_LABELS: Record<
  ProgramMarketplaceDifficulty,
  string
> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const PROGRAM_MARKETPLACE_EQUIPMENT = [
  "commercial_gym",
  "home_gym",
  "powerlifting_gym",
  "minimal",
  "bodyweight_only",
] as const;

export type ProgramMarketplaceEquipment =
  (typeof PROGRAM_MARKETPLACE_EQUIPMENT)[number];

export const PROGRAM_MARKETPLACE_EQUIPMENT_LABELS: Record<
  ProgramMarketplaceEquipment,
  string
> = {
  commercial_gym: "Commercial gym",
  home_gym: "Home gym",
  powerlifting_gym: "Powerlifting gym",
  minimal: "Minimal equipment",
  bodyweight_only: "Bodyweight only",
};

/** Allowed duration bands (weeks). */
export const PROGRAM_MARKETPLACE_DURATIONS_WEEKS = [
  4, 6, 8, 10, 12, 16, 20, 24,
] as const;

export type ProgramMarketplaceDurationWeeks =
  (typeof PROGRAM_MARKETPLACE_DURATIONS_WEEKS)[number];

/** Platform take rate in basis points (e.g. 1500 = 15%). Ledger only. */
export const PROGRAM_MARKETPLACE_PLATFORM_COMMISSION_BPS = 1500 as const;

export const PROGRAM_MARKETPLACE_COMMISSION_STATUSES = [
  "pending",
  "accrued",
  "voided",
  "paid_external",
] as const;

export type ProgramMarketplaceCommissionStatus =
  (typeof PROGRAM_MARKETPLACE_COMMISSION_STATUSES)[number];

export const PROGRAM_MARKETPLACE_PURCHASE_STATUSES = [
  "completed",
  "refunded",
  "voided",
] as const;

export type ProgramMarketplacePurchaseStatus =
  (typeof PROGRAM_MARKETPLACE_PURCHASE_STATUSES)[number];

export function isProgramMarketplaceListingStatus(
  value: string,
): value is ProgramMarketplaceListingStatus {
  return (PROGRAM_MARKETPLACE_LISTING_STATUSES as readonly string[]).includes(
    value,
  );
}

export function isProgramMarketplaceSport(
  value: string,
): value is ProgramMarketplaceSport {
  return (PROGRAM_MARKETPLACE_SPORTS as readonly string[]).includes(value);
}

export function isProgramMarketplaceGoal(
  value: string,
): value is ProgramMarketplaceGoal {
  return (PROGRAM_MARKETPLACE_GOALS as readonly string[]).includes(value);
}

export function isProgramMarketplaceDifficulty(
  value: string,
): value is ProgramMarketplaceDifficulty {
  return (PROGRAM_MARKETPLACE_DIFFICULTIES as readonly string[]).includes(
    value,
  );
}

export function isProgramMarketplaceEquipment(
  value: string,
): value is ProgramMarketplaceEquipment {
  return (PROGRAM_MARKETPLACE_EQUIPMENT as readonly string[]).includes(value);
}

export function isProgramMarketplaceDurationWeeks(
  value: number,
): value is ProgramMarketplaceDurationWeeks {
  return (PROGRAM_MARKETPLACE_DURATIONS_WEEKS as readonly number[]).includes(
    value,
  );
}

/** Public browse — only published listings. */
export function canAppearInProgramMarketplaceBrowse(
  status: string,
): boolean {
  return status === "published";
}

/**
 * Ratings only from verified purchasers.
 * Purchase must be completed; refunded/voided cannot rate.
 */
export function canRateProgramListing(input: {
  purchaseStatus: string;
  alreadyRated: boolean;
}): boolean {
  return input.purchaseStatus === "completed" && !input.alreadyRated;
}

/** Platform commission amount from sale price (cents). */
export function platformCommissionCents(
  priceCents: number,
  bps: number = PROGRAM_MARKETPLACE_PLATFORM_COMMISSION_BPS,
): number {
  if (priceCents <= 0 || bps <= 0) return 0;
  return Math.floor((priceCents * bps) / 10000);
}

export function creatorPayoutCents(
  priceCents: number,
  bps: number = PROGRAM_MARKETPLACE_PLATFORM_COMMISSION_BPS,
): number {
  return Math.max(0, priceCents - platformCommissionCents(priceCents, bps));
}
