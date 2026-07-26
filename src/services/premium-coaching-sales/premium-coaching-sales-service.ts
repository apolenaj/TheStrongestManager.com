/**
 * Premium Coaching Sales Flow service (Prompt 134).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  PREMIUM_COACHING_ENGINE_VERSION,
  PREMIUM_COACHING_HONESTY,
  PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE,
  PREMIUM_COACHING_STATUS_LABELS,
  canAdvancePremiumCoachingStage,
  canDeclineFrom,
  canWithdrawFrom,
  isPremiumCoachingAvailability,
  isPremiumCoachingBudgetRange,
  isPremiumCoachingExperience,
  isPremiumCoachingGoal,
  isPremiumCoachingStatus,
  premiumCoachingFunnelSteps,
  type PremiumCoachingAvailability,
  type PremiumCoachingBudgetRange,
  type PremiumCoachingExperience,
  type PremiumCoachingGoal,
  type PremiumCoachingStatus,
} from "@/domain/premium-coaching-sales";
import { trackProductEventSafe } from "@/services/analytics/track";

export type PremiumCoachingApplicationView = {
  id: string;
  status: PremiumCoachingStatus;
  statusLabel: string;
  goal: string;
  experienceLevel: string;
  budgetRange: string;
  availability: string;
  notes: string | null;
  appliedAt: string;
  reviewStartedAt: string | null;
  consultationAt: string | null;
  offerPresentedAt: string | null;
  funnelSteps: readonly string[];
  honesty: readonly string[];
  noAcceptancePromise: string;
};

function toView(row: {
  id: string;
  status: string;
  goal: string;
  experienceLevel: string;
  budgetRange: string;
  availability: string;
  notes: string | null;
  appliedAt: Date;
  reviewStartedAt: Date | null;
  consultationAt: Date | null;
  offerPresentedAt: Date | null;
}): PremiumCoachingApplicationView | null {
  if (!isPremiumCoachingStatus(row.status)) return null;
  return {
    id: row.id,
    status: row.status,
    statusLabel: PREMIUM_COACHING_STATUS_LABELS[row.status],
    goal: row.goal,
    experienceLevel: row.experienceLevel,
    budgetRange: row.budgetRange,
    availability: row.availability,
    notes: row.notes,
    appliedAt: row.appliedAt.toISOString(),
    reviewStartedAt: row.reviewStartedAt?.toISOString() ?? null,
    consultationAt: row.consultationAt?.toISOString() ?? null,
    offerPresentedAt: row.offerPresentedAt?.toISOString() ?? null,
    funnelSteps: premiumCoachingFunnelSteps(),
    honesty: PREMIUM_COACHING_HONESTY,
    noAcceptancePromise: PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE,
  };
}

export async function submitPremiumCoachingApplication(input: {
  userId: string;
  goal: string;
  experienceLevel: string;
  budgetRange: string;
  availability: string;
  notes?: string | null;
}): Promise<
  | { ok: true; applicationId: string; message: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.premiumCoachingSales) {
    return { ok: false, error: "Premium Coaching Sales Flow is not enabled." };
  }

  if (!isPremiumCoachingGoal(input.goal)) {
    return { ok: false, error: "Choose a valid training goal." };
  }
  if (!isPremiumCoachingExperience(input.experienceLevel)) {
    return { ok: false, error: "Choose a valid experience level." };
  }
  if (!isPremiumCoachingBudgetRange(input.budgetRange)) {
    return { ok: false, error: "Choose a valid budget range." };
  }
  if (!isPremiumCoachingAvailability(input.availability)) {
    return { ok: false, error: "Choose a valid availability option." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });

  // One open funnel application at a time
  const open = await prisma.premiumCoachingApplication.findFirst({
    where: {
      applicantUserId: input.userId,
      status: { in: ["applied", "in_review", "consultation", "offer"] },
    },
  });
  if (open) {
    return {
      ok: false,
      error:
        "You already have an open application. Check its status before applying again.",
    };
  }

  const row = await prisma.premiumCoachingApplication.create({
    data: {
      applicantUserId: input.userId,
      athleteProfileId: profile?.id ?? null,
      goal: input.goal as PremiumCoachingGoal,
      experienceLevel: input.experienceLevel as PremiumCoachingExperience,
      budgetRange: input.budgetRange as PremiumCoachingBudgetRange,
      availability: input.availability as PremiumCoachingAvailability,
      notes: input.notes?.trim().slice(0, 2000) || null,
      status: "applied",
      engineVersion: PREMIUM_COACHING_ENGINE_VERSION,
    },
  });

  trackProductEventSafe({
    name: "premium_coaching_application_submitted",
    props: {
      applicationId: row.id,
      goal: row.goal,
      experienceLevel: row.experienceLevel,
      budgetBand: row.budgetRange,
    },
    userId: input.userId,
  });

  return {
    ok: true,
    applicationId: row.id,
    message: PREMIUM_COACHING_NO_ACCEPTANCE_PROMISE,
  };
}

export async function listMyPremiumCoachingApplications(input: {
  userId: string;
}): Promise<
  | { ok: true; applications: PremiumCoachingApplicationView[]; honesty: readonly string[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.premiumCoachingSales) {
    return { ok: false, error: "Feature off." };
  }

  const rows = await prisma.premiumCoachingApplication.findMany({
    where: { applicantUserId: input.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    ok: true,
    applications: rows
      .map(toView)
      .filter((v): v is PremiumCoachingApplicationView => v != null),
    honesty: PREMIUM_COACHING_HONESTY,
  };
}

export async function withdrawPremiumCoachingApplication(input: {
  userId: string;
  applicationId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.premiumCoachingSales) {
    return { ok: false, error: "Feature off." };
  }

  const row = await prisma.premiumCoachingApplication.findFirst({
    where: { id: input.applicationId, applicantUserId: input.userId },
  });
  if (!row) return { ok: false, error: "Application not found." };
  if (!isPremiumCoachingStatus(row.status) || !canWithdrawFrom(row.status)) {
    return { ok: false, error: "This application cannot be withdrawn." };
  }

  const fromStage = row.status;
  await prisma.premiumCoachingApplication.update({
    where: { id: row.id },
    data: {
      status: "withdrawn",
      withdrawnAt: new Date(),
      stageChangedByUserId: input.userId,
    },
  });

  trackProductEventSafe({
    name: "premium_coaching_stage_changed",
    props: {
      applicationId: row.id,
      fromStage,
      toStage: "withdrawn",
    },
    userId: input.userId,
  });

  return { ok: true };
}

/**
 * Staff/admin advances Apply → Review → Consultation → Offer.
 */
