import { featureFlags } from "@/config/feature-flags";
import {
  PRICING_CANCELLATION_COPY,
  PRICING_HONESTY,
  annualSavingsCents,
  formatLimit,
  formatMoneyCents,
  getActiveBillingProvider,
  listPublicPlans,
  normalizePlanId,
  priceForInterval,
  readStripeEnvConfig,
  resolveEntitlements,
  type BillingInterval,
  type PlanDefinition,
  type PlanId,
} from "@/domain/billing";
import { prisma } from "@/lib/db";
import { trackProductEventSafe } from "@/services/analytics/track";

export type PricingTierView = {
  intervalDefault: BillingInterval;
  checkoutEnabled: boolean;
  provider: {
    id: string;
    label: string;
    status: string;
    note: string;
  };
  tiers: Array<{
    plan: PlanDefinition;
    monthlyLabel: string | null;
    annualLabel: string | null;
    annualSavingsLabel: string | null;
    limitsSummary: string[];
    cta: {
      label: string;
      href: string;
      enabled: boolean;
      hint: string;
    };
  }>;
  cancellation: typeof PRICING_CANCELLATION_COPY;
  honesty: readonly string[];
};

function buildCta(
  plan: PlanDefinition,
  checkoutEnabled: boolean,
): PricingTierView["tiers"][number]["cta"] {
  if (plan.id === "free") {
    return {
      label: "Start free",
      href: "/signup",
      enabled: true,
      hint: "No card required to create an account.",
    };
  }
  if (!plan.purchasable) {
    return {
      label: "Not available yet",
      href: "/coaching",
      enabled: false,
      hint: plan.availabilityNote ?? "Optional future tier.",
    };
  }
  if (!checkoutEnabled) {
    return {
      label: "Account required first",
      href: "/signup",
      enabled: true,
      hint: "Self-serve checkout is not live yet. Create a free account now; paid upgrade opens when Stripe is configured — this button does not charge you.",
    };
  }
  return {
    label: `Choose ${plan.name}`,
    href: `/signup?plan=${plan.id}`,
    enabled: true,
    hint: "You will confirm billing interval after Stripe checkout is wired.",
  };
}

/**
 * Public pricing page model — catalog-driven, no dark patterns.
 * Pass `locale` so list prices render in CZK on the Czech site.
 */
export function getPricingPageView(locale: string = "en"): PricingTierView {
  const provider = getActiveBillingProvider();
  const stripeEnv = readStripeEnvConfig();
  const checkoutEnabled =
    featureFlags.billingCheckout &&
    provider.status === "ready" &&
    stripeEnv.secretKeyConfigured &&
    stripeEnv.anyPriceIdConfigured;

  const providerNote =
    provider.status === "ready" && checkoutEnabled
      ? `${provider.label} checkout is configured.`
      : `${provider.label} adapter status: ${provider.status}. List prices are from the central catalog; checkout does not invent charges.`;

  const moSuffix = locale === "cs" ? "/měs." : "/mo";
  const yrSuffix = locale === "cs" ? "/rok" : "/yr";

  const tiers = listPublicPlans().map((plan) => {
    const savings = annualSavingsCents(plan);
    return {
      plan,
      monthlyLabel: plan.monthly
        ? `${formatMoneyCents(plan.monthly.amountCents, "usd", locale)}${moSuffix}`
        : plan.id === "free"
          ? formatMoneyCents(0, "usd", locale)
          : null,
      annualLabel: plan.annual
        ? `${formatMoneyCents(plan.annual.amountCents, "usd", locale)}${yrSuffix}`
        : null,
      annualSavingsLabel: savings
        ? locale === "cs"
          ? `Ušetři ${formatMoneyCents(savings, "usd", locale)} oproti 12× měsíčně`
          : `Save ${formatMoneyCents(savings, "usd", locale)} vs 12× monthly`
        : null,
      limitsSummary: [
        `Technique analyses / month: ${formatLimit(plan.limits.techniqueAnalysesPerMonth)}`,
        `Active programs: ${formatLimit(plan.limits.activePrograms)}`,
        `Progress analytics: ${plan.limits.progressAnalytics ? "Yes" : "No"}`,
        `Adaptive suggestions: ${plan.limits.adaptiveCoaching ? "Yes (you approve)" : "No"}`,
        `Cross-domain notes: ${plan.limits.advancedInsights ? "When enough data exists" : "No"}`,
        `Mealnexio connection: ${
          plan.limits.mealnexioIntegration
            ? "Entitlement only — API not live"
            : "No"
        }`,
      ],
      cta: buildCta(plan, checkoutEnabled),
    };
  });

  return {
    intervalDefault: "monthly",
    checkoutEnabled,
    provider: {
      id: provider.id,
      label: provider.label,
      status: provider.status,
      note: providerNote,
    },
    tiers,
    cancellation: PRICING_CANCELLATION_COPY,
    honesty: PRICING_HONESTY,
  };
}

