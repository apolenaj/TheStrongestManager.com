import { describe, expect, it } from "vitest";
import {
  API_PLATFORM_HONESTY,
  FUTURE_EXTERNAL_API_CATALOG,
  apiError,
  apiSuccess,
  futurePublicEndpointCount,
  plannedExternalEndpointCount,
} from "@/domain/api";

describe("API platform foundation", () => {
  it("plans external families but exposes none publicly yet", () => {
    expect(plannedExternalEndpointCount()).toBeGreaterThan(0);
    expect(futurePublicEndpointCount()).toBe(0);
    expect(FUTURE_EXTERNAL_API_CATALOG.every((e) => e.public === false)).toBe(
      true,
    );
    const families = new Set(FUTURE_EXTERNAL_API_CATALOG.map((e) => e.family));
    expect(families.has("athlete_metrics")).toBe(true);
    expect(families.has("exercises")).toBe(true);
    expect(families.has("technique_analysis")).toBe(true);
    expect(families.has("training_programs")).toBe(true);
    expect(families.has("performance_insights")).toBe(true);
  });

  it("requires auth on private catalog entries", () => {
    for (const e of FUTURE_EXTERNAL_API_CATALOG) {
      expect(e.auth.includes("none_public_readonly")).toBe(false);
      expect(e.auth.length).toBeGreaterThan(0);
    }
  });

  it("builds stable JSON envelopes", () => {
    expect(apiSuccess({ id: "1" })).toEqual({
      ok: true,
      data: { id: "1" },
    });
    expect(apiError("unauthorized", "Unauthorized.").error.code).toBe(
      "unauthorized",
    );
  });

  it("states honesty that external API is not public yet", () => {
    expect(API_PLATFORM_HONESTY[0]).toMatch(/not public/i);
  });
});
