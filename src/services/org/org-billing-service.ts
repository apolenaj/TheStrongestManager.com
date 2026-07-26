/**
 * Centralized organization (B2B) billing — seats, usage, upgrade paths.
 * Checkout stays off until Stripe org prices + billingCheckout are ready.
 */

import { featureFlags } from "@/config/feature-flags";
import { getActiveBillingProvider } from "@/domain/billing/provider";
import {
  ORG_BILLING_HONESTY,
  formatOrgLimit,
  formatOrgPriceLabel,
  getOrgPlanById,
  getOrgPlanCatalog,
  getOrgUpgradeOptions,
  normalizeOrgPlanId,
  resolveOrgEntitlements,
  type BillingInterval,
  type OrgPlanDefinition,
  type OrgPlanId,
  type ResolvedOrgEntitlements,
} from "@/domain/org-billing";
import {
  canManageOrgBilling,
  canViewOrgBilling,
  isOrgMemberRole,
  parseOrgCapabilities,
  type OrgMemberRole,
  type OrgPrincipal,
} from "@/domain/org";
import { prisma } from "@/lib/db";

function toPrincipal(
  role: OrgMemberRole,
  status: string,
  extra: import("@/domain/org").OrgCapability[] = [],
): OrgPrincipal {
  return {
    role,
    status:
      status === "active"
        ? "active"
        : status === "invited"
          ? "invited"
          : "revoked",
    extraCapabilities: extra,
  };
}

export type OrgBillingView = {
  honesty: readonly string[];
  organization: { id: string; name: string; slug: string };
  viewer: {
    canView: boolean;
    canManage: boolean;
  };
  subscription: {
    planId: OrgPlanId;
    planName: string;
    status: string;
    billingInterval: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
  };
  entitlements: ResolvedOrgEntitlements;
  seats: {
    coachesUsed: number;
    coachesLimitLabel: string;
    athletesUsed: number;
    athletesLimitLabel: string;
    coachesAtLimit: boolean;
    athletesAtLimit: boolean;
  };
  usage: {
    techniqueUsed: number;
    techniqueLimitLabel: string;
    techniqueAtLimit: boolean;
  };
  features: Array<{ id: string; label: string; included: boolean }>;
  catalog: Array<{
    id: OrgPlanId;
    name: string;
    tagline: string;
    purchasable: boolean;
    monthlyLabel: string;
    annualLabel: string;
    availabilityNote: string | null;
    isCurrent: boolean;
    maxCoachesLabel: string;
    maxAthletesLabel: string;
  }>;
  upgrades: Array<{
    id: OrgPlanId;
    name: string;
    tagline: string;
    purchasable: boolean;
    monthlyLabel: string;
    checkoutReady: boolean;
    availabilityNote: string | null;
  }>;
  checkout: {
    enabled: boolean;
    providerStatus: string;
    message: string;
  };
};

async function ensureOrgSubscription(organizationId: string) {
  const existing = await prisma.orgSubscription.findUnique({
    where: { organizationId },
  });
  if (existing) return existing;
  return prisma.orgSubscription.create({
    data: {
      organizationId,
      plan: "org_free",
      status: "active",
    },
  });
}

export async function getOrgSeatUsage(organizationId: string): Promise<{
  coachesUsed: number;
  athletesUsed: number;
}> {
  const members = await prisma.orgMembership.findMany({
    where: { organizationId, status: "active" },
    select: { role: true },
  });
  // Coaches: org_coach seats; org_admin also consumes a coach seat (operator).
  const coachesUsed = members.filter(
    (m) => m.role === "org_coach" || m.role === "org_admin",
  ).length;
  const athletesUsed = members.filter((m) => m.role === "org_athlete").length;
  return { coachesUsed, athletesUsed };
}

/**
 * Resolve entitlements + usage for seat enforcement (invite / add member).
 */
export async function getOrgBillingEntitlements(organizationId: string) {
  const sub = await ensureOrgSubscription(organizationId);
  const usage = await getOrgSeatUsage(organizationId);
  const entitlements = resolveOrgEntitlements({
    plan: sub.plan,
    status: sub.status,
    coachSeatLimitOverride: sub.coachSeatLimit,
    athleteSeatLimitOverride: sub.athleteSeatLimit,
  });
  return { sub, usage, entitlements };
}

function catalogRow(
  plan: OrgPlanDefinition,
  currentId: OrgPlanId,
): OrgBillingView["catalog"][number] {
  return {
    id: plan.id,
    name: plan.name,
    tagline: plan.tagline,
    purchasable: plan.purchasable,
    monthlyLabel: formatOrgPriceLabel(plan, "monthly"),
    annualLabel: formatOrgPriceLabel(plan, "annual"),
    availabilityNote: plan.availabilityNote,
    isCurrent: plan.id === currentId,
    maxCoachesLabel: formatOrgLimit(plan.limits.maxCoaches),
    maxAthletesLabel: formatOrgLimit(plan.limits.maxAthletes),
  };
}

export async function getOrgBillingView(input: {
  userId: string;
  organizationId: string;
}): Promise<
  { ok: true; view: OrgBillingView } | { ok: false; error: string }
