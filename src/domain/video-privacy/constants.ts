/**
 * Video Privacy Controls (Prompt 178).
 * Uploaded videos are private by default. Optional uses require explicit opt-in — no hidden consent.
 */

export const VIDEO_PRIVACY_POLICY_VERSION = "video_privacy.v1" as const;

export const VIDEO_PRIVACY_HONESTY = [
  "Technique videos are private by default — not public, not used for marketing.",
  "Analysis runs only when you explicitly consent to private analysis for that upload.",
  "Expert review and anonymous model improvement stay off unless you opt in — no hidden or pre-ticked consent.",
  "Anonymous model improvement never means making your video public or identifiable in a gallery.",
  "You can change optional sharing settings later or delete the upload from Technique.",
] as const;

export type VideoPrivacyOptionId =
  | "analysis_only"
  | "allow_expert_review"
  | "allow_anonymous_model_improvement";

export type VideoPrivacyChoices = {
  /** Required — use video only for private technique analysis. */
  analysisOnly: boolean;
  /** Optional — share with verified expert reviewers. Default false. */
  allowExpertReview: boolean;
  /** Optional — contribute anonymized signals to future model improvement. Default false. */
  allowAnonymousModelImprovement: boolean;
};

export const VIDEO_PRIVACY_DEFAULTS: VideoPrivacyChoices = {
  analysisOnly: false,
  allowExpertReview: false,
  allowAnonymousModelImprovement: false,
};

export const VIDEO_PRIVACY_OPTIONS: readonly {
  id: VideoPrivacyOptionId;
  title: string;
  description: string;
  required: boolean;
  defaultOn: false;
}[] = [
  {
    id: "analysis_only",
    title: "Use only for private analysis",
    description:
      "Store this video privately and run technique analysis for your account. Required to upload.",
    required: true,
    defaultOn: false,
  },
  {
    id: "allow_expert_review",
    title: "Allow expert review",
    description:
      "Let verified Expert Contributors view this analysis (and video) if you request a review. Off by default.",
    required: false,
    defaultOn: false,
  },
  {
    id: "allow_anonymous_model_improvement",
    title: "Allow anonymous model improvement",
    description:
      "Permit anonymized, aggregated use of analysis signals for future model improvement — not a public gallery, not marketing. Off by default. No live retrain is claimed.",
    required: false,
    defaultOn: false,
  },
] as const;

export function parseVideoPrivacyFromFlags(input: {
  analysisConsent: boolean;
  allowExpertReview: boolean;
  allowAnonymousModelImprovement: boolean;
}):
  | { ok: true; choices: VideoPrivacyChoices }
  | { ok: false; error: string } {
  if (!input.analysisConsent) {
    return {
      ok: false,
      error:
        "Explicit consent to private analysis is required. Videos are private by default — we do not imply consent.",
    };
  }
  return {
    ok: true,
    choices: {
      analysisOnly: true,
      allowExpertReview: Boolean(input.allowExpertReview),
      allowAnonymousModelImprovement: Boolean(
        input.allowAnonymousModelImprovement,
      ),
    },
  };
}

export function videoAllowsExpertReview(row: {
  allowExpertReview: boolean;
  expertReviewConsentAt: Date | string | null;
}): boolean {
  return (
    row.allowExpertReview === true || row.expertReviewConsentAt != null
  );
}

export function videoAllowsAnonymousModelImprovement(row: {
  modelImprovementConsentAt: Date | string | null;
  deletedAt?: Date | string | null;
}): boolean {
  if (row.deletedAt) return false;
  return row.modelImprovementConsentAt != null;
}

export function buildVideoPrivacyNote(choices: VideoPrivacyChoices): string {
  const parts = [
    "Private by default.",
    "Use: private analysis only.",
  ];
  if (choices.allowExpertReview) {
    parts.push("Expert review: opted in.");
  } else {
    parts.push("Expert review: off.");
  }
  if (choices.allowAnonymousModelImprovement) {
    parts.push("Anonymous model improvement: opted in.");
  } else {
    parts.push("Anonymous model improvement: off.");
  }
  parts.push("No hidden consent.");
  return parts.join(" ");
}

export function getVideoPrivacySnapshot(): {
  honesty: readonly string[];
  options: typeof VIDEO_PRIVACY_OPTIONS;
  defaults: VideoPrivacyChoices;
  policyVersion: typeof VIDEO_PRIVACY_POLICY_VERSION;
  docPath: "docs/VIDEO_PRIVACY_CONTROLS.md";
} {
  return {
    honesty: VIDEO_PRIVACY_HONESTY,
    options: VIDEO_PRIVACY_OPTIONS,
    defaults: VIDEO_PRIVACY_DEFAULTS,
    policyVersion: VIDEO_PRIVACY_POLICY_VERSION,
    docPath: "docs/VIDEO_PRIVACY_CONTROLS.md",
  };
}
