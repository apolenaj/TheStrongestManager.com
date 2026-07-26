import type { AthleteState } from "@/domain/performance-intelligence";
import type {
  CoachBrainRuleHit,
  CoachBrainToolBag,
  CoachSupportingDatum,
} from "@/domain/coach-brain/types";
import type { ConfidenceLevel } from "@/domain/scoring/types";
import {
  applyPillarFreshnessToConfidence,
  buildFreshnessSnapshot,
  freshnessMissingInformation,
  freshnessSupportingLines,
  type FreshnessSnapshot,
} from "@/domain/data-freshness";

function conf(
  a: ConfidenceLevel,
  b: ConfidenceLevel,
): ConfidenceLevel {
  const rank = { none: 0, low: 1, medium: 2, high: 3 };
  return rank[a] <= rank[b] ? a : b;
}

function freshnessFromState(state: AthleteState): FreshnessSnapshot {
  const value = state.dataFreshness.value;
  if (value?.pillars) {
    const now = state.computedAt;
    return buildFreshnessSnapshot(
      [
        ...(value.pillars.technique.lastAt
          ? [
              {
                kind: "technique_analysis",
                at: value.pillars.technique.lastAt,
              },
            ]
          : []),
        ...(value.pillars.recovery.lastAt
          ? [{ kind: "recovery_checkin", at: value.pillars.recovery.lastAt }]
          : []),
        ...(value.pillars.strength.lastAt
          ? [{ kind: "lift_log", at: value.pillars.strength.lastAt }]
          : []),
        ...(value.newestSignalAt
          ? [
              {
                kind: value.newestSignalKind ?? "training_session",
                at: value.newestSignalAt,
              },
            ]
          : []),
      ],
      now,
    );
  }
  return buildFreshnessSnapshot([], state.computedAt);
}

/**
 * AI must account for stale data — attach pillar lines and cap confidence.
 */
function accountForStaleData(
  hit: CoachBrainRuleHit,
  snapshot: FreshnessSnapshot,
): CoachBrainRuleHit {
  const supportLines = freshnessSupportingLines(snapshot);
  const existingValues = new Set(hit.supportingData.map((s) => s.value));
  const supportingData: CoachSupportingDatum[] = [
    ...hit.supportingData,
    ...supportLines
      .filter((line) => !existingValues.has(line))
      .map((line) => ({
        tool: "performance_intelligence" as const,
        key: "freshnessPillar",
        value: line,
      })),
  ];
  const missingFresh = freshnessMissingInformation(snapshot);
  const missingInformation = [
    ...hit.missingInformation,
    ...missingFresh.filter((m) => !hit.missingInformation.includes(m)),
  ];
  return {
    ...hit,
    supportingData,
    missingInformation,
    confidence: applyPillarFreshnessToConfidence(
      hit.confidence,
      snapshot,
      hit.category,
    ),
  };
}

/**
 * Deterministic rules layer — maps structured AthleteState + tools into draft hits.
 * Runs before the reasoning adapter; never mutates programs.
 */
export function evaluateCoachBrainRules(
  tools: CoachBrainToolBag,
): CoachBrainRuleHit[] {
  const hits: CoachBrainRuleHit[] = [];
  const state = tools.getAthleteState.data;

  if (!state) {
    hits.push({
      ruleId: "insufficient_athlete_state",
      priority: 100,
      category: "assessment",
      draftRecommendation:
        "Log a workout or recovery check-in so the coach brain has real signals to reason from.",
      draftReasoning:
        "AthleteState could not be assembled — recommendations stay deferred rather than invented.",
      supportingData: [
        {
          tool: "getAthleteState",
          key: "available",
          value: "false",
        },
      ],
      confidence: "none",
      risks: ["Acting without data invents coaching advice."],
      missingInformation: [
        ...(tools.getAthleteState.missing.length
          ? tools.getAthleteState.missing
          : ["Athlete profile signals"]),
      ],
      recommendedAction: {
        kind: "log",
        label: "Open Today",
        href: "/app/today",
        requiresExplicitConfirmation: false,
      },
    });
    return hits;
  }

  pushFromState(hits, state, tools);
  const snapshot = freshnessFromState(state);
  return hits
    .map((hit) => accountForStaleData(hit, snapshot))
    .sort((a, b) => b.priority - a.priority);
}

