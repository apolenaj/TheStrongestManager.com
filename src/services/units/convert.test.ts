import { describe, expect, it } from "vitest";
import {
  formatMass,
  fromCanonicalKg,
  lbToKg,
  normalizeMassUnit,
  parseMassInput,
  toCanonicalKg,
} from "@/services/units/convert";

describe("units conversion (compat re-export)", () => {
  it("normalizes legacy metric/imperial preferences", () => {
    expect(normalizeMassUnit("metric")).toBe("kg");
    expect(normalizeMassUnit("imperial")).toBe("lb");
    expect(normalizeMassUnit("lb")).toBe("lb");
  });

  it("converts mass bidirectionally", () => {
    expect(toCanonicalKg(220.46, "lb")).toBeCloseTo(100, 1);
    expect(fromCanonicalKg(100, "lb")).toBeCloseTo(220.46, 1);
    expect(lbToKg(220.46226218)).toBeCloseTo(100, 5);
  });

  it("parses preferred-unit inputs into canonical kg", () => {
    expect(parseMassInput("100", "kg")).toBe(100);
    expect(parseMassInput("220.46226218", "lb")).toBeCloseTo(100, 5);
    expect(parseMassInput("", "kg")).toBeNull();
  });

  it("formats display mass with unit labels", () => {
    expect(formatMass(100, "kg")).toBe("100 kg");
    expect(formatMass(100, "lb")).toMatch(/ lb$/);
  });
});