export async function getSubscriptionForUser(userId: string) {
  const row = await prisma.subscription.findUnique({
    where: { userId },
  });

  const now = new Date();
  const referralGrant = await prisma.referralAccessGrant.findFirst({
    where: {
      userId,
      status: "active",
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    orderBy: { endsAt: "desc" },
  });

  const basePlan = row ? normalizePlanId(row.plan) : ("free" as PlanId);
  const baseStatus = row?.status ?? "active";
  const grantPlan = referralGrant
    ? normalizePlanId(referralGrant.planId)
    : null;

  const planRank: Record<PlanId, number> = {
    free: 0,
    pro: 1,
    performance: 2,
    elite_coaching: 3,
  };
  const effectivePlan =
    grantPlan && planRank[grantPlan] > planRank[basePlan]
      ? grantPlan
      : basePlan;
  /** Complimentary referral access uses trialing so entitlements stay honest. */
  const effectiveStatus =
    grantPlan && planRank[grantPlan] > planRank[basePlan]
      ? "trialing"
      : baseStatus;

  if (!row && !referralGrant) {
    return {
      planId: "free" as PlanId,
      status: "active",
      entitlements: resolveEntitlements({ plan: "free", status: "active" }),
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null as Date | null,
      billingInterval: null as string | null,
      trialEndsAt: null as Date | null,
      graceEndsAt: null as Date | null,
      pendingPlan: null as string | null,
      provider: null as string | null,
      referralAccess: null as null | {
        planId: PlanId;
        endsAt: string;
        kind: string;
      },
    };
  }

  return {
    planId: effectivePlan,
    status: effectiveStatus,
    entitlements: resolveEntitlements({
      plan: effectivePlan,
      status: effectiveStatus,
      graceEndsAt: row?.graceEndsAt ?? null,
      now,
    }),
    cancelAtPeriodEnd: row?.cancelAtPeriodEnd ?? false,
    currentPeriodEnd: referralGrant?.endsAt ?? row?.currentPeriodEnd ?? null,
    billingInterval: row?.billingInterval ?? null,
    trialEndsAt: row?.trialEndsAt ?? null,
    graceEndsAt: row?.graceEndsAt ?? null,
    pendingPlan: row?.pendingPlan ?? null,
    provider: row?.provider ?? null,
    referralAccess: referralGrant
      ? {
          planId: normalizePlanId(referralGrant.planId),
          endsAt: referralGrant.endsAt.toISOString(),
          kind: referralGrant.kind,
        }
      : null,
  };
}

/** Helper for future checkout actions — returns null until provider is ready. */
export async function tryCreateCheckoutSession(input: {
  userId: string;
  planId: PlanId;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
}) {
  if (input.planId === "free" || input.planId === "elite_coaching") {
    const { obs } = await import("@/services/observability");
    obs.warn({
      category: "payment_failures",
      message: "checkout_plan_unavailable",
      props: { planId: input.planId },
    });
    return { ok: false as const, error: "Plan is not available for checkout." };
  }
  const price = priceForInterval(
    listPublicPlans().find((p) => p.id === input.planId)!,
    input.interval,
  );
  if (!price?.stripePriceId) {
    const { obs } = await import("@/services/observability");
    obs.warn({
      category: "payment_failures",
      message: "checkout_price_not_configured",
      props: { planId: input.planId, interval: input.interval },
    });
    return {
      ok: false as const,
      error: "Stripe price id is not configured for this plan/interval.",
    };
  }
  const provider = getActiveBillingProvider();
  const session = await provider.createCheckoutSession({
    userId: input.userId,
    planId: input.planId,
    interval: input.interval,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
    customerEmail: input.customerEmail,
  });
  if (!session) {
    const { obs } = await import("@/services/observability");
    obs.error({
      category: "payment_failures",
      message: "checkout_provider_not_ready",
      props: { planId: input.planId, interval: input.interval },
    });
    return {
      ok: false as const,
      error: "Billing provider is not ready for checkout.",
    };
  }

  trackProductEventSafe({
    name: "checkout_started",
    props: {
      planId: input.planId,
      interval: input.interval,
    },
    userId: input.userId,
  });

  const { enqueueDomainEventSafe } = await import("@/services/event-driven");
  enqueueDomainEventSafe({
    name: "billing.checkout_started",
    payload: {
      userId: input.userId,
      planId: input.planId,
      interval: input.interval,
    },
    dedupeParts: [input.userId, input.planId, input.interval, session.id],
  });

  return { ok: true as const, session };
}

/**
 * Call when a paid subscription becomes active (e.g. Stripe webhook).
 * Does not invent activation — callers must have verified provider state.
 */
export function emitSubscriptionActivatedEvent(input: {
  userId: string;
  planId: PlanId;
  fromPlanId?: PlanId;
}): void {
  trackProductEventSafe({
    name: "subscription_activated",
    props: {
      planId: input.planId,
      fromPlanId: input.fromPlanId,
    },
    userId: input.userId,
  });

  void import("@/services/event-driven").then(({ enqueueDomainEventSafe }) => {
    enqueueDomainEventSafe({
      name: "billing.subscription_activated",
      payload: {
        userId: input.userId,
        planId: input.planId,
        fromPlanId: input.fromPlanId,
      },
      dedupeParts: [input.userId, input.planId],
    });
  });
}
