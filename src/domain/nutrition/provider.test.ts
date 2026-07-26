import { describe, expect, it, beforeEach } from "vitest";
import {
  getActiveNutritionProvider,
  listNutritionProviders,
  registerNutritionProvider,
  resetNutritionProvidersForTests,
  unavailableMealnexioAdapter,
} from "@/domain/nutrition/provider";
import { NUTRITION_SHARED_DATA_KINDS } from "@/domain/nutrition/types";

describe("nutrition provider registry", () => {
  beforeEach(() => {
    resetNutritionProvidersForTests();
  });

  it("lists the Mealnexio stub by default", () => {
    const list = listNutritionProviders();
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe(unavailableMealnexioAdapter.id);
    expect(list[0]!.supportedDataKinds).toEqual([...NUTRITION_SHARED_DATA_KINDS]);
  });

  it("rejects duplicate provider ids", () => {
    expect(() =>
      registerNutritionProvider({
        ...unavailableMealnexioAdapter,
        id: "mealnexio",
      }),
    ).toThrow(/already registered/);
  });

  it("prefers a connected provider when registered", () => {
    registerNutritionProvider({
      id: "other",
      label: "Other",
      status: "connected",
      supportedDataKinds: ["calories"],
      async getConnection({ athleteProfileId }) {
        return {
          athleteProfileId,
          providerId: "other",
          status: "connected",
          externalAccountLabel: null,
          lastSyncAt: null,
          lastError: null,
        };
      },
      async fetchDailyTargets() {
        return null;
      },
      async fetchDailySummary() {
        return null;
      },
    });
    expect(getActiveNutritionProvider().id).toBe("other");
  });
});
