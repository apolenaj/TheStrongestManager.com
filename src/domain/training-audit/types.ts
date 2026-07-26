import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { ProgramScoreResult } from "@/domain/program-score";
import type {
  TrainingAuditFindingCode,
  TrainingAuditInputMode,
  TrainingAuditStage,
} from "@/domain/training-audit/constants";

/** One prescribed line as provided by the athlete — nulls stay null. */
export type TrainingAuditLine = {
  dayIndex: number;
  exerciseName: string;
  sets: number | null;
  reps: string | null;
  rpe: number | null;
  percent: number | null;
  loadKg: number | null;
  /** Filled only when catalog/heuristic match succeeds — never invented load. */
  movementPattern: string | null;
  category: string | null;
  /** true when name matched catalog or keyword heuristic. */
  patternResolved: boolean;
  source: "manual" | "csv" | "paste";
  raw?: string;
};

export type TrainingAuditDraft = {
  name: string;
  inputMode: TrainingAuditInputMode;
  lines: TrainingAuditLine[];
  /** Parse warnings — not fabricated content. */
  parseWarnings: string[];
};

export type TrainingAuditFinding = {
  id: string;
  code: TrainingAuditFindingCode;
  title: string;
  detail: string;
  severity: "info" | "watch" | "attention";
  confidence: ConfidenceLevel;
  /** Evidence drawn only from imported lines / aggregates. */
  evidence: string[];
};

export type TrainingAuditResult = {
  engineVersion: string;
  stage: TrainingAuditStage;
  draft: TrainingAuditDraft;
  findings: TrainingAuditFinding[];
  /** High-level summary for Understand step. */
  understanding: {
    headline: string;
    summary: string;
    lineCount: number;
    dayCount: number;
    unresolvedExercises: string[];
  };
  improvements: string[];
  /** Optional Program Score when enough structure exists — may be null overall. */
  programScore: ProgramScoreResult | null;
  honesty: readonly string[];
  missingInformation: string[];
};
