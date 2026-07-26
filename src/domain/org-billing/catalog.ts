/**
 * B2B organization plan catalog (Prompt 88).
 * Seat limits, usage limits, and features live here.
 * Do NOT hard-code B2B display prices — set PRICING_ORG_*_CENTS / STRIPE_PRICE_ORG_* when ready.
 */

import { formatMoneyCents } from "@/domain/billing/catalog";
import type { BillingInterval } from "@/domain/billing/catalog";

export const ORG_BILLING_ENGINE_VERSION = "org_billing.v1" as const;

export const ORG_PLAN_IDS = [
  "org_free",
  "org_team",
  "org_facility",
  "org_enterprise",
] as const;
export type OrgPlanId = (typeof ORG_PLAN_IDS)[number];

export type OrgLimitValue = number | "unlimited";

export type OrgPlanLimits = {
  /** Active org_coach (+ org_admin counting as coach seat if desired — see entitlements). */
  maxCoaches: OrgLimitValue;
  /** Active org_athlete seats. */
  maxAthletes: OrgLimitValue;
  /** Shared org pool for technique analyses per calendar month. */
  techniqueAnalysesPerMonth: OrgLimitValue;
  orgDashboard: boolean;
  teamAnalytics: boolean;
  exportAggregates: boolean;
  prioritySupport: boolean;
};

export type OrgPlanFeature = {
  id: string;
  label: string;
  included: boolean;
};

export type OrgPlanPrice = {
  amountCents: number;
  currency: "usd";
  stripePriceId: string | null;
};

export type OrgPlanDefinition = {
  id: OrgPlanId;
  name: string;
  tagline: string;
  /** Self-serve only when price env is published AND purchasable. */
  purchasable: boolean;
  highlightLabel: string | null;
  features: OrgPlanFeature[];
  limits: OrgPlanLimits;
  /**
   * null = free tier, enterprise contact, or price not published yet.
   * Never invent B2B dollars in code fallbacks.
   */
  monthly: OrgPlanPrice | null;
  annual: OrgPlanPrice | null;
  availabilityNote: string | null;
  /** Sort order for upgrade ladder (higher = upgrade target). */
  tierRank: number;
};

