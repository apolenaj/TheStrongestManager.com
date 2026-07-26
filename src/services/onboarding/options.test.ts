import { describe, expect, it } from "vitest";
import {
  buildInitialRecommendation,
  emptyOnboardingDraft,
  resolvePrimaryDiscipline,
} from "@/services/onboarding/options";

describe("onboarding deterministic helpers", () => {
  it("maps a single sport to primary discipline", () => {
    expect(
      resolvePrimaryDiscipline({
        primaryGoalId: "strength",
        sports: ["powerlifting"],
      }),
    ).toBe("powerlifting");
  });

  it("maps multiple sports to hybrid", () => {
    expect(
      resolvePrimaryDiscipline({
        primaryGoalId: "strength",
        sports: ["powerlifting", "bodybuilding"],
      }),
    ).toBe("hybrid");
  });

  it("falls back to goal discipline when sports are empty", () => {
    expect(
      resolvePrimaryDiscipline({
        primaryGoalId: "muscle_gain",
        sports: [],
      }),
    ).toBe("bodybuilding");
  });

  it("builds recommendations only from provided data", () => {
    const draft = emptyOnboardingDraft();
    draft.primaryGoalId = "strength";
    draft.experienceLevelId = "intermediate";
    draft.painCautionAcknowledged = true;

    const missingFrequency = buildInitialRecommendation(draft);
    expect(missingFrequency.title).toMatch(/frequency/i);

    draft.daysPerWeek = 4;
    const missingEquipment = buildInitialRecommendation(draft);
    expect(missingEquipment.title).toMatch(/equipment/i);

    draft.equipment = ["barbell"];
    const ready = buildInitialRecommendation(draft);
    expect(ready.title).toMatch(/first workout/i);
    expect(ready.body).toMatch(/fastest path|log a session/i);
    expect(ready.body).not.toMatch(/AI diagnosed|guaranteed/i);
  });
});
