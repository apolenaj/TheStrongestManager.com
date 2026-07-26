import { describe, expect, it, beforeEach } from "vitest";
import {
  annualSavingsCents,
  formatMoneyCents,
  getActiveBillingProvider,
  getPlanById,
  getPlanCatalog,
  normalizePlanId,
  resetBillingProvidersForTests,
  resolveEntitlements,
  hasEntitlement,
} from "@/domain/billing";
import { getPricingPageView } from "@/services/billing/billing-service";

describe("billing catalog", () => {
  it("stores prices centrally for purchasable tiers", () => {
    const catalog = getPlanCatalog();
    expect(catalog.map((p) => p.id)).toEqual([
      "free",
      "pro",
      "performance",
      "elite_coaching",
    ]);
    const pro = getPlanById("pro")!;
    expect(pro.monthly?.amountCents).toBeGreaterThan(0);
    expect(pro.annual?.amountCents).toBeGreaterThan(0);
    expect(formatMoneyCents(1900)).toMatch(/\$19/);
    const savings = annualSavingsCents(pro);
    expect(savings).toBe(
      pro.monthly!.amountCents * 12 - pro.annual!.amountCents,
    );
  });

  it("normalizes legacy plan ids", () => {
    expect(normalizePlanId("athlete")).toBe("pro");
    expect(normalizePlanId("coach_premium")).toBe("elite_coaching");
    expect(normalizePlanId("free")).toBe("free");
  });

  it("does not grant paid entitlements when subscription is canceled", () => {
    const entitlements = resolveEntitlements({
      plan: "pro",
      status: "canceled",
    });
    expect(entitlements.planId).toBe("free");
    expect(hasEntitlement(entitlements, "progressAnalytics")).toBe(false);
  });

  it("grants performance mealnexio entitlement when active", () => {
    const entitlements = resolveEntitlements({
      plan: "performance",
      status: "active",
    });
    expect(hasEntitlement(entitlements, "mealnexioIntegration")).toBe(true);
    expect(hasEntitlement(entitlements, "adaptiveCoaching")).toBe(true);
  });
});

describe("billing provider", () => {
  beforeEach(() => {
    resetBillingProvidersForTests();
  });

  it("defaults to unavailable Stripe stub that never invents checkout", async () => {
    const provider = getActiveBillingProvider();
    expect(provider.id).toBe("stripe");
    expect(provider.status).toBe("unavailable");
    expect(
      await provider.createCheckoutSession({
        userId: "u1",
        planId: "pro",
        interval: "monthly",
        successUrl: "https://example.com/ok",
        cancelUrl: "https://example.com/cancel",
      }),
    ).toBeNull();
  });
});

describe("getPricingPageView", () => {
  it("defaults interval to monthly and exposes cancellation copy", () => {
    const view = getPricingPageView();
    expect(view.intervalDefault).toBe("monthly");
    expect(view.checkoutEnabled).toBe(false);
    expect(view.cancellation.title).toBe("Cancellation");
    expect(view.tiers).toHaveLength(4);
    expect(view.tiers[0]?.plan.id).toBe("free");
    expect(view.tiers[0]?.cta.href).toBe("/signup");
    const pro = view.tiers.find((t) => t.plan.id === "pro");
    expect(pro?.cta.label).toBe("Account required first");
    expect(
      pro?.limitsSummary.some((line) => line.includes("Planned")),
    ).toBe(false);
    const performance = view.tiers.find((t) => t.plan.id === "performance");
    expect(
      performance?.limitsSummary.some((line) =>
        line.includes("API not live"),
      ),
    ).toBe(true);
  });
});