function envCentsOptional(key: string): number | null {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function envPriceId(key: string): string | null {
  const raw = process.env[key]?.trim();
  return raw ? raw : null;
}

function envLimit(key: string, fallback: OrgLimitValue): OrgLimitValue {
  const raw = process.env[key]?.trim();
  if (raw == null || raw === "") return fallback;
  if (raw === "unlimited") return "unlimited";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function publishedPrice(
  centsKey: string,
  stripeKey: string,
): OrgPlanPrice | null {
  const amountCents = envCentsOptional(centsKey);
  if (amountCents == null) return null;
  return {
    amountCents,
    currency: "usd",
    stripePriceId: envPriceId(stripeKey),
  };
}

/**
 * Central B2B catalog — limits & features yes; prices only when env publishes them.
 */
export function getOrgPlanCatalog(): OrgPlanDefinition[] {
  const teamMonthly = publishedPrice(
    "PRICING_ORG_TEAM_MONTHLY_CENTS",
    "STRIPE_PRICE_ORG_TEAM_MONTHLY",
  );
  const teamAnnual = publishedPrice(
    "PRICING_ORG_TEAM_ANNUAL_CENTS",
    "STRIPE_PRICE_ORG_TEAM_ANNUAL",
  );
  const facilityMonthly = publishedPrice(
    "PRICING_ORG_FACILITY_MONTHLY_CENTS",
    "STRIPE_PRICE_ORG_FACILITY_MONTHLY",
  );
  const facilityAnnual = publishedPrice(
    "PRICING_ORG_FACILITY_ANNUAL_CENTS",
    "STRIPE_PRICE_ORG_FACILITY_ANNUAL",
  );

  return [
    {
      id: "org_free",
      name: "Org Free",
      tagline: "Try organization structure with tight seat limits.",
      purchasable: false,
      highlightLabel: null,
      tierRank: 0,
      monthly: null,
      annual: null,
      availabilityNote: null,
      features: [
        { id: "org_dashboard", label: "Organization dashboard", included: true },
        { id: "teams", label: "Teams", included: true },
        { id: "aggregates", label: "Aggregate analytics (opt-in)", included: true },
        { id: "export", label: "Export aggregates", included: false },
        { id: "priority", label: "Priority support", included: false },
      ],
      limits: {
        maxCoaches: envLimit("ORG_LIMIT_FREE_MAX_COACHES", 1),
        maxAthletes: envLimit("ORG_LIMIT_FREE_MAX_ATHLETES", 5),
        techniqueAnalysesPerMonth: envLimit(
          "ORG_LIMIT_FREE_TECHNIQUE_MONTH",
          10,
        ),
        orgDashboard: true,
        teamAnalytics: true,
        exportAggregates: false,
        prioritySupport: false,
      },
    },
    {
      id: "org_team",
      name: "Org Team",
      tagline: "More coach and athlete seats for a coaching team or small gym.",
      purchasable: Boolean(teamMonthly || teamAnnual),
      highlightLabel: null,
      tierRank: 1,
      monthly: teamMonthly,
      annual: teamAnnual,
      availabilityNote:
        teamMonthly || teamAnnual
          ? null
          : "B2B list price not published yet — set PRICING_ORG_TEAM_*_CENTS when ready. No invented dollars.",
      features: [
        { id: "org_dashboard", label: "Organization dashboard", included: true },
        { id: "teams", label: "Teams", included: true },
        { id: "aggregates", label: "Aggregate analytics (opt-in)", included: true },
        { id: "export", label: "Export aggregates", included: true },
        { id: "priority", label: "Priority support", included: false },
      ],
      limits: {
        maxCoaches: envLimit("ORG_LIMIT_TEAM_MAX_COACHES", 5),
        maxAthletes: envLimit("ORG_LIMIT_TEAM_MAX_ATHLETES", 40),
        techniqueAnalysesPerMonth: envLimit(
          "ORG_LIMIT_TEAM_TECHNIQUE_MONTH",
          100,
        ),
        orgDashboard: true,
        teamAnalytics: true,
        exportAggregates: true,
        prioritySupport: false,
      },
    },
    {
      id: "org_facility",
      name: "Org Facility",
      tagline: "Higher seats and usage for gyms and multi-team facilities.",
      purchasable: Boolean(facilityMonthly || facilityAnnual),
      highlightLabel: null,
      tierRank: 2,
      monthly: facilityMonthly,
      annual: facilityAnnual,
      availabilityNote:
        facilityMonthly || facilityAnnual
          ? null
          : "B2B list price not published yet — set PRICING_ORG_FACILITY_*_CENTS when ready.",
      features: [
        { id: "all_team", label: "Everything in Org Team", included: true },
        { id: "export", label: "Export aggregates", included: true },
        { id: "priority", label: "Priority support", included: true },
      ],
      limits: {
        maxCoaches: envLimit("ORG_LIMIT_FACILITY_MAX_COACHES", 20),
        maxAthletes: envLimit("ORG_LIMIT_FACILITY_MAX_ATHLETES", 200),
        techniqueAnalysesPerMonth: envLimit(
          "ORG_LIMIT_FACILITY_TECHNIQUE_MONTH",
          500,
        ),
        orgDashboard: true,
        teamAnalytics: true,
        exportAggregates: true,
        prioritySupport: true,
      },
    },
    {
      id: "org_enterprise",
      name: "Org Enterprise",
      tagline: "Custom seats, usage, and contracts — not self-serve.",
      purchasable: false,
      highlightLabel: null,
      tierRank: 3,
      monthly: null,
      annual: null,
      availabilityNote:
        "Contact sales when ready. No self-serve checkout and no invented enterprise packages.",
      features: [
        {
          id: "all_facility",
          label: "Everything in Org Facility (planned)",
          included: true,
        },
        {
          id: "custom_seats",
          label: "Custom seat & usage contracts (planned)",
          included: true,
        },
      ],
      limits: {
        maxCoaches: "unlimited",
        maxAthletes: "unlimited",
        techniqueAnalysesPerMonth: "unlimited",
        orgDashboard: true,
        teamAnalytics: true,
        exportAggregates: true,
        prioritySupport: true,
      },
    },
  ];
}

export function getOrgPlanById(id: OrgPlanId): OrgPlanDefinition | undefined {
  return getOrgPlanCatalog().find((p) => p.id === id);
}

export function normalizeOrgPlanId(
  raw: string | null | undefined,
): OrgPlanId {
  if (!raw) return "org_free";
  if ((ORG_PLAN_IDS as readonly string[]).includes(raw)) {
    return raw as OrgPlanId;
  }
  return "org_free";
}

export function formatOrgLimit(value: OrgLimitValue): string {
  if (value === "unlimited") return "Unlimited";
  return String(value);
}

export function orgPriceForInterval(
  plan: OrgPlanDefinition,
  interval: BillingInterval,
): OrgPlanPrice | null {
  return interval === "annual" ? plan.annual : plan.monthly;
}

export function formatOrgPriceLabel(
  plan: OrgPlanDefinition,
  interval: BillingInterval,
): string {
  const price = orgPriceForInterval(plan, interval);
  if (!price) return "Price not published";
  return `${formatMoneyCents(price.amountCents)} / ${interval === "annual" ? "year" : "month"}`;
}

/** Plans strictly above current tier — for upgrade UI. */
export function getOrgUpgradeOptions(
  currentPlanId: OrgPlanId,
): OrgPlanDefinition[] {
  const current = getOrgPlanById(currentPlanId);
  const rank = current?.tierRank ?? 0;
  return getOrgPlanCatalog().filter((p) => p.tierRank > rank);
}

export const ORG_BILLING_HONESTY = [
  "Organization billing is centralized in the org plan catalog — not scattered in UI components.",
  "B2B list prices are not hard-coded; they appear only when PRICING_ORG_*_CENTS is set.",
  "Seat and usage limits enforce architecture today; paid checkout stays off until Stripe org prices are configured.",
  "Consumer subscriptions (Pro / Performance) stay separate from organization seats.",
] as const;

export { formatMoneyCents };
export type { BillingInterval };
