import {
  computeAthleteScores,
  displayableScore,
  RECOVERY_MIN_ENTRIES_FOR_MEDIUM,
  type InputSourceKind,
  type ScoreResult,
  type ScoringSnapshot,
} from "@/domain/scoring";
import { prisma } from "@/lib/db";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import {
  formatMass,
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";
import {
  hrefForRecommendationCategory,
  NOT_ENOUGH_DATA,
  resolveScoreLevel,
  type DashboardOpportunity,
  type DashboardPrItem,
  type DashboardProgressItem,
  type DashboardScore,
  type DashboardSessionItem,
  type DashboardSportFocus,
  type DashboardSportPrGroup,
  type DashboardTrendPoint,
  type DashboardView,
  type MetricSource,
} from "@/services/dashboard/types";
import { getCrossDomainInsights } from "@/services/insights/insights-service";
import { featureFlags } from "@/config/feature-flags";
import {
  assemblePersonalizationPlan,
  itemsForSurface,
  type PersonalizationSignals,
} from "@/domain/personalization";
import {
  MULTI_SPORT_FOCUS_LABELS,
  MULTI_SPORT_MODE_HREF,
  assembleMultiSportMode,
  isMultiSportAthlete,
  normalizeSportFocuses,
} from "@/domain/multi-sport-mode";
const LIFT_KEYS = MAJOR_LIFTS.map((lift) => lift.metricKey);

function parsePreferredSports(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

/**
 * When personalization is on, re-rank pending recommendations for the
 * dashboard opportunity card. Pricing is never involved.
 */
function pickDashboardRecommendation(profile: {
  primaryDiscipline: string | null;
  goals: Array<{ title: string; category: string }>;
  trainingExperience: {
    daysPerWeek: number | null;
    sessionLengthMinutes: number | null;
    preferredSports: string | null;
  } | null;
  recommendations: Array<{
    id: string;
    title: string;
    body: string;
    category: string;
    priority: number;
  }>;
  trainingSessions: Array<{ status: string }>;
  techniqueAnalyses: unknown[];
  programs: unknown[];
}): {
  id: string;
  title: string;
  body: string;
  category: string;
} | null {
  const fallback = profile.recommendations[0] ?? null;
  if (!featureFlags.personalizationEngine || profile.recommendations.length === 0) {
    return fallback;
  }

  const completedSessions = profile.trainingSessions.filter(
    (s) => s.status === "completed",
  ).length;
  const skippedSessions = profile.trainingSessions.filter(
    (s) => s.status === "skipped",
  ).length;

  const signals: PersonalizationSignals = {
    now: new Date(),
    lookbackDays: 28,
    goal: {
      title: profile.goals[0]?.title ?? null,
      category: profile.goals[0]?.category ?? null,
    },
    sport: {
      primaryDiscipline: profile.primaryDiscipline,
      preferredSports: parsePreferredSports(
        profile.trainingExperience?.preferredSports,
      ),
    },
    history: {
      completedSessions,
      skippedSessions,
      trainingDays: completedSessions,
      hasActiveProgram: profile.programs.length > 0,
      techniqueUploads: profile.techniqueAnalyses.length,
    },
    behavior: {
      acceptedAdaptations: 0,
      declinedAdaptations: 0,
      feedbackHelpful: 0,
      feedbackNotHelpful: 0,
    },
    preferences: {
      daysPerWeek: profile.trainingExperience?.daysPerWeek ?? null,
      sessionLengthMinutes:
        profile.trainingExperience?.sessionLengthMinutes ?? null,
      intensityBand: null,
      frequencyBand: null,
      volumeToleranceBand: null,
    },
    pendingRecommendations: profile.recommendations.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      category: r.category,
      priority: r.priority,
    })),
  };

  const plan = assemblePersonalizationPlan(signals);
  const top = itemsForSurface(plan, "recommendations")[0];
  if (!top) return fallback;

  const match = profile.recommendations.find(
    (r) => top.id === `rec.${r.id}` || top.title === r.title,
  );
  return match ?? fallback;
}

function normalizeSource(raw: string): MetricSource {
  if (
    raw === "observed" ||
    raw === "heuristic" ||
    raw === "reported" ||
    raw === "recommended"
  ) {
    return raw;
  }
  return "heuristic";
}

