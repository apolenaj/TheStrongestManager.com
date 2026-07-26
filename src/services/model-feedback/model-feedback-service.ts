/**
 * Model feedback service — persist ratings/decisions; never retrain production AI.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  MODEL_FEEDBACK_ENGINE_VERSION,
  MODEL_FEEDBACK_HONESTY,
  isModelFeedbackRelatedType,
  isModelFeedbackVerdict,
  mayAutoRetrainFromFeedback,
  verdictsAllowedForRole,
  type ModelFeedbackRelatedType,
  type ModelFeedbackRole,
  type ModelFeedbackVerdict,
} from "@/domain/model-feedback";
import { trackProductEventSafe } from "@/services/analytics/track";
import { prisma } from "@/lib/db";
import { assertCoachCanAccessAthlete } from "@/services/coach/coach-service";

export type SubmitModelFeedbackResult =
  | { ok: true; feedbackId: string }
  | { ok: false; error: string };

function truncateReason(raw: string | undefined): string | null {
  const t = raw?.trim() ?? "";
  if (!t) return null;
  return t.slice(0, 500);
}

export async function submitModelFeedback(input: {
  actorUserId: string;
  role: ModelFeedbackRole;
  relatedType: string;
  relatedId: string;
  verdict: string;
  reason?: string;
  /** Required for coach feedback targeting another athlete's suggestion. */
  athleteProfileId?: string;
}): Promise<SubmitModelFeedbackResult> {
  if (!featureFlags.modelFeedback) {
    return { ok: false, error: "Model feedback is not enabled." };
  }

  // Hard invariant — never wire retrain here.
  if (mayAutoRetrainFromFeedback() !== false) {
    return { ok: false, error: "Feedback pipeline misconfigured." };
  }

  if (!isModelFeedbackRelatedType(input.relatedType)) {
    return { ok: false, error: "Unknown recommendation type." };
  }
  if (!isModelFeedbackVerdict(input.verdict)) {
    return { ok: false, error: "Invalid feedback verdict." };
  }

  const allowed = verdictsAllowedForRole(input.role);
  if (!(allowed as readonly string[]).includes(input.verdict)) {
    return {
      ok: false,
      error:
        input.role === "athlete"
          ? "Athletes may rate helpful or not helpful."
          : input.role === "expert"
            ? "Experts may mark confirmed, corrected, or commented."
            : "Coaches may mark accepted, modified, or rejected.",
    };
  }

  const relatedId = input.relatedId.trim();
  if (!relatedId) {
    return { ok: false, error: "Missing recommendation id." };
  }

  let athleteProfileId = input.athleteProfileId?.trim() || null;

  if (input.role === "athlete") {
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: input.actorUserId },
      select: { id: true },
    });
    if (!profile) {
      return { ok: false, error: "Athlete profile required." };
    }
    athleteProfileId = profile.id;

    const owned = await assertAthleteOwnsRelated({
      athleteProfileId: profile.id,
      relatedType: input.relatedType,
      relatedId,
    });
    if (!owned.ok) return owned;
  } else if (input.role === "coach") {
    if (!athleteProfileId) {
      return { ok: false, error: "Athlete profile required for coach feedback." };
    }
    const access = await assertCoachCanAccessAthlete({
      coachUserId: input.actorUserId,
      athleteProfileId,
    });
    if (!access.ok) return access;
  } else {
    // expert — caller must verify expert status; athlete profile required
    if (!athleteProfileId) {
      return {
        ok: false,
        error: "Athlete profile required for expert feedback.",
      };
    }
    if (input.relatedType !== "technique_expert_review") {
      return {
        ok: false,
        error: "Experts may only feedback technique expert reviews.",
      };
    }
  }

  const reason = truncateReason(input.reason);

  const row = await prisma.modelFeedback.upsert({
    where: {
      actorUserId_relatedType_relatedId: {
        actorUserId: input.actorUserId,
        relatedType: input.relatedType,
        relatedId,
      },
    },
    create: {
      athleteProfileId: athleteProfileId!,
      actorUserId: input.actorUserId,
      role: input.role,
      relatedType: input.relatedType,
      relatedId,
      verdict: input.verdict,
      reason,
      engineVersion: MODEL_FEEDBACK_ENGINE_VERSION,
      autoRetrainBlocked: true,
    },
    update: {
      verdict: input.verdict,
      reason,
      role: input.role,
      athleteProfileId: athleteProfileId!,
      autoRetrainBlocked: true,
    },
  });

  // Product analytics — no free-text reason.
  trackProductEventSafe({
    name: "model_feedback_submitted",
    userId: input.actorUserId,
    props: {
      relatedType: input.relatedType,
      verdict: input.verdict,
      role: input.role,
    },
  });

  return { ok: true, feedbackId: row.id };
}

