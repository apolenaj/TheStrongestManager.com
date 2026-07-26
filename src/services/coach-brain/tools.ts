import { prisma } from "@/lib/db";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import { getAthleteState } from "@/services/performance-intelligence";
import {
  formatMass,
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";
import type {
  AthleteProfileToolData,
  CoachBrainToolBag,
  CoachBrainToolResult,
  GoalProgressToolData,
  NutritionSummaryToolData,
  ProgramContextToolData,
  RecentPRsToolData,
  RecentTrainingToolData,
  RecoveryTrendToolData,
  TechniqueTrendToolData,
} from "@/domain/coach-brain/types";
import type { AthleteState } from "@/domain/performance-intelligence";
import type { CoachBrainToolName } from "@/domain/coach-brain/constants";

const LIFT_KEYS = MAJOR_LIFTS.map((l) => l.metricKey);
const LIFT_LABEL: Record<string, string> = Object.fromEntries(
  MAJOR_LIFTS.map((l) => [l.metricKey, l.label]),
);

function toolResult<T>(
  tool: CoachBrainToolName,
  data: T | null,
  missing: string[],
): CoachBrainToolResult<T> {
  return {
    tool,
    ok: data != null,
    data,
    missing,
    fetchedAt: new Date(),
  };
}

/**
 * Internal tool runners — structured athlete reads for the Coach Brain.
 * Not a chatbot tool-call API for end users; orchestration-only.
 */
export async function gatherCoachBrainTools(
  userId: string,
): Promise<{ athleteProfileId: string; tools: CoachBrainToolBag } | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      trainingExperience: true,
      trainingSessions: {
        orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
        take: 12,
        include: {
          workout: { select: { name: true } },
          program: { select: { name: true } },
        },
      },
      progressMetrics: {
        where: { metricKey: { in: [...LIFT_KEYS] } },
        orderBy: { recordedAt: "desc" },
        take: 40,
      },
      programs: {
        where: { status: "active" },
        take: 1,
        select: { name: true },
      },
    },
  });

  if (!profile) return null;

  const stateView = await getAthleteState(userId);
  const state = stateView?.state ?? null;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const completed = profile.trainingSessions.filter(
    (s) => s.status === "completed",
  );
  const completedLast7Days = completed.filter((s) => {
    const when = s.completedAt ?? s.startedAt;
    return when != null && when.getTime() >= now - 7 * day;
  }).length;
  const completedLast28Days = completed.filter((s) => {
    const when = s.completedAt ?? s.startedAt;
    return when != null && when.getTime() >= now - 28 * day;
  }).length;

  const units = normalizeMassUnit(profile.units);
  const bestByLift = new Map<
    string,
    { value: number; unit: string | null; source: string }
  >();
  for (const row of profile.progressMetrics) {
    const kg = toCanonicalKg(row.value, row.unit ?? "kg");
    const prev = bestByLift.get(row.metricKey);
    if (!prev || kg > toCanonicalKg(prev.value, prev.unit ?? "kg")) {
      bestByLift.set(row.metricKey, {
        value: row.value,
        unit: row.unit,
        source: row.source,
      });
    }
  }

  const getAthleteProfile = toolResult<AthleteProfileToolData>(
    "getAthleteProfile",
    {
      displayName: profile.displayName,
      discipline: profile.primaryDiscipline,
      experienceLevel: profile.trainingExperience?.level ?? null,
      units: profile.units,
    },
    profile.displayName ? [] : ["Display name"],
  );

  const getRecentTraining = toolResult<RecentTrainingToolData>(
    "getRecentTraining",
    {
      completedLast7Days,
      completedLast28Days,
      recentSessions: profile.trainingSessions.slice(0, 5).map((s) => ({
        id: s.id,
        title:
          s.workout?.name ??
          s.workoutNameSnapshot ??
          s.program?.name ??
          `Session (${s.status})`,
        status: s.status,
        when:
          (s.completedAt ?? s.startedAt ?? s.scheduledAt)?.toISOString() ??
          null,
        href: `/app/training/${s.id}`,
      })),
    },
    completedLast7Days === 0 ? ["Completed sessions in last 7 days"] : [],
  );

  const latestTechnique = await prisma.techniqueAnalysis.findFirst({
    where: {
      athleteProfileId: profile.id,
      status: "completed",
      overallScore: { not: null },
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const tech = state?.techniqueTrend;
  const getTechniqueTrend = toolResult<TechniqueTrendToolData>(
    "getTechniqueTrend",
    tech?.value
      ? {
          direction: tech.value.direction,
          latestScore: tech.value.latestScore,
          sampleCount: tech.value.sampleCount,
          summary: tech.summary,
          latestAnalysisId: latestTechnique?.id ?? null,
          latestAnalysisHref: latestTechnique
            ? `/app/technique/${latestTechnique.id}`
            : "/app/technique",
        }
      : latestTechnique
        ? {
            direction: "unknown",
            latestScore: null,
            sampleCount: 0,
            summary: "Technique uploads exist but trend is not displayable yet.",
            latestAnalysisId: latestTechnique.id,
            latestAnalysisHref: `/app/technique/${latestTechnique.id}`,
          }
        : null,
    tech?.missingDependencies ?? ["Technique analyses"],
  );

  const recoverySince7 = new Date(now - 7 * day);
  const checkInsLast7Days = await prisma.recoveryEntry.count({
    where: {
      athleteProfileId: profile.id,
      recordedAt: { gte: recoverySince7 },
      readiness: { not: null },
    },
  });

  const recovery = state?.recoveryStatus;
  const getRecoveryTrend = toolResult<RecoveryTrendToolData>(
    "getRecoveryTrend",
    {
      statusLabel: recovery?.value?.statusLabel ?? "insufficient",
      latestReadiness: recovery?.value?.latestReadiness ?? null,
      score: recovery?.value?.score ?? null,
      summary:
        recovery?.summary ??
        "Recovery signals are insufficient for a strong reading.",
      checkInsLast7Days,
    },
    recovery?.missingDependencies ?? ["Recovery readiness check-ins"],
  );

  const program = state?.programProgress;
  const getProgramContext = toolResult<ProgramContextToolData>(
    "getProgramContext",
    {
      hasActiveProgram: Boolean(
        program?.value?.hasActiveProgram ?? profile.programs[0],
      ),
      activeProgramName:
        program?.value?.activeProgramName ?? profile.programs[0]?.name ?? null,
      adherenceScore: program?.value?.score ?? null,
      summary: program?.summary ?? "No program context.",
    },
    program?.value?.hasActiveProgram
      ? program.missingDependencies
      : ["Active program assigned"],
  );

  const goal = state?.goalProgress;
  const getGoalProgress = toolResult<GoalProgressToolData>(
    "getGoalProgress",
    goal?.value
      ? {
          goalTitle: goal.value.goalTitle,
          statusLabel: goal.value.statusLabel,
          summary: goal.summary,
        }
      : {
          goalTitle: null,
          statusLabel: "no_goal",
          summary: "No active goal.",
        },
    goal?.missingDependencies ?? [],
  );

  const getRecentPRs = toolResult<RecentPRsToolData>(
    "getRecentPRs",
    {
      lifts: [...bestByLift.entries()].map(([key, row]) => ({
        label: LIFT_LABEL[key] ?? key,
        display: formatMass(
          toCanonicalKg(row.value, row.unit ?? "kg"),
          units,
        ),
        source: row.source,
        metricKey: key,
        valueKg: toCanonicalKg(row.value, row.unit ?? "kg"),
      })),
    },
    bestByLift.size === 0 ? ["Reported or observed lift logs"] : [],
  );

  const nutrition = state?.nutritionAvailability;
  const getNutritionSummary = toolResult<NutritionSummaryToolData>(
    "getNutritionSummary",
    nutrition?.value
      ? {
          connected: nutrition.value.connected,
          hasTargets: nutrition.value.hasTargets,
          label: nutrition.value.label,
        }
      : {
          connected: false,
          hasTargets: false,
          label: "Nutrition unavailable.",
        },
    nutrition?.missingDependencies ?? ["Nutrition connection"],
  );

  const getAthleteStateTool = toolResult<AthleteState>(
    "getAthleteState",
    state,
    state ? [] : ["AthleteState from Performance Intelligence"],
  );

  return {
    athleteProfileId: profile.id,
    tools: {
      getAthleteProfile,
      getRecentTraining,
      getTechniqueTrend,
      getRecoveryTrend,
      getProgramContext,
      getGoalProgress,
      getRecentPRs,
      getNutritionSummary,
      getAthleteState: getAthleteStateTool,
    },
  };
}
