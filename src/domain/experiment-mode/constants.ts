/**
 * Experiment Mode (Prompt 119).
 * Personal training experiments — never scientific research.
 */

export const EXPERIMENT_MODE_ENGINE_VERSION =
  "personal_training_experiment.v1" as const;

export const EXPERIMENT_STATUSES = [
  "planned",
  "active",
  "completed",
  "abandoned",
] as const;

export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  abandoned: "Abandoned",
};

/** Measurable coaching signals — not research endpoints. */
export const EXPERIMENT_MEASURES = [
  "deadlift_performance",
  "squat_performance",
  "bench_performance",
  "technique",
  "training_volume",
  "session_adherence",
] as const;

export type ExperimentMeasure = (typeof EXPERIMENT_MEASURES)[number];

export const EXPERIMENT_MEASURE_LABELS: Record<ExperimentMeasure, string> = {
  deadlift_performance: "Deadlift performance",
  squat_performance: "Squat performance",
  bench_performance: "Bench performance",
  technique: "Technique",
  training_volume: "Training volume",
  session_adherence: "Session adherence",
};

export const EXPERIMENT_MODE_HONESTY = [
  "This is a personal training experiment — an n=1 coaching check for you, not scientific research.",
  "Before/after numbers are observational. Confounders (sleep, stress, diet, other training) can explain changes.",
  "Missing data stays missing. We never invent lifts, scores, or PRs to fill a comparison.",
  "Outcomes are not medical advice and do not prove cause and effect.",
] as const;

export const EXPERIMENT_MODE_PRODUCT_NAME = "Personal training experiment" as const;

export const EXPERIMENT_DURATION_WEEKS_MIN = 2;
export const EXPERIMENT_DURATION_WEEKS_MAX = 16;
