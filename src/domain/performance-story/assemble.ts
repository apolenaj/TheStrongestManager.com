import {
  MONTH_LABELS_EN,
  PERFORMANCE_STORY_CAUSALITY_CAVEAT,
  PERFORMANCE_STORY_ENGINE_VERSION,
  PERFORMANCE_STORY_HONESTY,
} from "@/domain/performance-story/constants";
import type {
  PerformanceStory,
  PerformanceStoryChapter,
  PerformanceStoryLine,
  PerformanceStorySharePayload,
  StoryMonthSignals,
} from "@/domain/performance-story/types";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function massDisplay(kg: number, units: "kg" | "lb"): string {
  if (units === "lb") return `${Math.round(kg * 2.2046226218)} lb`;
  return `${round1(kg)} kg`;
}

function signedMass(deltaKg: number, units: "kg" | "lb"): string {
  const sign = deltaKg > 0 ? "+" : "−";
  const abs = Math.abs(deltaKg);
  if (units === "lb") return `${sign}${Math.round(abs * 2.2046226218)} lb`;
  return `${sign}${round1(abs)} kg`;
}

/**
 * Build factual month lines — never joins kinds into causal sentences.
 */
export function buildChapterLines(
  signals: StoryMonthSignals,
  units: "kg" | "lb",
): PerformanceStoryLine[] {
  const lines: PerformanceStoryLine[] = [];

  for (const peak of signals.liftPeaks) {
    lines.push({
      kind: "lift",
      text: `${peak.liftLabel} ${massDisplay(peak.bestLoadKg, units)}.`,
    });
  }

  if (
    signals.techniqueAvg != null &&
    signals.techniqueAvgPrior != null
  ) {
    const delta = Math.round(signals.techniqueAvg - signals.techniqueAvgPrior);
    if (delta !== 0) {
      lines.push({
        kind: "technique",
        text: `Technique ${delta > 0 ? "improved" : "changed"} ${delta > 0 ? "+" : ""}${delta}.`,
      });
    } else {
      lines.push({
        kind: "technique",
        text: `Technique avg ${Math.round(signals.techniqueAvg)}.`,
      });
    }
  } else if (signals.techniqueAvg != null) {
    lines.push({
      kind: "technique",
      text: `Technique avg ${Math.round(signals.techniqueAvg)}.`,
    });
  }

  if (
    signals.bodyweightStartKg != null &&
    signals.bodyweightEndKg != null
  ) {
    const delta = signals.bodyweightEndKg - signals.bodyweightStartKg;
    if (Math.abs(delta) >= 0.5) {
      lines.push({
        kind: "bodyweight",
        text: `Bodyweight ${signedMass(delta, units)}.`,
      });
    } else if (signals.bodyweightEndKg != null) {
      lines.push({
        kind: "bodyweight",
        text: `Bodyweight ${massDisplay(signals.bodyweightEndKg, units)}.`,
      });
    }
  } else if (signals.bodyweightEndKg != null) {
    lines.push({
      kind: "bodyweight",
      text: `Bodyweight ${massDisplay(signals.bodyweightEndKg, units)}.`,
    });
  }

  if (signals.completedSessions > 0 && lines.length === 0) {
    lines.push({
      kind: "training",
      text: `${signals.completedSessions} completed session${signals.completedSessions === 1 ? "" : "s"}.`,
    });
  }

  return lines;
}

export function assemblePerformanceStory(input: {
  year: number;
  months: StoryMonthSignals[];
  units: "kg" | "lb";
}): PerformanceStory {
  const yearKey = String(input.year);
  const byMonth = new Map(input.months.map((m) => [m.month, m]));
  const chapters: PerformanceStoryChapter[] = [];
  const quietMonths: string[] = [];

  for (let month = 1; month <= 12; month++) {
    const label = MONTH_LABELS_EN[month - 1]!;
    const signals = byMonth.get(month) ?? {
      month,
      year: input.year,
      liftPeaks: [],
      techniqueAvg: null,
      techniqueAvgPrior: null,
      bodyweightStartKg: null,
      bodyweightEndKg: null,
      completedSessions: 0,
    };
    const lines = buildChapterLines(signals, input.units);
    if (lines.length === 0) {
      quietMonths.push(label);
      continue;
    }
    chapters.push({
      monthKey: `${yearKey}-${pad2(month)}`,
      monthLabel: label,
      month,
      year: input.year,
      lines,
    });
  }

  const yearlyHighlights = chapters.flatMap((ch) =>
    ch.lines.slice(0, 2).map((l) => `${ch.monthLabel}: ${l.text}`),
  );

  return {
    engineVersion: PERFORMANCE_STORY_ENGINE_VERSION,
    yearKey,
    yearLabel: `${input.year} Performance Story`,
    chapters,
    quietMonths,
    causalityCaveat: PERFORMANCE_STORY_CAUSALITY_CAVEAT,
    honesty: PERFORMANCE_STORY_HONESTY,
    yearlyHighlights: yearlyHighlights.slice(0, 12),
  };
}

export function buildPerformanceStorySharePayload(input: {
  story: PerformanceStory;
  athleteDisplayName: string;
}): PerformanceStorySharePayload {
  return {
    yearKey: input.story.yearKey,
    yearLabel: input.story.yearLabel,
    athleteDisplayName: input.athleteDisplayName,
    chapters: input.story.chapters.map((ch) => ({
      monthLabel: ch.monthLabel,
      lines: ch.lines.map((l) => l.text),
    })),
    yearlyHighlights: input.story.yearlyHighlights,
    causalityCaveat: input.story.causalityCaveat,
    honestyNote: PERFORMANCE_STORY_HONESTY[1],
    engineVersion: input.story.engineVersion,
  };
}

/** Guard: reject causal phrasing that should never ship in generated lines. */
export function containsFakeCausalLanguage(text: string): boolean {
  return /\b(because|caused by|due to|therefore|as a result of|which led to)\b/i.test(
    text,
  );
}
