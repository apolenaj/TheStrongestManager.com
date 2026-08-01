/**
 * Central pricing & plan catalog (Prompt 33).
 * All display prices and plan definitions live here (env may override amounts / Stripe price IDs).
 * Do not hard-code prices in marketing components.
 */

import { formatLocalizedMoney } from "@/domain/money/format-localized";

export const BILLING_INTERVALS = ["monthly", "annual"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

/**
 * Canonical plan ids stored on Subscription.plan.
 * Legacy DB values `athlete` → pro, `coach_premium` → elite_coaching.
 */
export const PLAN_IDS = [
  "free",
  "pro",
  "performance",
  "elite_coaching",
] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type PlanLimitValue = number | "unlimited" | "none";

export type PlanLimits = {
  /** Technique analyses per calendar month (demo allowance on free). */
  techniqueAnalysesPerMonth: PlanLimitValue;
  /** Concurrent athlete programs. */
  activePrograms: PlanLimitValue;
  progressAnalytics: boolean;
  trainingTools: boolean;
  adaptiveCoaching: boolean;
  advancedInsights: boolean;
  mealnexioIntegration: boolean;
  coachWorkspace: boolean;
};

export type PlanFeature = {
  id: string;
  label: string;
  included: boolean;
};

export type PlanPrice = {
  /** Display amount in the smallest currency unit (cents). */
  amountCents: number;
  currency: "usd";
  /** Stripe Price id when configured — never invent live checkout without it. */
  stripePriceId: string | null;
};

export type PlanDefinition = {
  id: PlanId;
  name: string;
  tagline: string;
  /** When false, shown as future / contact — not a checkout CTA. */
  purchasable: boolean;
  /** Soft highlight — not urgency or dark-pattern “most popular” theater. */
  highlightLabel: string | null;
  features: PlanFeature[];
  limits: PlanLimits;
  /** null = free or not sold as self-serve. */
  monthly: PlanPrice | null;
  annual: PlanPrice | null;
  /** Honest note for elite / future tiers. */
  availabilityNote: string | null;
};

function envCents(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw == null || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function envPriceId(key: string): string | null {
  const raw = process.env[key]?.trim();
  return raw ? raw : null;
}

/**
 * Single source of truth for list prices.
 * Override with PRICING_*_CENTS and STRIPE_PRICE_* without editing UI files.
 */
export function getPlanCatalog(): PlanDefinition[] {
  return [
    {
      id: "free",
      name: "Free",
      tagline: "Exercise library, methods, basic tracking, and limited technique analysis.",
      purchasable: false,
      highlightLabel: null,
      monthly: null,
      annual: null,
      availabilityNote: null,
      features: [
        { id: "exercises", label: "Exercise library", included: true },
        { id: "methods", label: "Training methods", included: true },
        { id: "tracking", label: "Basic training tracking", included: true },
        {
          id: "technique_demo",
          label: "Limited technique analysis (Free plan allowance)",
          included: true,
        },
        { id: "progress", label: "Full progress analytics", included: false },
        { id: "programs", label: "Full program tools", included: false },
        {
          id: "adaptive",
          label: "Adaptive programming suggestions (you approve)",
          included: false,
        },
        {
          id: "mealnexio",
          label: "Mealnexio connection (not live on any plan yet)",
          included: false,
        },
      ],
      limits: {
        techniqueAnalysesPerMonth: 2,
        activePrograms: 1,
        progressAnalytics: false,
        trainingTools: false,
        adaptiveCoaching: false,
        advancedInsights: false,
        mealnexioIntegration: false,
        coachWorkspace: false,
      },
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Training tools, progress, and programs for serious athletes.",
      purchasable: true,
      highlightLabel: "Common athlete plan",
      monthly: {
        amountCents: envCents("PRICING_PRO_MONTHLY_CENTS", 1900),
        currency: "usd",
        stripePriceId: envPriceId("STRIPE_PRICE_PRO_MONTHLY"),
      },
      annual: {
        amountCents: envCents("PRICING_PRO_ANNUAL_CENTS", 19000),
        currency: "usd",
        stripePriceId: envPriceId("STRIPE_PRICE_PRO_ANNUAL"),
      },
      availabilityNote: null,
      features: [
        { id: "exercises", label: "Exercise library", included: true },
        { id: "methods", label: "Training methods", included: true },
        { id: "tracking", label: "Basic training tracking", included: true },
        { id: "training_tools", label: "Training tools", included: true },
        { id: "progress", label: "Progress analytics", included: true },
        { id: "programs", label: "Programs", included: true },
        {
          id: "technique_more",
          label: "More technique analysis",
          included: true,
        },
        {
          id: "adaptive",
          label: "Adaptive programming suggestions (you approve)",
          included: false,
        },
        {
          id: "mealnexio",
          label: "Mealnexio connection (not live on any plan yet)",
          included: false,
        },
      ],
      limits: {
        techniqueAnalysesPerMonth: 20,
        activePrograms: 5,
        progressAnalytics: true,
        trainingTools: true,
        adaptiveCoaching: false,
        advancedInsights: false,
        mealnexioIntegration: false,
        coachWorkspace: false,
      },
    },
    {
      id: "performance",
      name: "Performance",
      tagline:
        "Higher technique limits, adaptive programming suggestions, and Mealnexio entitlement when sync ships.",
      purchasable: true,
      highlightLabel: null,
      monthly: {
        amountCents: envCents("PRICING_PERFORMANCE_MONTHLY_CENTS", 3900),
        currency: "usd",
        stripePriceId: envPriceId("STRIPE_PRICE_PERFORMANCE_MONTHLY"),
      },
      annual: {
        amountCents: envCents("PRICING_PERFORMANCE_ANNUAL_CENTS", 39000),
        currency: "usd",
        stripePriceId: envPriceId("STRIPE_PRICE_PERFORMANCE_ANNUAL"),
      },
      availabilityNote: null,
      features: [
        { id: "all_pro", label: "Everything in Pro", included: true },
        {
          id: "adaptive",
          label: "Adaptive programming suggestions (you approve)",
          included: true,
        },
        {
          id: "technique_high",
          label: "Higher technique analysis limits",
          included: true,
        },
        {
          id: "insights",
          label: "Cross-domain notes when enough data exists",
          included: true,
        },
        {
          id: "mealnexio",
          label: "Mealnexio connection entitlement (API not live yet)",
          included: true,
        },
      ],
      limits: {
        techniqueAnalysesPerMonth: 60,
        activePrograms: "unlimited",
        progressAnalytics: true,
        trainingTools: true,
        adaptiveCoaching: true,
        advancedInsights: true,
        mealnexioIntegration: true,
        coachWorkspace: false,
      },
    },
    {
      id: "elite_coaching",
      name: "Elite Coaching",
      tagline:
        "Future option: human coaching workflows on top of Performance — not sold as self-serve checkout yet.",
      purchasable: false,
      highlightLabel: null,
      monthly: null,
      annual: null,
      availabilityNote:
        "Not available for self-serve checkout. No waitlist urgency or invented coach packages.",
      features: [
        {
          id: "all_performance",
          label: "Everything in Performance (planned)",
          included: true,
        },
        {
          id: "human_coaching",
          label: "Human coaching workflows (planned)",
          included: true,
        },
        {
          id: "coach_workspace",
          label: "Coach workspace tools (planned)",
          included: true,
        },
      ],
      limits: {
        techniqueAnalysesPerMonth: "unlimited",
        activePrograms: "unlimited",
        progressAnalytics: true,
        trainingTools: true,
        adaptiveCoaching: true,
        advancedInsights: true,
        mealnexioIntegration: true,
        coachWorkspace: true,
      },
    },
  ];
}

export function getPlanById(id: PlanId): PlanDefinition | undefined {
  return getPlanCatalog().find((p) => p.id === id);
}

/** Map legacy Subscription.plan strings to canonical PlanId. */
export function normalizePlanId(raw: string | null | undefined): PlanId {
  if (!raw) return "free";
  if (raw === "athlete") return "pro";
  if (raw === "coach_premium") return "elite_coaching";
  if ((PLAN_IDS as readonly string[]).includes(raw)) return raw as PlanId;
  return "free";
}

export function formatMoneyCents(
  amountCents: number,
  currency: string = "usd",
  locale: string = "en",
): string {
  return formatLocalizedMoney(amountCents, currency, locale);
}

/** Honest annual savings vs 12× monthly — null if not applicable. */
export function annualSavingsCents(plan: PlanDefinition): number | null {
  if (!plan.monthly || !plan.annual) return null;
  const full = plan.monthly.amountCents * 12;
  const saved = full - plan.annual.amountCents;
  return saved > 0 ? saved : null;
}

export function priceForInterval(
  plan: PlanDefinition,
  interval: BillingInterval,
): PlanPrice | null {
  return interval === "annual" ? plan.annual : plan.monthly;
}

export function formatLimit(value: PlanLimitValue): string {
  if (value === "unlimited") return "Unlimited";
  if (value === "none") return "Not included";
  return String(value);
}

export const PRICING_CANCELLATION_COPY = {
  title: "Cancellation",
  body: "Cancel anytime. On a paid plan, access continues through the end of the current billing period when cancel-at-period-end is set.",
  bullets: [
    "No countdown timers or scarcity gimmicks on this page.",
    "Annual is optional — monthly is the default view.",
    "Checkout only runs when Stripe is configured; list prices come from the catalog.",
  ],
} as const;

export const PRICING_HONESTY = [
  "List prices come from one billing catalog so marketing and checkout stay aligned.",
  "Paid checkout stays off until Stripe is configured — we do not invent a successful charge.",
] as const;
