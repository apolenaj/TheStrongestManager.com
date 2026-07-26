import { describe, expect, it } from "vitest";
import {
  ENTITLEMENT_HONESTY,
  FEATURE_ENTITLEMENTS,
  buildEntitlementSystemSnapshot,
  isWithinNumericLimit,
  limitKeyForFeature,
} from "@/domain/entitlements";

describe("entitlement system", () => {
  it("maps prompt example features to plan limits", () => {
    const ids = FEATURE_ENTITLEMENTS.map((f) => f.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "technique_analyses",
        "ai_coach",
        "advanced_analytics",
        "coach_tools",
        "programs",
      ]),
    );
    expect(limitKeyForFeature("technique_analyses")).toBe(
      "techniqueAnalysesPerMonth",
    );
    expect(limitKeyForFeature("ai_coach")).toBe("adaptiveCoaching");
    expect(limitKeyForFeature("coach_tools")).toBe("coachWorkspace");
    expect(limitKeyForFeature("programs")).toBe("activePrograms");
    expect(ENTITLEMENT_HONESTY.join(" ")).toMatch(/EntitlementService/i);
  });

  it("builds plan matrix and numeric limit helpers", () => {
    expect(isWithinNumericLimit(0, 1)).toBe(true);
    expect(isWithinNumericLimit(1, 1)).toBe(false);
    expect(isWithinNumericLimit(99, "unlimited")).toBe(true);
    const snap = buildEntitlementSystemSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.matrix.length).toBeGreaterThanOrEqual(4);
    expect(snap.matrix[0]?.features.technique_analyses).toBeDefined();
  });
});
