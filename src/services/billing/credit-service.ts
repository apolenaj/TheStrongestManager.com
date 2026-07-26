import {
  CREDIT_HONESTY,
  CREDIT_PACKS,
  CREDIT_RELATED_TECHNIQUE,
  TECHNIQUE_ANALYSIS_CREDIT_COST,
  creditPeriodKey,
  endOfUtcMonth,
  getCreditPackById,
  type CreditPackDefinition,
} from "@/domain/billing/credits";
import {
  normalizePlanId,
  type PlanLimitValue,
} from "@/domain/billing";
import { prisma } from "@/lib/db";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export type CreditWalletView = {
  balance: number;
  periodKey: string;
  monthlyAllocation: PlanLimitValue;
  unlimitedAnalyses: boolean;
  recentTransactions: Array<{
    id: string;
    delta: number;
    kind: string;
    reason: string;
    balanceAfter: number;
    createdAt: string;
    expiresAt: string | null;
  }>;
  packs: CreditPackDefinition[];
  honesty: readonly string[];
};

async function ensureWalletTx(tx: Tx, userId: string) {
  return tx.creditBalance.upsert({
    where: { userId },
    create: {
      userId,
      balance: 0,
      lastReason: "wallet_initialized",
    },
    update: {},
  });
}

async function appendLedgerTx(
  tx: Tx,
  input: {
    userId: string;
    delta: number;
    kind: string;
    reason: string;
    relatedType?: string | null;
    relatedId?: string | null;
    expiresAt?: Date | null;
    settlesGrantId?: string | null;
  },
) {
  const wallet = await tx.creditBalance.findUniqueOrThrow({
    where: { userId: input.userId },
  });
  const next = wallet.balance + input.delta;
  if (next < 0) {
    throw new Error("INSUFFICIENT_CREDITS");
  }
  const updated = await tx.creditBalance.update({
    where: { userId: input.userId },
    data: {
      balance: next,
      lastReason: input.reason,
    },
  });
  const row = await tx.creditTransaction.create({
    data: {
      userId: input.userId,
      delta: input.delta,
      balanceAfter: updated.balance,
      kind: input.kind,
      reason: input.reason,
      relatedType: input.relatedType ?? null,
      relatedId: input.relatedId ?? null,
      expiresAt: input.expiresAt ?? null,
      settlesGrantId: input.settlesGrantId ?? null,
    },
  });
  return row;
}

/**
 * Expire monthly grants past expiresAt (idempotent per grant).
 * Caps expire amount by current balance — never invents negative wallet.
 */
export async function expireStaleCredits(userId: string): Promise<number> {
  return prisma.$transaction(async (tx) => {
    await ensureWalletTx(tx, userId);
    const now = new Date();
    const grants = await tx.creditTransaction.findMany({
      where: {
        userId,
        kind: { in: ["grant_monthly", "grant_trial"] },
        expiresAt: { lte: now },
        delta: { gt: 0 },
      },
      orderBy: { createdAt: "asc" },
    });

    let expiredTotal = 0;
    for (const grant of grants) {
      const already = await tx.creditTransaction.findFirst({
        where: {
          userId,
          kind: "expire",
          settlesGrantId: grant.id,
        },
      });
      if (already) continue;

      const wallet = await tx.creditBalance.findUniqueOrThrow({
        where: { userId },
      });
      const amount = Math.min(grant.delta, wallet.balance);
      if (amount <= 0) {
        // Record zero-settle so we do not reprocess forever when balance already spent.
        await tx.creditTransaction.create({
          data: {
            userId,
            delta: 0,
            balanceAfter: wallet.balance,
            kind: "expire",
            reason: `expire_spent:${grant.id}`,
            settlesGrantId: grant.id,
          },
        });
        continue;
      }

      await appendLedgerTx(tx, {
        userId,
        delta: -amount,
        kind: "expire",
        reason: `Monthly allocation expired (${grant.reason})`,
        settlesGrantId: grant.id,
      });
      expiredTotal += amount;
    }
    return expiredTotal;
  });
}

async function planAllocationForUser(userId: string): Promise<{
  amount: number | "unlimited";
  planId: string;
}> {
  const { getTechniqueAnalysisMonthlyLimit } = await import(
    "@/services/entitlements/entitlement-service"
  );
  const { amount, planId } = await getTechniqueAnalysisMonthlyLimit(userId);
  return { amount, planId };
}

/**
 * Grant this UTC month's allocation once (free trial / paid monthly pool).
 */
