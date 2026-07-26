/**
 * Affiliate System service (Prompt 136).
 * Clicks → conversions → commission ledger. Disclosure-gated public listings.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  AFFILIATE_COMMISSION_STATUS_LABELS,
  AFFILIATE_DISCLOSURE,
  AFFILIATE_DISCLOSURE_SHORT,
  AFFILIATE_ENGINE_VERSION,
  AFFILIATE_HONESTY,
  AFFILIATE_PARTNER_STATUS_LABELS,
  AFFILIATE_PARTNER_TYPE_LABELS,
  buildAffiliateLandingPath,
  buildAffiliateSignupPath,
  commissionIdempotencyKey,
  estimateCommissionCents,
  filterPartnersForDisplay,
  generateAffiliateTrackingCode,
  isAffiliatePartnerType,
  isValidAffiliateTrackingCode,
  normalizeAffiliateSlug,
  type AffiliateCommissionStatus,
  type AffiliatePartnerStatus,
  type AffiliatePartnerType,
} from "@/domain/affiliate-system";
import { prisma } from "@/lib/db";
import { trackProductEventSafe } from "@/services/analytics/track";

export type AffiliateHubView = {
  partner: null | {
    id: string;
    displayName: string;
    slug: string;
    partnerType: AffiliatePartnerType;
    partnerTypeLabel: string;
    status: AffiliatePartnerStatus;
    statusLabel: string;
    landingPath: string;
    trackingCode: string;
  };
  stats: {
    clicks: number;
    conversions: number;
    commissionPendingCents: number;
    commissionAccruedCents: number;
  };
  recentClicks: Array<{ id: string; createdAt: string }>;
  recentConversions: Array<{
    id: string;
    eventType: string;
    status: string;
    attributedAt: string;
  }>;
  recentCommissions: Array<{
    id: string;
    amountCents: number;
    status: AffiliateCommissionStatus;
    statusLabel: string;
    createdAt: string;
  }>;
  honesty: readonly string[];
  disclosure: readonly string[];
  disclosureShort: string;
};

export type PublicAffiliateDirectoryItem = {
  slug: string;
  displayName: string;
  partnerType: AffiliatePartnerType;
  partnerTypeLabel: string;
  landingPath: string;
};

async function issueUniqueTrackingCode(): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const code = generateAffiliateTrackingCode(10);
    const clash = await prisma.affiliateLink.findUnique({ where: { code } });
    if (!clash) return code;
  }
  throw new Error("Could not allocate affiliate tracking code.");
}

export async function applyToAffiliateProgram(input: {
  userId: string;
  displayName: string;
  slug: string;
  partnerType: string;
  disclosureAcknowledged: boolean;
}): Promise<{ ok: true; partnerId: string } | { ok: false; error: string }> {
  if (!featureFlags.affiliateSystem) {
    return { ok: false, error: "Affiliate System is not enabled." };
  }
  if (!input.disclosureAcknowledged) {
    return {
      ok: false,
      error: "You must acknowledge the affiliate disclosure to apply.",
    };
  }
  if (!isAffiliatePartnerType(input.partnerType)) {
    return { ok: false, error: "Choose creator, coach, or partner." };
  }
  const displayName = input.displayName.trim().slice(0, 80);
  if (displayName.length < 2) {
    return { ok: false, error: "Enter a display name." };
  }
  const slug = normalizeAffiliateSlug(input.slug || displayName);
  if (!slug) {
    return { ok: false, error: "Enter a valid public slug." };
  }

  const existing = await prisma.affiliatePartner.findUnique({
    where: { userId: input.userId },
  });
  if (existing) {
    return { ok: false, error: "You already have an affiliate partner profile." };
  }

  const slugTaken = await prisma.affiliatePartner.findUnique({
    where: { slug },
  });
  if (slugTaken) {
    return { ok: false, error: "That slug is already in use." };
  }

  const code = await issueUniqueTrackingCode();
  const partner = await prisma.affiliatePartner.create({
    data: {
      userId: input.userId,
      displayName,
      slug,
      partnerType: input.partnerType,
      status: "pending",
      disclosureAcknowledgedAt: new Date(),
      engineVersion: AFFILIATE_ENGINE_VERSION,
      links: {
        create: {
          code,
          destinationPath: "/signup",
          label: "Primary",
          status: "active",
        },
      },
    },
  });

  trackProductEventSafe({
    name: "affiliate_partner_applied",
    props: {
      partnerId: partner.id,
      partnerType: input.partnerType,
    },
    userId: input.userId,
  });

  return { ok: true, partnerId: partner.id };
}

export async function getAffiliateHubView(input: {
  userId: string;
}): Promise<{ ok: true; view: AffiliateHubView } | { ok: false; error: string }> {
  if (!featureFlags.affiliateSystem) {
    return { ok: false, error: "Affiliate System is not enabled." };
  }

  const partner = await prisma.affiliatePartner.findUnique({
    where: { userId: input.userId },
    include: {
      links: { where: { status: "active" }, orderBy: { createdAt: "asc" }, take: 1 },
    },
  });

  if (!partner) {
    return {
      ok: true,
      view: {
        partner: null,
        stats: {
          clicks: 0,
          conversions: 0,
          commissionPendingCents: 0,
          commissionAccruedCents: 0,
        },
        recentClicks: [],
        recentConversions: [],
        recentCommissions: [],
        honesty: AFFILIATE_HONESTY,
        disclosure: AFFILIATE_DISCLOSURE,
        disclosureShort: AFFILIATE_DISCLOSURE_SHORT,
      },
    };
  }

  const primary = partner.links[0] ?? null;
  const [clicks, conversions, commissions, recentClicks, recentConversions] =
    await Promise.all([
      prisma.affiliateClick.count({ where: { partnerId: partner.id } }),
      prisma.affiliateConversion.count({ where: { partnerId: partner.id } }),
      prisma.affiliateCommission.findMany({
        where: { partnerId: partner.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.affiliateClick.findMany({
        where: { partnerId: partner.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, createdAt: true },
      }),
      prisma.affiliateConversion.findMany({
        where: { partnerId: partner.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          eventType: true,
          status: true,
          attributedAt: true,
        },
      }),
    ]);

  const commissionPendingCents = commissions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + c.amountCents, 0);
  const commissionAccruedCents = commissions
    .filter((c) => c.status === "accrued" || c.status === "paid_external")
    .reduce((s, c) => s + c.amountCents, 0);

  return {
    ok: true,
    view: {
      partner: {
        id: partner.id,
        displayName: partner.displayName,
        slug: partner.slug,
        partnerType: partner.partnerType as AffiliatePartnerType,
        partnerTypeLabel:
          AFFILIATE_PARTNER_TYPE_LABELS[
            partner.partnerType as AffiliatePartnerType
          ] ?? partner.partnerType,
        status: partner.status as AffiliatePartnerStatus,
        statusLabel:
          AFFILIATE_PARTNER_STATUS_LABELS[
            partner.status as AffiliatePartnerStatus
          ] ?? partner.status,
        landingPath: primary
          ? buildAffiliateLandingPath(primary.code)
          : `/affiliates`,
        trackingCode: primary?.code ?? "",
      },
      stats: {
        clicks,
        conversions,
        commissionPendingCents,
        commissionAccruedCents,
      },
      recentClicks: recentClicks.map((c) => ({
        id: c.id,
        createdAt: c.createdAt.toISOString(),
      })),
      recentConversions: recentConversions.map((c) => ({
        id: c.id,
        eventType: c.eventType,
        status: c.status,
        attributedAt: c.attributedAt.toISOString(),
      })),
      recentCommissions: commissions.slice(0, 10).map((c) => ({
        id: c.id,
        amountCents: c.amountCents,
        status: c.status as AffiliateCommissionStatus,
        statusLabel:
          AFFILIATE_COMMISSION_STATUS_LABELS[
            c.status as AffiliateCommissionStatus
          ] ?? c.status,
        createdAt: c.createdAt.toISOString(),
      })),
      honesty: AFFILIATE_HONESTY,
      disclosure: AFFILIATE_DISCLOSURE,
      disclosureShort: AFFILIATE_DISCLOSURE_SHORT,
    },
  };
}

/**
 * Public directory — empty unless caller affirms disclosure is visible.
 */
