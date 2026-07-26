import { describe, expect, it } from "vitest";
import {
  PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION,
  PROGRAM_MARKETPLACE_HONESTY,
  canAppearInProgramMarketplaceBrowse,
  canRateProgramListing,
  creatorPayoutCents,
  platformCommissionCents,
} from "@/domain/program-marketplace";

describe("program marketplace domain", () => {
  it("never invents browse listings from non-published status", () => {
    expect(canAppearInProgramMarketplaceBrowse("published")).toBe(true);
    expect(canAppearInProgramMarketplaceBrowse("pending_review")).toBe(false);
    expect(canAppearInProgramMarketplaceBrowse("draft")).toBe(false);
    expect(PROGRAM_MARKETPLACE_HONESTY[0]).toMatch(/does not invent/i);
  });

  it("allows ratings only from verified purchasers", () => {
    expect(
      canRateProgramListing({
        purchaseStatus: "completed",
        alreadyRated: false,
      }),
    ).toBe(true);
    expect(
      canRateProgramListing({
        purchaseStatus: "completed",
        alreadyRated: true,
      }),
    ).toBe(false);
    expect(
      canRateProgramListing({
        purchaseStatus: "refunded",
        alreadyRated: false,
      }),
    ).toBe(false);
  });

  it("ledgers platform commission without inventing payouts", () => {
    expect(platformCommissionCents(10000)).toBe(1500);
    expect(creatorPayoutCents(10000)).toBe(8500);
    expect(platformCommissionCents(0)).toBe(0);
  });

  it("documents copyright protection for unauthorized uploads", () => {
    expect(
      PROGRAM_MARKETPLACE_COPYRIGHT_PROTECTION.some((l) =>
        /copyrighted/i.test(l),
      ),
    ).toBe(true);
  });
});
