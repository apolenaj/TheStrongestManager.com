import { describe, expect, it } from "vitest";
import {
  TRAVEL_PRESETS,
  TRAVEL_TRAINING_HONESTY,
  gateExerciseForTravel,
  isTravelPresetId,
  resolveTravelCatalogKeys,
  resolveTravelOnboardingIds,
  serializeHomeEquipmentSnapshot,
  parseHomeEquipmentSnapshot,
  travelAdaptationLines,
} from "@/domain/travel-training-mode";

describe("travel-training-mode", () => {
  it("defines hotel gym, no gym, and limited presets", () => {
    expect(TRAVEL_PRESETS.hotel_gym.label).toBe("Hotel gym");
    expect(TRAVEL_PRESETS.no_gym.label).toBe("No gym");
    expect(TRAVEL_PRESETS.limited.label).toBe("Limited equipment");
    expect(TRAVEL_TRAINING_HONESTY.join(" ")).toMatch(/original program/i);
    expect(TRAVEL_TRAINING_HONESTY.join(" ")).toMatch(/ending travel/i);
  });

  it("resolves hotel / no-gym catalog keys without barbell priority gear", () => {
    const hotel = resolveTravelCatalogKeys({ preset: "hotel_gym" });
    expect(hotel).toEqual(
      expect.arrayContaining(["dumbbell", "bodyweight"]),
    );
    expect(hotel).not.toContain("barbell");

    const none = resolveTravelCatalogKeys({ preset: "no_gym" });
    expect(none).toEqual(expect.arrayContaining(["bodyweight"]));
    expect(none).not.toContain("dumbbell");
    expect(none).not.toContain("barbell");
  });

  it("allows limited equipment custom checklists", () => {
    expect(
      resolveTravelOnboardingIds({
        preset: "limited",
        limitedEquipment: ["dumbbells", "kettlebells", "bodyweight"],
      }),
    ).toEqual(["dumbbells", "kettlebells", "bodyweight"]);
    expect(
      resolveTravelCatalogKeys({
        preset: "limited",
        limitedEquipment: ["dumbbells", "bodyweight"],
      }),
    ).toEqual(expect.arrayContaining(["dumbbell", "bodyweight"]));
  });

  it("never allows barbell as primary under no-gym travel gear", () => {
    const travel = resolveTravelCatalogKeys({ preset: "no_gym" });
    const decision = gateExerciseForTravel({
      required: ["barbell", "plates"],
      travelEquipment: travel,
      travelActive: true,
    });
    expect(decision.allowPrimary).toBe(false);
    expect(decision.equipmentNote).toMatch(/Alternative/i);
  });

  it("round-trips home equipment snapshots", () => {
    const raw = serializeHomeEquipmentSnapshot({
      availableEquipment: ["barbell", "rack", "bench"],
      equipmentProfileId: "home_gym",
    });
    expect(parseHomeEquipmentSnapshot(raw)).toEqual({
      availableEquipment: ["barbell", "rack", "bench"],
      equipmentProfileId: "home_gym",
    });
  });

  it("describes adaptation and checkpoint honesty", () => {
    const lines = travelAdaptationLines({
      preset: "hotel_gym",
      hasProgramCheckpoint: true,
      catalogKeys: ["dumbbell", "bodyweight"],
    });
    expect(lines.join(" ")).toMatch(/checkpoint/i);
    expect(isTravelPresetId("hotel_gym")).toBe(true);
    expect(isTravelPresetId("commercial_gym")).toBe(false);
  });
});
