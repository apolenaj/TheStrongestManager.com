/**
 * Assemble bodyweight ↔ performance relationship analysis.
 */

import {
  BODYWEIGHT_PERFORMANCE_ENGINE_VERSION,
  BODYWEIGHT_PERFORMANCE_HONESTY,
  BODYWEIGHT_PERFORMANCE_TREND_LABELS,
} from "@/domain/bodyweight-performance/constants";
import type {
  BodyweightPerformanceAnalysis,
  BwPerfSample,
} from "@/domain/bodyweight-performance/types";
import {
  classifyDeltaTrend,
  formatSignedKg,
  nearestBodyweightKg,
  relativeStrengthAt,
  sortSamples,
  summarizeWindow,
} from "@/domain/bodyweight-performance/trends";

function trendPhrase(trend: keyof typeof BODYWEIGHT_PERFORMANCE_TREND_LABELS): string {
  return BODYWEIGHT_PERFORMANCE_TREND_LABELS[trend].toLowerCase();
}

/**
 * Build analysis from logged bodyweight + estimated strength samples.
 * Does not invent points; does not claim weight gain always improves strength.
 */
export function analyzeBodyweightPerformance(input: {
  windowLabel: string;
  windowStart: Date;
  windowEnd: Date;
  bodyweightSamples: BwPerfSample[];
  /** Estimated strength samples (e1RM effort kg) in the window. */
  estimatedStrengthSamples: BwPerfSample[];
}): BodyweightPerformanceAnalysis {
  const bwInWindow = sortSamples(input.bodyweightSamples).filter((s) => {
    const t = new Date(s.at).getTime();
    return (
      t >= input.windowStart.getTime() && t <= input.windowEnd.getTime()
    );
  });
  const strengthInWindow = sortSamples(input.estimatedStrengthSamples).filter(
    (s) => {
      const t = new Date(s.at).getTime();
      return (
        t >= input.windowStart.getTime() && t <= input.windowEnd.getTime()
      );
    },
  );

  const bodyweight = summarizeWindow(bwInWindow, "percent");
  const estimatedStrength = summarizeWindow(strengthInWindow, "strength_kg");

  const missingNotes: string[] = [];
  if (bodyweight.sampleCount < 2) {
    missingNotes.push(
      "Need at least two bodyweight logs in the window to show a bodyweight trend.",
    );
  }
  if (estimatedStrength.sampleCount < 2) {
    missingNotes.push(
      "Need at least two estimated-strength samples (multi-rep sets or e1RM metrics) in the window.",
    );
  }

  let startRatio: number | null = null;
  let endRatio: number | null = null;
  if (
    estimatedStrength.startKg != null &&
    estimatedStrength.endKg != null &&
    strengthInWindow.length >= 1
  ) {
    const firstStrength = strengthInWindow[0]!;
    const lastStrength = strengthInWindow[strengthInWindow.length - 1]!;
    const bwStart =
      nearestBodyweightKg(firstStrength.at, bwInWindow) ??
      bodyweight.startKg;
    const bwEnd =
      nearestBodyweightKg(lastStrength.at, bwInWindow) ?? bodyweight.endKg;
    startRatio = relativeStrengthAt(firstStrength.valueKg, bwStart);
    endRatio = relativeStrengthAt(lastStrength.valueKg, bwEnd);
  }

  const relativeTrend = classifyDeltaTrend({
    start: startRatio,
    end: endRatio,
    mode: "ratio",
  });
  const deltaRatio =
    startRatio != null && endRatio != null ? endRatio - startRatio : null;

  const narrativeLines: string[] = [];
  if (bodyweight.deltaDisplay) {
    narrativeLines.push(`Bodyweight ${bodyweight.deltaDisplay}.`);
  }
  if (estimatedStrength.trend !== "unknown") {
    narrativeLines.push(
      `Estimated strength ${trendPhrase(estimatedStrength.trend)}.`,
    );
  }
  if (relativeTrend !== "unknown") {
    narrativeLines.push(
      `Relative strength ${trendPhrase(relativeTrend)}.`,
    );
  }

  // Explicit Prompt 121 example-shaped line when the classic pattern appears
  if (
    bodyweight.trend === "down" &&
    estimatedStrength.trend === "stable" &&
    relativeTrend === "up" &&
    bodyweight.deltaKg != null
  ) {
    narrativeLines.push(
      `Pattern: bodyweight ${formatSignedKg(bodyweight.deltaKg)}, estimated strength stable, relative strength improved — weight loss and strength are not the same signal.`,
    );
  }

  if (
    bodyweight.trend === "up" &&
    estimatedStrength.trend === "stable"
  ) {
    narrativeLines.push(
      "Weight gain with flat estimated strength does not prove stronger performance — relative strength may be unchanged or down.",
    );
  }

  if (narrativeLines.length === 0 && missingNotes.length === 0) {
    narrativeLines.push(
      "Not enough aligned change to narrate a clear bodyweight–strength relationship yet.",
    );
  }

  return {
    engineVersion: BODYWEIGHT_PERFORMANCE_ENGINE_VERSION,
    windowLabel: input.windowLabel,
    windowStart: input.windowStart.toISOString(),
    windowEnd: input.windowEnd.toISOString(),
    bodyweight,
    estimatedStrength,
    relativeStrength: {
      startRatio,
      endRatio,
      deltaRatio,
      deltaDisplay:
        deltaRatio == null
          ? null
          : `${deltaRatio > 0 ? "+" : ""}${deltaRatio.toFixed(2)}× BW`,
      trend: relativeTrend,
    },
    narrativeLines,
    missingNotes,
    disclaimers: BODYWEIGHT_PERFORMANCE_HONESTY,
  };
}
