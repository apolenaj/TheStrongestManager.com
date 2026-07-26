import type { LiveAutoregSuggestionKind } from "@/domain/live-session-autoregulation/constants";

export type LiveAutoregSetSignal = {
  plannedLoadKg: number | null;
  plannedReps: number | null;
  plannedRpe: number | null;
  actualLoadKg: number | null;
  actualReps: number | null;
  actualRpe: number | null;
};

export type LiveAutoregSuggestion = {
  kind: Exclude<LiveAutoregSuggestionKind, "none">;
  label: string;
  headline: string;
  detail: string;
  /** How much harder actual RPE was vs planned. */
  rpeDelta: number;
  plannedSummary: string;
  actualSummary: string;
  /** Proposed next-set load when reducing — null if unknown. */
  proposedNextLoadKg: number | null;
  /** Current next-set load used as baseline, if known. */
  currentNextLoadKg: number | null;
  /** Always true — UI/service must not apply until confirm. */
  requiresUserConfirmation: true;
  autoApplied: false;
};

export type LiveAutoregEvaluation =
  | { ok: true; suggestion: LiveAutoregSuggestion }
  | { ok: false; reason: string; suggestion: null };

export type LiveAutoregSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  significantRpeDelta: number;
  example: typeof import("@/domain/live-session-autoregulation/constants").LIVE_AUTOREG_EXAMPLE;
  forbidden: readonly string[];
  docPath: "docs/LIVE_SESSION_AUTOREGULATION.md";
  generatedAt: string;
};
