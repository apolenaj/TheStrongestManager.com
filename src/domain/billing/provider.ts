/**
 * Stripe-compatible billing provider abstraction (Prompt 33).
 * Do not assume Stripe keys exist. Never invent successful checkout.
 */

import type { BillingInterval, PlanId } from "@/domain/billing/catalog";

export type BillingProviderStatus =
  | "unavailable"
  | "not_configured"
  | "ready";

export type CheckoutSessionRequest = {
  userId: string;
  planId: Exclude<PlanId, "free" | "elite_coaching">;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
};

export type CheckoutSessionResult = {
  id: string;
  url: string;
};

export type CustomerPortalRequest = {
  userId: string;
  providerCustomerId: string;
  returnUrl: string;
};

export type CustomerPortalResult = {
  url: string;
};

export type BillingProviderAdapter = {
  id: string;
  label: string;
  status: BillingProviderStatus;
  /**
   * Create a hosted checkout session when configured.
   * Return null when unavailable — never invent a paid redirect.
   */
  createCheckoutSession: (
    input: CheckoutSessionRequest,
  ) => Promise<CheckoutSessionResult | null>;
  /**
   * Create a customer portal session for cancel / payment method updates.
   * Return null when unavailable.
   */
  createCustomerPortalSession: (
    input: CustomerPortalRequest,
  ) => Promise<CustomerPortalResult | null>;
};

/** Default stub — Stripe-shaped API without claiming checkout works. */
export const unavailableStripeAdapter: BillingProviderAdapter = {
  id: "stripe",
  label: "Stripe",
  status: "unavailable",
  async createCheckoutSession() {
    return null;
  },
  async createCustomerPortalSession() {
    return null;
  },
};

const registry: BillingProviderAdapter[] = [unavailableStripeAdapter];

export function listBillingProviders(): BillingProviderAdapter[] {
  return [...registry];
}

export function getActiveBillingProvider(): BillingProviderAdapter {
  const ready = registry.find((p) => p.status === "ready");
  if (ready) return ready;
  const stripe = registry.find((p) => p.id === "stripe");
  return stripe ?? unavailableStripeAdapter;
}

/**
 * Register a real Stripe (or other) adapter when keys and price IDs exist.
 */
export function registerBillingProvider(adapter: BillingProviderAdapter): void {
  if (registry.some((p) => p.id === adapter.id)) {
    throw new Error(`Billing provider already registered: ${adapter.id}`);
  }
  registry.push(adapter);
}

export function resetBillingProvidersForTests(): void {
  registry.length = 0;
  registry.push(unavailableStripeAdapter);
}

/**
 * Env presence check for a future Stripe adapter — does not invent readiness.
 */
export function readStripeEnvConfig(): {
  secretKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
  anyPriceIdConfigured: boolean;
} {
  return {
    secretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    webhookSecretConfigured: Boolean(
      process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    ),
    anyPriceIdConfigured: Boolean(
      process.env.STRIPE_PRICE_PRO_MONTHLY?.trim() ||
        process.env.STRIPE_PRICE_PRO_ANNUAL?.trim() ||
        process.env.STRIPE_PRICE_PERFORMANCE_MONTHLY?.trim() ||
        process.env.STRIPE_PRICE_PERFORMANCE_ANNUAL?.trim(),
    ),
  };
}