> {
  if (!featureFlags.orgBilling) {
    return { ok: false, error: "Organization billing is not enabled." };
  }

  const membership = await prisma.orgMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId,
      },
    },
    include: { organization: true },
  });
  if (!membership || membership.status !== "active") {
    return { ok: false, error: "Not a member of this organization." };
  }

  const role: OrgMemberRole = isOrgMemberRole(membership.role)
    ? membership.role
    : "org_athlete";
  const orgPerms = await prisma.orgPermission.findMany({
    where: { organizationId: input.organizationId },
  });
  const extra = orgPerms.flatMap((p) => {
    if (
      (p.principalType === "role" && p.principalKey === role) ||
      (p.principalType === "user" && p.principalKey === input.userId)
    ) {
      return parseOrgCapabilities(p.permissionsJson);
    }
    return [];
  });
  const principal = toPrincipal(role, membership.status, extra);
  if (!canViewOrgBilling(principal)) {
    return { ok: false, error: "Billing view not permitted for your role." };
  }

  const { sub, usage, entitlements } = await getOrgBillingEntitlements(
    input.organizationId,
  );
  const planId = entitlements.planId;
  const plan = getOrgPlanById(planId) ?? getOrgPlanById("org_free")!;

  const techLimit = entitlements.limits.techniqueAnalysesPerMonth;
  const techUsed = sub.techniqueUsageCount;
  const techAtLimit =
    techLimit !== "unlimited" && techUsed >= techLimit;

  const provider = getActiveBillingProvider();
  const checkoutEnabled =
    featureFlags.billingCheckout && provider.status === "ready";

  const upgrades = getOrgUpgradeOptions(planId).map((p) => {
    const hasPrice = Boolean(p.monthly || p.annual);
    return {
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      purchasable: p.purchasable,
      monthlyLabel: formatOrgPriceLabel(p, "monthly"),
      checkoutReady: checkoutEnabled && p.purchasable && hasPrice,
      availabilityNote: p.availabilityNote,
    };
  });

  return {
    ok: true,
    view: {
      honesty: ORG_BILLING_HONESTY,
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
      },
      viewer: {
        canView: true,
        canManage: canManageOrgBilling(principal),
      },
      subscription: {
        planId,
        planName: entitlements.planName,
        status: sub.status,
        billingInterval: sub.billingInterval,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
      },
      entitlements,
      seats: {
        coachesUsed: usage.coachesUsed,
        coachesLimitLabel: formatOrgLimit(entitlements.maxCoaches),
        athletesUsed: usage.athletesUsed,
        athletesLimitLabel: formatOrgLimit(entitlements.maxAthletes),
        coachesAtLimit:
          entitlements.maxCoaches !== "unlimited" &&
          usage.coachesUsed >= entitlements.maxCoaches,
        athletesAtLimit:
          entitlements.maxAthletes !== "unlimited" &&
          usage.athletesUsed >= entitlements.maxAthletes,
      },
      usage: {
        techniqueUsed: techUsed,
        techniqueLimitLabel: formatOrgLimit(techLimit),
        techniqueAtLimit: techAtLimit,
      },
      features: plan.features,
      catalog: getOrgPlanCatalog().map((p) => catalogRow(p, planId)),
      upgrades,
      checkout: {
        enabled: checkoutEnabled,
        providerStatus: provider.status,
        message: checkoutEnabled
          ? "Checkout is configured."
          : "Organization checkout is not live yet — prices and Stripe org price IDs must be published first. Seat limits still apply.",
      },
    },
  };
}

/**
 * Record an upgrade intent / apply free→plan when not requiring payment.
 * Paid upgrades require Stripe — returns honest error until ready.
 */
export async function requestOrgPlanUpgrade(input: {
  userId: string;
  organizationId: string;
  targetPlanId: string;
  interval?: BillingInterval;
}): Promise<{ ok: true; applied: boolean; message: string } | { ok: false; error: string }> {
  if (!featureFlags.orgBilling) {
    return { ok: false, error: "Organization billing is not enabled." };
  }

  const membership = await prisma.orgMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId,
      },
    },
  });
  if (!membership || membership.status !== "active") {
    return { ok: false, error: "Not a member of this organization." };
  }

  const role: OrgMemberRole = isOrgMemberRole(membership.role)
    ? membership.role
    : "org_athlete";
  const principal = toPrincipal(role, membership.status, []);
  if (!canManageOrgBilling(principal)) {
    return { ok: false, error: "Billing manage not permitted for your role." };
  }

  const targetId = normalizeOrgPlanId(input.targetPlanId);
  if (targetId === "org_free") {
    return { ok: false, error: "Cannot upgrade to Org Free." };
  }

  const target = getOrgPlanById(targetId);
  if (!target) return { ok: false, error: "Unknown organization plan." };

  const { entitlements } = await getOrgBillingEntitlements(
    input.organizationId,
  );
  const current = getOrgPlanById(entitlements.planId);
  if ((current?.tierRank ?? 0) >= target.tierRank) {
    return {
      ok: false,
      error: "Choose a higher plan than the current subscription.",
    };
  }

  if (targetId === "org_enterprise") {
    return {
      ok: true,
      applied: false,
      message:
        "Enterprise is contact-only — no self-serve checkout and no invented packages.",
    };
  }

  const interval = input.interval ?? "monthly";
  const price =
    interval === "annual" ? target.annual : target.monthly;
  const provider = getActiveBillingProvider();
  const checkoutReady =
    featureFlags.billingCheckout &&
    provider.status === "ready" &&
    target.purchasable &&
    price != null &&
    price.stripePriceId != null;

  if (!checkoutReady) {
    return {
      ok: true,
      applied: false,
      message:
        price == null
          ? "B2B list price is not published yet (set PRICING_ORG_*_CENTS). No charge invented."
          : "Stripe org checkout is not ready. Seat/feature catalog still applies; no charge was made.",
    };
  }

  // Future: createCheckoutSession with organizationId. Never invent success here.
  return {
    ok: true,
    applied: false,
    message:
      "Checkout adapter would start here — provider ready but org checkout session not implemented yet.",
  };
}
