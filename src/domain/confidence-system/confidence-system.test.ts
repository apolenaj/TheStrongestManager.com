import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_DISPLAY_LABELS,
  CONFIDENCE_PERCENTAGES_CALIBRATED,
  CONFIDENCE_SYSTEM_HONESTY,
  formatConfidenceLabel,
  formatConfidencePercent,
  formatConfidenceWithOptionalPercent,
  normalizeConfidenceLevel,
  toUniversalConfidence,
} from "@/domain/confidence-system";

describe("confidence system", () => {
  it("exposes four athlete-facing levels", () => {
    expect(CONFIDENCE_DISPLAY_LABELS).toEqual({
      high: "High",
      medium: "Moderate",
      low: "Low",
      none: "Insufficient data",
    });
    expect(toUniversalConfidence("medium")).toBe("moderate");
    expect(toUniversalConfidence("none")).toBe("insufficient_data");
  });

  it("normalizes moderate and insufficient aliases", () => {
    expect(normalizeConfidenceLevel("moderate")).toBe("medium");
    expect(normalizeConfidenceLevel("Moderate")).toBe("medium");
    expect(normalizeConfidenceLevel("insufficient")).toBe("none");
    expect(normalizeConfidenceLevel("insufficient_data")).toBe("none");
    expect(normalizeConfidenceLevel("unknown")).toBe("none");
    expect(normalizeConfidenceLevel(null)).toBe("none");
  });

  it("formats labels consistently across pillars", () => {
    expect(formatConfidenceLabel("high")).toBe("High");
    expect(formatConfidenceLabel("medium")).toBe("Moderate");
    expect(formatConfidenceLabel("moderate")).toBe("Moderate");
    expect(formatConfidenceLabel("low")).toBe("Low");
    expect(formatConfidenceLabel("none")).toBe("Insufficient data");
  });

  it("never shows uncalibrated confidence percentages", () => {
    expect(CONFIDENCE_PERCENTAGES_CALIBRATED).toBe(false);
    expect(formatConfidencePercent(0.72)).toBeNull();
    expect(formatConfidenceWithOptionalPercent("medium", 0.72)).toBe(
      "Moderate",
    );
    expect(CONFIDENCE_SYSTEM_HONESTY.join(" ")).toMatch(/percentage/i);
  });
});
