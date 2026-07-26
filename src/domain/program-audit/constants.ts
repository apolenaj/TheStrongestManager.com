/**
 * Free Program Audit Funnel (Prompt 170).
 * Paste program → deterministic basic audit → unlock detailed recommendations with account.
 * No fake scoring.
 */

export const PROGRAM_AUDIT_ENGINE_VERSION = "program_audit.v1" as const;

export const PROGRAM_AUDIT_HONESTY = [
  "Checks are deterministic rules on the text you paste — not an AI score and not a fabricated program grade.",
  "No fake 0–100 Program Score on this free page. In-app Program Score appears only when enough observed components exist.",
  "Unresolved exercise names stay unresolved; missing sets/RPE/loads stay missing.",
  "Detailed recommendations and full finding lists unlock after you create an account.",
] as const;

export const PROGRAM_AUDIT_PRIVACY_COPY =
  "Your pasted program is analyzed in the browser for this free check. We do not store the paste on our servers from this page. Create an account to run a full Training Audit under your profile if you want history and detailed recommendations saved.";

export const PROGRAM_AUDIT_CLAIM_LIMIT = 8;
export const PROGRAM_AUDIT_CLAIM_WINDOW_MS = 60 * 60 * 1000;
export const PROGRAM_AUDIT_TICKET_TTL_SECONDS = 20 * 60;

/** Max findings shown before signup. */
export const PROGRAM_AUDIT_MAX_FREE_FINDINGS = 3;

/** Soft max paste size (chars) — abuse / browser guard. */
export const PROGRAM_AUDIT_MAX_PASTE_CHARS = 20_000;

export const PROGRAM_AUDIT_FUNNEL_STEPS = [
  {
    id: "paste",
    label: "Paste program",
    detail: "Day headers + lifts like “Back squat 4x5 @RPE8”. Missing fields stay blank.",
  },
  {
    id: "claim_ticket",
    label: "Claim free audit",
    detail: "Rate-limited ticket per network — no account required for basic results.",
  },
  {
    id: "basic_audit",
    label: "Basic audit",
    detail: "Deterministic structural checks first — volume, balance, density, progression cues.",
  },
  {
    id: "limited_results",
    label: "Limited results",
    detail: "A short finding list — not the full recommendation pack.",
  },
  {
    id: "signup_unlock",
    label: "Unlock details",
    detail: "Create an account for full findings, improvements, and in-app Program Score when earned.",
  },
] as const;

export const PROGRAM_AUDIT_LOCKED_SECTIONS = [
  "Full finding list with every evidence row",
  "Detailed improvement recommendations",
  "Training Program Score components (when enough data)",
  "AI Program Review dimensions",
  "Saved audit history under your account",
] as const;

export const PROGRAM_AUDIT_SIGNUP_HREF =
  "/signup?next=/app/training-audit&from=program-audit";

export const PROGRAM_AUDIT_EXAMPLE_PASTE = `Day 1
Back squat 4x5 @RPE8 80%
Bench press 4x6 @RPE7
Barbell row 3x8

Day 2
Deadlift 3x5 @RPE8
Overhead press 4x6
Pull-up 3x8

Day 3
Front squat 3x6 @RPE7
Incline bench 3x8
Romanian deadlift 3x8`;
