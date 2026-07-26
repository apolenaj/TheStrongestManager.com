import type { DashboardView } from "@/services/dashboard/types";
import { NOT_ENOUGH_DATA } from "@/services/dashboard/types";
import type { CommandCenterSectionId } from "@/domain/command-center/constants";
import type { CommandCenterWidgetSnippet } from "@/domain/command-center/types";

/**
 * Map existing dashboard data into command-center snippets.
 * Never invents scores — uses DashboardView honesty.
 */
export function buildWidgetSnippets(
  data: DashboardView,
): Record<CommandCenterSectionId, CommandCenterWidgetSnippet> {
  const upcoming = data.upcomingWorkout;
  const todayEmpty = !upcoming && data.recentSessions.length === 0;

  const athlete = data.scores.athlete;
  const technique = data.scores.technique;
  const recovery = data.scores.recovery;

  return {
    today: {
      sectionId: "today",
      headline: upcoming
        ? upcoming.title
        : data.isNewAthlete
          ? "Finish your first-session checklist"
          : "No upcoming workout scheduled",
      detail: upcoming
        ? `Status: ${upcoming.status}`
        : data.opportunity
          ? data.opportunity.title
          : data.topInsight?.title ?? null,
      empty: todayEmpty && !data.opportunity && !data.topInsight,
      ctaLabel: "Open Today",
    },
    performance: {
      sectionId: "performance",
      headline:
        athlete.value != null
          ? `Athlete score ${athlete.value}`
          : (athlete.statusLabel ?? athlete.emptyLabel),
      detail: athlete.detail,
      empty: athlete.value == null && !athlete.statusLabel,
      ctaLabel: "Open progress",
    },
    training: {
      sectionId: "training",
      headline: data.trainingLoad.hasEnoughData
        ? `${data.trainingLoad.completedLast7Days} sessions in 7 days`
        : NOT_ENOUGH_DATA,
      detail: data.trainingLoad.hasEnoughData
        ? `${data.trainingLoad.completedLast28Days} in 28 days · ${data.trainingLoad.plannedUpcoming} planned`
        : "Log completed sessions to unlock load context.",
      empty: !data.trainingLoad.hasEnoughData,
      ctaLabel: "Open programs",
    },
    technique: {
      sectionId: "technique",
      headline:
        technique.value != null
          ? `Technique ${technique.value}`
          : (technique.statusLabel ?? technique.emptyLabel),
      detail:
        data.techniqueTrend.length > 0
          ? `${data.techniqueTrend.length} recent trend points`
          : technique.detail,
      empty: technique.value == null && data.techniqueTrend.length === 0,
      ctaLabel: "Open technique",
    },
    recovery: {
      sectionId: "recovery",
      headline:
        recovery.value != null
          ? `Readiness ${recovery.value}`
          : (recovery.statusLabel ?? recovery.emptyLabel),
      detail: recovery.detail,
      empty: recovery.value == null && data.recoveryTrend.length === 0,
      ctaLabel: "Open recovery",
    },
    nutrition: {
      sectionId: "nutrition",
      headline: "Nutrition status",
      detail:
        "Mealnexio sync stays off until a real API ships — open Nutrition for honest status.",
      empty: true,
      ctaLabel: "Open nutrition",
    },
    goal_trajectory: {
      sectionId: "goal_trajectory",
      headline: data.goalTitle
        ? `Focus: ${data.goalTitle}`
        : "No active goal title yet",
      detail: data.goalTitle
        ? "Open goal progress for trajectory — qualitative when data is thin."
        : "Set a goal on your profile before trajectory estimates apply.",
      empty: !data.goalTitle,
      ctaLabel: "Goal progress",
    },
    ai_coach: {
      sectionId: "ai_coach",
      headline: data.opportunity
        ? data.opportunity.title
        : data.topInsight
          ? data.topInsight.title
          : "Ask the AI Coach",
      detail: data.opportunity
        ? data.opportunity.body
        : data.topInsight
          ? data.topInsight.summary
          : "Recommendations use your logged data — nothing auto-applies to programs.",
      empty: !data.opportunity && !data.topInsight,
      ctaLabel: "Open AI Coach",
    },
  };
}
