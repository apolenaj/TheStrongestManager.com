/**
 * Personal Record Intelligence (Prompt 72).
 */

/** Round load keys for rep-PR matching (kg). */
export const PR_LOAD_BUCKET_KG = 2.5;

/** Lookback when gathering samples for the PR timeline. */
export const PR_INTEL_LOOKBACK_DAYS = 365;

export const PR_TYPE_LABELS = {
  one_rm: "1RM",
  estimated_1rm: "Estimated 1RM",
  rep_pr: "Rep PR",
  volume_pr: "Volume PR",
  technical_pr: "Technical PR",
} as const;

export const PR_SHARE_HONESTY =
  "Shared from The Strongest — Estimated 1RM is never a verified competition PR.";