export async function ensureMonthlyAllocation(userId: string): Promise<{
  granted: number;
  unlimited: boolean;
  periodKey: string;
}> {
  await expireStaleCredits(userId);
  const periodKey = creditPeriodKey();
  const { amount, planId } = await planAllocationForUser(userId);

  if (amount === "unlimited") {
    return { granted: 0, unlimited: true, periodKey };
  }
  if (amount <= 0) {
    return { granted: 0, unlimited: false, periodKey };
  }

  return prisma.$transaction(async (tx) => {
    await ensureWalletTx(tx, userId);
    const reason = `monthly_allocation:${periodKey}:${planId}`;
    const grantKind = planId === "free" ? "grant_trial" : "grant_monthly";
    const existing = await tx.creditTransaction.findFirst({
      where: {
        userId,
        kind: grantKind,
        reason,
      },
    });
    if (existing) {
      return { granted: 0, unlimited: false, periodKey };
    }

    await appendLedgerTx(tx, {
      userId,
      delta: amount,
      kind: grantKind,
      reason,
      expiresAt: endOfUtcMonth(),
    });
    return { granted: amount, unlimited: false, periodKey };
  }).then(async (result) => {
    if (result.granted > 0) {
      const { enqueueDomainEventSafe } = await import("@/services/event-driven");
      enqueueDomainEventSafe({
        name: "billing.credits_changed",
        payload: {
          userId,
          reason: `monthly_allocation:${periodKey}`,
          delta: result.granted,
        },
        dedupeParts: [userId, `monthly_allocation:${periodKey}`],
      });
    }
    return result;
  });
}

/**
 * Atomic spend for a technique analysis. Idempotent per analysis id.
 */
export async function deductAnalysisCredit(input: {
  userId: string;
  analysisId: string;
  cost?: number;
}): Promise<
  | { ok: true; balanceAfter: number; transactionId: string; skippedUnlimited: boolean }
  | { ok: false; error: string; code: "insufficient" | "unlimited_skip" }
> {
  const cost = input.cost ?? TECHNIQUE_ANALYSIS_CREDIT_COST;
  await ensureMonthlyAllocation(input.userId);
  const { amount } = await planAllocationForUser(input.userId);
  if (amount === "unlimited") {
    return {
      ok: true,
      balanceAfter: (await getBalance(input.userId)).balance,
      transactionId: "unlimited",
      skippedUnlimited: true,
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await ensureWalletTx(tx, input.userId);

      const prior = await tx.creditTransaction.findFirst({
        where: {
          userId: input.userId,
          kind: "spend_analysis",
          relatedType: CREDIT_RELATED_TECHNIQUE,
          relatedId: input.analysisId,
        },
      });
      if (prior) {
        return {
          ok: true as const,
          balanceAfter: prior.balanceAfter,
          transactionId: prior.id,
          skippedUnlimited: false,
        };
      }

      // Atomic conditional decrement — fails closed if concurrent spend empties wallet.
      const updated = await tx.creditBalance.updateMany({
        where: {
          userId: input.userId,
          balance: { gte: cost },
        },
        data: {
          balance: { decrement: cost },
          lastReason: `spend_analysis:${input.analysisId}`,
        },
      });
      if (updated.count !== 1) {
        return {
          ok: false as const,
          error:
            "Not enough technique analysis credits. Wait for next month’s allocation or buy a credit pack when checkout is live.",
          code: "insufficient" as const,
        };
      }

      const wallet = await tx.creditBalance.findUniqueOrThrow({
        where: { userId: input.userId },
      });
      const row = await tx.creditTransaction.create({
        data: {
          userId: input.userId,
          delta: -cost,
          balanceAfter: wallet.balance,
          kind: "spend_analysis",
          reason: `Technique analysis ${input.analysisId}`,
          relatedType: CREDIT_RELATED_TECHNIQUE,
          relatedId: input.analysisId,
        },
      });
      return {
        ok: true as const,
        balanceAfter: wallet.balance,
        transactionId: row.id,
        skippedUnlimited: false,
      };
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return {
        ok: false,
        error: "Not enough technique analysis credits.",
        code: "insufficient",
      };
    }
    throw error;
  }
}

/**
 * Restore credits for a failed analysis (system error). Idempotent per analysis.
 */
export async function refundAnalysisCredit(input: {
  userId: string;
  analysisId: string;
  reason?: string;
}): Promise<{ ok: true; restored: number; balanceAfter: number } | { ok: true; restored: 0; balanceAfter: number; already?: boolean }> {
  const { amount } = await planAllocationForUser(input.userId);
  if (amount === "unlimited") {
    const bal = await getBalance(input.userId);
    return { ok: true, restored: 0, balanceAfter: bal.balance };
  }

  return prisma.$transaction(async (tx) => {
    await ensureWalletTx(tx, input.userId);

    const existingRefund = await tx.creditTransaction.findFirst({
      where: {
        userId: input.userId,
        kind: "refund_analysis",
        relatedType: CREDIT_RELATED_TECHNIQUE,
        relatedId: input.analysisId,
      },
    });
    if (existingRefund) {
      return {
        ok: true as const,
        restored: 0,
        balanceAfter: existingRefund.balanceAfter,
        already: true,
      };
    }

    const spend = await tx.creditTransaction.findFirst({
      where: {
        userId: input.userId,
        kind: "spend_analysis",
        relatedType: CREDIT_RELATED_TECHNIQUE,
        relatedId: input.analysisId,
      },
    });
    if (!spend) {
      const wallet = await tx.creditBalance.findUniqueOrThrow({
        where: { userId: input.userId },
      });
      return {
        ok: true as const,
        restored: 0,
        balanceAfter: wallet.balance,
      };
    }

    const restore = Math.abs(spend.delta);
    const row = await appendLedgerTx(tx, {
      userId: input.userId,
      delta: restore,
      kind: "refund_analysis",
      reason:
        input.reason ??
        `Refund for system failure on analysis ${input.analysisId}`,
      relatedType: CREDIT_RELATED_TECHNIQUE,
      relatedId: input.analysisId,
    });
    return {
      ok: true as const,
      restored: restore,
      balanceAfter: row.balanceAfter,
    };
  });
}

