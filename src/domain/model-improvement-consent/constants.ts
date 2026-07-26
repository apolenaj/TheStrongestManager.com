/**
 * Model Improvement Consent (Prompt 179).
 * Clear, unbundled consent UI kinds — service use ≠ expert review ≠ research.
 * No bundled consent. Revoke where applicable.
 */

export const MODEL_IMPROVEMENT_CONSENT_VERSION =
  "model_improvement_consent.v1" as const;

export const MODEL_IMPROVEMENT_CONSENT_HONESTY = [
  "Service use, expert review, and research/model improvement are separate choices — never one bundled checkbox.",
  "Research/model improvement is off by default and may be revoked; it does not turn on expert review or public video sharing.",
  "Expert review consent does not enroll you in research/model improvement.",
  "Using the product for private training and analysis is not the same as agreeing to research aggregates.",
  "No live model-training pipeline is claimed — research consent prepares privacy-safe aggregates for a future moat.",
] as const;

export type ConsentKindId =
  | "service_use"
  | "expert_review"
  | "research_model_improvement";

export type ConsentKindDefinition = {
  id: ConsentKindId;
  title: string;
  summary: string;
  /** What granting this does. */
  grants: string;
  /** What it never does. */
  never: string;
  revocable: boolean;
  revokeHow: string;
};

export const CONSENT_KINDS: readonly ConsentKindDefinition[] = [
  {
    id: "service_use",
    title: "Service use",
    summary:
      "Use Performance OS for your account — programs, logging, and private technique analysis you explicitly start.",
    grants:
      "Access to product features you choose. Technique uploads still require a separate analysis checkbox per video.",
    never:
      "Does not share video with experts or enroll you in research/model improvement.",
    revocable: true,
    revokeHow:
      "Stop uploading, delete technique videos, or delete your account from Settings. Past service use cannot be “un-used,” but media can be removed.",
  },
  {
    id: "expert_review",
    title: "Expert review",
    summary:
      "Allow verified Expert Contributors to review technique analyses you choose to share.",
    grants:
      "Account preference for expert review plus per-video opt-in when you upload or save privacy options.",
    never:
      "Does not make videos public or allow anonymous research aggregates.",
    revocable: true,
    revokeHow:
      "Turn off the account preference and/or revoke expert share on existing videos. Withdraw pending reviews where the product supports it.",
  },
  {
    id: "research_model_improvement",
    title: "Research / model improvement",
    summary:
      "Allow anonymized, aggregated signals for future model improvement (data moat) — not surveillance.",
    grants:
      "Eligibility for privacy-safe cohort aggregates when scopes are on. Per-video technique contribution still needs its own opt-in.",
    never:
      "Does not share identifiable video with experts or publish your clips.",
    revocable: true,
    revokeHow:
      "Revoke account research consent and clear model-improvement flags on existing videos. No further aggregates after revoke.",
  },
] as const;

export type ConsentKindStatus = {
  kind: ConsentKindId;
  active: boolean;
  detail: string;
  updatedAt: string | null;
};

export function getModelImprovementConsentSnapshot(): {
  honesty: readonly string[];
  kinds: typeof CONSENT_KINDS;
  policyVersion: typeof MODEL_IMPROVEMENT_CONSENT_VERSION;
  docPath: "docs/MODEL_IMPROVEMENT_CONSENT.md";
} {
  return {
    honesty: MODEL_IMPROVEMENT_CONSENT_HONESTY,
    kinds: CONSENT_KINDS,
    policyVersion: MODEL_IMPROVEMENT_CONSENT_VERSION,
    docPath: "docs/MODEL_IMPROVEMENT_CONSENT.md",
  };
}
