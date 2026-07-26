/**
 * Plan-aware adherence analysis.
 * Does not reward blind completion of every scheduled session.
 */

import {
  TRAINING_CONSISTENCY_ENGINE_VERSION,
  TRAINING_CONSISTENCY_HONESTY,
  type TciContextKind,
  type TciDayOutcome,
} from "@/domain/training-consistency-intelligence/constants";
import { contextsForDay } from "@/domain/training-consistency-intelligence/contexts";
import {
  canPublishTrainingConsistency,
  insufficientPlanHistoryReason,
} from "@/domain/training-consistency-intelligence/gate";
import type {
  ConsistencyContextWindow,
  ConsistencyDayResult,
  ConsistencyPlanDay,
  ConsistencySessionPoint,
  TrainingConsistencyAnalysis,
} from "@/domain/training-consistency-intelligence/types";

function sessionsOnDay(
  dayKey: string,
  sessions: ConsistencySessionPoint[],
): ConsistencySessionPoint[] {
  return sessions.filter((s) => s.dayKey === dayKey);
}

function classifyDay(input: {
  plan: ConsistencyPlanDay;
  sessions: ConsistencySessionPoint[];
  dayContexts: ConsistencyContextWindow[];
  /** YYYY-MM-DD — days on/after this are not scored as misses. */
  openDayKey: string;
}): ConsistencyDayResult {
  const { plan, sessions, dayContexts, openDayKey } = input;
  const kinds = dayContexts.map((c) => c.kind);
  const completed = sessions.filter((s) => s.status === "completed");
  const skipped = sessions.filter((s) => s.status === "skipped");
  const pending = sessions.filter(
    (s) => s.status === "planned" || s.status === "in_progress",
  );
  const isOpenOrFuture = plan.dayKey >= openDayKey;

  const softContext = kinds.some(
    (k) => k === "deload" || k === "injury_break" || k === "program_change",
  );

  // Planned rest day
  if (plan.expectation === "rest") {
    if (completed.length > 0) {
      return {
        dayKey: plan.dayKey,
        expectation: plan.expectation,
        outcome: "extra_session",
        contexts:
          kinds.length > 0 ? kinds : (["planned_rest"] as TciContextKind[]),
        explanation:
          "Unscheduled session on a planned rest day — tracked as extra gym time, not higher adherence.",
      };
    }
    if (isOpenOrFuture) {
      return {
        dayKey: plan.dayKey,
        expectation: plan.expectation,
        outcome: "pending",
        contexts: kinds,
        explanation: "Upcoming planned rest — not scored yet.",
      };
    }
    return {
      dayKey: plan.dayKey,
      expectation: plan.expectation,
      outcome: "adhered_rest",
      contexts: kinds.includes("planned_rest")
        ? kinds
        : (["planned_rest", ...kinds] as TciContextKind[]),
      explanation: softContext
        ? "Planned rest honored during a context window (deload / break / program change)."
        : "Planned rest honored — rest is on-plan, not a miss.",
    };
  }

  // Training expected
  if (pending.length > 0 && completed.length === 0 && skipped.length === 0) {
    return {
      dayKey: plan.dayKey,
      expectation: plan.expectation,
      outcome: "pending",
      contexts: kinds,
      explanation:
        "Scheduled session still open — excluded from adherence until resolved.",
    };
  }

  if (completed.length > 0) {
    if (kinds.includes("injury_break")) {
      return {
        dayKey: plan.dayKey,
        expectation: plan.expectation,
        outcome: "context_adjusted",
        contexts: kinds,
        explanation:
          "Session completed during an injury-break window — counted as context-adjusted, not a gym-day trophy.",
      };
    }
    return {
      dayKey: plan.dayKey,
      expectation: plan.expectation,
      outcome: "adhered_training",
      contexts: kinds,
      explanation: kinds.includes("deload")
        ? "Trained as scheduled during a deload window — adherence, not volume heroics."
        : "Completed the planned training day.",
    };
  }

  if (
    skipped.length > 0 ||
    (sessions.length === 0 && plan.expectation === "training")
  ) {
    if (isOpenOrFuture && skipped.length === 0) {
      return {
        dayKey: plan.dayKey,
        expectation: plan.expectation,
        outcome: "pending",
        contexts: kinds,
        explanation: "Scheduled training day still open.",
      };
    }

    if (softContext) {
      return {
        dayKey: plan.dayKey,
        expectation: plan.expectation,
        outcome: "context_adjusted",
        contexts: kinds,
        explanation: kinds.includes("injury_break")
          ? "Scheduled day skipped or empty during an injury break — not counted as a miss."
          : kinds.includes("deload")
            ? "Scheduled day adjusted during deload — reduced training can still be on-plan."
            : "Scheduled day adjusted around a program change — transition, not a miss.",
      };
    }

    if (sessions.length === 0) {
      return {
        dayKey: plan.dayKey,
        expectation: plan.expectation,
        outcome: "missed",
        contexts: kinds,
        explanation:
          "Training was planned; no completed session and no soft context.",
      };
    }

    return {
      dayKey: plan.dayKey,
      expectation: plan.expectation,
      outcome: "missed",
      contexts: kinds,
      explanation:
        "Skipped a planned training day without deload, injury break, or program-change context.",
    };
  }

  return {
    dayKey: plan.dayKey,
    expectation: plan.expectation,
    outcome: "excluded",
    contexts: kinds,
    explanation: "Day excluded from adherence.",
  };
}

