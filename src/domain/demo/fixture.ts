import { scoreLevelFromValue } from "@/design-system/tokens/colors";
import {
  DEMO_ATHLETE_DISPLAY_NAME,
  toDemoHref,
} from "@/domain/demo/constants";
import type { DashboardView } from "@/services/dashboard/types";
import { NOT_ENOUGH_DATA } from "@/services/dashboard/types";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function score(
  key: string,
  label: string,
  href: string,
  value: number,
  source: "observed" | "heuristic" | "reported",
  detail: string,
) {
  return {
    key,
    label,
    href: toDemoHref(href),
    value,
    level: scoreLevelFromValue(value),
    source,
    emptyLabel: NOT_ENOUGH_DATA,
    statusLabel: null,
    detail,
  };
}

/**
 * Deterministic example dashboard for Demo Mode.
 * Labeled as Demo Athlete — not attached to any production user account.
 */
export function buildDemoDashboardFixture(): DashboardView {
  return {
    athleteProfileId: "demo-athlete-profile",
    greetingName: DEMO_ATHLETE_DISPLAY_NAME,
    goalTitle: "Add 10 kg to competition total",
    goals: [
      { title: "Add 10 kg to competition total", category: "performance" },
    ],
    discipline: "powerlifting",
    sportFocuses: [
      {
        id: "powerlifting",
        label: "Powerlifting",
        href: toDemoHref("/app/powerlifting"),
      },
    ],
    isMultiSport: false,
    experienceLevel: "intermediate",
    isNewAthlete: false,
    isDemoPresentation: true,
    firstSession: {
      goalChosen: true,
      profileReady: true,
      techniqueUploaded: true,
      workoutLogged: true,
      completedCount: 4,
      totalCount: 4,
    },
    scores: {
      athlete: score(
        "athlete",
        "Athlete Score",
        "/app/progress",
        78,
        "heuristic",
        "Example composite from seeded demo signals — not a live account.",
      ),
      strength: score(
        "strength",
        "Strength",
        "/app/progress",
        82,
        "reported",
        "From demo reported lifts (squat / bench / deadlift).",
      ),
      technique: score(
        "technique",
        "Technique",
        "/app/technique",
        74,
        "observed",
        "From demo technique analyses on file.",
      ),
      programming: {
        key: "programming",
        label: "Programming",
        href: toDemoHref("/app/programs"),
        value: null,
        level: null,
        source: "insufficient",
        emptyLabel: NOT_ENOUGH_DATA,
        statusLabel: "Meet peaking block (demo)",
        detail: "Active demo program name — not a scored programming metric.",
      },
      recovery: score(
        "recovery",
        "Recovery",
        "/app/recovery",
        71,
        "heuristic",
        "From demo readiness check-ins.",
      ),
      consistency: score(
        "consistency",
        "Consistency",
        "/app/training",
        86,
        "observed",
        "From completed demo sessions in the last 28 days.",
      ),
      mobilityReadiness: score(
        "mobility_readiness",
        "Readiness",
        "/app/recovery",
        78,
        "reported",
        "Latest demo readiness entry.",
      ),
    },
    opportunity: {
      id: "demo-opportunity",
      title: "Tighten squat depth consistency before adding load",
      body: "Demo insight only: recent technique notes flag depth variance on back squat. Address that before another intensity jump — this is not your live athlete data.",
      category: "technique",
      href: toDemoHref("/app/technique"),
    },
    topInsight: {
      id: "demo-cross-domain",
      title: "Recovery dip after high-volume lower day",
      summary:
        "Example cross-domain note: readiness fell after the demo high-volume squat session. Next lower day stays moderate in this example plan.",
      confidence: "medium",
      actionLabel: "Review recovery",
      actionHref: toDemoHref("/app/recovery"),
    },
    recentProgress: [
      {
        id: "demo-prog-1",
        label: "Back squat (reported)",
        valueLabel: "160 kg × 3",
        recordedAt: daysAgo(3),
        source: "reported",
        href: toDemoHref("/app/progress"),
      },
      {
        id: "demo-prog-2",
        label: "Bodyweight",
        valueLabel: "82.4 kg",
        recordedAt: daysAgo(1),
        source: "reported",
        href: toDemoHref("/app/profile"),
      },
    ],
    trainingLoad: {
      completedLast7Days: 3,
      completedLast28Days: 11,
      plannedUpcoming: 2,
      hasEnoughData: true,
      href: toDemoHref("/app/training"),
    },
    recentSessions: [
      {
        id: "demo-session-1",
        title: "Lower — volume squat",
        status: "completed",
        when: daysAgo(2),
        href: toDemoHref("/app/training"),
      },
      {
        id: "demo-session-2",
        title: "Upper — bench focus",
        status: "completed",
        when: daysAgo(4),
        href: toDemoHref("/app/training"),
      },
    ],
    upcomingWorkout: {
      id: "demo-upcoming",
      title: "Lower — technique + speed",
      status: "planned",
      when: daysAgo(-1),
      href: toDemoHref("/app/today"),
    },
    techniqueTrend: [
      {
        id: "demo-tech-1",
        label: "Back squat",
        value: 71,
        recordedAt: daysAgo(14),
      },
      {
        id: "demo-tech-2",
        label: "Back squat",
        value: 74,
        recordedAt: daysAgo(7),
      },
      {
        id: "demo-tech-3",
        label: "Deadlift",
        value: 76,
        recordedAt: daysAgo(3),
      },
    ],
    recoveryTrend: [
      { id: "demo-rec-1", label: "Readiness", value: 68, recordedAt: daysAgo(5) },
      { id: "demo-rec-2", label: "Readiness", value: 72, recordedAt: daysAgo(3) },
      { id: "demo-rec-3", label: "Readiness", value: 78, recordedAt: daysAgo(1) },
    ],
    personalRecords: [
      {
        liftId: "lift_squat",
        label: "Squat",
        display: "180 kg",
        recordedAt: daysAgo(30),
        source: "reported",
        href: toDemoHref("/app/profile"),
      },
      {
        liftId: "lift_bench",
        label: "Bench",
        display: "120 kg",
        recordedAt: daysAgo(30),
        source: "reported",
        href: toDemoHref("/app/profile"),
      },
      {
        liftId: "lift_deadlift",
        label: "Deadlift",
        display: "210 kg",
        recordedAt: daysAgo(30),
        source: "reported",
        href: toDemoHref("/app/profile"),
      },
    ],
    prsBySport: [],
  };
}

