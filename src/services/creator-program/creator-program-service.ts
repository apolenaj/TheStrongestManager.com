/**
 * Creator Program service (Prompt 137).
 * Apply → staff approve. Capabilities unlock only when approved.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  CREATOR_CAPABILITIES,
  CREATOR_CAPABILITY_DESCRIPTIONS,
  CREATOR_CAPABILITY_HREFS,
  CREATOR_CAPABILITY_LABELS,
  CREATOR_CAPABILITY_SECONDARY_HREFS,
  CREATOR_ENGINE_VERSION,
  CREATOR_HONESTY,
  CREATOR_NO_PARTNERSHIP_PROMISE,
  CREATOR_PARTNERSHIP_STATUS_LABELS,
  creatorRoleLabel,
  hasCreatorCapability,
  isCreatorCapability,
  isCreatorPartnershipStatus,
  resolveCreatorCapabilities,
  type CreatorCapability,
  type CreatorPartnershipStatus,
} from "@/domain/creator-program";
import { prisma } from "@/lib/db";
import { trackProductEventSafe } from "@/services/analytics/track";

export type CreatorCapabilityView = {
  id: CreatorCapability;
  label: string;
  description: string;
  unlocked: boolean;
  href: string | null;
  secondaryHref: string | null;
};

export type CreatorProgramView = {
  application: null | {
    id: string;
    displayName: string;
    handle: string | null;
    status: CreatorPartnershipStatus;
    statusLabel: string;
    roleLabel: string;
    appliedAt: string;
    reviewedAt: string | null;
    requestedCapabilities: CreatorCapability[];
  };
  /** Live capabilities — empty unless approved. */
  capabilities: CreatorCapabilityView[];
  /** Catalog always shown for architecture transparency. */
  capabilityCatalog: CreatorCapabilityView[];
  isApprovedPartner: boolean;
  honesty: readonly string[];
  noPartnershipPromise: string;
};

function parseRequestedCapabilities(raw: string): CreatorCapability[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...CREATOR_CAPABILITIES];
    return parsed.filter((v): v is CreatorCapability =>
      typeof v === "string" ? isCreatorCapability(v) : false,
    );
  } catch {
    return [...CREATOR_CAPABILITIES];
  }
}

function capabilityViews(
  status: CreatorPartnershipStatus | "none",
): CreatorCapabilityView[] {
  const unlockedSet = new Set(
    status === "none" ? [] : resolveCreatorCapabilities(status),
  );
  return CREATOR_CAPABILITIES.map((id) => ({
    id,
    label: CREATOR_CAPABILITY_LABELS[id],
    description: CREATOR_CAPABILITY_DESCRIPTIONS[id],
    unlocked: unlockedSet.has(id),
    href: unlockedSet.has(id) ? CREATOR_CAPABILITY_HREFS[id] : null,
    secondaryHref: unlockedSet.has(id)
      ? (CREATOR_CAPABILITY_SECONDARY_HREFS[id] ?? null)
      : null,
  }));
}

export async function applyToCreatorProgram(input: {
  userId: string;
  displayName: string;
  handle?: string | null;
  notes?: string | null;
  requestedCapabilities?: string[];
}): Promise<
  | { ok: true; partnershipId: string; message: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.creatorProgram) {
    return { ok: false, error: "Creator Program is not enabled." };
  }

  const displayName = input.displayName.trim().slice(0, 80);
  if (displayName.length < 2) {
    return { ok: false, error: "Enter a display name." };
  }

  const existing = await prisma.creatorPartnership.findUnique({
    where: { userId: input.userId },
  });
  if (existing) {
    return {
      ok: false,
      error: "You already have a Creator Program application.",
    };
  }

  const requested =
    input.requestedCapabilities && input.requestedCapabilities.length > 0
      ? input.requestedCapabilities.filter(isCreatorCapability)
      : [...CREATOR_CAPABILITIES];

  if (requested.length === 0) {
    return { ok: false, error: "Select at least one capability." };
  }

  const handle = input.handle?.trim().slice(0, 48) || null;
  const notes = input.notes?.trim().slice(0, 2000) || null;

  const row = await prisma.creatorPartnership.create({
    data: {
      userId: input.userId,
      displayName,
      handle,
      status: "pending",
      requestedCapabilitiesJson: JSON.stringify(requested),
      notes,
      engineVersion: CREATOR_ENGINE_VERSION,
    },
  });

  trackProductEventSafe({
    name: "creator_program_applied",
    props: {
      partnershipId: row.id,
      capabilityCount: requested.length,
    },
    userId: input.userId,
  });

  return {
    ok: true,
    partnershipId: row.id,
    message: CREATOR_NO_PARTNERSHIP_PROMISE,
  };
}

