/**
 * Athlete data export (Prompt 43 — portability).
 * Returns structured JSON the athlete owns. Does not include raw video bytes,
 * private storage keys, password hashes, or other users' data.
 */

import { prisma } from "@/lib/db";

export type DataExportResult =
  | { ok: true; filename: string; json: string }
  | { ok: false; error: string };

export async function exportUserData(userId: string): Promise<DataExportResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      isAthlete: true,
      isCoach: true,
      createdAt: true,
      updatedAt: true,
      athleteProfile: {
        select: {
          id: true,
          displayName: true,
          sex: true,
          birthYear: true,
          primaryDiscipline: true,
          timezone: true,
          units: true,
          onboardingCompletedAt: true,
          painCautionAcknowledgedAt: true,
          movementNotes: true,
          createdAt: true,
          updatedAt: true,
          goals: true,
          trainingExperience: true,
          bodyMetrics: {
            select: {
              id: true,
              metricKey: true,
              value: true,
              unit: true,
              source: true,
              recordedAt: true,
              notes: true,
              createdAt: true,
            },
          },
          trainingSessions: {
            select: {
              id: true,
              status: true,
              scheduledAt: true,
              startedAt: true,
              completedAt: true,
              notes: true,
              perceivedEffort: true,
              createdAt: true,
            },
          },
          techniqueAnalyses: {
            where: { deletedAt: null },
            select: {
              id: true,
              status: true,
              exerciseId: true,
              cameraAngle: true,
              loadKg: true,
              reps: true,
              overallScore: true,
              confidenceBasis: true,
              durationSeconds: true,
              widthPx: true,
              heightPx: true,
              mimeType: true,
              fileSizeBytes: true,
              analysisBackendStatus: true,
              createdAt: true,
              updatedAt: true,
              // Omit: storageKey, mediaUrl, movementReportJson, originalFileName
            },
          },
          recoveryEntries: {
            select: {
              id: true,
              recordedAt: true,
              sleepHours: true,
              sleepQuality: true,
              readiness: true,
              soreness: true,
              stress: true,
              motivation: true,
              fatigue: true,
              hrv: true,
              restingHr: true,
              source: true,
              readinessConfidence: true,
              notes: true,
              createdAt: true,
            },
          },
          recommendations: {
            select: {
              id: true,
              category: true,
              title: true,
              body: true,
              status: true,
              priority: true,
              createdAt: true,
            },
          },
        },
      },
      subscription: {
        select: {
          plan: true,
          status: true,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      creditBalance: {
        select: {
          balance: true,
          lastReason: true,
          updatedAt: true,
        },
      },
      academyEnrollments: {
        select: {
          id: true,
          courseSlug: true,
          status: true,
          enrolledAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    formatVersion: 1,
    notice:
      "This export contains account and training data you own. Raw technique videos are not embedded — delete them from Technique or by deleting your account. Password hashes and private storage paths are excluded.",
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAthlete: user.isAthlete,
      isCoach: user.isCoach,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    subscription: user.subscription,
    credits: user.creditBalance,
    academy: user.academyEnrollments,
    athleteProfile: user.athleteProfile,
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    filename: `thestrongestmanager-export-${stamp}.json`,
    json: JSON.stringify(payload, null, 2),
  };
}
