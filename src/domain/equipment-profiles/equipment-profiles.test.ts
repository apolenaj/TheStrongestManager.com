import { describe, expect, it } from "vitest";
import {
  EQUIPMENT_AWARE_HONESTY,
  EQUIPMENT_PROFILE_PRESETS,
  equipmentFullyAvailable,
  gateExerciseEquipment,
  inferEquipmentProfileId,
  mapOnboardingEquipmentToCatalog,
} from "@/domain/equipment-profiles";

describe("equipment-profiles", () => {
  it("defines commercial, home, powerlifting, and minimal presets", () => {
    expect(EQUIPMENT_PROFILE_PRESETS.commercial_gym.label).toBe(
      "Commercial gym",
    );
    expect(EQUIPMENT_PROFILE_PRESETS.home_gym.label).toBe("Home gym");
    expect(EQUIPMENT_PROFILE_PRESETS.powerlifting_gym.label).toBe(
      "Powerlifting gym",
    );
    expect(EQUIPMENT_PROFILE_PRESETS.minimal.label).toBe("Minimal equipment");
    expect(EQUIPMENT_AWARE_HONESTY.join(" ")).toMatch(/unavailable equipment/i);
  });

  it("maps onboarding IDs to catalog keys including specialty → other", () => {
    expect(
      mapOnboardingEquipmentToCatalog([
        "barbell",
        "dumbbells",
        "machines",
        "specialty",
      ]),
    ).toEqual(
      expect.arrayContaining(["barbell", "dumbbell", "machine", "other"]),
    );
  });

  it("never allows primary recommendations for unavailable equipment", () => {
    const decision = gateExerciseEquipment({
      required: ["barbell", "rack", "bench"],
      available: ["dumbbell", "bodyweight"],
    });
    expect(decision.allowPrimary).toBe(false);
    expect(decision.allowAsAlternative).toBe(true);
    expect(decision.equipmentNote).toMatch(/Alternative/i);
    expect(decision.equipmentNote).toMatch(/barbell/i);
  });

  it("treats empty equipment as incomplete, not full gym access", () => {
    const decision = gateExerciseEquipment({
      required: ["barbell"],
      available: [],
    });
    expect(decision.allowPrimary).toBe(false);
    expect(decision.allowAsAlternative).toBe(false);
  });

  it("implies plates when barbell is available", () => {
    expect(
      equipmentFullyAvailable(
        ["barbell", "plates", "bench"],
        ["barbell", "bench"],
      ),
    ).toBe(true);
  });

  it("infers presets from checklist fingerprints", () => {
    expect(
      inferEquipmentProfileId([
        ...EQUIPMENT_PROFILE_PRESETS.minimal.onboardingIds,
      ]),
    ).toBe("minimal");
    expect(
      inferEquipmentProfileId([
        ...EQUIPMENT_PROFILE_PRESETS.commercial_gym.onboardingIds,
      ]),
    ).toBe("commercial_gym");
  });
});
