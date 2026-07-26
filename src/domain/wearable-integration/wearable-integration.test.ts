import { afterEach, describe, expect, it } from "vitest";
import {
  WEARABLE_INTEGRATION_HONESTY,
  WEARABLE_PROVIDER_IDS,
  buildWearableIntegrationSnapshot,
  getConnectedWearableProvider,
  getWearableProvider,
  listWearableProviders,
  mayUseLiveWearableReads,
  registerWearableProvider,
  resetWearableProvidersForTests,
} from "@/domain/wearable-integration";

describe("wearable integration abstraction", () => {
  afterEach(() => {
    resetWearableProvidersForTests();
  });

  it("registers all five planned providers as not_configured stubs", () => {
    const list = listWearableProviders();
    expect(list.map((p) => p.id).sort()).toEqual(
      [...WEARABLE_PROVIDER_IDS].sort(),
    );
    expect(list.every((p) => p.status === "not_configured")).toBe(true);
    expect(getConnectedWearableProvider()).toBeNull();
  });

  it("stubs never invent samples", async () => {
    for (const id of WEARABLE_PROVIDER_IDS) {
      const adapter = getWearableProvider(id)!;
      const conn = await adapter.getConnection({
        athleteProfileId: "athlete_test",
      });
      expect(conn.status).toBe("not_configured");
      expect(conn.externalAccountLabel).toBeNull();
      const samples = await adapter.fetchSamples({
        athleteProfileId: "athlete_test",
        since: new Date("2026-01-01"),
        kinds: adapter.supportedDataKinds,
      });
      expect(samples).toEqual([]);
    }
  });

  it("blocks live reads without connected status + live flag", () => {
    const oura = getWearableProvider("oura")!;
    expect(mayUseLiveWearableReads(oura)).toBe(false);

    registerWearableProvider({
      ...oura,
      status: "connected",
      async fetchSamples() {
        return [
          {
            kind: "sleep",
            recordedAt: new Date(),
            value: 8,
            unit: "hours",
            providerId: "oura",
            source: "device",
            quality: null,
          },
        ];
      },
    });
    // Live flag still default off → mayUseLiveWearableReads false
    expect(
      mayUseLiveWearableReads(getWearableProvider("oura")!),
    ).toBe(false);
  });

  it("snapshot and honesty document no fake integrations", () => {
    const snap = buildWearableIntegrationSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/WEARABLE_INTEGRATION.md");
    expect(snap.connectedCount).toBe(0);
    expect(snap.providers).toHaveLength(5);
    expect(WEARABLE_INTEGRATION_HONESTY.join(" ")).toMatch(/no fake/i);
  });
});
