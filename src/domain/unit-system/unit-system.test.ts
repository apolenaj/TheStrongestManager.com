import { describe, expect, it } from "vitest";
import {
  buildUnitSystemSnapshot,
  cmToFeetInches,
  feetInchesToCm,
  formatDistance,
  formatLength,
  formatMass,
  fromCanonicalKg,
  lbToKg,
  normalizeMassUnit,
  parseFeetInchesInput,
  parseLengthInput,
  parseMassInput,
  resolveUnitPreference,
  toCanonicalCm,
  toCanonicalKg,
  toCanonicalMeters,
  UNIT_SYSTEM_HONESTY,
} from "@/domain/unit-system";

describe("unit system — preference", () => {
  it("normalizes legacy metric/imperial preferences", () => {
    expect(normalizeMassUnit("metric")).toBe("kg");
    expect(normalizeMassUnit("imperial")).toBe("lb");
    expect(normalizeMassUnit("lb")).toBe("lb");
  });

  it("resolves full metric and imperial presentation prefs", () => {
    const metric = resolveUnitPreference("kg");
    expect(metric).toMatchObject({
      system: "metric",
      mass: "kg",
      length: "cm",
      distanceLong: "km",
      distanceShort: "m",
      heightStyle: "cm",
    });
    const imperial = resolveUnitPreference("lb");
    expect(imperial).toMatchObject({
      system: "imperial",
      mass: "lb",
      length: "in",
      distanceLong: "mi",
      distanceShort: "ft",
      heightStyle: "ft_in",
    });
  });
});

describe("unit system — mass kg/lb", () => {
  it("converts mass bidirectionally with stable round-trip", () => {
    expect(toCanonicalKg(220.46, "lb")).toBeCloseTo(100, 1);
    expect(fromCanonicalKg(100, "lb")).toBeCloseTo(220.46, 1);
    expect(lbToKg(220.46226218)).toBeCloseTo(100, 5);
    const kg = 142.5;
    expect(toCanonicalKg(fromCanonicalKg(kg, "lb"), "lb")).toBeCloseTo(kg, 10);
  });

  it("parses preferred-unit inputs into canonical kg only", () => {
    expect(parseMassInput("100", "kg")).toBe(100);
    expect(parseMassInput("220.46226218", "lb")).toBeCloseTo(100, 5);
    expect(parseMassInput("", "kg")).toBeNull();
  });

  it("formats display mass with unit labels", () => {
    expect(formatMass(100, "kg")).toBe("100 kg");
    expect(formatMass(100, "lb")).toMatch(/ lb$/);
  });
});

describe("unit system — length cm/ft/in", () => {
  it("stores height as cm and presents ft/in for imperial", () => {
    expect(toCanonicalCm(70.866, "in")).toBeCloseTo(180, 1);
    const parts = cmToFeetInches(180);
    expect(parts.feet).toBe(5);
    expect(parts.inches).toBeCloseTo(10.9, 0);
    expect(formatLength(180, "kg")).toBe("180 cm");
    expect(formatLength(180, "lb")).toMatch(/^\d+ ft [\d.]+ in$/);
    expect(feetInchesToCm(5, 10.86614173)).toBeCloseTo(180, 1);
  });

  it("parses composite feet/inches into canonical cm", () => {
    expect(parseFeetInchesInput("5'11")).toBeCloseTo(180.34, 0);
    expect(parseLengthInput("5'10", "lb")).toBeCloseTo(177.8, 0);
    expect(parseLengthInput("180", "kg")).toBe(180);
  });

  it("round-trips feet+inches through canonical cm", () => {
    const cm = feetInchesToCm(6, 0);
    const back = cmToFeetInches(cm);
    expect(back.feet).toBe(6);
    expect(back.inches).toBeCloseTo(0, 5);
  });
});

describe("unit system — distance km/miles", () => {
  it("canonicalizes distance to meters", () => {
    expect(toCanonicalMeters(5, "km")).toBe(5000);
    expect(toCanonicalMeters(1, "mi")).toBeCloseTo(1609.344, 5);
    expect(toCanonicalMeters(40, "m")).toBe(40);
    expect(toCanonicalMeters(100, "ft")).toBeCloseTo(30.48, 5);
  });

  it("presents short walks in m/ft and long runs in km/mi", () => {
    expect(formatDistance(40, "kg")).toBe("40 m");
    expect(formatDistance(40, "lb")).toMatch(/ ft$/);
    expect(formatDistance(5000, "kg")).toBe("5 km");
    expect(formatDistance(5000, "lb")).toMatch(/ mi$/);
  });
});

describe("unit system — presentation only", () => {
  it("documents that storage stays canonical", () => {
    expect(UNIT_SYSTEM_HONESTY.join(" ")).toMatch(/canonical/i);
    expect(UNIT_SYSTEM_HONESTY.join(" ")).toMatch(/presentation/i);
  });

  it("builds admin snapshot with sample conversions", () => {
    const snap = buildUnitSystemSnapshot("2026-07-21T00:00:00.000Z");
    expect(snap.canonical).toEqual({
      mass: "kg",
      length: "cm",
      distance: "m",
    });
    expect(snap.samples.mass100kg.metric).toBe("100 kg");
    expect(snap.samples.height180cm.metric).toBe("180 cm");
    expect(snap.samples.run5km.metric).toBe("5 km");
    expect(snap.samples.walk40m.imperial).toMatch(/ft/);
  });
});
