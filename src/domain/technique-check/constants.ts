/**
 * Free Technique Check Funnel (Prompt 169).
 * Upload one lift → basic analysis → limited insight → account to save full report.
 * Guest video never leaves the browser. Rate-limit claim tickets.
 */

export const TECHNIQUE_CHECK_ENGINE_VERSION = "technique_check.v1" as const;

export const TECHNIQUE_CHECK_HONESTY = [
  "You get limited insight before signup when the browser can run pose estimation — we do not require an account to show any value.",
  "Guest video stays in your browser. We do not upload, store, or use it for marketing.",
  "Insights are labeled observed, estimated, or recommended. No injury risk, joint forces, or invented Technique Scores.",
  "Full report save, history, and comparison require an account. Rate limits curb anonymous abuse.",
] as const;

export const TECHNIQUE_CHECK_PRIVACY_COPY =
  "For this free check, your video is processed in your browser and is not uploaded to our servers. Nothing is stored for marketing. Create an account only if you want to save a private full report under your athlete profile — then the normal technique privacy rules apply (private storage, deletable anytime).";

/** Guest claim tickets per IP per window. */
export const TECHNIQUE_CHECK_CLAIM_LIMIT = 5;
export const TECHNIQUE_CHECK_CLAIM_WINDOW_MS = 60 * 60 * 1000;
/** Signed claim ticket lifetime. */
export const TECHNIQUE_CHECK_TICKET_TTL_SECONDS = 20 * 60;

/** Max limited insight bullets shown before signup. */
export const TECHNIQUE_CHECK_MAX_INSIGHTS = 2;
/** Max phase names previewed in the free summary. */
export const TECHNIQUE_CHECK_MAX_PHASE_PREVIEW = 3;

export const TECHNIQUE_CHECK_SUPPORTED_EXERCISES = ["deadlift"] as const;

export type TechniqueCheckEvidenceLabel =
  | "observed"
  | "estimated"
  | "recommended";

export type TechniqueCheckFunnelStepId =
  | "consent_upload"
  | "claim_ticket"
  | "analyze"
  | "limited_insight"
  | "signup_to_save";

export type TechniqueCheckFunnelStep = {
  id: TechniqueCheckFunnelStepId;
  label: string;
  detail: string;
};

export const TECHNIQUE_CHECK_FUNNEL_STEPS: readonly TechniqueCheckFunnelStep[] = [
  {
    id: "consent_upload",
    label: "Upload one lift",
    detail: "Pick a short deadlift clip and camera angle. Consent required. Video stays local.",
  },
  {
    id: "claim_ticket",
    label: "Claim a free check",
    detail: "Rate-limited ticket per network — curbs anonymous abuse without requiring signup.",
  },
  {
    id: "analyze",
    label: "Basic analysis",
    detail: "Browser pose estimation + movement pipeline. No server upload for guests.",
  },
  {
    id: "limited_insight",
    label: "Limited insight",
    detail: "A short labeled summary — not the full component report.",
  },
  {
    id: "signup_to_save",
    label: "Save full report",
    detail: "Create an account to store privately, unlock the full breakdown, and re-check over time.",
  },
] as const;

export const TECHNIQUE_CHECK_LOCKED_SECTIONS = [
  "Full Technique Score component breakdown",
  "Bar-path chart and path metrics",
  "Full drill and accessory suggestions",
  "Saved history, trends, and comparison",
  "Private cloud storage of your video",
] as const;

export const TECHNIQUE_CHECK_SIGNUP_HREF =
  "/signup?next=/app/technique&from=technique-check";