async function assertAthleteOwnsRelated(input: {
  athleteProfileId: string;
  relatedType: ModelFeedbackRelatedType;
  relatedId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  switch (input.relatedType) {
    case "program_adaptation": {
      const row = await prisma.programAdaptation.findFirst({
        where: {
          id: input.relatedId,
          athleteProfileId: input.athleteProfileId,
        },
        select: { id: true },
      });
      if (!row) return { ok: false, error: "Adaptation not found." };
      return { ok: true };
    }
    case "program_ai_review": {
      const row = await prisma.programAiReview.findFirst({
        where: {
          id: input.relatedId,
          athleteProfileId: input.athleteProfileId,
        },
        select: { id: true },
      });
      if (!row) return { ok: false, error: "Program review not found." };
      return { ok: true };
    }
    case "recommendation": {
      const row = await prisma.recommendation.findFirst({
        where: {
          id: input.relatedId,
          athleteProfileId: input.athleteProfileId,
        },
        select: { id: true },
      });
      if (!row) return { ok: false, error: "Recommendation not found." };
      return { ok: true };
    }
    case "insight": {
      // Ephemeral insight ids from the engine — allow any non-empty stable key for the athlete.
      if (input.relatedId.length < 2) {
        return { ok: false, error: "Invalid insight id." };
      }
      return { ok: true };
    }
    case "coach_chat":
    case "coach_brain":
    case "pr_prediction":
    case "goal_probability":
    case "exercise_prescription":
    case "weak_point":
    case "daily_brief":
    case "fatigue_alert":
    case "deload_intelligence": {
      if (input.relatedId.length < 2) {
        return { ok: false, error: "Invalid related id." };
      }
      return { ok: true };
    }
    case "coach_ai_suggestion": {
      return {
        ok: false,
        error: "Athletes rate adaptations and insights — not coach AI drafts.",
      };
    }
    case "technique_expert_review": {
      return {
        ok: false,
        error: "Athletes do not submit expert review feedback.",
      };
    }
    default:
      return { ok: false, error: "Unsupported type." };
  }
}

/**
 * Record coach decision feedback when they accept/edit/reject a Coach AI suggestion.
 */
export async function recordCoachAiDecisionFeedback(input: {
  coachUserId: string;
  athleteProfileId: string;
  suggestionId: string;
  decision: "accept" | "edit" | "reject";
}): Promise<void> {
  if (!featureFlags.modelFeedback) return;

  const verdict: ModelFeedbackVerdict =
    input.decision === "accept"
      ? "accepted"
      : input.decision === "edit"
        ? "modified"
        : "rejected";

  await submitModelFeedback({
    actorUserId: input.coachUserId,
    role: "coach",
    relatedType: "coach_ai_suggestion",
    relatedId: input.suggestionId,
    verdict,
    athleteProfileId: input.athleteProfileId,
  });
}

/**
 * Record expert confirm/correct/comment for offline model improvement datasets.
 */
export async function recordTechniqueExpertReviewFeedback(input: {
  expertUserId: string;
  athleteProfileId: string;
  reviewId: string;
  decision: "confirm" | "correct" | "comment";
  reason?: string;
}): Promise<void> {
  if (!featureFlags.modelFeedback) return;

  const verdict: ModelFeedbackVerdict =
    input.decision === "confirm"
      ? "confirmed"
      : input.decision === "correct"
        ? "corrected"
        : "commented";

  await submitModelFeedback({
    actorUserId: input.expertUserId,
    role: "expert",
    relatedType: "technique_expert_review",
    relatedId: input.reviewId,
    verdict,
    reason: input.reason,
    athleteProfileId: input.athleteProfileId,
  });
}

export function modelFeedbackHonesty(): readonly string[] {
  return MODEL_FEEDBACK_HONESTY;
}
