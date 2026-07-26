/**
 * Deterministic suggestion drafts from athlete signals — never auto-applied.
 */

import {
  COACH_AI_ENGINE_VERSION,
  type CoachAiConfidence,
  type CoachAiSuggestionKind,
} from "@/domain/coach-ai/constants";

export type CoachAiAthleteSignals = {
  athleteLabel: string;
  /** Completed sessions in last 7 days. */
  sessionsLast7d: number;
  /** Completed sessions in prior 7 days. */
  sessionsPrev7d: number;
  /** Mean technique score recent vs earlier (null if thin). */
  techniqueDelta: number | null;
  techniqueSampleCount: number;
  /** Mean RPE recent if available. */
  meanRpeRecent: number | null;
  hasRecoveryEntries7d: boolean;
  hasTechniqueAnalyses14d: boolean;
  hasActiveProgram: boolean;
  openGoalsCount: number;
  /** Days until next active competition; null if none. */
  daysUntilCompetition: number | null;
  competitionLabel: string | null;
};

export type CoachAiDraftSuggestion = {
  kind: CoachAiSuggestionKind;
  title: string;
  /** Proposed change the coach would act on. */
  suggestedChange: string;
  /** Why the AI suggests this. */
  why: string;
  /** Supporting data bullets. */
  supportingData: string[];
  confidence: CoachAiConfidence;
  proposedChangeJson: Record<string, unknown>;
  engineVersion: typeof COACH_AI_ENGINE_VERSION;
};

function confidenceFromSamples(n: number): CoachAiConfidence {
  if (n >= 4) return "high";
  if (n >= 2) return "medium";
  return "low";
}

/**
 * Build AI drafts from signals. Empty when nothing useful — never invent athletes.
 */