export async function listPublicAffiliateDirectory(input: {
  disclosureVisible: boolean;
}): Promise<PublicAffiliateDirectoryItem[]> {
  if (!featureFlags.affiliateSystem) return [];
  if (!input.disclosureVisible) return [];

  const rows = await prisma.affiliatePartner.findMany({
    where: { status: "active" },
    include: {
      links: { where: { status: "active" }, orderBy: { createdAt: "asc" }, take: 1 },
    },
    orderBy: { displayName: "asc" },
    take: 100,
  });

  const mapped = rows
    .filter((r) => r.links[0])
    .map((r) => ({
      slug: r.slug,
      displayName: r.displayName,
      partnerType: r.partnerType as AffiliatePartnerType,
      partnerTypeLabel:
        AFFILIATE_PARTNER_TYPE_LABELS[r.partnerType as AffiliatePartnerType] ??
        r.partnerType,
      landingPath: buildAffiliateLandingPath(r.links[0]!.code),
    }));

  return filterPartnersForDisplay(mapped, {
    disclosureVisible: input.disclosureVisible,
  });
}

export async function getAffiliateLandingByCode(code: string): Promise<
  | {
      ok: true;
      linkId: string;
      partnerId: string;
      displayName: string;
      partnerTypeLabel: string;
      signupPath: string;
      disclosure: readonly string[];
      disclosureShort: string;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.affiliateSystem) {
    return { ok: false, error: "Affiliate System is not enabled." };
  }
  if (!isValidAffiliateTrackingCode(code)) {
    return { ok: false, error: "Invalid tracking code." };
  }

  const link = await prisma.affiliateLink.findUnique({
    where: { code },
    include: { partner: true },
  });
  if (!link || link.status !== "active" || link.partner.status !== "active") {
    return { ok: false, error: "Affiliate link is not available." };
  }

  return {
    ok: true,
    linkId: link.id,
    partnerId: link.partnerId,
    displayName: link.partner.displayName,
    partnerTypeLabel:
      AFFILIATE_PARTNER_TYPE_LABELS[
        link.partner.partnerType as AffiliatePartnerType
      ] ?? link.partner.partnerType,
    signupPath: buildAffiliateSignupPath(link.code),
    disclosure: AFFILIATE_DISCLOSURE,
    disclosureShort: AFFILIATE_DISCLOSURE_SHORT,
  };
}

