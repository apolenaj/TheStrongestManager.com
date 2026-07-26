/**
 * Personal Record Intelligence types (Prompt 72).
 */

export type PrType =
  | "one_rm"
  | "estimated_1rm"
  | "rep_pr"
  | "volume_pr"
  | "technical_pr";

export type StrengthSample = {
  id: string;
  at: Date;
  exerciseKey: string;
  exerciseLabel: string;
  loadKg: number;
  reps: number;
};

export type TechniqueSample = {
  id: string;
  at: Date;
  exerciseKey: string;
  exerciseLabel: string;
  overallScore: number;
};

export type PrEvent = {
  /** Stable id for UI / share (derived from sample + type). */
  id: string;
  types: PrType[];
  primaryType: PrType;
  at: string;
  exerciseKey: string;
  exerciseLabel: string;
  /** e.g. NEW PR */
  title: string;
  /** e.g. 260 kg × 7 */
  headline: string;
  /** Related context lines */
  related: string[];
  metrics: {
    loadKg: number | null;
    reps: number | null;
    estimated1rmKg: number | null;
    volumeKg: number | null;
    techniqueScore: number | null;
    previousEstimated1rmKg: number | null;
    previousTechniqueScore: number | null;
  };
};

export type PrTimeline = {
  events: PrEvent[];
  countsByType: Record<PrType, number>;
  generatedAt: string;
};

/** Payload frozen into PrShare — public-safe. */
export type PrSharePayload = {
  title: string;
  headline: string;
  exerciseLabel: string;
  types: PrType[];
  related: string[];
  at: string;
  honestyNote: string;
  /** Opt-in share card snapshot (Prompt 73) — only selected metrics. */
  shareCard?: {
    formatId: string;
    eyebrow: string;
    cardHeadline: string;
    stats: Array<{ label?: string; value: string }>;
    brand: string;
    includedMetrics: string[];
  };
};