export function draftCoachAiSuggestions(
  signals: CoachAiAthleteSignals,
): CoachAiDraftSuggestion[] {
  const drafts: CoachAiDraftSuggestion[] = [];

  // Week summary — always when we have any session signal
  const sessionDelta = signals.sessionsLast7d - signals.sessionsPrev7d;
  drafts.push({
    kind: "week_summary",
    title: `Week summary — ${signals.athleteLabel}`,
    suggestedChange:
      "Review this week’s volume and recovery before changing the plan.",
    why: "Copilot summarized recent training load vs the prior week for your review.",
    supportingData: [
      `${signals.sessionsLast7d} completed session(s) in the last 7 days`,
      `${signals.sessionsPrev7d} completed session(s) in the prior 7 days`,
      sessionDelta === 0
        ? "Session count unchanged week-over-week"
        : sessionDelta > 0
          ? `Session count up by ${sessionDelta}`
          : `Session count down by ${Math.abs(sessionDelta)}`,
      signals.meanRpeRecent != null
        ? `Mean recent RPE ≈ ${signals.meanRpeRecent.toFixed(1)}`
        : "RPE not logged enough to summarize",
    ],
    confidence: confidenceFromSamples(
      signals.sessionsLast7d + signals.sessionsPrev7d,
    ),
    proposedChangeJson: {
      action: "review_week",
      sessionsLast7d: signals.sessionsLast7d,
      sessionsPrev7d: signals.sessionsPrev7d,
    },
    engineVersion: COACH_AI_ENGINE_VERSION,
  });

  // Performance changes
  if (signals.techniqueDelta != null && signals.techniqueSampleCount >= 2) {
    const up = signals.techniqueDelta >= 3;
    const down = signals.techniqueDelta <= -3;
    if (up || down) {
      drafts.push({
        kind: "performance_change",
        title: up
          ? "Technique scores trending up"
          : "Technique scores trending down",
        suggestedChange: up
          ? "Consider progressing load carefully while keeping technique cues."
          : "Hold or reduce intensity and re-check technique cues before progressing.",
        why: "Recent technique analyses differ from earlier scores in the window.",
        supportingData: [
          `Technique delta ≈ ${signals.techniqueDelta >= 0 ? "+" : ""}${signals.techniqueDelta.toFixed(1)} points`,
          `${signals.techniqueSampleCount} scored analyses in window`,
        ],
        confidence: confidenceFromSamples(signals.techniqueSampleCount),
        proposedChangeJson: {
          action: up ? "progress_cautiously" : "hold_or_reduce",
          techniqueDelta: signals.techniqueDelta,
        },
        engineVersion: COACH_AI_ENGINE_VERSION,
      });
    }
  }

  if (sessionDelta <= -2 && signals.sessionsPrev7d >= 2) {
    drafts.push({
      kind: "performance_change",
      title: "Training frequency dropped",
      suggestedChange:
        "Ask the athlete about barriers this week; avoid stacking load until consistency returns.",
      why: "Completed sessions fell meaningfully vs the prior week.",
      supportingData: [
        `${signals.sessionsLast7d} vs ${signals.sessionsPrev7d} sessions (WoW)`,
      ],
      confidence: "medium",
      proposedChangeJson: {
        action: "check_in_consistency",
        sessionDelta,
      },
      engineVersion: COACH_AI_ENGINE_VERSION,
    });
  }

  // Program adjustment draft
  if (signals.hasActiveProgram && signals.sessionsLast7d >= 2) {
    drafts.push({
      kind: "program_adjustment_draft",
      title: "Draft program adjustment (not applied)",
      suggestedChange:
        signals.meanRpeRecent != null && signals.meanRpeRecent >= 8.5
          ? "Draft: keep main lifts, trim accessory volume ~10–20% next week."
          : "Draft: keep prescription; add one technique emphasis set if recovery allows.",
      why: "Based on recent session count and RPE — draft only until you decide.",
      supportingData: [
        "Active program present",
        `${signals.sessionsLast7d} sessions this week`,
        signals.meanRpeRecent != null
          ? `Mean RPE ≈ ${signals.meanRpeRecent.toFixed(1)}`
          : "RPE sparse — draft is low confidence",
      ],
      confidence:
        signals.meanRpeRecent != null
          ? confidenceFromSamples(signals.sessionsLast7d)
          : "low",
      proposedChangeJson: {
        action: "draft_program_tweak",
        autoApply: false,
      },
      engineVersion: COACH_AI_ENGINE_VERSION,
    });
  }

  // Missing data flags
  const missing: string[] = [];
  if (!signals.hasTechniqueAnalyses14d) {
    missing.push("No technique analyses in the last 14 days");
  }
  if (!signals.hasRecoveryEntries7d) {
    missing.push("No recovery check-ins in the last 7 days");
  }
  if (signals.sessionsLast7d === 0 && signals.sessionsPrev7d === 0) {
    missing.push("No completed sessions in the last 14 days");
  }
  if (!signals.hasActiveProgram) {
    missing.push("No active program on file");
  }
  if (signals.openGoalsCount === 0) {
    missing.push("No open goals");
  }

  if (missing.length > 0) {
    drafts.push({
      kind: "missing_data",
      title: "Missing data flags",
      suggestedChange:
        "Request the missing inputs before making load or volume decisions.",
      why: "Decisions with thin data are easy to get wrong — flagging gaps for you.",
      supportingData: missing,
      confidence: "high",
      proposedChangeJson: {
        action: "request_missing_data",
        flags: missing,
      },
      engineVersion: COACH_AI_ENGINE_VERSION,
    });
  }

  // Competition context — draft only; never invents a meet without a date signal.
  if (
    signals.daysUntilCompetition != null &&
    signals.daysUntilCompetition >= 0 &&
    signals.daysUntilCompetition <= 21
  ) {
    const label =
      signals.competitionLabel?.trim() || "Competition";
    drafts.push({
      kind: "performance_change",
      title: "Competition approaching",
      suggestedChange:
        signals.daysUntilCompetition <= 7
          ? "Review peaking and recovery with the athlete; avoid stacking new volume this week."
          : "Confirm competition plan and keep technique quality ahead of load jumps.",
      why: "An upcoming competition date is on file — context for your programming decision.",
      supportingData: [
        `${label} in ${signals.daysUntilCompetition} day${signals.daysUntilCompetition === 1 ? "" : "s"}`,
      ],
      confidence: "high",
      proposedChangeJson: {
        action: "competition_context",
        daysUntilCompetition: signals.daysUntilCompetition,
        autoApply: false,
      },
      engineVersion: COACH_AI_ENGINE_VERSION,
    });
  }

  return drafts;
}

export function decisionEventType(
  decision: "accept" | "edit" | "reject",
): "accepted" | "edited" | "rejected" {
  if (decision === "accept") return "accepted";
  if (decision === "edit") return "edited";
  return "rejected";
}

export function statusAfterDecision(
  decision: "accept" | "edit" | "reject",
): "accepted" | "edited" | "rejected" {
  return decisionEventType(decision);
}
