import { describe, expect, it } from "vitest";
import {
  BILLING_2_CAPABILITIES,
  BILLING_2_HONESTY,
  comparePlans,
  isWithinGracePeriod,
  parseStripeBillingEvent,
  resolveEntitlements,
} from "@/domain/billing";
import { buildBilling2Snapshot } from "@/domain/billing/billing-2-snapshot";

describe("billing 2.0", () => {
  it("covers monetization capabilities", () => {
    const ids = BILLING_2_CAPABILITIES.map((c) => c.id);
    for (const id of [
      "monthly",
      "annual",
      "trials",
      "coupons",
      "credits",
      "upgrades",
      "downgrades",
      "grace",
      "invoices",
      "webhook_idempotency",
      "no_frontend_grant",
    ]) {
      expect(ids).toContain(id);
    }
    expect(BILLING_2_HONESTY.join(" ")).toMatch(/frontend/i);
    expect(buildBilling2Snapshot().counts.shipped).toBeGreaterThanOrEqual(10);
  });

  it("classifies upgrades/downgrades and grace entitlements", () => {
    expect(comparePlans("pro", "performance")).toBe("upgrade");
    expect(comparePlans("performance", "pro")).toBe("downgrade");
    expect(comparePlans("pro", "pro")).toBe("same");

    const graceEnd = new Date(Date.now() + 60_000);
    expect(
      isWithinGracePeriod({
        status: "past_due",
        graceEndsAt: graceEnd,
      }),
    ).toBe(true);

    const entitled = resolveEntitlements({
      plan: "pro",
      status: "past_due",
      graceEndsAt: graceEnd,
    });
    expect(entitled.accessActive).toBe(true);
    expect(entitled.inGracePeriod).toBe(true);
    expect(entitled.planId).toBe("pro");

    const expired = resolveEntitlements({
      plan: "pro",
      status: "past_due",
      graceEndsAt: new Date(Date.now() - 1000),
    });
    expect(expired.accessActive).toBe(false);
    expect(expired.planId).toBe("free");
  });

  it("parses subscription webhook into upsert command", () => {
    const parsed = parseStripeBillingEvent({
      id: "evt_test_1",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_1",
          customer: "cus_1",
          status: "trialing",
          trial_end: Math.floor(Date.now() / 1000) + 86400,
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
          cancel_at_period_end: false,
          metadata: {
            userId: "user_1",
            planId: "pro",
            billingInterval: "monthly",
            couponCode: "WELCOME10",
          },
          items: {
            data: [
              {
                price: {
                  id: "price_1",
                  recurring: { interval: "month" },
                },
              },
            ],
          },
        },
      },
    });
    expect("ok" in parsed && parsed.ok === false).toBe(false);
    if ("ok" in parsed) return;
    expect(parsed.providerEventId).toBe("evt_test_1");
    expect(parsed.commands.some((c) => c.kind === "upsert_subscription")).toBe(
      true,
    );
    expect(parsed.commands.some((c) => c.kind === "redeem_coupon")).toBe(true);
  });
});
