"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { getRequestClientKey } from "@/lib/request-client-key";
import {
  deleteUserAccount,
  registerWithEmailPassword,
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/services/auth/account-service";
import {
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/services/auth/schemas";
import { requireSession } from "@/services/auth/session";

export type ActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limited = rateLimit(
    await getRequestClientKey("signup"),
    RATE_LIMITS.signup,
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many signup attempts. Try again in ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const referralRaw = String(formData.get("referralCode") ?? "").trim();
  const referralCode =
    referralRaw && /^[a-zA-Z0-9]{6,16}$/.test(referralRaw)
      ? referralRaw
      : null;

  const affiliateRaw = String(formData.get("affiliateCode") ?? "").trim();
  const affiliateCode =
    affiliateRaw && /^[a-zA-Z0-9]{6,20}$/.test(affiliateRaw)
      ? affiliateRaw
      : null;

  const result = await registerWithEmailPassword(
    parsed.data.email,
    parsed.data.password,
    { referralCode, affiliateCode },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/app",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error: "Account created, but sign-in failed. Try logging in.",
      };
    }
    throw error;
  }

  return { ok: true };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limited = rateLimit(
    await getRequestClientKey("login"),
    RATE_LIMITS.login,
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many login attempts. Try again in ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email or password.",
    };
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "/app");
  const safeCallback =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/app";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallback,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error: "Invalid email or password.",
      };
    }
    throw error;
  }

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limited = rateLimit(
    await getRequestClientKey("forgot"),
    RATE_LIMITS.forgotPassword,
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many reset requests. Try again in ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  await requestPasswordReset(parsed.data.email);

  return {
    ok: true,
    message:
      "If an account exists for that email, password reset instructions were sent.",
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limited = rateLimit(
    await getRequestClientKey("reset"),
    RATE_LIMITS.resetPassword,
  );
  if (!limited.ok) {
    return {
      ok: false,
      error: `Too many reset attempts. Try again in ${limited.retryAfterSeconds}s.`,
    };
  }

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const result = await resetPasswordWithToken(
    parsed.data.token,
    parsed.data.password,
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  redirect("/login?reset=1");
}

export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = deleteAccountSchema.safeParse({
    confirmation: formData.get("confirmation"),
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid confirmation",
    };
  }

  const result = await deleteUserAccount({
    userId: session.user.id,
    password: parsed.data.password,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  await signOut({ redirectTo: "/?deleted=1" });
  return { ok: true };
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/app" });
}

export async function appleSignInAction() {
  await signIn("apple", { redirectTo: "/app" });
}
