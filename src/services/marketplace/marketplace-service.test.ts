import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

vi.mock("@/config/feature-flags", () => ({
  featureFlags: {
    coachMarketplace: true,
  },
}));

describe("marketplace public state", () => {
  const stamp = Date.now();
  const email = `market-coach-${stamp}@example.com`;
  let userId = "";
  let profileId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        isCoach: true,
        coachMarketplaceProfile: {
          create: {
            slug: `coach-${stamp}`,
            displayName: "Draft Only Coach",
            bio: "Should not appear while draft",
            listingStatus: "draft",
            specializationsJson: JSON.stringify(["powerlifting"]),
            languagesJson: JSON.stringify(["en"]),
            experienceSummary: "10 years",
            pricingJson: JSON.stringify({
              currency: "USD",
              amountCents: 15000,
              billingPeriod: "month",
              label: "$150 / month",
            }),
            credentials: {
              create: [
                {
                  title: "CSCS",
                  issuer: "NSCA",
                  verificationStatus: "unverified",
                },
                {
                  title: "Verified Cert",
                  issuer: "Example",
                  verificationStatus: "verified",
                  verifiedAt: new Date(),
                },
              ],
            },
          },
        },
      },
      include: { coachMarketplaceProfile: true },
    });
    userId = user.id;
    profileId = user.coachMarketplaceProfile!.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    vi.unstubAllGlobals();
  });

  it("returns empty browse when no published profiles (no fake coaches)", async () => {
    const { getMarketplacePublicState } = await import(
      "@/services/marketplace/marketplace-service"
    );
    const state = await getMarketplacePublicState();
    expect(state.flagEnabled).toBe(true);
    expect(state.showComingSoon).toBe(true);
    expect(state.listings).toHaveLength(0);
    expect(state.honesty[1]).toMatch(/Verified/i);
  });

  it("lists published coaches and does not mark unverified credentials as verified", async () => {
    await prisma.coachMarketplaceProfile.update({
      where: { id: profileId },
      data: {
        listingStatus: "published",
        publishedAt: new Date(),
        displayName: "Published Coach",
      },
    });

    const { getMarketplacePublicState, getPublishedCoachListingBySlug } =
      await import("@/services/marketplace/marketplace-service");

    const state = await getMarketplacePublicState();
    expect(state.showComingSoon).toBe(false);
    expect(state.listings).toHaveLength(1);
    expect(state.listings[0]!.displayName).toBe("Published Coach");
    expect(state.listings[0]!.verifiedCredentialCount).toBe(1);
    expect(state.listings[0]!.credentialCount).toBe(2);

    const detail = await getPublishedCoachListingBySlug(`coach-${stamp}`);
    expect(detail).not.toBeNull();
    const unverified = detail!.credentials.find((c) => c.title === "CSCS");
    expect(unverified?.isVerified).toBe(false);
    expect(unverified?.verificationLabel).toBe("Unverified");
    const verified = detail!.credentials.find(
      (c) => c.title === "Verified Cert",
    );
    expect(verified?.isVerified).toBe(true);
    expect(verified?.verificationLabel).toBe("Verified");
  });
});
