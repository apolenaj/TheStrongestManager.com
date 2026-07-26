import { prisma } from "@/lib/db";
import { getOnboardingPathConfig } from "@/domain/onboarding-paths";
import {
  MAJOR_LIFTS,
  buildInitialRecommendation,
  resolveGoalMeta,
  resolvePrimaryDiscipline,
  type OnboardingDraft,
  type PrimaryGoalId,
} from "@/services/onboarding/options";
import { enableCoachRole } from "@/services/coach/coach-service";

export type BuildProfileResult =
  | { ok: true; athleteProfileId: string; redirectTo: string }
  | { ok: false; error: string };

function normalizeText(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function competitionSportFromDraft(
  draft: OnboardingDraft,
): "powerlifting" | "strongman" | "deadlift_only" {
  if (draft.pathId === "strongman" || draft.sports.includes("strongman")) {
    return "strongman";
  }
  if (draft.pathId === "powerlifter" || draft.sports.includes("powerlifting")) {
    return "powerlifting";
  }
  return "powerlifting";
}

/**
 * Creates the athlete graph from onboarding answers using deterministic rules only.
 * Skipped fields are omitted — never invented.
 */
export async function buildAthleteProfileFromOnboarding(input: {
  userId: string;
  draft: OnboardingDraft;
}): Promise<BuildProfileResult> {
  const { userId, draft } = input;

  if (!draft.primaryGoalId) {
    return { ok: false, error: "Choose a primary goal to continue." };
  }
  if (!draft.experienceLevelId) {
    return { ok: false, error: "Choose your training experience level." };
  }
  if (!draft.painCautionAcknowledged) {
    return {
      ok: false,
      error: "Acknowledge the pain and injury caution to finish onboarding.",
    };
  }

  const existing = await prisma.athleteProfile.findUnique({
    where: { userId },
  });
  if (existing?.onboardingCompletedAt) {
    return {
      ok: false,
      error: "Onboarding is already complete for this account.",
    };
  }

  const goalMeta = resolveGoalMeta(draft.primaryGoalId as PrimaryGoalId);
  const primaryDiscipline = resolvePrimaryDiscipline(draft);
  const recommendation = buildInitialRecommendation(draft);
  const programNote = normalizeText(draft.currentProgramNote);
  const historyNote = normalizeText(draft.recentHistory);
  const combinedHistory =
    [programNote ? `Current program: ${programNote}` : null, historyNote]
      .filter(Boolean)
      .join("\n\n") || null;
  const now = new Date();

  const pathConfig = draft.pathId
    ? getOnboardingPathConfig(draft.pathId)
    : null;
  const redirectTo = pathConfig?.redirectAfter ?? "/app/dashboard";

  const athleteProfileId = await prisma.$transaction(async (tx) => {
    const profile = existing
      ? await tx.athleteProfile.update({
          where: { id: existing.id },
          data: {
            primaryDiscipline:
              draft.pathId === "coach" ? "coach" : primaryDiscipline,
            units: "kg",
            onboardingCompletedAt: now,
            painCautionAcknowledgedAt: now,
            movementNotes: normalizeText(draft.movementNotes),
          },
        })
      : await tx.athleteProfile.create({
          data: {
            userId,
            primaryDiscipline:
              draft.pathId === "coach" ? "coach" : primaryDiscipline,
            units: "kg",
            onboardingCompletedAt: now,
            painCautionAcknowledgedAt: now,
            movementNotes: normalizeText(draft.movementNotes),
          },
        });

    await tx.goal.deleteMany({
      where: { athleteProfileId: profile.id, status: "active" },
    });
    await tx.goal.create({
      data: {
        athleteProfileId: profile.id,
        category: draft.pathId === "coach" ? "other" : goalMeta.category,
        title:
          draft.pathId === "coach" ? "Coach Mode setup" : goalMeta.label,
        description:
          draft.pathId === "coach"
            ? "Coach path completed during onboarding."
            : "Primary goal captured during onboarding. Based only on your selection.",
        status: "active",
        priority: 1,
      },
    });

    await tx.trainingExperience.upsert({
      where: { athleteProfileId: profile.id },
      create: {
        athleteProfileId: profile.id,
        level: draft.experienceLevelId,
        daysPerWeek: draft.daysPerWeek ?? undefined,
        preferredSports:
          draft.sports.length > 0 ? JSON.stringify(draft.sports) : null,
        availableEquipment:
          draft.equipment.length > 0 ? JSON.stringify(draft.equipment) : null,
        recentHistory: combinedHistory,
        recoveryHabits: normalizeText(draft.recoveryHabits),
        notes: programNote,
        coachingStatus: null,
      },
      update: {
        level: draft.experienceLevelId,
        daysPerWeek: draft.daysPerWeek,
        preferredSports:
          draft.sports.length > 0 ? JSON.stringify(draft.sports) : null,
        availableEquipment:
          draft.equipment.length > 0 ? JSON.stringify(draft.equipment) : null,
        recentHistory: combinedHistory,
        recoveryHabits: normalizeText(draft.recoveryHabits),
        notes: programNote,
        coachingStatus: undefined,
      },
    });

    if (draft.bodyweightKg != null && draft.bodyweightKg > 0) {
      await tx.bodyMetric.create({
        data: {
          athleteProfileId: profile.id,
          metricKey: "bodyweight",
          value: draft.bodyweightKg,
          unit: "kg",
          source: "reported",
          recordedAt: now,
          notes: "Reported during onboarding",
        },
      });
    }

    if (draft.heightCm != null && draft.heightCm > 0) {
      await tx.bodyMetric.create({
        data: {
          athleteProfileId: profile.id,
          metricKey: "height",
          value: draft.heightCm,
          unit: "cm",
          source: "reported",
          recordedAt: now,
          notes: "Reported during onboarding",
        },
      });
    }

    for (const lift of MAJOR_LIFTS) {
      const value = draft.lifts[lift.id];
      if (value == null || value <= 0) continue;
      await tx.progressMetric.create({
        data: {
          athleteProfileId: profile.id,
          metricKey: lift.metricKey,
          value,
          unit: "kg",
          source: "reported",
          recordedAt: now,
          notes: `Self-reported ${lift.label} from onboarding — not a verified test.`,
        },
      });
    }

    if (draft.competitionDate) {
      const competitionDate = new Date(
        `${draft.competitionDate}T12:00:00.000Z`,
      );
      if (!Number.isNaN(competitionDate.getTime())) {
        await tx.competitionPrep.create({
          data: {
            athleteProfileId: profile.id,
            sport: competitionSportFromDraft(draft),
            name: null,
            competitionDate,
            status: "active",
          },
        });
      }
    }

    const recoveryHabits = normalizeText(draft.recoveryHabits);
    if (recoveryHabits) {
      await tx.recoveryEntry.create({
        data: {
          athleteProfileId: profile.id,
          recordedAt: now,
          source: "reported",
          notes: recoveryHabits,
        },
      });
    }

    await tx.recommendation.create({
      data: {
        athleteProfileId: profile.id,
        category: recommendation.category,
        title: recommendation.title,
        body: recommendation.body,
        status: "pending",
        priority: 1,
      },
    });

    await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: "free",
        status: "active",
      },
      update: {},
    });

    await tx.creditBalance.upsert({
      where: { userId },
      create: {
        userId,
        balance: 0,
        lastReason: "onboarding_initialized",
      },
      update: {},
    });

    return profile.id;
  });

  if (pathConfig?.enableCoachMode) {
    await enableCoachRole(userId);
  }

  const { trackProductEventSafe } = await import("@/services/analytics/track");
  trackProductEventSafe({
    name: "onboarding_completed",
    props: { athleteProfileId },
    userId,
  });

  const { qualifyReferralOnOnboarding } = await import(
    "@/services/referral-program"
  );
  await qualifyReferralOnOnboarding({ referredUserId: userId });

  return { ok: true, athleteProfileId, redirectTo };
}