function toInputSource(raw: string | null | undefined): InputSourceKind {
  if (
    raw === "observed" ||
    raw === "heuristic" ||
    raw === "reported" ||
    raw === "recommended"
  ) {
    return raw;
  }
  return "reported";
}

function sessionTitle(session: {
  workout: { name: string } | null;
  program: { name: string } | null;
  status: string;
}): string {
  if (session.workout?.name) return session.workout.name;
  if (session.program?.name) return `${session.program.name} session`;
  return `Training session (${session.status})`;
}

function sessionWhen(session: {
  completedAt: Date | null;
  startedAt: Date | null;
  scheduledAt: Date | null;
}): Date | null {
  return session.completedAt ?? session.startedAt ?? session.scheduledAt;
}

function dashboardScoreFromResult(
  result: ScoreResult,
  label: string,
  href: string,
  statusLabel: string | null = null,
): DashboardScore {
  const value = displayableScore(result);
  return {
    key: result.scoreKey,
    label,
    href,
    value,
    level: resolveScoreLevel(value, null),
    source:
      value == null
        ? "insufficient"
        : result.confidence === "high"
          ? "observed"
          : "heuristic",
    emptyLabel: NOT_ENOUGH_DATA,
    statusLabel: value == null ? statusLabel : null,
    detail:
      value != null
        ? `${result.explanation} Confidence: ${result.confidence}.`
        : result.missingInputs[0] ?? result.explanation,
  };
}

/**
 * Build the authenticated performance dashboard from stored athlete data.
 * Scores come from the domain scoring engine; UI only shows displayable confidence.
 */
