import { describe, expect, it } from "vitest";
import {
  parseStripeBillingEvent,
  type ParsedBillingWebhook,
} from "@/domain/billing/webhook-parse";
import { PROGRAM_COMMERCE_KIND } from "@/domain/program-commerce/constants";
import { programCheckoutMetadata } from "@/domain/program-commerce/price-validation";

function assertParsed(
  parsed: ReturnType<typeof parseStripeBillingEvent>,
): ParsedBillingWebhook {
  if ("ok" in parsed && parsed.ok === false) {
    throw new Error(parsed.error);
  }
  return parsed as ParsedBillingWebhook;
}

describe("program commerce webhook parsing", () => {
  it("emits grant_program_entitlement for one-time program checkout", () => {
    const meta = programCheckoutMetadata({
      userId: "user_1",
      productId: "prod_1",
      orderId: "order_1",
    });
    const parsed = assertParsed(
      parseStripeBillingEvent({
        id: "evt_program_1",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_1",
            mode: "payment",
            payment_status: "paid",
            amount_total: 4900,
            currency: "gbp",
            payment_intent: "pi_1",
            client_reference_id: "user_1",
            metadata: meta,
          },
        },
      }),
    );

    expect(parsed.eventType).toBe("checkout.session.completed");
    expect(parsed.commands).toEqual([
      expect.objectContaining({
        kind: "grant_program_entitlement",
        userId: "user_1",
        productId: "prod_1",
        orderId: "order_1",
        stripeCheckoutSessionId: "cs_test_1",
        amountTotalCents: 4900,
        currency: "gbp",
      }),
    ]);
    expect(meta.commerceKind).toBe(PROGRAM_COMMERCE_KIND);
  });

  it("does not treat program checkout as a subscription upsert", () => {
    const parsed = assertParsed(
      parseStripeBillingEvent({
        id: "evt_program_2",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_2",
            mode: "payment",
            payment_status: "paid",
            metadata: {
              commerceKind: PROGRAM_COMMERCE_KIND,
              userId: "user_2",
              productId: "prod_2",
              orderId: "order_2",
            },
          },
        },
      }),
    );

    expect(parsed.commands.some((c) => c.kind === "upsert_subscription")).toBe(
      false,
    );
    expect(
      parsed.commands.some((c) => c.kind === "grant_program_entitlement"),
    ).toBe(true);
  });
});
