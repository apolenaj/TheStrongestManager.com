import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { generateResetToken, hashToken } from "@/lib/tokens";
import { sendEmail } from "@/services/email/send-email";
import { purgeTechniqueVideosForUser } from "@/services/privacy/purge-media";
import { isReservedDemoEmail } from "@/domain/demo";

export type AuthServiceResult =
  | { ok: true }
  | { ok: false; error: string };

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function registerWithEmailPassword(
  email: string,
  password: string,
  options?: { referralCode?: string | null; affiliateCode?: string | null },
): Promise<AuthServiceResult & { userId?: string }> {
  const normalized = email.trim().toLowerCase();
  if (isReservedDemoEmail(normalized)) {
    return {
      ok: false,
      error: "That email is reserved for Demo Mode and cannot be used to sign up.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      /** Production signups are never demo accounts. */
      isDemoAccount: false,
    },
  });

  const { trackProductEventSafe } = await import("@/services/analytics/track");
  trackProductEventSafe({
    name: "signup_completed",
    props: { method: "email" },
    userId: user.id,
  });

  if (options?.referralCode) {
    const { attributeReferralOnSignup } = await import(
      "@/services/referral-program"
    );
    await attributeReferralOnSignup({
      referredUserId: user.id,
      code: options.referralCode,
    });
  }

  if (options?.affiliateCode) {
    const { attributeAffiliateConversionOnSignup } = await import(
      "@/services/affiliate-system"
    );
    await attributeAffiliateConversionOnSignup({
      convertedUserId: user.id,
      code: options.affiliateCode,
    });
  }

  return { ok: true, userId: user.id };
}

export async function requestPasswordReset(
  email: string,
): Promise<AuthServiceResult> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
  });

  // Always succeed externally to avoid account enumeration.
  if (!user?.passwordHash) {
    return { ok: true };
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = generateResetToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${siteUrl()}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your TheStrongestManager password",
    text: [
      "You requested a password reset for TheStrongestManager.",
      "",
      `Open this link within one hour to choose a new password:`,
      resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });

  return { ok: true };
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
): Promise<AuthServiceResult> {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return {
      ok: false,
      error: "This reset link is invalid or has expired. Request a new one.",
    };
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return { ok: true };
}

export async function deleteUserAccount(input: {
  userId: string;
  password?: string;
}): Promise<AuthServiceResult> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    include: { accounts: true },
  });

  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  if (user.passwordHash) {
    if (!input.password) {
      return {
        ok: false,
        error: "Enter your password to delete this account.",
      };
    }
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      return { ok: false, error: "Password is incorrect." };
    }
  }

  // Remove private video files before cascading DB delete (rows alone would orphan disk).
  await purgeTechniqueVideosForUser(user.id);

  await prisma.user.delete({ where: { id: user.id } });
  return { ok: true };
}

export async function authenticateCredentials(
  email: string,
  password: string,
): Promise<{ id: string; email: string } | null> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
  });

  if (!user?.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return { id: user.id, email: user.email };
}
