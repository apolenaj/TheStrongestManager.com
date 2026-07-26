import { describe, expect, it } from "vitest";
import {
  GROWTH_ALLOWLIST_SURFACES,
  GROWTH_DENYLIST_CATEGORIES,
  GROWTH_EXPERIMENT_HONESTY,
  GROWTH_EXPERIMENTS,
  assertCategoryNotDenied,
  assertExperimentSurfaceAllowed,
  assignArm,
  assignmentBucket,
  summarizeExperimentOutcomes,
  wilsonInterval,
} from "@/domain/growth-experiments";

describe("growth experiment framework", () => {
  it("allowlists CTA/onboarding/pricing and denylists safety/privacy/medical", () => {
    expect(GROWTH_ALLOWLIST_SURFACES).toEqual([
      "homepage_cta",
      "onboarding",
      "pricing_presentation",
    ]);
    expect(GROWTH_DENYLIST_CATEGORIES).toEqual([
      "safety_warnings",
      "privacy",
      "medical_messaging",
    ]);
    expect(assertExperimentSurfaceAllowed("homepage_cta").ok).toBe(true);
    expect(assertExperimentSurfaceAllowed("trust_center").ok).toBe(false);
    expect(assertCategoryNotDenied("medical_messaging").ok).toBe(false);
    expect(GROWTH_EXPERIMENT_HONESTY.join(" ")).toMatch(/Never|never/i);
    expect(
      GROWTH_EXPERIMENTS.every((e) =>
        (GROWTH_ALLOWLIST_SURFACES as readonly string[]).includes(e.surface),
      ),
    ).toBe(true);
  });

  it("assigns arms stably and gates statistical claims", () => {
    const exp = GROWTH_EXPERIMENTS[0]!;
    const a = assignArm(exp, "subject-1");
    const b = assignArm(exp, "subject-1");
    expect(a.id).toBe(b.id);
    expect(assignmentBucket(exp.id, "subject-1")).toBe(
      assignmentBucket(exp.id, "subject-1"),
    );

    const under = summarizeExperimentOutcomes({
      experimentId: exp.id,
      arms: [
        { armId: "control", exposures: 10, conversions: 2 },
        { armId: "specific", exposures: 10, conversions: 3 },
      ],
    });
    expect(under.status).toBe("insufficient_sample");
    expect(under.declaredWinnerArmId).toBeNull();

    const interval = wilsonInterval(50, 200);
    expect(interval).not.toBeNull();
    expect(interval!.low).toBeLessThanOrEqual(interval!.rate);
  });
});