export async function getPerformanceDashboard(
  userId: string,
): Promise<DashboardView | null> {
  const profilePromise = prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: featureFlags.multiSportAthleteMode ? 8 : 1,
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
          priority: true,
          status: true,
        },
      },
      trainingExperience: {
        select: {
          level: true,
          daysPerWeek: true,
          sessionLengthMinutes: true,
          preferredSports: true,
          availableEquipment: true,
        },
      },
      athleteScores: {
        orderBy: { recordedAt: "desc" },
        take: 24,
      },
      recommendations: {
        where: { status: "pending" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          body: true,
          category: true,
          priority: true,
        },
      },
      trainingSessions: {
        orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
        take: 30,
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
          programId: true,
          workoutNameSnapshot: true,
          workout: { select: { name: true } },
          program: { select: { name: true } },
        },
      },
      techniqueAnalyses: {
        where: { status: "completed", overallScore: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          overallScore: true,
          createdAt: true,
          confidenceBasis: true,
          exercise: { select: { name: true } },
        },
      },
      recoveryEntries: {
        orderBy: { recordedAt: "desc" },
        take: 14,
        select: {
          id: true,
          readiness: true,
          sleepHours: true,
          hrv: true,
          soreness: true,
          recordedAt: true,
          source: true,
        },
      },
      progressMetrics: {
        orderBy: { recordedAt: "desc" },
        take: featureFlags.multiSportAthleteMode ? 80 : 40,
        select: {
          id: true,
          metricKey: true,
          value: true,
          unit: true,
          reps: true,
          recordedAt: true,
          source: true,
        },
      },
      bodyMetrics: {
        where: { metricKey: "bodyweight" },
        orderBy: { recordedAt: "desc" },
        take: 1,
        select: { value: true, unit: true, recordedAt: true },
      },
      programs: {
        where: { status: "active" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { id: true, name: true, status: true },
      },
    },
  });

  const [profile, techniqueUploadCount] = await Promise.all([
    profilePromise,
    prisma.techniqueAnalysis.count({
      where: {
        athleteProfile: { userId },
        deletedAt: null,
        status: { not: "deleted" },
      },
    }),
  ]);

  if (!profile) return null;

  const units = normalizeMassUnit(profile.units);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekAgo = new Date(now.getTime() - 7 * dayMs);
  const monthAgo = new Date(now.getTime() - 28 * dayMs);

  const completedSessions = profile.trainingSessions.filter(
    (s) => s.status === "completed",
  );
  const plannedUpcoming = profile.trainingSessions.filter(
    (s) =>
      (s.status === "planned" || s.status === "in_progress") &&
      (s.scheduledAt == null || s.scheduledAt >= now),
  );

  const completedLast7Days = completedSessions.filter((s) => {
    const when = s.completedAt ?? s.startedAt;
    return when != null && when >= weekAgo;
  }).length;

  const completedLast28Days = completedSessions.filter((s) => {
    const when = s.completedAt ?? s.startedAt;
    return when != null && when >= monthAgo;
  }).length;

  const readinessEntries = profile.recoveryEntries.filter(
    (e) => e.readiness != null,
  );
  const recoveryWithSignals = profile.recoveryEntries.filter(
    (e) =>
      e.readiness != null ||
      e.sleepHours != null ||
      e.hrv != null ||
      e.soreness != null,
  );

  const hasAthleteScores = profile.athleteScores.length > 0;
  const hasTechniqueScores = profile.techniqueAnalyses.length > 0;
  const hasRecoverySignals = recoveryWithSignals.length > 0;
  const hasCompletedSessions = completedSessions.length > 0;

  const isNewAthlete =
    !hasAthleteScores &&
    !hasTechniqueScores &&
    !hasRecoverySignals &&
    !hasCompletedSessions;

  const goalChosen = profile.goals.length > 0;
  let equipmentKeys: string[] = [];
  try {
    const raw = profile.trainingExperience?.availableEquipment;
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        equipmentKeys = parsed.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        );
      }
    }
  } catch {
    equipmentKeys = [];
  }
  const profileReady =
    Boolean(profile.displayName?.trim()) &&
    Boolean(profile.trainingExperience?.level) &&
    (profile.trainingExperience?.daysPerWeek != null ||
      equipmentKeys.length > 0 ||
      profile.bodyMetrics.length > 0 ||
      profile.progressMetrics.length > 0);
  const techniqueUploaded = techniqueUploadCount > 0;
  const workoutLogged = hasCompletedSessions;
  const firstSessionFlags = {
    goalChosen,
    profileReady,
    techniqueUploaded,
    workoutLogged,
  };
  const firstSessionCompleted = [
    firstSessionFlags.profileReady,
    firstSessionFlags.techniqueUploaded,
    firstSessionFlags.workoutLogged,
    firstSessionFlags.goalChosen,
  ].filter(Boolean).length;
  const firstSession = {
    ...firstSessionFlags,
    completedCount: firstSessionCompleted,
    totalCount: 4,
  };

  const activeProgram = profile.programs[0] ?? null;

  const snapshot: ScoringSnapshot = {
    now,
    lifts: profile.progressMetrics
      .filter((m) => (LIFT_KEYS as readonly string[]).includes(m.metricKey))
      .map((m) => ({
        metricKey: m.metricKey,
        valueKg: toCanonicalKg(m.value, m.unit ?? "kg"),
        reps: m.reps,
        recordedAt: m.recordedAt,
        source: toInputSource(m.source),
      })),
    techniqueAnalyses: profile.techniqueAnalyses.map((a) => ({
      overallScore: a.overallScore as number,
      recordedAt: a.createdAt,
      confidenceBasis: toInputSource(a.confidenceBasis),
    })),
    recoveryEntries: readinessEntries.map((e) => ({
      readiness: e.readiness as number,
      recordedAt: e.recordedAt,
      source: toInputSource(e.source),
    })),
    sessions: profile.trainingSessions.map((s) => ({
      status: s.status,
      scheduledAt: s.scheduledAt,
      completedAt: s.completedAt,
      startedAt: s.startedAt,
      programId: s.programId,
    })),
    activeProgramId: activeProgram?.id ?? null,
    activeProgramName: activeProgram?.name ?? null,
    bodyweightKg: profile.bodyMetrics[0]
      ? toCanonicalKg(
          profile.bodyMetrics[0].value,
          profile.bodyMetrics[0].unit,
        )
      : null,
    experienceLevel: profile.trainingExperience?.level ?? null,
    primaryDiscipline: profile.primaryDiscipline,
  };

  const computed = computeAthleteScores(snapshot);

  const strength = dashboardScoreFromResult(
    computed.strength,
    "Strength",
    "/app/progress",
  );
  const technique = dashboardScoreFromResult(
    computed.technique,
    "Technique",
    "/app/technique",
  );
  const recovery = dashboardScoreFromResult(
    computed.recovery,
    "Recovery",
    "/app/recovery",
  );
  const consistency = dashboardScoreFromResult(
    computed.consistency,
    "Consistency",
    "/app/training",
  );
  const programming = dashboardScoreFromResult(
    computed.programming,
    "Programming",
    "/app/programs",
    activeProgram && displayableScore(computed.programming) == null
      ? activeProgram.name
      : null,
  );
  const athlete = dashboardScoreFromResult(
    computed.overall,
    "Athlete Score",
    "/app/progress",
  );

  let mobilityReadiness: DashboardScore | null = null;
  if (readinessEntries.length >= RECOVERY_MIN_ENTRIES_FOR_MEDIUM) {
    const latest = readinessEntries[0];
    mobilityReadiness = {
      key: "mobility_readiness",
      label: "Readiness",
      href: "/app/recovery",
      value: latest.readiness ?? null,
      level: resolveScoreLevel(latest.readiness ?? null, null),
      source: normalizeSource(latest.source),
      emptyLabel: NOT_ENOUGH_DATA,
      statusLabel: null,
      detail: `Latest readiness from ${readinessEntries.length} logged entries (shown only when enough recovery history exists).`,
    };
  }

  const recommendation = pickDashboardRecommendation(profile);

  const opportunity: DashboardOpportunity | null = recommendation
    ? {
        id: recommendation.id,
        title: recommendation.title,
        body: recommendation.body,
        category: recommendation.category,
        href: hrefForRecommendationCategory(recommendation.category),
      }
    : null;

  const liftLabel = (metricKey: string) =>
    MAJOR_LIFTS.find((l) => l.metricKey === metricKey)?.label ?? metricKey;

  const recentProgress: DashboardProgressItem[] = profile.progressMetrics
    .slice(0, 5)
    .map((row) => {
      const isLift = (LIFT_KEYS as readonly string[]).includes(row.metricKey);
      const valueLabel = isLift
        ? formatMass(toCanonicalKg(row.value, row.unit ?? "kg"), units)
        : `${row.value}${row.unit ? ` ${row.unit}` : ""}`;
      return {
        id: row.id,
        label: isLift ? liftLabel(row.metricKey) : row.metricKey,
        valueLabel,
        recordedAt: row.recordedAt,
        source: normalizeSource(row.source),
        href: "/app/progress",
      };
    });

  const recentSessions: DashboardSessionItem[] = completedSessions
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      title: sessionTitle(s),
      status: s.status,
      when: sessionWhen(s),
      href: "/app/training",
    }));

  const nextPlanned =
    plannedUpcoming
      .slice()
      .sort((a, b) => {
        const aTime = a.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bTime = b.scheduledAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      })[0] ?? null;

  const upcomingWorkout: DashboardSessionItem | null = nextPlanned
    ? {
        id: nextPlanned.id,
        title: sessionTitle(nextPlanned),
        status: nextPlanned.status,
        when: nextPlanned.scheduledAt,
        href: "/app/today",
      }
    : null;

  const techniqueTrend: DashboardTrendPoint[] = profile.techniqueAnalyses
    .filter((a) => a.overallScore != null)
    .slice(0, 6)
    .map((a) => ({
      id: a.id,
      label: a.exercise?.name ?? "Technique analysis",
      value: a.overallScore as number,
      recordedAt: a.createdAt,
    }));

  const recoveryTrend: DashboardTrendPoint[] = readinessEntries
    .slice(0, 7)
    .map((e) => ({
      id: e.id,
      label: "Readiness",
      value: e.readiness as number,
      recordedAt: e.recordedAt,
    }));

  const personalRecords: DashboardPrItem[] = MAJOR_LIFTS.flatMap((lift) => {
    const rows = profile.progressMetrics.filter(
      (m) => m.metricKey === lift.metricKey,
    );
    if (rows.length === 0) return [];
    const best = rows.reduce((max, row) => {
      const kg = toCanonicalKg(row.value, row.unit ?? "kg");
      const maxKg = toCanonicalKg(max.value, max.unit ?? "kg");
      return kg > maxKg ? row : max;
    });
    return [
      {
        liftId: lift.id,
        label: lift.label,
        display: formatMass(
          toCanonicalKg(best.value, best.unit ?? "kg"),
          units,
        ),
        recordedAt: best.recordedAt,
        source: normalizeSource(best.source),
        href: "/app/profile",
        sportId: "powerlifting",
        sportLabel: MULTI_SPORT_FOCUS_LABELS.powerlifting,
      },
    ];
  });

  const preferredSports = parsePreferredSports(
    profile.trainingExperience?.preferredSports,
  );
  const sportFocusIds = featureFlags.multiSportAthleteMode
    ? normalizeSportFocuses({
        preferredSports,
        primaryDiscipline: profile.primaryDiscipline,
      })
    : [];
  const isMultiSport =
    featureFlags.multiSportAthleteMode && isMultiSportAthlete(sportFocusIds);

  const sportFocuses: DashboardSportFocus[] = sportFocusIds.map((id) => ({
    id,
    label: MULTI_SPORT_FOCUS_LABELS[id],
    href: MULTI_SPORT_MODE_HREF[id],
  }));

  let prsBySport: DashboardSportPrGroup[] = [];
  if (featureFlags.multiSportAthleteMode && sportFocusIds.length > 0) {
    const multi = assembleMultiSportMode({
      preferredSports,
      primaryDiscipline: profile.primaryDiscipline,
      goals: profile.goals.map((g) => ({
        title: g.title,
        category: g.category,
        priority: g.priority,
      })),
      loggedPrs: profile.progressMetrics.map((m) => ({
        metricKey: m.metricKey,
        value: m.value,
        unit: m.unit,
        recordedAt: m.recordedAt,
      })),
    });
    prsBySport = multi.prGroups.map((group) => ({
      sportId: group.sportId,
      sportLabel: group.sportLabel,
      href: group.href,
      emptyNote: group.emptyNote,
      prs: group.prs.map((pr) => ({
        liftId: pr.metricKey,
        label: pr.label,
        display:
          pr.unit === "kg" || pr.unit === "lb"
            ? formatMass(toCanonicalKg(pr.value, pr.unit), units)
            : `${pr.value} ${pr.unit}`,
        recordedAt: pr.recordedAtIso
          ? new Date(pr.recordedAtIso)
          : new Date(0),
        source: "reported" as const,
        href: group.href,
        sportId: group.sportId,
        sportLabel: group.sportLabel,
      })),
    }));
  }

  const greetingName = profile.displayName?.trim() || "Athlete";

  let topInsight: DashboardView["topInsight"] = null;
  if (featureFlags.appInsights) {
    const insightsView = await getCrossDomainInsights(userId);
    const tip = insightsView?.topInsight;
    if (tip && tip.id !== "insufficient_cross_domain_data") {
      topInsight = {
        id: tip.id,
        title: tip.title,
        summary: tip.summary,
        confidence: tip.confidence,
        actionLabel: tip.action.label,
        actionHref: tip.action.href,
      };
    }
  }

  return {
    athleteProfileId: profile.id,
    greetingName,
    goalTitle: profile.goals[0]?.title ?? null,
    goals: profile.goals.map((g) => ({
      title: g.title,
      category: g.category,
    })),
    discipline: profile.primaryDiscipline,
    sportFocuses,
    isMultiSport,
    experienceLevel: profile.trainingExperience?.level ?? null,
    isNewAthlete,
    firstSession,
    scores: {
      athlete,
      strength,
      technique,
      programming,
      recovery,
      consistency,
      mobilityReadiness,
    },
    opportunity,
    topInsight,
    recentProgress,
    trainingLoad: {
      completedLast7Days,
      completedLast28Days,
      plannedUpcoming: plannedUpcoming.length,
      hasEnoughData: hasCompletedSessions,
      href: "/app/training",
    },
    recentSessions,
    upcomingWorkout,
    techniqueTrend,
    recoveryTrend,
    personalRecords,
    prsBySport,
  };
}