/** Grant a purchased pack (or manual adjust). */
export async function grantCreditPack(input: {
  userId: string;
  packId: string;
  externalRef?: string;
}): Promise<
  | { ok: true; credits: number; balanceAfter: number }
  | { ok: false; error: string }
> {
  const pack = getCreditPackById(input.packId);
  if (!pack) return { ok: false, error: "Unknown credit pack." };

  const reason = input.externalRef
    ? `grant_pack:${pack.id}:${input.externalRef}`
    : `grant_pack:${pack.id}:${Date.now()}`;

  const result = await prisma.$transaction(async (tx) => {
    await ensureWalletTx(tx, input.userId);
    if (input.externalRef) {
      const dup = await tx.creditTransaction.findFirst({
        where: { userId: input.userId, kind: "grant_pack", reason },
      });
      if (dup) {
        return {
          ok: true as const,
          credits: 0,
          balanceAfter: dup.balanceAfter,
        };
      }
    }
    const expiresAt =
      pack.expiresInDays != null
        ? new Date(Date.now() + pack.expiresInDays * 86400000)
        : null;
    const row = await appendLedgerTx(tx, {
      userId: input.userId,
      delta: pack.credits,
      kind: "grant_pack",
      reason,
      expiresAt,
    });
    return {
      ok: true as const,
      credits: pack.credits,
      balanceAfter: row.balanceAfter,
    };
  });

  if (result.ok && result.credits > 0) {
    const { enqueueDomainEventSafe } = await import("@/services/event-driven");
    enqueueDomainEventSafe({
      name: "billing.credits_changed",
      payload: {
        userId: input.userId,
        reason,
        delta: result.credits,
      },
      dedupeParts: [input.userId, reason],
    });
  }

  return result;
}

/** Grant technique credits from a qualified referral (idempotent via reason). */
export async function grantReferralCredits(input: {
  userId: string;
  credits: number;
  /** Opaque referral reward id — used for ledger idempotency. */
  referralRewardId: string;
}): Promise<
  | { ok: true; credits: number; balanceAfter: number; duplicate: boolean }
  | { ok: false; error: string }
> {
  if (input.credits <= 0) {
    return { ok: false, error: "Credits must be positive." };
  }
  const reason = `grant_referral:${input.referralRewardId}`;

  return prisma.$transaction(async (tx) => {
    await ensureWalletTx(tx, input.userId);
    const dup = await tx.creditTransaction.findFirst({
      where: { userId: input.userId, kind: "grant_referral", reason },
    });
    if (dup) {
      return {
        ok: true as const,
        credits: 0,
        balanceAfter: dup.balanceAfter,
        duplicate: true,
      };
    }
    const row = await appendLedgerTx(tx, {
      userId: input.userId,
      delta: input.credits,
      kind: "grant_referral",
      reason,
      relatedType: "referral_reward",
      relatedId: input.referralRewardId,
    });
    return {
      ok: true as const,
      credits: input.credits,
      balanceAfter: row.balanceAfter,
      duplicate: false,
    };
  });
}

export async function getBalance(userId: string): Promise<{ balance: number }> {
  await ensureMonthlyAllocation(userId);
  const wallet = await prisma.creditBalance.findUnique({
    where: { userId },
    select: { balance: true },
  });
  return { balance: wallet?.balance ?? 0 };
}

export async function getCreditWalletView(
  userId: string,
): Promise<CreditWalletView> {
  const allocation = await ensureMonthlyAllocation(userId);
  const { amount } = await planAllocationForUser(userId);
  const wallet = await prisma.creditBalance.findUnique({
    where: { userId },
  });
  const recent = await prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    balance: wallet?.balance ?? 0,
    periodKey: allocation.periodKey,
    monthlyAllocation: amount === "unlimited" ? "unlimited" : amount,
    unlimitedAnalyses: amount === "unlimited",
    recentTransactions: recent.map((t) => ({
      id: t.id,
      delta: t.delta,
      kind: t.kind,
      reason: t.reason,
      balanceAfter: t.balanceAfter,
      createdAt: t.createdAt.toISOString(),
      expiresAt: t.expiresAt?.toISOString() ?? null,
    })),
    packs: [...CREDIT_PACKS],
    honesty: CREDIT_HONESTY,
  };
}

export { normalizePlanId, CREDIT_PACKS, TECHNIQUE_ANALYSIS_CREDIT_COST };