export async function recordAffiliateClick(input: {
  code: string;
  visitorKey?: string | null;
}): Promise<
  | { ok: true; clickId: string; redirectPath: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.affiliateSystem) {
    return { ok: false, error: "Affiliate System is not enabled." };
  }
  if (!isValidAffiliateTrackingCode(input.code)) {
    return { ok: false, error: "Invalid tracking code." };
  }

  const link = await prisma.affiliateLink.findUnique({
    where: { code: input.code },
    include: { partner: true },
  });
  if (!link || link.status !== "active" || link.partner.status !== "active") {
    return { ok: false, error: "Affiliate link is not available." };
  }

  const click = await prisma.affiliateClick.create({
    data: {
      partnerId: link.partnerId,
      linkId: link.id,
      visitorKey: input.visitorKey?.slice(0, 64) ?? null,
      destinationPath: buildAffiliateSignupPath(link.code),
    },
  });

  trackProductEventSafe({
    name: "affiliate_link_clicked",
    props: {
      partnerId: link.partnerId,
      linkId: link.id,
    },
  });

  return {
    ok: true,
    clickId: click.id,
    redirectPath: buildAffiliateSignupPath(link.code),
  };
}

async function ledgerCommissionForConversion(input: {
  conversionId: string;
  partnerId: string;
  partnerType: AffiliatePartnerType;
  eventType: "signup" | "subscription";
  userId: string | null;
}): Promise<void> {
  const amountCents = estimateCommissionCents({
    partnerType: input.partnerType,
    eventType: input.eventType,
  });
  const idempotencyKey = commissionIdempotencyKey({
    conversionId: input.conversionId,
    eventType: input.eventType,
  });

  await prisma.affiliateCommission.upsert({
    where: { idempotencyKey },
    create: {
      conversionId: input.conversionId,
      partnerId: input.partnerId,
      amountCents,
      currency: "usd",
      status: "pending",
      idempotencyKey,
    },
    update: {},
  });

  await prisma.affiliateConversion.update({
    where: { id: input.conversionId },
    data: { status: "commissioned" },
  });

  trackProductEventSafe({
    name: "affiliate_commission_ledgered",
    props: {
      partnerId: input.partnerId,
      conversionId: input.conversionId,
      amountCents,
      commissionStatus: "pending",
    },
    userId: input.userId,
  });
}

