import { describe, expect, it } from "vitest";
import {
  TRAINING_STYLE_FORBIDDEN_CLAIMS,
  TRAINING_STYLE_HONESTY,
  assembleTrainingStyleProfile,
  trainingStyleProfileText,
  type TrainingStyleSignals,
} from "@/domain/training-style";

function base(overrides: Partial<TrainingStyleSignals> = {}): TrainingStyleSignals {
  return {
    now: new Date("2026-07-21T12:00:00Z"),
    lookbackDays: 28,
    stated: {
      daysPerWeek: 4,
      sessionLengthMinutes: 75,
      coachingStatus: "self",
    },
    completedSessions: 12,
    skippedSessions: 1,
    trainingDays: 12,
    meanRpe: 8.2,
    rpeSampleCount: 20,
    meanSetsPerSession: 9,
    acceptedReduceVolume: 2,
    acceptedIncreaseVolume: 0,
    acceptedIncreaseLoad: 1,
    acceptedReduceLoad: 0,
    declinedIncreaseLoad: 1,
    declinedReduceVolume: 0,
    feedbackHelpful: 1,
    feedbackNotHelpful: 0,
    ...overrides,
  };
}

describe("training style profiler", () => {
  it("builds the example-style practical profile", () => {
    const profile = assembleTrainingStyleProfile(base());
    expect(profile.summaryLine).toMatch(/High-intensity/i);
    expect(profile.summaryLine).toMatch(/Moderate frequency/i);
    expect(profile.summaryLine).toMatch(/Low tolerance for high-volume/i);

    const intensity = profile.dimensions.find(
      (d) => d.id === "intensity_preference",
    );
    expect(intensity?.band).toBe("prefer_higher");
    const frequency = profile.dimensions.find(
      (d) => d.id === "frequency_preference",
    );
    expect(frequency?.band).toBe("moderate");
    const volume = profile.dimensions.find((d) => d.id === "volume_tolerance");
    expect(volume?.band).toBe("low");
  });

  it("never invents preferences without data and bans personality claims", () => {
    const empty = assembleTrainingStyleProfile(
      base({
        stated: {
          daysPerWeek: null,
          sessionLengthMinutes: null,
          coachingStatus: null,
        },
        completedSessions: 0,
        skippedSessions: 0,
        trainingDays: 0,
        meanRpe: null,
        rpeSampleCount: 0,
        meanSetsPerSession: null,
        acceptedReduceVolume: 0,
        acceptedIncreaseVolume: 0,
        acceptedIncreaseLoad: 0,
        acceptedReduceLoad: 0,
        declinedIncreaseLoad: 0,
        declinedReduceVolume: 0,
        feedbackHelpful: 0,
        feedbackNotHelpful: 0,
      }),
    );
    expect(empty.summaryLine).toBeNull();
    expect(empty.dimensions.every((d) => d.band == null || d.missingNote)).toBe(
      true,
    );

    const text = trainingStyleProfileText(empty);
    for (const phrase of TRAINING_STYLE_FORBIDDEN_CLAIMS) {
      expect(text).not.toContain(phrase);
    }
    expect(TRAINING_STYLE_HONESTY.join(" ")).toMatch(/not psychological/i);
  });
});
