/**
 * Program Marketplace service (Prompt 138).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION,
  PROGRAM_MARKETPLACE_DIFFICULTY_LABELS,
  PROGRAM_MARKETPLACE_ENGINE_VERSION,
  PROGRAM_MARKETPLACE_EQUIPMENT_LABELS,
  PROGRAM_MARKETPLACE_GOAL_LABELS,
  PROGRAM_MARKETPLACE_HONESTY,
  PROGRAM_MARKETPLACE_LISTING_STATUS_LABELS,
  PROGRAM_MARKETPLACE_PLATFORM_COMMISSION_BPS,
  PROGRAM_MARKETPLACE_SPORT_LABELS,
  canAppearInProgramMarketplaceBrowse,
  canRateProgramListing,
  creatorPayoutCents,
  isProgramMarketplaceDifficulty,
  isProgramMarketplaceDurationWeeks,
  isProgramMarketplaceEquipment,
  isProgramMarketplaceGoal,
  isProgramMarketplaceListingStatus,
  isProgramMarketplaceSport,
  platformCommissionCents,
  type ProgramMarketplaceDifficulty,
  type ProgramMarketplaceEquipment,
  type ProgramMarketplaceGoal,
  type ProgramMarketplaceListingStatus,
  type ProgramMarketplaceSport,
} from "@/domain/program-marketplace";
import { prisma } from "@/lib/db";
import { trackProductEventSafe } from "@/services/analytics/track";
import { userHasCreatorCapability } from "@/services/creator-program";

const COPYRIGHT_ATTESTATION_VERSION = "program_marketplace_copyright.v1";

export type ProgramListingCard = {
  id: string;
  title: string;
  preview: string;
  sport: string;
  sportLabel: string;
  goal: string;
  goalLabel: string;
  durationWeeks: number;
  difficulty: string;
  difficultyLabel: string;
  equipment: string[];
  equipmentLabels: string[];
  priceCents: number;
  currency: string;
  listingStatus: string;
  statusLabel: string;
  creatorDisplay: string;
  averageStars: number | null;
  ratingCount: number;
  publishedAt: string | null;
};

export type ProgramMarketplaceBrowseView = {
  listings: ProgramListingCard[];
  showComingSoon: boolean;
  honesty: readonly string[];
  copyrightProtection: readonly string[];
  filters: {
    sport: string | null;
    goal: string | null;
    difficulty: string | null;
  };
};

function parseEquipment(raw: string): ProgramMarketplaceEquipment[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is ProgramMarketplaceEquipment =>
        typeof v === "string" && isProgramMarketplaceEquipment(v),
    );
  } catch {
    return [];
  }
}

function toCard(
  row: {
    id: string;
    title: string;
    preview: string;
    sport: string;
    goal: string;
    durationWeeks: number;
    difficulty: string;
    equipmentJson: string;
    priceCents: number;
    currency: string;
    listingStatus: string;
    publishedAt: Date | null;
    creator: { email: string; creatorPartnership: { displayName: string } | null };
    ratings: { stars: number }[];
  },
): ProgramListingCard {
  const equipment = parseEquipment(row.equipmentJson);
  const ratingCount = row.ratings.length;
  const averageStars =
    ratingCount > 0
      ? Math.round(
          (row.ratings.reduce((s, r) => s + r.stars, 0) / ratingCount) * 10,
        ) / 10
      : null;

  return {
    id: row.id,
    title: row.title,
    preview: row.preview,
    sport: row.sport,
    sportLabel:
      PROGRAM_MARKETPLACE_SPORT_LABELS[row.sport as ProgramMarketplaceSport] ??
      row.sport,
    goal: row.goal,
    goalLabel:
      PROGRAM_MARKETPLACE_GOAL_LABELS[row.goal as ProgramMarketplaceGoal] ??
      row.goal,
    durationWeeks: row.durationWeeks,
    difficulty: row.difficulty,
    difficultyLabel:
      PROGRAM_MARKETPLACE_DIFFICULTY_LABELS[
        row.difficulty as ProgramMarketplaceDifficulty
      ] ?? row.difficulty,
    equipment,
    equipmentLabels: equipment.map(
      (e) => PROGRAM_MARKETPLACE_EQUIPMENT_LABELS[e],
    ),
    priceCents: row.priceCents,
    currency: row.currency,
    listingStatus: row.listingStatus,
    statusLabel:
      PROGRAM_MARKETPLACE_LISTING_STATUS_LABELS[
        row.listingStatus as ProgramMarketplaceListingStatus
      ] ?? row.listingStatus,
    creatorDisplay:
      row.creator.creatorPartnership?.displayName ?? "Creator",
    averageStars,
    ratingCount,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function browseProgramMarketplace(input: {
  sport?: string | null;
  goal?: string | null;
  difficulty?: string | null;
}): Promise<ProgramMarketplaceBrowseView> {
  if (!featureFlags.programMarketplace) {
    return {
      listings: [],
      showComingSoon: true,
      honesty: PROGRAM_MARKETPLACE_HONESTY,
      copyrightProtection: PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION,
      filters: {
        sport: input.sport ?? null,
        goal: input.goal ?? null,
        difficulty: input.difficulty ?? null,
      },
    };
  }

  const where: {
    listingStatus: string;
    sport?: string;
    goal?: string;
    difficulty?: string;
  } = { listingStatus: "published" };

  if (input.sport && isProgramMarketplaceSport(input.sport)) {
    where.sport = input.sport;
  }
  if (input.goal && isProgramMarketplaceGoal(input.goal)) {
    where.goal = input.goal;
  }
  if (input.difficulty && isProgramMarketplaceDifficulty(input.difficulty)) {
    where.difficulty = input.difficulty;
  }

  const rows = await prisma.programMarketplaceListing.findMany({
    where,
    include: {
      creator: {
        select: {
          email: true,
          creatorPartnership: { select: { displayName: true } },
        },
      },
      ratings: { select: { stars: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });

  const listings = rows
    .filter((r) => canAppearInProgramMarketplaceBrowse(r.listingStatus))
    .map(toCard);

  return {
    listings,
    showComingSoon: listings.length === 0,
    honesty: PROGRAM_MARKETPLACE_HONESTY,
    copyrightProtection: PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION,
    filters: {
      sport: where.sport ?? null,
      goal: where.goal ?? null,
      difficulty: where.difficulty ?? null,
    },
  };
}

export async function getProgramMarketplaceListingPreview(input: {
  listingId: string;
  viewerUserId?: string | null;
}): Promise<
  | {
      ok: true;
      listing: ProgramListingCard;
      viewerHasPurchase: boolean;
      canRate: boolean;
      honesty: readonly string[];
      copyrightProtection: readonly string[];
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.programMarketplace) {
    return { ok: false, error: "Program Marketplace is not enabled." };
  }

  const row = await prisma.programMarketplaceListing.findUnique({
    where: { id: input.listingId },
    include: {
      creator: {
        select: {
          email: true,
          creatorPartnership: { select: { displayName: true } },
        },
      },
      ratings: { select: { stars: true } },
    },
  });
  if (!row) return { ok: false, error: "Listing not found." };

  const isOwner = input.viewerUserId === row.creatorUserId;
  if (
    !canAppearInProgramMarketplaceBrowse(row.listingStatus) &&
    !isOwner
  ) {
    return { ok: false, error: "Listing is not publicly available." };
  }

  let viewerHasPurchase = false;
  let canRate = false;
  if (input.viewerUserId) {
    const purchase = await prisma.programMarketplacePurchase.findUnique({
      where: {
        listingId_buyerUserId: {
          listingId: row.id,
          buyerUserId: input.viewerUserId,
        },
      },
      include: { rating: true },
    });
    if (purchase) {
      viewerHasPurchase = purchase.status === "completed";
      canRate = canRateProgramListing({
        purchaseStatus: purchase.status,
        alreadyRated: Boolean(purchase.rating),
      });
    }
  }

  return {
    ok: true,
    listing: toCard(row),
    viewerHasPurchase,
    canRate,
    honesty: PROGRAM_MARKETPLACE_HONESTY,
    copyrightProtection: PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION,
  };
}

export async function submitProgramMarketplaceListing(input: {
  userId: string;
  title: string;
  preview: string;
  sport: string;
  goal: string;
  durationWeeks: number;
  difficulty: string;
  equipment: string[];
  priceCents: number;
  copyrightAttested: boolean;
  programId?: string | null;
}): Promise<
  | { ok: true; listingId: string; message: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.programMarketplace) {
    return { ok: false, error: "Program Marketplace is not enabled." };
  }

  const canPublish = await userHasCreatorCapability({
    userId: input.userId,
    capability: "publish_programs",
  });
  if (!canPublish) {
    return {
      ok: false,
      error:
        "Approved Creator Program capability (publish programs) is required.",
    };
  }

  if (!input.copyrightAttested) {
    return {
      ok: false,
      error: "Copyright attestation is required before review.",
    };
  }

  const title = input.title.trim().slice(0, 120);
  const preview = input.preview.trim().slice(0, 2000);
  if (title.length < 3) return { ok: false, error: "Enter a title." };
  if (preview.length < 20) {
    return { ok: false, error: "Enter a longer preview (min 20 characters)." };
  }
  if (!isProgramMarketplaceSport(input.sport)) {
    return { ok: false, error: "Choose a valid sport." };
  }
  if (!isProgramMarketplaceGoal(input.goal)) {
    return { ok: false, error: "Choose a valid goal." };
  }
  if (!isProgramMarketplaceDifficulty(input.difficulty)) {
    return { ok: false, error: "Choose a valid difficulty." };
  }
  if (!isProgramMarketplaceDurationWeeks(input.durationWeeks)) {
    return { ok: false, error: "Choose a valid duration." };
  }
  const equipment = input.equipment.filter(isProgramMarketplaceEquipment);
  if (equipment.length === 0) {
    return { ok: false, error: "Select at least one equipment profile." };
  }
  if (input.priceCents < 0 || input.priceCents > 500000) {
    return { ok: false, error: "Price is out of range." };
  }

  const row = await prisma.programMarketplaceListing.create({
    data: {
      creatorUserId: input.userId,
      programId: input.programId || null,
      title,
      preview,
      sport: input.sport,
      goal: input.goal,
      durationWeeks: input.durationWeeks,
      difficulty: input.difficulty,
      equipmentJson: JSON.stringify(equipment),
      priceCents: input.priceCents,
      listingStatus: "pending_review",
      copyrightAttestedAt: new Date(),
      copyrightAttestationVersion: COPYRIGHT_ATTESTATION_VERSION,
      engineVersion: PROGRAM_MARKETPLACE_ENGINE_VERSION,
    },
  });

  trackProductEventSafe({
    name: "program_marketplace_submitted",
    props: {
      listingId: row.id,
      sport: input.sport,
      goal: input.goal,
      difficulty: input.difficulty,
    },
    userId: input.userId,
  });

  return {
    ok: true,
    listingId: row.id,
    message:
      "Listing submitted for copyright review. It is not published yet.",
  };
}

export async function listCreatorProgramMarketplaceListings(input: {
  userId: string;
}): Promise<
  | { ok: true; listings: ProgramListingCard[]; canPublish: boolean }
  | { ok: false; error: string }
> {
  if (!featureFlags.programMarketplace) {
    return { ok: false, error: "Program Marketplace is not enabled." };
  }

  const canPublish = await userHasCreatorCapability({
    userId: input.userId,
    capability: "publish_programs",
  });

  const rows = await prisma.programMarketplaceListing.findMany({
    where: { creatorUserId: input.userId },
    include: {
      creator: {
        select: {
          email: true,
          creatorPartnership: { select: { displayName: true } },
        },
      },
      ratings: { select: { stars: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    ok: true,
    listings: rows.map(toCard),
    canPublish,
  };
}

export async function reviewProgramMarketplaceListing(input: {
  listingId: string;
  actorUserId: string;
  toStatus: "published" | "rejected" | "suspended";
  reviewNote?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.programMarketplace) {
    return { ok: false, error: "Program Marketplace is not enabled." };
  }
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) {
    return { ok: false, error: "Only staff can review listings." };
  }

  const row = await prisma.programMarketplaceListing.findUnique({
    where: { id: input.listingId },
  });
  if (!row) return { ok: false, error: "Listing not found." };
  if (!row.copyrightAttestedAt && input.toStatus === "published") {
    return {
      ok: false,
      error: "Cannot publish without copyright attestation.",
    };
  }

  const now = new Date();
  await prisma.programMarketplaceListing.update({
    where: { id: row.id },
    data: {
      listingStatus: input.toStatus,
      reviewedByUserId: input.actorUserId,
      reviewedAt: now,
      reviewNote: input.reviewNote?.trim().slice(0, 500) || null,
      publishedAt: input.toStatus === "published" ? now : row.publishedAt,
    },
  });

  trackProductEventSafe({
    name: "program_marketplace_reviewed",
    props: {
      listingId: row.id,
      toStatus: input.toStatus,
    },
    userId: input.actorUserId,
  });

  if (input.toStatus === "published") {
    trackProductEventSafe({
      name: "program_marketplace_published",
      props: { listingId: row.id },
      userId: row.creatorUserId,
    });
  }

  return { ok: true };
}

export async function listProgramMarketplaceForStaff(input: {
  actorUserId: string;
}): Promise<
  | { ok: true; listings: ProgramListingCard[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.programMarketplace) {
    return { ok: false, error: "Program Marketplace is not enabled." };
  }
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) return { ok: false, error: "Staff only." };

  const rows = await prisma.programMarketplaceListing.findMany({
    where: {
      listingStatus: { in: ["pending_review", "published", "suspended"] },
    },
    include: {
      creator: {
        select: {
          email: true,
          creatorPartnership: { select: { displayName: true } },
        },
      },
      ratings: { select: { stars: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return { ok: true, listings: rows.map(toCard) };
}

/**
 * Record a verified purchase (architecture stub for checkout).
 * Ledgers platform commission. Enables ratings when status=completed.
 */
