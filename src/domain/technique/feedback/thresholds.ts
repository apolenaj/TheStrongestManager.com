/**
 * Technique feedback / drill engine thresholds (Prompt 20).
 * Named constants with rationale — no blind prescriptions.
 */

/** Max recommendations returned for a report (aligned with report UX). */
export const FEEDBACK_MAX_RECOMMENDATIONS = 3;

/**
 * Component score at or below this is treated as a meaningful issue
 * when confidence is adequate (e.g. “significantly early” hip rise).
 */
export const FEEDBACK_ISSUE_SCORE_MAX = 55;
/** Rationale: below mid-band on 0–100 component scale; leaves room for “ok but not great”. */

/**
 * Stricter band for “significant” issues that unlock load-management style advice.
 */
export const FEEDBACK_SIGNIFICANT_SCORE_MAX = 45;

/**
 * Minimum component confidence to prescribe drills/exercises (not just re-film).
 * none/low → do not invent aggressive programming advice.
 */
export const FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION = "medium" as const;

/** Minimum overall assessment confidence to emit exercise progressions. */
export const FEEDBACK_MIN_ASSESSMENT_CONFIDENCE_FOR_PROGRESSIONS = "medium" as const;

/** Default reassessment window after technique practice (sessions). */
export const FEEDBACK_REASSESS_AFTER_SESSIONS = 2;

/** Beginner dosage: keep loads clearly submaximal. */
export const FEEDBACK_BEGINNER_DOSAGE =
  "2–3 sets of 3–5 reps @ empty bar to ~50% of a comfortable working weight. Stop if positions degrade.";

/** Intermediate dosage. */
export const FEEDBACK_INTERMEDIATE_DOSAGE =
  "3 sets of 3–5 reps @ ~50–70% of a recent easy set. Film side view. Stop short of grinding.";

/** Advanced / elite dosage — still technique priority, not peaking loads. */
export const FEEDBACK_ADVANCED_DOSAGE =
  "2–4 sets of 2–4 reps @ technique weight (well below competition / PR attempts). One filmed set for re-analysis.";

/** Dosage when movement cautions / pain notes are present — unload. */
export const FEEDBACK_PAIN_FLAG_DOSAGE =
  "Technique practice only with empty bar or the lightest load that keeps you pain-free in your usual range. Do not push through sharp pain. Seek a qualified professional for pain that persists — this app does not diagnose.";

/** Soft gate copy when confidence is too low to prescribe. */
export const FEEDBACK_LOW_CONFIDENCE_MESSAGE =
  "Observation confidence is too low to prescribe drills confidently. Re-film from the side with the full body visible, then re-analyze.";
