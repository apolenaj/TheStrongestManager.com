/**
 * Scoring domain types.
 * Engines are pure: they never invent inputs and never hide formula terms.
 */

export type ScoreKey =
  | "strength"
  | "technique"
  | "programming"
  | "recovery"
  | "consistency"
  | "overall";

/** Product honesty: none/low must not be shown as a numeric score in UI. */
export type ConfidenceLevel = "none" | "low" | "medium" | "high";

export type InputSourceKind =
  | "observed"
  | "heuristic"
  | "reported"
  | "recommended";

export type ScoreInputRecord = {
  key: string;
  label: string;
  value: number | string | boolean | null;
  unit?: string;
  source?: InputSourceKind;
};

export type ScoreReasoning = {
  formulaId: string;
  formulaVersion: string;
  /** Human-readable formula statement (also documented in SCORING_SYSTEM.md). */
  formulaDescription: string;
  /** Checklist of minimum data this engine requires. */
  minimumData: string[];
  /** Extra reasoning notes produced at compute time. */
  notes: string[];
};

export type ScoreResult = {
  scoreKey: ScoreKey;
  /**
   * 0–100 when the formula could run from available inputs.
   * Null when required minimum data is missing (formula not applicable).
   * May be non-null with low confidence — UI must still hide via displayableScore().
   */
  score: number | null;
  confidence: ConfidenceLevel;
  inputs: ScoreInputRecord[];
  missingInputs: string[];
  explanation: string;
  timestamp: Date;
  reasoning: ScoreReasoning;
};

export type ScoreDefinition = {
  scoreKey: ScoreKey;
  label: string;
  /** Where signals come from in the product model. */
  inputSources: string[];
  /** Formula prose — must match the engine implementation. */
  formula: string;
  /** Minimum data before a displayable (medium/high) score is possible. */
  requiredMinimumData: string[];
  /** How confidence is assigned. */
  confidenceRules: string;
};

/** Snapshot of athlete signals fed into pure scoring engines. */
export type LiftSample = {
  metricKey: string;
  valueKg: number;
  /** Optional reps for the logged effort — enables Estimated 1RM when ≥ 2. */
  reps?: number | null;
  recordedAt: Date;
  source: InputSourceKind;
};

export type TechniqueSample = {
  overallScore: number;
  recordedAt: Date;
  confidenceBasis: InputSourceKind;
};

export type RecoverySample = {
  readiness: number;
  recordedAt: Date;
  source: InputSourceKind;
};

export type SessionSample = {
  status: "planned" | "in_progress" | "completed" | "skipped" | string;
  scheduledAt: Date | null;
  completedAt: Date | null;
  startedAt: Date | null;
  programId: string | null;
};

export type ScoringSnapshot = {
  now: Date;
  lifts: LiftSample[];
  techniqueAnalyses: TechniqueSample[];
  recoveryEntries: RecoverySample[];
  sessions: SessionSample[];
  activeProgramId: string | null;
  activeProgramName: string | null;
  /** Latest bodyweight kg when known — required for BW-relative strength. */
  bodyweightKg: number | null;
  /** TrainingExperience.level — drives beginner→competition context bands. */
  experienceLevel: string | null;
  /** AthleteProfile.primaryDiscipline — sport-specific lift weighting. */
  primaryDiscipline: string | null;
};