/** Rewrite every /app href on a dashboard view onto /demo paths. */
export function mapDashboardViewToDemoPaths(
  view: DashboardView,
): DashboardView {
  const mapScore = (s: DashboardView["scores"]["athlete"]) => ({
    ...s,
    href: toDemoHref(s.href),
  });

  return {
    ...view,
    isDemoPresentation: true,
    greetingName: DEMO_ATHLETE_DISPLAY_NAME,
    scores: {
      athlete: mapScore(view.scores.athlete),
      strength: mapScore(view.scores.strength),
      technique: mapScore(view.scores.technique),
      programming: mapScore(view.scores.programming),
      recovery: mapScore(view.scores.recovery),
      consistency: mapScore(view.scores.consistency),
      mobilityReadiness: view.scores.mobilityReadiness
        ? mapScore(view.scores.mobilityReadiness)
        : null,
    },
    opportunity: view.opportunity
      ? { ...view.opportunity, href: toDemoHref(view.opportunity.href) }
      : null,
    topInsight: view.topInsight
      ? {
          ...view.topInsight,
          actionHref: toDemoHref(view.topInsight.actionHref),
        }
      : null,
    recentProgress: view.recentProgress.map((item) => ({
      ...item,
      href: toDemoHref(item.href),
    })),
    trainingLoad: {
      ...view.trainingLoad,
      href: toDemoHref(view.trainingLoad.href),
    },
    recentSessions: view.recentSessions.map((item) => ({
      ...item,
      href: toDemoHref(item.href),
    })),
    upcomingWorkout: view.upcomingWorkout
      ? {
          ...view.upcomingWorkout,
          href: toDemoHref(view.upcomingWorkout.href),
        }
      : null,
    personalRecords: view.personalRecords.map((item) => ({
      ...item,
      href: toDemoHref(item.href),
    })),
    sportFocuses: view.sportFocuses.map((focus) => ({
      ...focus,
      href: toDemoHref(focus.href),
    })),
    prsBySport: view.prsBySport.map((group) => ({
      ...group,
      href: toDemoHref(group.href),
      prs: group.prs.map((pr) => ({
        ...pr,
        href: toDemoHref(pr.href),
      })),
    })),
  };
}
