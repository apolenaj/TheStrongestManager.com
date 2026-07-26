import { describe, expect, it } from "vitest";
import {
  assertAthleteSeat,
  assertCoachSeat,
  getOrgPlanCatalog,
  getOrgUpgradeOptions,
  normalizeOrgPlanId,
  resolveOrgEntitlements,
} from "@/domain/org-billing";

describe("org billing catalog", () => {
  it("does not invent B2B list prices without env", () => {
    const team = getOrgPlanCatalog().find((p) => p.id === "org_team");
    // Without PRICING_ORG_TEAM_*_CENTS, prices stay unpublished
    expect(team?.monthly).toBeNull();
    expect(team?.annual).toBeNull();
    expect(team?.purchasable).toBe(false);
    expect(team?.availabilityNote).toMatch(/not published/i);
  });

  it("defines seat and usage limits for each plan", () => {
    for (const plan of getOrgPlanCatalog()) {
      expect(plan.limits.maxCoaches).toBeDefined();
      expect(plan.limits.maxAthletes).toBeDefined();
      expect(plan.limits.techniqueAnalysesPerMonth).toBeDefined();
    }
  });

  it("offers upgrade ladder from free", () => {
    const upgrades = getOrgUpgradeOptions("org_free");
    expect(upgrades.map((p) => p.id)).toContain("org_team");
    expect(upgrades.map((p) => p.id)).toContain("org_facility");
    expect(upgrades.map((p) => p.id)).toContain("org_enterprise");
  });

  it("normalizes unknown plans to org_free", () => {
    expect(normalizeOrgPlanId("nope")).toBe("org_free");
  });
});

describe("org entitlements & seats", () => {
  it("enforces coach and athlete seat caps", () => {
    const ent = resolveOrgEntitlements({
      plan: "org_free",
      status: "active",
    });
    const coachOk = assertCoachSeat(ent, { coachesUsed: 0, athletesUsed: 0 });
    expect(coachOk.ok).toBe(true);

    const coachLimit = assertCoachSeat(ent, {
      coachesUsed: typeof ent.maxCoaches === "number" ? ent.maxCoaches : 999,
      athletesUsed: 0,
    });
    expect(coachLimit.ok).toBe(false);

    const athleteLimit = assertAthleteSeat(ent, {
      coachesUsed: 0,
      athletesUsed:
        typeof ent.maxAthletes === "number" ? ent.maxAthletes : 999,
    });
    expect(athleteLimit.ok).toBe(false);
  });

  it("falls back to free limits when paid status inactive", () => {
    const ent = resolveOrgEntitlements({
      plan: "org_facility",
      status: "canceled",
    });
    expect(ent.planId).toBe("org_free");
    expect(ent.accessActive).toBe(false);
  });
});
