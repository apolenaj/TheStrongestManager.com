import { describe, expect, it } from "vitest";
import {
  AFFILIATE_DISCLOSURE,
  AFFILIATE_PARTNER_TYPES,
  buildAffiliateLandingPath,
  buildAffiliateSignupPath,
  canDisplayAffiliatePartnerships,
  estimateCommissionCents,
  filterPartnersForDisplay,
  generateAffiliateTrackingCode,
  isValidAffiliateTrackingCode,
  normalizeAffiliateSlug,
} from "@/domain/affiliate-system";

describe("affiliate system domain", () => {
  it("supports creator, coach, and partner types", () => {
    expect(AFFILIATE_PARTNER_TYPES).toEqual([
      "creator",
      "coach",
      "partner",
    ]);
  });

  it("never displays partnerships without disclosure", () => {
    expect(canDisplayAffiliatePartnerships({ disclosureVisible: false })).toBe(
      false,
    );
    expect(canDisplayAffiliatePartnerships({ disclosureVisible: true })).toBe(
      true,
    );
    expect(
      filterPartnersForDisplay([{ id: "1" }], { disclosureVisible: false }),
    ).toEqual([]);
    expect(
      filterPartnersForDisplay([{ id: "1" }], { disclosureVisible: true }),
    ).toEqual([{ id: "1" }]);
    expect(AFFILIATE_DISCLOSURE[0]).toMatch(/Disclosure/i);
  });

  it("tracks clicks via landing path and conversions via ?aff=", () => {
    const code = generateAffiliateTrackingCode(10);
    expect(isValidAffiliateTrackingCode(code)).toBe(true);
    expect(buildAffiliateLandingPath(code)).toBe(`/a/${code}`);
    expect(buildAffiliateSignupPath(code)).toContain(`aff=${code}`);
    expect(buildAffiliateSignupPath(code)).toContain(
      "utm_source=affiliate_system",
    );
  });

  it("estimates commission ledger amounts by type and event", () => {
    expect(
      estimateCommissionCents({ partnerType: "creator", eventType: "signup" }),
    ).toBe(500);
    expect(
      estimateCommissionCents({
        partnerType: "partner",
        eventType: "subscription",
      }),
    ).toBe(2500);
  });

  it("normalizes partner slugs", () => {
    expect(normalizeAffiliateSlug("  My Coach!! ")).toBe("my-coach");
    expect(normalizeAffiliateSlug("x")).toBeNull();
  });
});