export async function attributeAffiliateConversionOnSignup(input: {
  convertedUserId: string;
  code: string | null | undefined;
}): Promise<void> {
  if (!featureFlags.affiliateSystem) return;
  const raw = input.code?.trim() ?? "";
  if (!raw || !isValidAffiliateTrackingCode(raw)) return;

  const existing = await prisma.affiliateConversion.findUnique({
    where: {
      convertedUserId_eventType: {
        convertedUserId: input.convertedUserId,
        eventType: "signup",
      },
    },
  });
  if (existing) return;

  const link = await prisma.affiliateLink.findUnique({
    where: { code: raw },
    include: { partner: true },
  });
  if (!link || link.status !== "active" || link.partner.status !== "active") {
    return;
  }

  // Partner cannot convert themselves.
  if (link.partner.userId === input.convertedUserId) return;

  const recentClick = await prisma.affiliateClick.findFirst({
    where: { linkId: link.id },
    orderBy: { createdAt: "desc" },
  });

  const conversion = await prisma.affiliateConversion.create({
    data: {
      partnerId: link.partnerId,
      linkId: link.id,
      clickId: recentClick?.id ?? null,
      convertedUserId: input.convertedUserId,
      eventType: "signup",
      status: "attributed",
      engineVersion: AFFILIATE_ENGINE_VERSION,
    },
  });

  trackProductEventSafe({
    name: "affiliate_conversion_attributed",
    props: {
      partnerId: link.partnerId,
      conversionId: conversion.id,
      eventType: "signup",
    },
    userId: input.convertedUserId,
  });

  await ledgerCommissionForConversion({
    conversionId: conversion.id,
    partnerId: link.partnerId,
    partnerType: link.partner.partnerType as AffiliatePartnerType,
    eventType: "signup",
    userId: input.convertedUserId,
  });
}

export async function activateAffiliatePartner(input: {
  partnerId: string;
  actorUserId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.affiliateSystem) {
    return { ok: false, error: "Affiliate System is not enabled." };
  }
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) {
    return { ok: false, error: "Only staff can activate affiliate partners." };
  }

  const partner = await prisma.affiliatePartner.findUnique({
    where: { id: input.partnerId },
  });
  if (!partner) return { ok: false, error: "Partner not found." };

  await prisma.affiliatePartner.update({
    where: { id: partner.id },
    data: { status: "active" },
  });

  trackProductEventSafe({
    name: "affiliate_partner_activated",
    props: {
      partnerId: partner.id,
      partnerType: partner.partnerType,
    },
    userId: input.actorUserId,
  });

  return { ok: true };
}

export async function listPendingAffiliatePartnersForStaff(input: {
  actorUserId: string;
}): Promise<
  | {
      ok: true;
      partners: Array<{
        id: string;
        displayName: string;
        slug: string;
        partnerType: string;
        status: string;
        createdAt: string;
      }>;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.affiliateSystem) {
    return { ok: false, error: "Affiliate System is not enabled." };
  }
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) {
    return { ok: false, error: "Staff only." };
  }

  const rows = await prisma.affiliatePartner.findMany({
    where: { status: { in: ["pending", "active", "suspended"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return {
    ok: true,
    partners: rows.map((r) => ({
      id: r.id,
      displayName: r.displayName,
      slug: r.slug,
      partnerType: r.partnerType,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
