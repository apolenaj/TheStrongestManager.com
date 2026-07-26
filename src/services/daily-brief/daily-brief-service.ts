import { prisma } from "@/lib/db";
import {
  buildDailyCoachingBrief,
  deriveTechniqueFocusFromAssessments,
  type DailyCoachingBrief,
} from "@/domain/daily-brief";
import { getAthleteState } from "@/services/performance-intelligence";
import { getTodayWorkout } from "@/services/workout/workout-service";
import { parseStoredMovementReport } from "@/services/movement/persist-report";

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function looksLikeDeadlift(name: string): boolean {
  return /deadlift/i.test(name);
}

/**
 * Personalized Daily Coaching Brief for the athlete’s local day.
 * Presentational consumers must not recompute priorities in the browser.
 */
export async function getDailyCoachingBrief(
  userId: string,
): Promise<DailyCoachingBrief | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const [today, stateView, recentAnalyses, checkInsLast7Days] =
    await Promise.all([
      getTodayWorkout(userId),
      getAthleteState(userId),
      prisma.techniqueAnalysis.findMany({
        where: {
          athleteProfileId: profile.id,
          deletedAt: null,
          status: "completed",
          OR: [
            { overallScore: { not: null } },
            { movementReportJson: { not: null } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 2,
        select: {
          id: true,
          cameraAngle: true,
          movementReportJson: true,
        },
      }),
      prisma.recoveryEntry.count({
        where: {
          athleteProfileId: profile.id,
          recordedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          readiness: { not: null },
        },
      }),
    ]);

  if (!today) return null;

  const state = stateView?.state ?? null;
  const technique = deriveTechniqueFocusFromAssessments({
    analyses: recentAnalyses.map((row) => {
      const report = parseStoredMovementReport(row.movementReportJson);
      const components =
        report?.techniqueAssessment?.components
          ?.filter((c) => c.score != null)
          .map((c) => ({
            id: c.id,
            label: c.label,
            score: c.score,
          })) ?? [];
      return {
        id: row.id,
        href: `/app/technique/${row.id}`,
        cameraAngle: row.cameraAngle,
        components,
      };
    }),
  });

  const preview = today.prescription?.exercisesPreview ?? [];
  const hasDeadliftToday = preview.some((e) => looksLikeDeadlift(e.name));
  const techniqueCue =
    preview.find((e) => e.techniqueCue)?.techniqueCue ?? null;

  return buildDailyCoachingBrief({
    dateKey: localDateKey(new Date()),
    workout: {
      activeSessionId: today.activeSessionId,
      prescriptionTitle: today.prescription?.title ?? null,
      prescriptionGoal: today.prescription?.goal ?? null,
      programName: today.prescription?.programName ?? null,
      emptyReason: today.emptyReason,
      hasDeadliftToday,
      techniqueCue,
    },
    technique,
    signals: {
      loadSpikeFlagged: state?.fatigueTrend.value?.loadSpikeFlagged === true,
      recoveryStatusLabel: state?.recoveryStatus.value?.statusLabel ?? null,
      latestReadiness: state?.recoveryStatus.value?.latestReadiness ?? null,
      recoveryCheckInsLast7Days: checkInsLast7Days,
      techniqueTrendDirection: state?.techniqueTrend.value?.direction ?? null,
      techniqueSampleCount: state?.techniqueTrend.value?.sampleCount ?? 0,
      goalTitle: state?.goalProgress.value?.goalTitle ?? today.goalTitle,
      goalStatusLabel: state?.goalProgress.value?.statusLabel ?? null,
      goalSummary: state?.goalProgress.summary ?? null,
      dataConfidence: state?.dataConfidence.value?.overall ?? null,
    },
  });
}
