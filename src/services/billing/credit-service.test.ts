import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  deductAnalysisCredit,
  ensureMonthlyAllocation,
  getBalance,
  grantCreditPack,
  refundAnalysisCredit,
} from "@/services/billing/credit-service";
import { creditPeriodKey } from "@/domain/billing/credits";

describe("technique analysis credits", () => {
  const email = `credits-${Date.now()}@example.com`;
  let userId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        subscription: {
          create: { plan: "free", status: "active" },
        },
        creditBalance: {
          create: { balance: 0, lastReason: "test" },
        },
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
  });

  it("grants free monthly/trial allocation once per period", async () => {
    const first = await ensureMonthlyAllocation(userId);
    expect(first.granted).toBe(2);
    expect(first.periodKey).toBe(creditPeriodKey());
    const second = await ensureMonthlyAllocation(userId);
    expect(second.granted).toBe(0);
    expect((await getBalance(userId)).balance).toBe(2);
  });

  it("deducts atomically and refunds idempotently on system failure", async () => {
    const analysisId = `analysis-${Date.now()}`;
    const spend = await deductAnalysisCredit({ userId, analysisId });
    expect(spend.ok).toBe(true);
    if (!spend.ok) return;
    expect(spend.balanceAfter).toBe(1);

    const again = await deductAnalysisCredit({ userId, analysisId });
    expect(again.ok).toBe(true);
    if (!again.ok) return;
    expect(again.balanceAfter).toBe(1);

    const refund = await refundAnalysisCredit({
      userId,
      analysisId,
      reason: "system error test",
    });
    expect(refund.restored).toBe(1);
    expect(refund.balanceAfter).toBe(2);

    const refund2 = await refundAnalysisCredit({ userId, analysisId });
    expect(refund2.restored).toBe(0);
    expect((await getBalance(userId)).balance).toBe(2);
  });

  it("rejects spend when balance is empty", async () => {
    await deductAnalysisCredit({ userId, analysisId: "a1" });
    await deductAnalysisCredit({ userId, analysisId: "a2" });
    const fail = await deductAnalysisCredit({
      userId,
      analysisId: "a3",
    });
    expect(fail.ok).toBe(false);
    if (fail.ok) return;
    expect(fail.code).toBe("insufficient");
  });

  it("grants optional credit packs", async () => {
    const pack = await grantCreditPack({
      userId,
      packId: "credits_5",
      externalRef: "test-ref-1",
    });
    expect(pack.ok).toBe(true);
    if (!pack.ok) return;
    expect(pack.credits).toBe(5);
    expect(pack.balanceAfter).toBe(5);

    const dup = await grantCreditPack({
      userId,
      packId: "credits_5",
      externalRef: "test-ref-1",
    });
    expect(dup.ok).toBe(true);
    if (!dup.ok) return;
    expect(dup.credits).toBe(0);
  });
});
