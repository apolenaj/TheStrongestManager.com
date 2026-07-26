import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  authenticateCredentials,
  deleteUserAccount,
  registerWithEmailPassword,
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/services/auth/account-service";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/tokens";

describe("account service", () => {
  const email = `athlete-${Date.now()}@example.com`;
  const password = "strongpass-123";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("registers and authenticates with email/password only", async () => {
    const created = await registerWithEmailPassword(email, password);
    expect(created.ok).toBe(true);
    if (created.ok) {
      expect(created.userId).toBeTruthy();
    }

    const stored = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(stored.isDemoAccount).toBe(false);

    const duplicate = await registerWithEmailPassword(email, password);
    expect(duplicate.ok).toBe(false);

    const sessionUser = await authenticateCredentials(email, password);
    expect(sessionUser?.email).toBe(email);

    const rejected = await authenticateCredentials(email, "wrong-password");
    expect(rejected).toBeNull();
  });

  it("blocks reserved Demo Mode emails from production signup", async () => {
    const blocked = await registerWithEmailPassword(
      "demo-athlete@demo.thestrongest.local",
      password,
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.error).toMatch(/reserved for Demo Mode/i);
    }
  });

  it("resets password with a valid token", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    await requestPasswordReset(email);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const raw = "test-reset-token-value";
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const reset = await resetPasswordWithToken(raw, "new-strong-pass-99");
    expect(reset).toEqual({ ok: true });

    expect(await authenticateCredentials(email, password)).toBeNull();
    expect(
      await authenticateCredentials(email, "new-strong-pass-99"),
    ).not.toBeNull();
  });

  it("deletes an account after password confirmation", async () => {
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    const deleted = await deleteUserAccount({
      userId: user.id,
      password: "new-strong-pass-99",
    });
    expect(deleted).toEqual({ ok: true });
    expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
  });
});