function pushFromState(
  hits: CoachBrainRuleHit[],
  state: AthleteState,
  tools: CoachBrainToolBag,
) {
  const support = (items: CoachSupportingDatum[]) => items;

  if (state.fatigueTrend.value?.loadSpikeFlagged) {
    hits.push({
      ruleId: "load_spike_review_recovery",
      priority: 90,
      category: "recovery",
      draftRecommendation:
        "Review recovery and upcoming intensity — estimated training volume spiked vs baseline.",
      draftReasoning:
        "FatigueTrend flagged a conservative volume spike. This is a load-pressure heuristic, not an injury prediction.",
      supportingData: support([
        {
          tool: "performance_intelligence",
          key: "fatigueTrend.loadSpikeFlagged",
          value: "true",
        },
        {
          tool: "getRecoveryTrend",
          key: "summary",
          value: tools.getRecoveryTrend.data?.summary ?? "unavailable",
        },
      ]),
      confidence: conf(state.fatigueTrend.confidence, "medium"),
      risks: [
        "Spike flags can false-alarm on thin baselines — confirm recent logs before cutting volume.",
      ],
      missingInformation: state.fatigueTrend.missingDependencies,
      recommendedAction: {
        kind: "review",
        label: "Review recovery",
        href: "/app/recovery",
        requiresExplicitConfirmation: false,
      },
    });
  }

  if (
    state.recoveryStatus.value?.statusLabel === "low" ||
    (state.recoveryStatus.value?.latestReadiness != null &&
      state.recoveryStatus.value.latestReadiness < 55)
  ) {
    hits.push({
      ruleId: "low_readiness_ease_load",
      priority: 85,
      category: "programming",
      draftRecommendation:
        "Consider easing load or volume on the next hard session until readiness recovers.",
      draftReasoning:
        "Recovery status is low from athlete-reported readiness. Any program change still requires your explicit confirmation.",
      supportingData: support([
        {
          tool: "getRecoveryTrend",
          key: "statusLabel",
          value: state.recoveryStatus.value?.statusLabel ?? "insufficient",
        },
        {
          tool: "getRecoveryTrend",
          key: "latestReadiness",
          value: String(state.recoveryStatus.value?.latestReadiness ?? "n/a"),
        },
      ]),
      confidence: conf(state.recoveryStatus.confidence, "low"),
      risks: [
        "Readiness is self-reported — not clinical accuracy.",
        "Program edits must go through Accept/Modify/Decline — never written without your confirmation.",
      ],
      missingInformation: state.recoveryStatus.missingDependencies,
      recommendedAction: {
        kind: "confirm_adaptation",
        label: "Review adaptive suggestions",
        href: "/app/adaptations",
        requiresExplicitConfirmation: true,
      },
    });
  }

  if (state.techniqueTrend.value?.direction === "down") {
    hits.push({
      ruleId: "technique_trend_down",
      priority: 75,
      category: "technique",
      draftRecommendation:
        "Prioritize technique quality on your next main lift before chasing load.",
      draftReasoning:
        "TechniqueTrend direction is down across recent analyses. Supporting scores stay labeled by source.",
      supportingData: support([
        {
          tool: "getTechniqueTrend",
          key: "direction",
          value: state.techniqueTrend.value.direction,
        },
        {
          tool: "getTechniqueTrend",
          key: "latestScore",
          value: String(state.techniqueTrend.value.latestScore ?? "n/a"),
        },
      ]),
      confidence: conf(state.techniqueTrend.confidence, "medium"),
      risks: ["Camera/pose quality can move scores without a true technique change."],
      missingInformation: state.techniqueTrend.missingDependencies,
      recommendedAction: {
        kind: "review",
        label: "Open technique",
        href: "/app/technique",
        requiresExplicitConfirmation: false,
      },
    });
  }

  if (state.performanceTrend.value?.direction === "down") {
    hits.push({
      ruleId: "performance_trend_down",
      priority: 70,
      category: "training",
      draftRecommendation:
        "Strength trend is down — review recent volume, recovery, and technique before adding intensity.",
      draftReasoning:
        "PerformanceTrend uses strength windows from logged lifts. Declining direction is a coaching flag, not a verified strength regression.",
      supportingData: support([
        {
          tool: "performance_intelligence",
          key: "performanceTrend.direction",
          value: state.performanceTrend.value.direction,
        },
        {
          tool: "getGoalProgress",
          key: "statusLabel",
          value: tools.getGoalProgress.data?.statusLabel ?? "unknown",
        },
      ]),
      confidence: conf(state.performanceTrend.confidence, "low"),
      risks: ["Estimated 1RMs can move trends without verified PRs."],
      missingInformation: state.performanceTrend.missingDependencies,
      recommendedAction: {
        kind: "review",
        label: "Open progress",
        href: "/app/progress",
        requiresExplicitConfirmation: false,
      },
    });
  }

  if (
    state.trainingConsistency.value == null ||
    state.trainingConsistency.source === "insufficient"
  ) {
    hits.push({
      ruleId: "build_consistency",
      priority: 55,
      category: "training",
      draftRecommendation:
        "Log completed sessions this week — consistency needs resolved workouts before coaching can adapt.",
      draftReasoning:
        "TrainingConsistency is insufficient. The coach brain will not invent adherence.",
      supportingData: support([
        {
          tool: "getRecentTraining",
          key: "completedLast7Days",
          value: String(
            tools.getRecentTraining.data?.completedLast7Days ?? 0,
          ),
        },
      ]),
      confidence: "low",
      risks: [],
      missingInformation: state.trainingConsistency.missingDependencies,
      recommendedAction: {
        kind: "log",
        label: "Log a workout",
        href: "/app/today",
        requiresExplicitConfirmation: false,
      },
    });
  }

  if (
    state.nutritionAvailability.value &&
    !state.nutritionAvailability.value.connected &&
    state.bodyweightTrend.value?.direction === "down" &&
    state.performanceTrend.value?.direction === "down"
  ) {
    hits.push({
      ruleId: "nutrition_context_missing",
      priority: 50,
      category: "nutrition",
      draftRecommendation:
        "Bodyweight and performance are both trending down — connect nutrition when sync is live, or review intake offline. Macros are not invented here.",
      draftReasoning:
        "Cross-signal pattern without nutrition targets. The brain will not prescribe calories.",
      supportingData: support([
        {
          tool: "getNutritionSummary",
          key: "connected",
          value: "false",
        },
        {
          tool: "getAthleteProfile",
          key: "discipline",
          value: tools.getAthleteProfile.data?.discipline ?? "n/a",
        },
      ]),
      confidence: "low",
      risks: ["Without synced nutrition, intake advice would be invented."],
      missingInformation: [
        "Mealnexio connection / nutrition targets when API is live",
        ...state.bodyweightTrend.missingDependencies,
      ],
      recommendedAction: {
        kind: "connect",
        label: "Open nutrition",
        href: "/app/nutrition",
        requiresExplicitConfirmation: false,
      },
    });
  }

  if (
    state.goalProgress.value?.statusLabel === "no_goal" ||
    state.goalProgress.value == null
  ) {
    hits.push({
      ruleId: "set_goal",
      priority: 40,
      category: "assessment",
      draftRecommendation: "Choose a primary goal so recommendations have a clear target.",
      draftReasoning:
        "GoalProgress has no active goal. Coaching stays generic until a goal is on file.",
      supportingData: support([
        {
          tool: "getGoalProgress",
          key: "statusLabel",
          value: "no_goal",
        },
      ]),
      confidence: "none",
      risks: [],
      missingInformation: ["Active goal on athlete profile"],
      recommendedAction: {
        kind: "review",
        label: "Open profile",
        href: "/app/profile",
        requiresExplicitConfirmation: false,
      },
    });
  }

  if (hits.length === 0) {
    hits.push({
      ruleId: "maintain_course",
      priority: 10,
      category: "training",
      draftRecommendation:
        "Signals look stable enough to continue the current plan — keep logging sessions and recovery.",
      draftReasoning:
        "No high-priority rule fired. The coach brain prefers an honest “maintain” note over inventing a change.",
      supportingData: support([
        {
          tool: "performance_intelligence",
          key: "dataConfidence",
          value: state.dataConfidence.value?.overall ?? "none",
        },
        {
          tool: "performance_intelligence",
          key: "dataFreshness",
          value: state.dataFreshness.value?.freshnessLabel ?? "unknown",
        },
      ]),
      confidence: conf(state.dataConfidence.confidence, "low"),
      risks: [],
      missingInformation: state.dataConfidence.missingDependencies,
      recommendedAction: {
        kind: "log",
        label: "Continue Today",
        href: "/app/today",
        requiresExplicitConfirmation: false,
      },
    });
  }
}