function isResolved(outcome: TciDayOutcome): boolean {
  return (
    outcome === "adhered_training" ||
    outcome === "adhered_rest" ||
    outcome === "missed" ||
    outcome === "context_adjusted"
  );
}

function isAdhered(outcome: TciDayOutcome): boolean {
  return (
    outcome === "adhered_training" ||
    outcome === "adhered_rest" ||
    outcome === "context_adjusted"
  );
}

/**
 * Analyze plan adherence for a window.
 */
export function analyzeTrainingConsistency(input: {
  windowLabel: string;
  planDays: ConsistencyPlanDay[];
  sessions: ConsistencySessionPoint[];
  contexts: ConsistencyContextWindow[];
  /** Default: first day of “today” — open/future days stay pending. */
  openDayKey?: string;
}): TrainingConsistencyAnalysis {
  const openDayKey =
    input.openDayKey ?? new Date().toISOString().slice(0, 10);
  const days: ConsistencyDayResult[] = input.planDays.map((plan) =>
    classifyDay({
      plan,
      sessions: sessionsOnDay(plan.dayKey, input.sessions),
      dayContexts: contextsForDay(plan.dayKey, input.contexts),
      openDayKey,
    }),
  );

  const resolved = days.filter((d) => isResolved(d.outcome));
  const adheredDays = resolved.filter((d) => isAdhered(d.outcome)).length;
  const missedDays = resolved.filter((d) => d.outcome === "missed").length;
  const contextAdjustedDays = days.filter(
    (d) => d.outcome === "context_adjusted",
  ).length;
  const plannedRestHonored = days.filter(
    (d) => d.outcome === "adhered_rest",
  ).length;
  const extraGymSessions = days.filter(
    (d) => d.outcome === "extra_session",
  ).length;
  const trainedDays = days.filter((d) => d.outcome === "adhered_training").length;

  const publishable = canPublishTrainingConsistency(resolved.length);
  const adherencePct = publishable
    ? Math.round((100 * adheredDays) / resolved.length)
    : null;

  // Blind completion: trained on nearly every scheduled day while ignoring rest quality
  let blindCompletionNote: string | null = null;
  const restDays = days.filter((d) => d.expectation === "rest").length;
  const restBroken = extraGymSessions;
  if (
    publishable &&
    restDays >= 3 &&
    restBroken >= Math.ceil(restDays * 0.5) &&
    missedDays === 0
  ) {
    blindCompletionNote =
      "You completed a lot of unscheduled sessions on planned rest days. That raises gym attendance, not plan adherence — rest was part of the plan.";
  } else if (
    publishable &&
    trainedDays > 0 &&
    plannedRestHonored === 0 &&
    restDays >= 4 &&
    extraGymSessions >= 2
  ) {
    blindCompletionNote =
      "Consistency here is adherence to the plan. Filling rest days in the gym is tracked as extra sessions, not a higher score.";
  }

  const narrativeLines: string[] = [];
  if (!publishable) {
    narrativeLines.push(insufficientPlanHistoryReason(resolved.length));
  } else {
    narrativeLines.push(
      `Plan adherence ${adherencePct}% across ${resolved.length} resolvable plan days (${adheredDays} on-plan, ${missedDays} missed).`,
    );
    if (plannedRestHonored > 0) {
      narrativeLines.push(
        `${plannedRestHonored} planned rest day${plannedRestHonored === 1 ? "" : "s"} honored — rest counts as adherence.`,
      );
    }
    if (contextAdjustedDays > 0) {
      narrativeLines.push(
        `${contextAdjustedDays} day${contextAdjustedDays === 1 ? "" : "s"} adjusted for deload, injury break, or program change.`,
      );
    }
    if (extraGymSessions > 0) {
      narrativeLines.push(
        `${extraGymSessions} extra unscheduled session${extraGymSessions === 1 ? "" : "s"} — not counted toward adherence.`,
      );
    }
    if (missedDays === 0 && extraGymSessions === 0) {
      narrativeLines.push(
        "Follow-through matched the plan without treating gym days as the goal.",
      );
    }
  }
  if (blindCompletionNote) {
    narrativeLines.push(blindCompletionNote);
  }

  return {
    engineVersion: TRAINING_CONSISTENCY_ENGINE_VERSION,
    windowLabel: input.windowLabel,
    adherencePct,
    publishable,
    suppressedReason: publishable
      ? null
      : insufficientPlanHistoryReason(resolved.length),
    resolvedPlanDays: resolved.length,
    adheredDays,
    missedDays,
    contextAdjustedDays,
    plannedRestHonored,
    extraGymSessions,
    blindCompletionNote,
    days,
    activeContexts: input.contexts,
    narrativeLines,
    honesty: TRAINING_CONSISTENCY_HONESTY,
  };
}
