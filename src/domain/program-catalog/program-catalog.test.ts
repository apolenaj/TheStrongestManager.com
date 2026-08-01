import { describe, expect, it } from "vitest";
import {
  PROGRAM_CATALOG_SEED,
  PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE,
} from "@/domain/program-catalog/catalog";
import {
  toEntitledProgramProduct,
  toPublicProgramProduct,
} from "@/domain/program-catalog/public";

describe("program catalog seed", () => {
  it("includes legacy free/paid families, expanded paid catalog, and the bundle", () => {
    const free = PROGRAM_CATALOG_SEED.filter((p) => p.variant === "free");
    const paid = PROGRAM_CATALOG_SEED.filter((p) => p.variant === "paid");
    const bundles = PROGRAM_CATALOG_SEED.filter((p) => p.variant === "bundle");
    expect(free).toHaveLength(6);
    expect(paid).toHaveLength(17);
    expect(bundles).toHaveLength(1);
    expect(free.every((p) => p.durationWeeks === 4 && p.isFree)).toBe(true);
    expect(
      paid.every((p) => p.durationWeeks >= 8 && p.durationWeeks <= 16 && !p.isFree),
    ).toBe(true);
    expect(bundles[0]?.displayPricePence).toBe(
      PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.completeMethodCollection,
    );
  });

  it("hides drafts and stripe fields from public mapper", () => {
    const draft = toPublicProgramProduct({
      id: "1",
      slug: "linear-strength-builder",
      name: "Linear Strength Builder",
      description: "x",
      methodId: null,
      durationWeeks: 12,
      availableSchedules: ["3day"],
      difficulty: "beginner",
      recoveryDemand: "moderate",
      isFree: false,
      status: "draft",
      defaultCurrency: "gbp",
      displayPrice: 4900,
      bundleIds: [],
    });
    expect(draft).toBeNull();

    const published = toPublicProgramProduct({
      id: "1",
      slug: "linear-strength-builder",
      name: "Linear Strength Builder",
      description: "x",
      methodId: "linear-periodization",
      durationWeeks: 12,
      availableSchedules: ["3day"],
      difficulty: "beginner",
      recoveryDemand: "moderate",
      isFree: false,
      status: "published",
      defaultCurrency: "gbp",
      displayPrice: 4900,
      bundleIds: [],
    });
    expect(published).not.toBeNull();
    expect(published).not.toHaveProperty("stripePriceId");
  });

  it("does not leak draft products via entitlements mapper", () => {
    expect(
      toEntitledProgramProduct({
        id: "1",
        slug: "secret-draft",
        name: "Secret",
        description: "x",
        methodId: null,
        durationWeeks: 4,
        availableSchedules: [],
        difficulty: "beginner",
        recoveryDemand: "low",
        isFree: true,
        status: "draft",
        defaultCurrency: "gbp",
        displayPrice: 0,
        bundleIds: [],
      }),
    ).toBeNull();
  });
});
