import type {
  ExperimentMeasure,
  ExperimentStatus,
} from "@/domain/experiment-mode/constants";

export type ExperimentMeasureValue = {
  measure: ExperimentMeasure;
  label: string;
  /** Display string; null when unknown. */
  display: string | null;
  /** Numeric when available for delta math. */
  numeric: number | null;
  unit: string | null;
  missingNote: string | null;
};

export type ExperimentSnapshot = {
  capturedAt: string;
  windowStart: string;
  windowEnd: string;
  measures: ExperimentMeasureValue[];
  notes: string | null;
};

export type ExperimentCompareRow = {
  measure: ExperimentMeasure;
  label: string;
  beforeDisplay: string | null;
  afterDisplay: string | null;
  deltaDisplay: string | null;
  confidence: "none" | "low" | "medium" | "high";
  missingNote: string | null;
};

export type ExperimentCompareResult = {
  rows: ExperimentCompareRow[];
  disclaimer: string;
};

export type PersonalTrainingExperimentView = {
  id: string;
  title: string;
  intervention: string;
  hypothesis: string;
  measures: ExperimentMeasure[];
  durationWeeks: number;
  status: ExperimentStatus;
  plannedStartAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  abandonedAt: string | null;
  athleteNotes: string | null;
  baseline: ExperimentSnapshot | null;
  outcome: ExperimentSnapshot | null;
  compare: ExperimentCompareResult | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExperimentInput = {
  title: string;
  intervention: string;
  hypothesis: string;
  measures: ExperimentMeasure[];
  durationWeeks: number;
  athleteNotes?: string | null;
  plannedStartAt?: string | null;
};
