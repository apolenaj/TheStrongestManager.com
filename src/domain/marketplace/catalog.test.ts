import { describe, expect, it } from "vitest";
import {
  canAppearInMarketplaceBrowse,
  canCreateInquiry,
  credentialVerificationLabel,
  isCredentialVerified,
  matchesSportFilter,
  MARKETPLACE_PAYMENTS_DISABLED,
  toPublicCredentialView,
} from "@/domain/marketplace/catalog";

describe("marketplace credentials & listing honesty", () => {
  it("never treats unverified or pending as verified", () => {
    expect(isCredentialVerified({ verificationStatus: "unverified" })).toBe(
      false,
    );
    expect(
      isCredentialVerified({ verificationStatus: "pending_review" }),
    ).toBe(false);
    expect(isCredentialVerified({ verificationStatus: "rejected" })).toBe(
      false,
    );
    expect(credentialVerificationLabel("unverified")).toBe("Unverified");
    expect(credentialVerificationLabel("pending_review")).toBe(
      "Verification pending",
    );
    expect(credentialVerificationLabel("verified")).toBe("Verified");
  });

  it("expires verified credentials past expiresAt", () => {
    const past = new Date("2020-01-01T00:00:00.000Z");
    expect(
      isCredentialVerified({
        verificationStatus: "verified",
        expiresAt: past,
        now: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).toBe(false);
    expect(
      credentialVerificationLabel("verified", {
        expiresAt: past,
        now: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).toBe("Expired");
  });

  it("maps public credential views without implying verification", () => {
    const view = toPublicCredentialView({
      id: "c1",
      title: "CSCS",
      issuer: "NSCA",
      yearEarned: 2019,
      verificationStatus: "unverified",
    });
    expect(view.isVerified).toBe(false);
    expect(view.verificationLabel).not.toBe("Verified");
  });

  it("only published listings appear in browse", () => {
    expect(canAppearInMarketplaceBrowse("draft")).toBe(false);
    expect(canAppearInMarketplaceBrowse("pending_review")).toBe(false);
    expect(canAppearInMarketplaceBrowse("published")).toBe(true);
  });

  it("filters by sport specialization and gates inquiries", () => {
    expect(
      matchesSportFilter(["Powerlifting", "Technique"], "powerlifting"),
    ).toBe(true);
    expect(matchesSportFilter(["Bodybuilding"], "strongman")).toBe(false);
    expect(
      canCreateInquiry({ listingStatus: "draft", message: "x".repeat(25) }).ok,
    ).toBe(false);
    expect(
      canCreateInquiry({
        listingStatus: "published",
        message: "Looking for meet prep help this cycle.",
      }),
    ).toEqual({ ok: true });
    expect(MARKETPLACE_PAYMENTS_DISABLED).toBe(true);
  });
});