export async function recordProgramMarketplacePurchase(input: {
  listingId: string;
  buyerUserId: string;
  externalRef?: string | null;
}): Promise<
  | { ok: true; purchaseId: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.programMarketplace) {
    return { ok: false, error: "Program Marketplace is not enabled." };
  }

  const listing = await prisma.programMarketplaceListing.findUnique({
    where: { id: input.listingId },
  });
  if (!listing || listing.listingStatus !== "published") {
    return { ok: false, error: "Listing is not available for purchase." };
  }
  if (listing.creatorUserId === input.buyerUserId) {
    return { ok: false, error: "Creators cannot purchase their own listing." };
  }

  const existing = await prisma.programMarketplacePurchase.findUnique({
    where: {
      listingId_buyerUserId: {
        listingId: listing.id,
        buyerUserId: input.buyerUserId,
      },
    },
  });
  if (existing) {
    return { ok: true, purchaseId: existing.id };
  }

  const platformCents = platformCommissionCents(listing.priceCents);
  const creatorCents = creatorPayoutCents(listing.priceCents);

  const purchase = await prisma.programMarketplacePurchase.create({
    data: {
      listingId: listing.id,
      buyerUserId: input.buyerUserId,
      status: "completed",
      priceCents: listing.priceCents,
      currency: listing.currency,
      externalRef: input.externalRef ?? null,
    },
  });

  const idempotencyKey = `pm_commission:${purchase.id}`;
  await prisma.programMarketplaceCommission.upsert({
    where: { idempotencyKey },
    create: {
      listingId: listing.id,
      purchaseId: purchase.id,
      platformCents,
      creatorCents,
      currency: listing.currency,
      status: "pending",
      idempotencyKey,
    },
    update: {},
  });

  trackProductEventSafe({
    name: "program_marketplace_purchased",
    props: {
      listingId: listing.id,
      purchaseId: purchase.id,
      priceCents: listing.priceCents,
    },
    userId: input.buyerUserId,
  });

  trackProductEventSafe({
    name: "program_marketplace_commission_ledgered",
    props: {
      listingId: listing.id,
      purchaseId: purchase.id,
      platformCents,
      commissionStatus: "pending",
      commissionBps: PROGRAM_MARKETPLACE_PLATFORM_COMMISSION_BPS,
    },
    userId: listing.creatorUserId,
  });

  return { ok: true, purchaseId: purchase.id };
}

