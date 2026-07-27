import { describe, expect, it } from "vitest";
import {
  CATALOG_WORKOUT_PAIN_FLAG_MESSAGE,
  estimatedRirFromRpe,
  proposeTmReductionFromRpe,
  suggestedWeightKg,
} from "@/domain/catalog-workout/rules";

describe("catalog workout rules", () => {
  it("calculates suggested weight from percent of TM", () => {
    expect(
      suggestedWeightKg({ percentOfTm: 70, trainingMaxKg: 180 }),
    ).toBe(126);
  });

  it("estimates RIR from RPE", () => {
    expect(estimatedRirFromRpe(7)).toBe(3);
  });

  it("proposes TM cut only when RPE overshoots significantly", () => {
    expect(
      proposeTmReductionFromRpe({
        liftKey: "squat",
        currentTm: 180,
        prescribedRpe: 7,
        actualRpe: 8,
      }),
    ).toBeNull();

    const proposal = proposeTmReductionFromRpe({
      liftKey: "squat",
      currentTm: 180,
      prescribedRpe: 7,
      actualRpe: 9,
    });
    expect(proposal).not.toBeNull();
    expect(proposal?.toTm).toBe(171);
    expect(proposal?.reason).toMatch(/approve/i);
  });

  it("uses safe non-diagnostic pain language", () => {
    expect(CATALOG_WORKOUT_PAIN_FLAG_MESSAGE).toMatch(/seek medical assessment/i);
    expect(CATALOG_WORKOUT_PAIN_FLAG_MESSAGE.toLowerCase()).not.toContain(
      "you have a tear",
    );
    expect(CATALOG_WORKOUT_PAIN_FLAG_MESSAGE.toLowerCase()).toContain(
      "does not diagnose",
    );
  });
});