export async function getCreatorProgramView(input: {
  userId: string;
}): Promise<
  | { ok: true; view: CreatorProgramView }
  | { ok: false; error: string }
> {
  if (!featureFlags.creatorProgram) {
    return { ok: false, error: "Creator Program is not enabled." };
  }

  const row = await prisma.creatorPartnership.findUnique({
    where: { userId: input.userId },
  });

  if (!row || !isCreatorPartnershipStatus(row.status)) {
    return {
      ok: true,
      view: {
        application: null,
        capabilities: capabilityViews("none"),
        capabilityCatalog: capabilityViews("none"),
        isApprovedPartner: false,
        honesty: CREATOR_HONESTY,
        noPartnershipPromise: CREATOR_NO_PARTNERSHIP_PROMISE,
      },
    };
  }

  const status = row.status;
  const requested = parseRequestedCapabilities(row.requestedCapabilitiesJson);

  return {
    ok: true,
    view: {
      application: {
        id: row.id,
        displayName: row.displayName,
        handle: row.handle,
        status,
        statusLabel: CREATOR_PARTNERSHIP_STATUS_LABELS[status],
        roleLabel: creatorRoleLabel(status),
        appliedAt: row.appliedAt.toISOString(),
        reviewedAt: row.reviewedAt?.toISOString() ?? null,
        requestedCapabilities: requested,
      },
      capabilities: capabilityViews(status),
      capabilityCatalog: capabilityViews(status),
      isApprovedPartner: status === "approved",
      honesty: CREATOR_HONESTY,
      noPartnershipPromise: CREATOR_NO_PARTNERSHIP_PROMISE,
    },
  };
}

export async function userHasCreatorCapability(input: {
  userId: string;
  capability: CreatorCapability;
}): Promise<boolean> {
  if (!featureFlags.creatorProgram) return false;
  const row = await prisma.creatorPartnership.findUnique({
    where: { userId: input.userId },
    select: { status: true },
  });
  if (!row) return false;
  return hasCreatorCapability(row.status, input.capability);
}

export async function reviewCreatorPartnership(input: {
  partnershipId: string;
  actorUserId: string;
  toStatus: "approved" | "rejected" | "suspended";
  reviewNote?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.creatorProgram) {
    return { ok: false, error: "Creator Program is not enabled." };
  }

  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) {
    return { ok: false, error: "Only staff can review creator applications." };
  }

  const row = await prisma.creatorPartnership.findUnique({
    where: { id: input.partnershipId },
  });
  if (!row) return { ok: false, error: "Application not found." };

  let affiliatePartnerId = row.affiliatePartnerId;
  if (input.toStatus === "approved") {
    // Soft-link existing active affiliate of type creator when present.
    const affiliate = await prisma.affiliatePartner.findUnique({
      where: { userId: row.userId },
    });
    if (
      affiliate &&
      affiliate.status === "active" &&
      affiliate.partnerType === "creator"
    ) {
      affiliatePartnerId = affiliate.id;
    }
  }

  await prisma.creatorPartnership.update({
    where: { id: row.id },
    data: {
      status: input.toStatus,
      reviewedByUserId: input.actorUserId,
      reviewedAt: new Date(),
      reviewNote: input.reviewNote?.trim().slice(0, 500) || null,
      affiliatePartnerId,
    },
  });

  trackProductEventSafe({
    name: "creator_program_reviewed",
    props: {
      partnershipId: row.id,
      toStatus: input.toStatus,
    },
    userId: input.actorUserId,
  });

  if (input.toStatus === "approved") {
    trackProductEventSafe({
      name: "creator_program_approved",
      props: { partnershipId: row.id },
      userId: row.userId,
    });
  }

  return { ok: true };
}

export async function listCreatorPartnershipsForStaff(input: {
  actorUserId: string;
}): Promise<
  | {
      ok: true;
      applications: Array<{
        id: string;
        displayName: string;
        handle: string | null;
        status: string;
        statusLabel: string;
        roleLabel: string;
        appliedAt: string;
      }>;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.creatorProgram) {
    return { ok: false, error: "Creator Program is not enabled." };
  }
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) {
    return { ok: false, error: "Staff only." };
  }

  const rows = await prisma.creatorPartnership.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return {
    ok: true,
    applications: rows.map((r) => {
      const status = isCreatorPartnershipStatus(r.status)
        ? r.status
        : ("pending" as const);
      return {
        id: r.id,
        displayName: r.displayName,
        handle: r.handle,
        status,
        statusLabel: CREATOR_PARTNERSHIP_STATUS_LABELS[status],
        roleLabel: creatorRoleLabel(status),
        appliedAt: r.appliedAt.toISOString(),
      };
    }),
  };
}
