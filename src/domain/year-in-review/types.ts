import type { YearInReviewCardKind } from "@/domain/year-in-review/constants";

export type YearExerciseCount = {
  exerciseKey: string;
  exerciseLabel: string;
  setCount: number;
};

export type YearPrHighlight = {
  id: string;
  title: string;
  detail: string;
};

export type YearCompetitionResult = {
  id: string;
  name: string;
  sport: string;
  dateLabel: string;
  status: string;
  weightClassLabel: string | null;
};

/** Raw year signals — service fills; domain never invents. */
export type YearInReviewSignals = {
  year: number;
  athleteDisplayName: string;
  completedSessions: number;
  /** Sessions per month index 0–11. */
  sessionsByMonth: number[];
  prCount: number;
  prHighlights: YearPrHighlight[];
  techniqueFirstAvg: number | null;
  techniqueLastAvg: number | null;
  techniqueSampleCount: number;
  topExercises: YearExerciseCount[];
  competitions: YearCompetitionResult[];
};

export type YearInReviewCard = {
  id: string;
  kind: YearInReviewCardKind;
  /** Large display line. */
  headline: string;
  /** Supporting copy — factual. */
  subline: string | null;
  /** Optional stat rows for the card. */
  stats: Array<{ label: string; value: string }>;
  /** True when the card is showing an honest empty state. */
  empty: boolean;
};

export type YearInReviewReport = {
  engineVersion: string;
  yearKey: string;
  yearLabel: string;
  athleteDisplayName: string;
  cards: YearInReviewCard[];
  honesty: readonly string[];
  /** Most consistent month label when known. */
  mostConsistentMonth: string | null;
};

export type YearInReviewSharePayload = {
  yearKey: string;
  yearLabel: string;
  athleteDisplayName: string;
  cards: Array<{
    kind: YearInReviewCardKind;
    headline: string;
    subline: string | null;
    stats: Array<{ label: string; value: string }>;
    empty: boolean;
  }>;
  honestyNote: string;
  engineVersion: string;
};

export type YearInReviewSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  cardKinds: YearInReviewCardKind[];
  docPath: "docs/YEAR_IN_REVIEW.md";
  generatedAt: string;
};
