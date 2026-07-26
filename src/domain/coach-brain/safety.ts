import { COACH_BRAIN_FORBIDDEN_CLAIM_PATTERNS } from "@/domain/coach-brain/constants";
import type {
  CoachBrainRecommendation,
  CoachBrainSafetyFlag,
} from "@/domain/coach-brain/types";
import { coachBrainRecommendationToSafetyInput } from "@/domain/safety-system/adapters";
import { validateRecommendationSafety } from "@/domain/safety-system/validate";

/**
 * Safety validation — fail closed on forbidden claims and auto-apply language.
 * Also runs Safety System 2.0 (central recommendation gate).
 * Does not expose or require chain-of-thought.
 */
export function validateCoachBrainRecommendations(
  recommendations: CoachBrainRecommendation[],
  opts?: { painSafeModeActive?: boolean },
): {
  ok: boolean;
  flags: CoachBrainSafetyFlag[];
  sanitized: CoachBrainRecommendation[];
} {
  const flags: CoachBrainSafetyFlag[] = [];
  const sanitized: CoachBrainRecommendation[] = [];

  for (const rec of recommendations) {
    const text = [
      rec.recommendation,
      rec.reasoningSummary,
      ...rec.risks,
      rec.recommendedAction.label,
    ].join("\n");

    let blocked = false;
    for (const pattern of COACH_BRAIN_FORBIDDEN_CLAIM_PATTERNS) {
      if (pattern.test(text)) {
        blocked = true;
        flags.push({
          code: "forbidden_claim",
          message: `Blocked recommendation “${rec.id}” — matched safety pattern ${pattern}.`,
          severity: "block",
        });
        break;
      }
    }

    if (
      rec.recommendedAction.kind === "confirm_adaptation" &&
      !rec.recommendedAction.requiresExplicitConfirmation
    ) {
      blocked = true;
      flags.push({
        code: "adaptation_without_confirmation",
        message: `Blocked “${rec.id}” — program changes must require explicit confirmation.`,
        severity: "block",
      });
    }

    if (!rec.reasoningSummary.trim()) {
      blocked = true;
      flags.push({
        code: "missing_reasoning_summary",
        message: `Blocked “${rec.id}” — reasoningSummary is required (concise, not CoT).`,
        severity: "block",
      });
    }

    if (
      typeof rec.recommendation !== "string" ||
      !Array.isArray(rec.supportingData) ||
      !rec.confidence ||
      !Array.isArray(rec.risks) ||
      !Array.isArray(rec.missingInformation) ||
      !rec.recommendedAction
    ) {
      blocked = true;
      flags.push({
        code: "incomplete_structure",
        message: `Blocked “${rec.id}” — structured output fields incomplete.`,
        severity: "block",
      });
    }

    let next: CoachBrainRecommendation = {
      ...rec,
      // Ensure adaptation actions stay confirmation-gated.
      recommendedAction: {
        ...rec.recommendedAction,
        requiresExplicitConfirmation:
          rec.recommendedAction.kind === "confirm_adaptation"
            ? true
            : rec.recommendedAction.requiresExplicitConfirmation,
      },
    };

    if (!blocked) {
      const safety = validateRecommendationSafety(
        coachBrainRecommendationToSafetyInput(next, {
          painSafeModeActive: opts?.painSafeModeActive,
        }),
      );
      for (const finding of safety.findings) {
        flags.push({
          code: `safety_system.${finding.ruleId}`,
          message: finding.message,
          severity: finding.action === "block" ? "block" : "warn",
        });
      }
      if (safety.action === "block") {
        blocked = true;
      } else if (safety.action === "modify" && safety.outputText) {
        next = { ...next, recommendation: safety.outputText };
        flags.push({
          code: "safety_system.modified",
          message: `Modified recommendation “${rec.id}” via Safety System 2.0.`,
          severity: "warn",
        });
      }
    }

    if (!blocked) {
      sanitized.push(next);
    }
  }

  const hardBlocks = flags.filter((f) => f.severity === "block");
  return {
    ok: hardBlocks.length === 0 && sanitized.length > 0,
    flags,
    sanitized,
  };
}
