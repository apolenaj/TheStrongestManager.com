import { describe, expect, it } from "vitest";
import {
  FATIGUE_ALERT_FORBIDDEN_PHRASES,
  FATIGUE_ALERT_HONESTY,
  FATIGUE_ALERT_LEVEL_LABELS,
  analyzeFatigueAlert,
} from "@/domain/fatigue-alert-system";

const quiet = {
  loadSpikeFlagged: false,
  loadSpikeDetail: null as string | null,
  volumeTrendUp: false,
  performanceDirection: "flat" as const,
  performanceDetail: "Performance trend flat.",
  readinessRecentMean: 70,
  readinessPriorMean: 68,
  readinessSampleCount: 4,
};

describe("fatigue-alert-system", () => {
  it("exposes calm level labels and non-medical honesty", () => {
    expect(FATIGUE_ALERT_LEVEL_LABELS.normal).toBe("Normal");
    expect(FATIGUE_ALERT_LEVEL_LABELS.watch).toBe("Watch");
    expect(FATIGUE_ALERT_LEVEL_LABELS.elevated).toBe("Elevated");
    expect(FATIGUE_ALERT_LEVEL_LABELS.high_concern).toBe("High concern");
    expect(FATIGUE_ALERT_HONESTY.join(" ")).toMatch(/not a medical/i);
    for (const phrase of FATIGUE_ALERT_FORBIDDEN_PHRASES) {
      expect(FATIGUE_ALERT_HONESTY.join(" ").toLowerCase()).not.toContain(
        phrase,
      );
    }
  });

  it("stays Normal with quiet signals or thin data", () => {
    const quietAnalysis = analyzeFatigueAlert({
      windowLabel: "14 days",
      sessionCount: 5,
      signals: quiet,
    });
    expect(quietAnalysis.level).toBe("normal");
    expect(quietAnalysis.levelLabel).toBe("Normal");

    const thin = analyzeFatigueAlert({
      windowLabel: "14 days",
      sessionCount: 1,
      signals: {
        ...quiet,
        loadSpikeFlagged: true,
        performanceDirection: "down",
        readinessRecentMean: 30,
        readinessSampleCount: 4,
      },
    });
    expect(thin.level).toBe("normal");
    expect(thin.publishable).toBe(false);
  });

  it("maps one signal to Watch and two to Elevated", () => {
    const watch = analyzeFatigueAlert({
      windowLabel: "14 days",
      sessionCount: 5,
      signals: {
        ...quiet,
        loadSpikeFlagged: true,
        loadSpikeDetail: "Volume rose vs baseline.",
      },
    });
    expect(watch.level).toBe("watch");
    expect(watch.title).toMatch(/monitoring/i);

    const elevated = analyzeFatigueAlert({
      windowLabel: "14 days",
      sessionCount: 5,
      signals: {
        ...quiet,
        loadSpikeFlagged: true,
        loadSpikeDetail: "Volume rose vs baseline.",
        readinessRecentMean: 40,
        readinessSampleCount: 4,
      },
    });
    expect(elevated.level).toBe("elevated");
    expect(elevated.summary.toLowerCase()).not.toMatch(/danger|emergency/);
  });

  it("maps three aligned signals to High concern without medical claims", () => {
    const analysis = analyzeFatigueAlert({
      windowLabel: "14 days",
      sessionCount: 6,
      signals: {
        loadSpikeFlagged: true,
        loadSpikeDetail: "Conservative volume note.",
        volumeTrendUp: true,
        performanceDirection: "down",
        performanceDetail: "Recent strength trend is down on logged efforts.",
        readinessRecentMean: 38,
        readinessPriorMean: 55,
        readinessSampleCount: 5,
      },
    });
    expect(analysis.level).toBe("high_concern");
    expect(analysis.levelLabel).toBe("High concern");
    expect(analysis.summary).toMatch(/not a medical diagnosis/i);
    const blob = `${analysis.summary} ${analysis.explanation.join(" ")}`.toLowerCase();
    for (const phrase of FATIGUE_ALERT_FORBIDDEN_PHRASES) {
      expect(blob).not.toContain(phrase);
    }
  });
});
