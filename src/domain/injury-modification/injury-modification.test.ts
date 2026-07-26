import { describe, expect, it } from "vitest";
import {
  INJURY_DECLARATION_KINDS,
  INJURY_MODIFICATION_FORBIDDEN_PHRASES,
  INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
  INJURY_MODIFICATION_HONESTY,
  INJURY_SUGGESTION_KINDS,
  injuryModificationPrefersLowerLoading,
  resolveInjuryModificationPlan,
} from "@/domain/injury-modification";

describe("injury-modification", () => {
  it("defines user declaration kinds and suggestion kinds", () => {
    expect(INJURY_DECLARATION_KINDS).toEqual([
      "avoid_painful_movement",
      "temporary_restriction",
      "professional_instruction",
    ]);
    expect(INJURY_SUGGESTION_KINDS).toEqual([
      "alternative_exercise",
      "reduced_range",
      "lower_loading",
    ]);
  });

  it("always includes healthcare disclaimer and never-diagnose stance", () => {
    expect(INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER).toMatch(
      /qualified healthcare professional/i,
    );
    expect(INJURY_MODIFICATION_HONESTY.join(" ")).toMatch(/not an injury diagnosis/i);
    expect(INJURY_MODIFICATION_FORBIDDEN_PHRASES.length).toBeGreaterThan(0);

    const plan = resolveInjuryModificationPlan({ records: [] });
    expect(plan.neverDiagnose).toBe(true);
    expect(plan.healthcareDisclaimer).toBe(
      INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
    );
  });

  it("suggests alternatives, reduced range, and lower loading for declarations", () => {
    const plan = resolveInjuryModificationPlan({
      records: [
        {
          id: "1",
          declarationKind: "avoid_painful_movement",
          status: "active",
          notes: null,
          affectedArea: "overhead press",
          instructionSource: null,
          startsAt: new Date().toISOString(),
          endsAt: null,
          clearedAt: null,
        },
      ],
    });
    expect(plan.active).toBe(true);
    expect(plan.suggestions.map((s) => s.kind).sort()).toEqual([
      "alternative_exercise",
      "lower_loading",
      "reduced_range",
    ]);
    expect(plan.explanation.join(" ")).toMatch(/overhead press/i);
  });

  it("defers to Pain-Safe and withholds workaround suggestions", () => {
    const plan = resolveInjuryModificationPlan({
      painSafeActive: true,
      records: [
        {
          id: "1",
          declarationKind: "temporary_restriction",
          status: "active",
          notes: null,
          affectedArea: null,
          instructionSource: null,
          startsAt: new Date().toISOString(),
          endsAt: null,
          clearedAt: null,
        },
      ],
    });
    expect(plan.deferToPainSafe).toBe(true);
    expect(plan.suggestions).toHaveLength(0);
    expect(plan.explanation.join(" ")).toMatch(/Pain-Safe/i);
  });

  it("biases adaptations toward lower loading when active and not pain-safe", () => {
    expect(
      injuryModificationPrefersLowerLoading({
        planActive: true,
        painSafeActive: false,
        changeKind: "increase_load",
      }),
    ).toBe(true);
    expect(
      injuryModificationPrefersLowerLoading({
        planActive: true,
        painSafeActive: true,
        changeKind: "increase_load",
      }),
    ).toBe(false);
  });
});
