/**
 * Referral Program service (Prompt 135).
 * Single-level attribution + qualification + reward grants. No pyramid.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  REFERRAL_ABUSE_LIMITS,
  REFERRAL_ANTI_PYRAMID,
  REFERRAL_DEFAULT_REWARDS,
  REFERRAL_ENGINE_VERSION,
  REFERRAL_HONESTY,
  REFERRAL_REWARD_DESCRIPTIONS,
  REFERRAL_REWARD_KINDS,
  REFERRAL_REWARD_LABELS,
  REFERRAL_STATUS_LABELS,
  buildReferralInvitePath,
  complimentaryDaysForReward,
  complimentaryPlanForReward,
  evaluateReferralAttribution,
  generateUserReferralCode,
  isDirectReferrerOnly,
  isValidUserReferralCode,
  qualifiesAfterOnboarding,
  startOfUtcMonth,
  techniqueCreditsForRole,
  type ReferralRewardKind,
  type ReferralStatus,
  type ReferralVoidReason,
} from "@/domain/referral-program";
import { prisma } from "@/lib/db";
import { trackProductEventSafe } from "@/services/analytics/track";
import { grantReferralCredits } from "@/services/billing/credit-service";

export type ReferralProgramView = {
  code: string;
  invitePath: string;
  stats: {
    attributed: number;
    qualified: number;
    rewarded: number;
    voided: number;
    rewardedThisMonth: number;
  };
  recent: Array<{
    id: string;
    status: ReferralStatus;
    statusLabel: string;
    voidReason: string | null;
    attributedAt: string;
    qualifiedAt: string | null;
    rewardedAt: string | null;
  }>;
  rewardCatalog: Array<{
    kind: ReferralRewardKind;
    label: string;
    description: string;
  }>;
  defaultRewards: typeof REFERRAL_DEFAULT_REWARDS;
  abuseLimits: typeof REFERRAL_ABUSE_LIMITS;
  honesty: readonly string[];
  antiPyramid: readonly string[];
  myAccessGrants: Array<{
    kind: string;
    planId: string;
    endsAt: string;
    status: string;
  }>;
};

async function issueUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateUserReferralCode(8);
    const clash = await prisma.userReferralCode.findUnique({
      where: { code },
    });
    if (!clash) return code;
  }
  throw new Error("Could not allocate a unique referral code.");
}

export async function ensureUserReferralCode(userId: string): Promise<{
  code: string;
  invitePath: string;
  created: boolean;
}> {
  const existing = await prisma.userReferralCode.findUnique({
    where: { userId },
  });
  if (existing) {
    return {
      code: existing.code,
      invitePath: buildReferralInvitePath(existing.code),
      created: false,
    };
  }

  const code = await issueUniqueCode();
  const row = await prisma.userReferralCode.create({
    data: { userId, code },
  });

  trackProductEventSafe({
    name: "referral_code_issued",
    props: { codeLength: row.code.length },
    userId,
  });

  return {
    code: row.code,
    invitePath: buildReferralInvitePath(row.code),
    created: true,
  };
}

export async function getReferralProgramView(input: {
  userId: string;
}): Promise<
  | { ok: true; view: ReferralProgramView }
  | { ok: false; error: string }
> {
  if (!featureFlags.referralProgram) {
    return { ok: false, error: "Referral Program is not enabled." };
  }

  const issued = await ensureUserReferralCode(input.userId);
  const monthStart = startOfUtcMonth();

  const [rows, rewardedThisMonth, grants] = await Promise.all([
    prisma.referral.findMany({
      where: { referrerUserId: input.userId },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.referral.count({
      where: {
        referrerUserId: input.userId,
        status: "rewarded",
        rewardedAt: { gte: monthStart },
      },
    }),
    prisma.referralAccessGrant.findMany({
      where: { userId: input.userId },
      orderBy: { endsAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = {
    attributed: rows.filter((r) => r.status === "attributed").length,
    qualified: rows.filter((r) => r.status === "qualified").length,
    rewarded: rows.filter((r) => r.status === "rewarded").length,
    voided: rows.filter((r) => r.status === "voided").length,
    rewardedThisMonth,
  };

  return {
    ok: true,
    view: {
      code: issued.code,
      invitePath: issued.invitePath,
      stats,
      recent: rows.slice(0, 15).map((r) => ({
        id: r.id,
        status: r.status as ReferralStatus,
        statusLabel:
          REFERRAL_STATUS_LABELS[r.status as ReferralStatus] ?? r.status,
        voidReason: r.voidReason,
        attributedAt: r.attributedAt.toISOString(),
        qualifiedAt: r.qualifiedAt?.toISOString() ?? null,
        rewardedAt: r.rewardedAt?.toISOString() ?? null,
      })),
      rewardCatalog: REFERRAL_REWARD_KINDS.map((kind) => ({
        kind,
        label: REFERRAL_REWARD_LABELS[kind],
        description: REFERRAL_REWARD_DESCRIPTIONS[kind],
      })),
      defaultRewards: REFERRAL_DEFAULT_REWARDS,
      abuseLimits: REFERRAL_ABUSE_LIMITS,
      honesty: REFERRAL_HONESTY,
      antiPyramid: REFERRAL_ANTI_PYRAMID,
      myAccessGrants: grants.map((g) => ({
        kind: g.kind,
        planId: g.planId,
        endsAt: g.endsAt.toISOString(),
        status: g.status,
      })),
    },
  };
}

/**
 * Attribute a signup to a referral code. Safe to call with null/invalid codes.
 * Never creates multi-level edges.
 */
