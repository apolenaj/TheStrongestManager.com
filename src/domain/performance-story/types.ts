export type StoryLiftPeak = {
  liftKey: string;
  liftLabel: string;
  /** Best logged load (kg) in the month for this lift. */
  bestLoadKg: number;
};

export type StoryMonthSignals = {
  /** 1–12 */
  month: number;
  year: number;
  liftPeaks: StoryLiftPeak[];
  /** Mean technique score when analyses exist. */
  techniqueAvg: number | null;
  /** Prior month mean for delta — null if unavailable. */
  techniqueAvgPrior: number | null;
  /** First / last bodyweight kg in month when ≥1 logs. */
  bodyweightStartKg: number | null;
  bodyweightEndKg: number | null;
  completedSessions: number;
};

export type PerformanceStoryLine = {
  /** Short athlete-facing fact, e.g. "Deadlift 280 kg". */
  text: string;
  kind: "lift" | "technique" | "bodyweight" | "training";
};

export type PerformanceStoryChapter = {
  monthKey: string;
  monthLabel: string;
  month: number;
  year: number;
  lines: PerformanceStoryLine[];
};

export type PerformanceStory = {
  engineVersion: string;
  yearKey: string;
  yearLabel: string;
  chapters: PerformanceStoryChapter[];
  /** Months with no notable signal — listed for honesty. */
  quietMonths: string[];
  causalityCaveat: string;
  honesty: readonly string[];
  /** Compact yearly review bullets for share card. */
  yearlyHighlights: string[];
};

export type PerformanceStorySharePayload = {
  yearKey: string;
  yearLabel: string;
  athleteDisplayName: string;
  chapters: Array<{
    monthLabel: string;
    lines: string[];
  }>;
  yearlyHighlights: string[];
  causalityCaveat: string;
  honestyNote: string;
  engineVersion: string;
};

export type PerformanceStorySnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  causalityCaveat: string;
  exampleChapterShape: string[];
  docPath: "docs/PERFORMANCE_STORY.md";
  generatedAt: string;
};
