/**
 * Powerlifting Attempt Selector types (Prompt 71).
 */

export type AttemptLift = "squat" | "bench" | "deadlift";

export type AttemptRiskPreference = "conservative" | "balanced" | "aggressive";

export type AttemptConfidence = "low" | "moderate" | "high";

export type StrengthEstimate = {
  /** Recent estimated capacity range (kg). */
  lowKg: number;
  highKg: number;
  /** Optional label e.g. "PR prediction median". */
  sourceLabel: string;
};

export type MeetAttemptHistoryEntry = {
  meetDate: Date;
  lift: AttemptLift;
  openerKg: number | null;
  secondKg: number | null;
  thirdKg: number | null;
  /** Best successful attempt that day, if known. */
  bestMadeKg: number | null;
  /** Did they miss the opener? */
  missedOpener: boolean | null;
};

export type AttemptSelectorInput = {
  lift: AttemptLift;
  recentStrength: StrengthEstimate | null;
  history: MeetAttemptHistoryEntry[];
  confidence: AttemptConfidence;
  /** Goal third / meet PR intent (kg). */
  goalKg: number | null;
  risk: AttemptRiskPreference;
};

export type ConditionalThird = {
  /** Lower third if second is hard / grindy. */
  lowKg: number;
  /** Higher third if second moves well. */
  highKg: number;
  condition: string;
};

export type AttemptSelection = {
  lift: AttemptLift;
  liftLabel: string;
  risk: AttemptRiskPreference;
  riskLabel: string;
  openerKg: number;
  secondKg: number;
  third: ConditionalThird;
  /** Internal planning ceiling used (not a guaranteed max). */
  planningCeilingKg: number;
  strategy: string[];
  inputsUsed: {
    hasRecentStrength: boolean;
    historyMeetCount: number;
    confidence: AttemptConfidence;
    goalKg: number | null;
  };
  honestyNote: string;
};

export type AttemptSelectorResult =
  | { ok: true; selection: AttemptSelection }
  | { ok: false; reason: string };