export async function attributeReferralOnSignup(input: {
  referredUserId: string;
  code: string | null | undefined;
}): Promise<{ ok: true; referralId?: string; voided?: boolean } | { ok: false }> {
  if (!featureFlags.referralProgram) return { ok: true };
  const raw = input.code?.trim() ?? "";
  if (!raw) return { ok: true };
  if (!isValidUserReferralCode(raw)) {
    return { ok: true };
  }

  const existing = await prisma.referral.findUnique({
    where: { referredUserId: input.referredUserId },
  });
  if (existing) return { ok: true, referralId: existing.id };

  const codeRow = await prisma.userReferralCode.findUnique({
    where: { code: raw },
    include: { user: { select: { id: true, isDemoAccount: true } } },
  });
  if (!codeRow) return { ok: true };

  const referred = await prisma.user.findUnique({
    where: { id: input.referredUserId },
    select: { id: true, isDemoAccount: true },
  });
  if (!referred) return { ok: false };

  const monthStart = startOfUtcMonth();
  const [rewardedThisMonth, pendingAttributions] = await Promise.all([
    prisma.referral.count({
      where: {
        referrerUserId: codeRow.userId,
        status: "rewarded",
        rewardedAt: { gte: monthStart },
      },
    }),
    prisma.referral.count({
      where: {
        referrerUserId: codeRow.userId,
        status: "attributed",
      },
    }),
  ]);

  const verdict = evaluateReferralAttribution({
    referrerUserId: codeRow.userId,
    referredUserId: referred.id,
    referrerIsDemo: codeRow.user.isDemoAccount,
    referredIsDemo: referred.isDemoAccount,
    rewardedThisMonth,
    pendingAttributions,
  });

  if (!verdict.ok) {
    const voided = await prisma.referral.create({
      data: {
        codeId: codeRow.id,
        code: codeRow.code,
        referrerUserId: codeRow.userId,
        referredUserId: referred.id,
        status: "voided",
        voidReason: verdict.reason,
        engineVersion: REFERRAL_ENGINE_VERSION,
      },
    });
    trackProductEventSafe({
      name: "referral_voided",
      props: {
        referralId: voided.id,
        voidReason: verdict.reason,
      },
      userId: referred.id,
    });
    return { ok: true, referralId: voided.id, voided: true };
  }

  const row = await prisma.referral.create({
    data: {
      codeId: codeRow.id,
      code: codeRow.code,
      referrerUserId: codeRow.userId,
      referredUserId: referred.id,
      status: "attributed",
      engineVersion: REFERRAL_ENGINE_VERSION,
    },
  });

  trackProductEventSafe({
    name: "referral_attributed",
    props: { referralId: row.id },
    userId: referred.id,
  });

  return { ok: true, referralId: row.id };
}

