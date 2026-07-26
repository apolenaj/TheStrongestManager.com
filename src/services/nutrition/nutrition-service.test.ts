import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getActiveNutritionProvider,
  registerNutritionProvider,
  resetNutritionProvidersForTests,
  unavailableMealnexioAdapter,
  type NutritionProviderAdapter,
} from "@/domain/nutrition";

vi.mock("@/config/feature-flags", () => ({
  featureFlags: {
    mealnexioSync: false,
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    athleteProfile: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { getNutritionDashboard } from "@/services/nutrition/nutrition-service";

describe("nutrition provider architecture", () => {
  beforeEach(() => {
    resetNutritionProvidersForTests();
    vi.clearAllMocks();
  });

  it("defaults to unavailable Mealnexio stub that never invents targets", async () => {
    const provider = getActiveNutritionProvider();
    expect(provider.id).toBe("mealnexio");
    expect(provider.status).toBe("unavailable");
    expect(await provider.fetchDailyTargets({ athleteProfileId: "x", date: "2026-07-20" })).toBeNull();
    expect(await provider.fetchDailySummary({ athleteProfileId: "x", date: "2026-07-20" })).toBeNull();
  });

  it("allows registering a future real adapter", () => {
    const fake: NutritionProviderAdapter = {
      ...unavailableMealnexioAdapter,
      id: "mealnexio-live",
      label: "Mealnexio (live)",
      status: "connected",
      async getConnection({ athleteProfileId }) {
        return {
          athleteProfileId,
          providerId: "mealnexio-live",
          status: "connected",
          externalAccountLabel: "athlete@example.com",
          lastSyncAt: new Date("2026-07-20T12:00:00Z"),
          lastError: null,
        };
      },
      async fetchDailyTargets() {
        return {
          date: "2026-07-20",
          caloriesKcal: 2500,
          macros: { proteinG: 180, carbsG: 250, fatG: 70 },
          source: "mealnexio",
          syncedAt: new Date("2026-07-20T12:00:00Z"),
        };
      },
      async fetchDailySummary() {
        return null;
      },
    };
    registerNutritionProvider(fake);
    expect(getActiveNutritionProvider().id).toBe("mealnexio-live");
  });
});

describe("getNutritionDashboard", () => {
  beforeEach(() => {
    resetNutritionProvidersForTests();
    vi.clearAllMocks();
  });

  it("returns null without athlete profile", async () => {
    vi.mocked(prisma.athleteProfile.findUnique).mockResolvedValue(null);
    expect(await getNutritionDashboard("user-1")).toBeNull();
  });

  it("never shows invented daily targets when sync flag is off", async () => {
    vi.mocked(prisma.athleteProfile.findUnique).mockResolvedValue({
      id: "profile-1",
      bodyMetrics: [{ value: 82.5, recordedAt: new Date("2026-07-19T08:00:00Z") }],
    } as never);

    const view = await getNutritionDashboard("user-1");
    expect(view).not.toBeNull();
    expect(view!.syncFeatureEnabled).toBe(false);
    expect(view!.dailyTargets).toBeNull();
    expect(view!.dailySummary).toBeNull();
    expect(view!.provider.status).toBe("unavailable");
    expect(view!.localBodyweight?.kg).toBe(82.5);
    expect(view!.localBodyweight?.sourceLabel).toMatch(/not Mealnexio/i);
    expect(view!.plannedSharedData.map((d) => d.id)).toEqual(
      expect.arrayContaining([
        "calories",
        "macros",
        "bodyweight",
        "nutrition_adherence",
        "training_day_nutrition",
        "meal_timing",
      ]),
    );
    expect(view!.mealnexio.siteUrl).toBe("https://mealnexio.com");
  });
});