export async function rateProgramMarketplaceListing(input: {
  listingId: string;
  buyerUserId: string;
  stars: number;
  comment?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.programMarketplace) {
    return { ok: false, error: "Program Marketplace is not enabled." };
  }
  if (input.stars < 1 || input.stars > 5 || !Number.isInteger(input.stars)) {
    return { ok: false, error: "Stars must be an integer from 1 to 5." };
  }

  const purchase = await prisma.programMarketplacePurchase.findUnique({
    where: {
      listingId_buyerUserId: {
        listingId: input.listingId,
        buyerUserId: input.buyerUserId,
      },
    },
    include: { rating: true },
  });
  if (!purchase) {
    return {
      ok: false,
      error: "Only verified purchasers can rate this program.",
    };
  }
  if (
    !canRateProgramListing({
      purchaseStatus: purchase.status,
      alreadyRated: Boolean(purchase.rating),
    })
  ) {
    return {
      ok: false,
      error: "Rating is not allowed for this purchase status.",
    };
  }

  await prisma.programMarketplaceRating.create({
    data: {
      listingId: input.listingId,
      purchaseId: purchase.id,
      buyerUserId: input.buyerUserId,
      stars: input.stars,
      comment: input.comment?.trim().slice(0, 500) || null,
    },
  });

  trackProductEventSafe({
    name: "program_marketplace_rated",
    props: {
      listingId: input.listingId,
      purchaseId: purchase.id,
      stars: input.stars,
    },
    userId: input.buyerUserId,
  });

  return { ok: true };
}
