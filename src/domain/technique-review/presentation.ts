/**
 * Presentation + disagreement helpers for technique expert review.
 */

import type {
  TechniqueDisagreementKind,
  TechniqueExpertDecision,
  TechniqueExpertReviewStatus,
} from "@/domain/technique-review/constants";

export type TechniqueAuthorshipPresentation = {
  /** Short badge label for the report hero. */
  badge: string;
  /** Longer honesty line. */
  detail: string;
  /** True only after confirm / correct / comment. */
  isExpertReviewed: boolean;
  /** True when AI analysis exists as the primary engine output. */
  showsAiAnalysis: boolean;
};

/**
 * Hard rule: never present AI as expert-reviewed unless an expert has decided.
 */
export function presentTechniqueAuthorship(
  status: TechniqueExpertReviewStatus | string | null | undefined,
): TechniqueAuthorshipPresentation {
  const s = status ?? "none";

  if (s === "confirmed" || s === "corrected" || s === "commented") {
    return {
      badge: "Expert reviewed",
      detail:
        s === "corrected"
          ? "A verified expert corrected this AI analysis."
          : s === "commented"
            ? "A verified expert reviewed this AI analysis and left a comment."
            : "A verified expert confirmed this AI analysis.",
      isExpertReviewed: true,
      showsAiAnalysis: true,
    };
  }

  if (s === "pending_review") {
    return {
      badge: "AI analysis",
      detail:
        "Expert review requested — still AI analysis until a verified expert decides. Not expert-reviewed yet.",
      isExpertReviewed: false,
      showsAiAnalysis: true,
    };
  }

  return {
    badge: "AI analysis",
    detail:
      "Automated technique analysis. Optional expert review is available — this report is not expert-reviewed.",
    isExpertReviewed: false,
    showsAiAnalysis: true,
  };
}

export function isExpertReviewedStatus(
  status: string | null | undefined,
): boolean {
  return presentTechniqueAuthorship(status).isExpertReviewed;
}

export function decisionToReviewStatus(
  decision: TechniqueExpertDecision,
): Extract<
  TechniqueExpertReviewStatus,
  "confirmed" | "corrected" | "commented"
> {
  if (decision === "confirm") return "confirmed";
  if (decision === "correct") return "corrected";
  return "commented";
}

/**
 * Classify AI vs expert disagreement for offline model improvement datasets.
 */
export function classifyTechniqueDisagreement(input: {
  decision: TechniqueExpertDecision;
  aiOverallScore: number | null;
  correctedOverallScore: number | null;
  aiSummary: string | null;
  correctedSummary: string | null;
  comment: string | null;
}): TechniqueDisagreementKind {
  if (input.decision === "confirm") {
    return "none";
  }

  if (input.decision === "comment") {
    return input.comment?.trim() ? "qualitative" : "none";
  }

  // correct
  const scoreChanged =
    input.correctedOverallScore != null &&
    (input.aiOverallScore == null ||
      Math.abs(input.correctedOverallScore - input.aiOverallScore) >= 0.5);

  const summaryChanged =
    Boolean(input.correctedSummary?.trim()) &&
    (input.correctedSummary?.trim() ?? "") !== (input.aiSummary?.trim() ?? "");

  const qualitative = Boolean(input.comment?.trim());

  const parts = [
    scoreChanged ? "score" : null,
    summaryChanged ? "summary" : null,
    qualitative ? "qualitative" : null,
  ].filter(Boolean);

  if (parts.length === 0) return "none";
  if (parts.length > 1) return "mixed";
  if (parts[0] === "score") return "score";
  if (parts[0] === "summary") return "summary";
  return "qualitative";
}

/** Display score after expert review — prefer correction when present. */
export function resolveDisplayedTechniqueScore(input: {
  aiOverallScore: number | null;
  expertReviewStatus: string | null | undefined;
  correctedOverallScore: number | null | undefined;
}): number | null {
  if (
    input.expertReviewStatus === "corrected" &&
    input.correctedOverallScore != null
  ) {
    return input.correctedOverallScore;
  }
  return input.aiOverallScore;
}