export async function advancePremiumCoachingApplication(input: {
  actorUserId: string;
  applicationId: string;
  toStatus: PremiumCoachingStatus;
  offerNotes?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.premiumCoachingSales) {
    return { ok: false, error: "Feature off." };
  }

  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true, isCoach: true },
  });
  if (!actor?.isAdmin && !actor?.isCoach) {
    return { ok: false, error: "Only staff or coaches may advance applications." };
  }

  const row = await prisma.premiumCoachingApplication.findUnique({
    where: { id: input.applicationId },
  });
  if (!row || !isPremiumCoachingStatus(row.status)) {
    return { ok: false, error: "Application not found." };
  }

  const fromStage = row.status;

  if (input.toStatus === "declined") {
    if (!canDeclineFrom(row.status)) {
      return { ok: false, error: "Cannot decline from this status." };
    }
    await prisma.premiumCoachingApplication.update({
      where: { id: row.id },
      data: {
        status: "declined",
        declinedAt: new Date(),
        stageChangedByUserId: input.actorUserId,
      },
    });
    trackProductEventSafe({
      name: "premium_coaching_stage_changed",
      props: {
        applicationId: row.id,
        fromStage,
        toStage: "declined",
      },
      userId: input.actorUserId,
    });
    return { ok: true };
  }

  if (!canAdvancePremiumCoachingStage(row.status, input.toStatus)) {
    return {
      ok: false,
      error: `Cannot move from ${row.status} to ${input.toStatus}.`,
    };
  }

  const data: {
    status: string;
    stageChangedByUserId: string;
    reviewStartedAt?: Date;
    consultationAt?: Date;
    offerPresentedAt?: Date;
    offerJson?: string;
  } = {
    status: input.toStatus,
    stageChangedByUserId: input.actorUserId,
  };

  if (input.toStatus === "in_review") data.reviewStartedAt = new Date();
  if (input.toStatus === "consultation") data.consultationAt = new Date();
  if (input.toStatus === "offer") {
    data.offerPresentedAt = new Date();
    data.offerJson = JSON.stringify({
      notes: input.offerNotes?.trim().slice(0, 2000) || null,
      presentedAt: new Date().toISOString(),
      paymentRequired: false,
    });
  }

  await prisma.premiumCoachingApplication.update({
    where: { id: row.id },
    data,
  });

  trackProductEventSafe({
    name: "premium_coaching_stage_changed",
    props: {
      applicationId: row.id,
      fromStage,
      toStage: input.toStatus,
    },
    userId: input.actorUserId,
  });

  if (input.toStatus === "offer") {
    trackProductEventSafe({
      name: "premium_coaching_offer_presented",
      props: { applicationId: row.id },
      userId: input.actorUserId,
    });
  }

  return { ok: true };
}

export async function listPremiumCoachingApplicationsForStaff(input: {
  actorUserId: string;
}): Promise<
  | { ok: true; applications: PremiumCoachingApplicationView[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.premiumCoachingSales) {
    return { ok: false, error: "Feature off." };
  }

  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true, isCoach: true },
  });
  if (!actor?.isAdmin && !actor?.isCoach) {
    return { ok: false, error: "Staff or coach access required." };
  }

  const rows = await prisma.premiumCoachingApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    ok: true,
    applications: rows
      .map(toView)
      .filter((v): v is PremiumCoachingApplicationView => v != null),
  };
}
