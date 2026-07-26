import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/db";
import {
  DEMO_ATHLETE_DISPLAY_NAME,
  DEMO_ATHLETE_EMAIL,
} from "@/domain/demo/constants";

export type SeedDemoAthleteResult = {
  userId: string;
  athleteProfileId: string;
  email: string;
  created: boolean;
};

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Upserts the isolated Demo Mode athlete.
 * Only sets isDemoAccount on this reserved identity — never on production signups.
 */
export async function seedDemoAthlete(input?: {
  password?: string;
}): Promise<SeedDemoAthleteResult> {
  const password =
    input?.password ??
    process.env.DEMO_ATHLETE_PASSWORD ??
    "demo-only-not-for-production";
  const passwordHash = await hashPassword(password);
  const now = new Date();

  const existing = await prisma.user.findUnique({
    where: { email: DEMO_ATHLETE_EMAIL },
    include: { athleteProfile: true },
  });

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: DEMO_ATHLETE_DISPLAY_NAME,
          passwordHash,
          isDemoAccount: true,
          isAthlete: true,
          isCoach: false,
          isAdmin: false,
        },
      })
    : await prisma.user.create({
        data: {
          email: DEMO_ATHLETE_EMAIL,
          name: DEMO_ATHLETE_DISPLAY_NAME,
          passwordHash,
          isDemoAccount: true,
          isAthlete: true,
          isCoach: false,
          isAdmin: false,
        },
      });

  const profile =
    existing?.athleteProfile ??
    (await prisma.athleteProfile.create({
      data: {
        userId: user.id,
        displayName: DEMO_ATHLETE_DISPLAY_NAME,
        primaryDiscipline: "powerlifting",
        units: "kg",
        onboardingCompletedAt: now,
        painCautionAcknowledgedAt: now,
      },
    }));

  if (existing?.athleteProfile) {
    await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        displayName: DEMO_ATHLETE_DISPLAY_NAME,
        primaryDiscipline: "powerlifting",
        units: "kg",
        onboardingCompletedAt: profile.onboardingCompletedAt ?? now,
        painCautionAcknowledgedAt: profile.painCautionAcknowledgedAt ?? now,
      },
    });
  }

  // Clear prior demo graph so re-seed stays deterministic (isolated account only).
  await prisma.$transaction([
    prisma.recommendation.deleteMany({ where: { athleteProfileId: profile.id } }),
    prisma.athleteScore.deleteMany({ where: { athleteProfileId: profile.id } }),
    prisma.techniqueAnalysis.deleteMany({
      where: { athleteProfileId: profile.id },
    }),
    prisma.recoveryEntry.deleteMany({ where: { athleteProfileId: profile.id } }),
    prisma.programAdaptation.deleteMany({
      where: { athleteProfileId: profile.id },
    }),
    prisma.trainingSession.deleteMany({
      where: { athleteProfileId: profile.id },
    }),
    prisma.progressMetric.deleteMany({ where: { athleteProfileId: profile.id } }),
    prisma.bodyMetric.deleteMany({ where: { athleteProfileId: profile.id } }),
    prisma.goal.deleteMany({ where: { athleteProfileId: profile.id } }),
    prisma.trainingExperience.deleteMany({
      where: { athleteProfileId: profile.id },
    }),
    prisma.workout.deleteMany({ where: { athleteProfileId: profile.id } }),
    prisma.program.deleteMany({ where: { athleteProfileId: profile.id } }),
  ]);

  await prisma.goal.create({
    data: {
      athleteProfileId: profile.id,
      category: "performance",
      title: "Add 10 kg to competition total",
      status: "active",
      priority: 1,
    },
  });

  await prisma.trainingExperience.create({
    data: {
      athleteProfileId: profile.id,
      level: "intermediate",
      yearsTraining: 4,
      daysPerWeek: 4,
      sessionLengthMinutes: 90,
      coachingStatus: "self",
      preferredSports: JSON.stringify(["powerlifting"]),
      availableEquipment: JSON.stringify(["barbell", "rack", "bench"]),
      recentHistory: "Demo seed — example peaking block.",
      recoveryHabits: "Demo seed — sleep + walk days.",
    },
  });

  await prisma.bodyMetric.create({
    data: {
      athleteProfileId: profile.id,
      metricKey: "bodyweight",
      value: 82.4,
      unit: "kg",
      source: "reported",
      recordedAt: daysAgo(1),
      notes: "Demo seed bodyweight.",
    },
  });

  await prisma.progressMetric.createMany({
    data: [
      {
        athleteProfileId: profile.id,
        metricKey: "lift_squat",
        value: 180,
        unit: "kg",
        source: "reported",
        recordedAt: daysAgo(30),
        notes: "Demo seed reported squat.",
      },
      {
        athleteProfileId: profile.id,
        metricKey: "lift_bench",
        value: 120,
        unit: "kg",
        source: "reported",
        recordedAt: daysAgo(30),
        notes: "Demo seed reported bench.",
      },
      {
        athleteProfileId: profile.id,
        metricKey: "lift_deadlift",
        value: 210,
        unit: "kg",
        source: "reported",
        recordedAt: daysAgo(30),
        notes: "Demo seed reported deadlift.",
      },
    ],
  });

  const program = await prisma.program.create({
    data: {
      athleteProfileId: profile.id,
      name: "Meet peaking block (demo)",
      status: "active",
      description: "Isolated Demo Mode program — not a production athlete plan.",
    },
  });

  await prisma.trainingSession.createMany({
    data: [
      {
        athleteProfileId: profile.id,
        programId: program.id,
        workoutNameSnapshot: "Lower — volume squat",
        status: "completed",
        scheduledAt: daysAgo(2),
        startedAt: daysAgo(2),
        completedAt: daysAgo(2),
        prescriptionLockedAt: daysAgo(2),
      },
      {
        athleteProfileId: profile.id,
        programId: program.id,
        workoutNameSnapshot: "Upper — bench focus",
        status: "completed",
        scheduledAt: daysAgo(4),
        startedAt: daysAgo(4),
        completedAt: daysAgo(4),
        prescriptionLockedAt: daysAgo(4),
      },
      {
        athleteProfileId: profile.id,
        programId: program.id,
        workoutNameSnapshot: "Lower — technique + speed",
        status: "planned",
        scheduledAt: daysAgo(-1),
      },
    ],
  });

  // Extra completed sessions for consistency lookback.
  for (const day of [6, 8, 10, 12, 14, 16, 18, 20, 22]) {
    await prisma.trainingSession.create({
      data: {
        athleteProfileId: profile.id,
        programId: program.id,
        workoutNameSnapshot: `Demo session −${day}d`,
        status: "completed",
        scheduledAt: daysAgo(day),
        startedAt: daysAgo(day),
        completedAt: daysAgo(day),
        prescriptionLockedAt: daysAgo(day),
      },
    });
  }

  await prisma.techniqueAnalysis.createMany({
    data: [
      {
        athleteProfileId: profile.id,
        status: "completed",
        overallScore: 71,
        confidenceBasis: "observed",
        summary: "Demo technique analysis (squat) — seed only.",
        analysisBackendStatus: "completed",
        createdAt: daysAgo(14),
      },
      {
        athleteProfileId: profile.id,
        status: "completed",
        overallScore: 74,
        confidenceBasis: "observed",
        summary: "Demo technique analysis (squat) — seed only.",
        analysisBackendStatus: "completed",
        createdAt: daysAgo(7),
      },
      {
        athleteProfileId: profile.id,
        status: "completed",
        overallScore: 76,
        confidenceBasis: "observed",
        summary: "Demo technique analysis (deadlift) — seed only.",
        analysisBackendStatus: "completed",
        createdAt: daysAgo(3),
      },
    ],
  });

  await prisma.recoveryEntry.createMany({
    data: [
      {
        athleteProfileId: profile.id,
        readiness: 68,
        source: "reported",
        recordedAt: daysAgo(5),
      },
      {
        athleteProfileId: profile.id,
        readiness: 72,
        source: "reported",
        recordedAt: daysAgo(3),
      },
      {
        athleteProfileId: profile.id,
        readiness: 78,
        source: "reported",
        recordedAt: daysAgo(1),
      },
    ],
  });

  await prisma.recommendation.create({
    data: {
      athleteProfileId: profile.id,
      category: "technique",
      title: "Tighten squat depth consistency before adding load",
      body: "Demo insight only — isolated seed athlete, not a production account.",
      status: "pending",
      priority: 2,
    },
  });

  return {
    userId: user.id,
    athleteProfileId: profile.id,
    email: DEMO_ATHLETE_EMAIL,
    created: !existing,
  };
}