async function grantOneReward(input: {
  referralId: string;
  referrerUserId: string;
  referredUserId: string;
  role: "referrer" | "referee";
  kind: ReferralRewardKind;
}): Promise<void> {
  const beneficiaryUserId =
    input.role === "referrer" ? input.referrerUserId : input.referredUserId;

  if (
    !isDirectReferrerOnly({
      beneficiaryUserId,
      referrerUserId: input.referrerUserId,
      referredUserId: input.referredUserId,
      role: input.role,
    })
  ) {
    // Fail closed — never pay an upline.
    trackProductEventSafe({
      name: "referral_voided",
      props: {
        referralId: input.referralId,
        voidReason: "multi_level_blocked" satisfies ReferralVoidReason,
      },
      userId: beneficiaryUserId,
    });
    return;
  }

  const idempotencyKey = `${input.referralId}:${input.role}:${input.kind}`;
  const credits =
    input.kind === "technique_credits"
      ? techniqueCreditsForRole(input.role)
      : null;

  const reward = await prisma.referralReward.upsert({
    where: { idempotencyKey },
    create: {
      referralId: input.referralId,
      beneficiaryUserId,
      beneficiaryRole: input.role,
      rewardKind: input.kind,
      status: "pending",
      creditsAmount: credits,
      idempotencyKey,
    },
    update: {},
  });

  if (reward.status === "granted") return;

  if (input.kind === "technique_credits") {
    const amount = credits ?? techniqueCreditsForRole(input.role);
    const granted = await grantReferralCredits({
      userId: beneficiaryUserId,
      credits: amount,
      referralRewardId: reward.id,
    });
    if (!granted.ok) {
      await prisma.referralReward.update({
        where: { id: reward.id },
        data: { status: "skipped" },
      });
      return;
    }
    await prisma.referralReward.update({
      where: { id: reward.id },
      data: {
        status: "granted",
        creditsAmount: amount,
        grantedAt: new Date(),
      },
    });
    trackProductEventSafe({
      name: "referral_reward_granted",
      props: {
        referralId: input.referralId,
        rewardKind: input.kind,
        beneficiaryRole: input.role,
      },
      userId: beneficiaryUserId,
    });
    return;
  }

  const days = complimentaryDaysForReward(input.kind);
  const planId = complimentaryPlanForReward(input.kind);
  if (days == null || !planId) {
    await prisma.referralReward.update({
      where: { id: reward.id },
      data: { status: "skipped" },
    });
    return;
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + days * 86400000);
  const kindLabel =
    input.kind === "free_month"
      ? "complimentary_month"
      : "premium_feature_bundle";

  await prisma.referralAccessGrant.upsert({
    where: { referralRewardId: reward.id },
    create: {
      userId: beneficiaryUserId,
      referralRewardId: reward.id,
      kind: kindLabel,
      planId,
      startsAt,
      endsAt,
      status: "active",
    },
    update: {
      status: "active",
      startsAt,
      endsAt,
      planId,
    },
  });

  await prisma.referralReward.update({
    where: { id: reward.id },
    data: { status: "granted", grantedAt: new Date() },
  });

  trackProductEventSafe({
    name: "referral_reward_granted",
    props: {
      referralId: input.referralId,
      rewardKind: input.kind,
      beneficiaryRole: input.role,
    },
    userId: beneficiaryUserId,
  });
}

/**
 * After athlete onboarding completes — qualify + grant default rewards.
 */
export async function qualifyReferralOnOnboarding(input: {
  referredUserId: string;
}): Promise<void> {
  if (!featureFlags.referralProgram) return;
  if (!qualifiesAfterOnboarding(true)) return;

  const referral = await prisma.referral.findUnique({
    where: { referredUserId: input.referredUserId },
  });
  if (!referral || referral.status === "voided") return;
  if (referral.status === "rewarded") return;

  // Re-check monthly cap at grant time (attribution may have been earlier).
  const monthStart = startOfUtcMonth();
  const rewardedThisMonth = await prisma.referral.count({
    where: {
      referrerUserId: referral.referrerUserId,
      status: "rewarded",
      rewardedAt: { gte: monthStart },
    },
  });
  if (rewardedThisMonth >= REFERRAL_ABUSE_LIMITS.maxRewardedPerMonth) {
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "voided",
        voidReason: "abuse_cap",
      },
    });
    trackProductEventSafe({
      name: "referral_voided",
      props: { referralId: referral.id, voidReason: "abuse_cap" },
      userId: input.referredUserId,
    });
    return;
  }

  const now = new Date();
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: "qualified",
      qualifiedAt: referral.qualifiedAt ?? now,
    },
  });

  trackProductEventSafe({
    name: "referral_qualified",
    props: { referralId: referral.id },
    userId: input.referredUserId,
  });

  for (const spec of REFERRAL_DEFAULT_REWARDS) {
    await grantOneReward({
      referralId: referral.id,
      referrerUserId: referral.referrerUserId,
      referredUserId: referral.referredUserId,
      role: spec.role,
      kind: spec.kind,
    });
  }

  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: "rewarded",
      rewardedAt: now,
    },
  });
}

/**
 * Explicit grant path for free_month / premium_features (architecture ready).
 * Still single-level only; never invents multi-hop payouts.
 */
export async function grantConfiguredReferralReward(input: {
  referralId: string;
  role: "referrer" | "referee";
  kind: ReferralRewardKind;
  actorUserId: string;
  actorIsAdmin: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.referralProgram) {
    return { ok: false, error: "Referral Program is not enabled." };
  }
  if (!input.actorIsAdmin) {
    return { ok: false, error: "Only staff can grant non-default reward kinds." };
  }

  const referral = await prisma.referral.findUnique({
    where: { id: input.referralId },
  });
  if (!referral || referral.status === "voided") {
    return { ok: false, error: "Referral not eligible." };
  }
  if (referral.status !== "qualified" && referral.status !== "rewarded") {
    return { ok: false, error: "Referral must be qualified first." };
  }

  await grantOneReward({
    referralId: referral.id,
    referrerUserId: referral.referrerUserId,
    referredUserId: referral.referredUserId,
    role: input.role,
    kind: input.kind,
  });
  return { ok: true };
}
