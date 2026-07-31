"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Alert,
  Button,
  Input,
  Label,
} from "@/design-system";
import {
  appleSignInAction,
  forgotPasswordAction,
  googleSignInAction,
  loginAction,
  resetPasswordAction,
  signUpAction,
} from "@/services/auth/actions";
import type { ActionState } from "@/services/auth/actions";

const initial: ActionState = { ok: false };

export function SignUpForm({
  referralCode,
  affiliateCode,
}: {
  referralCode?: string | null;
  affiliateCode?: string | null;
}) {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(signUpAction, initial);

  return (
    <form action={action} className="space-y-4">
      {referralCode ? (
        <input type="hidden" name="referralCode" value={referralCode} />
      ) : null}
      {affiliateCode ? (
        <input type="hidden" name="affiliateCode" value={affiliateCode} />
      ) : null}
      <div>
        <Label htmlFor="signup-email">{t("fields.email")}</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </div>
      <div>
        <Label htmlFor="signup-password">{t("fields.password")}</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
        />
        <p className="mt-1.5 text-xs text-[var(--color-muted)]">
          {t("signup.passwordHint")}
        </p>
      </div>
      {state.error ? (
        <Alert tone="danger" title={t("signup.errorTitle")} role="alert">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        {t("signup.submit")}
      </Button>
      <p className="text-center text-sm text-[var(--color-muted)]">
        {t("signup.haveAccount")}{" "}
        <Link
          href="/login"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          {t("signup.logIn")}
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({
  callbackUrl,
  resetSuccess,
}: {
  callbackUrl: string;
  resetSuccess?: boolean;
}) {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {resetSuccess ? (
        <Alert tone="success" title={t("login.resetSuccessTitle")}>
          {t("login.resetSuccessBody")}
        </Alert>
      ) : null}
      <div>
        <Label htmlFor="login-email">{t("fields.email")}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="login-password">{t("fields.password")}</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <Alert tone="danger" title={t("login.errorTitle")} role="alert">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        {t("login.submit")}
      </Button>
      <p className="text-center text-sm text-[var(--color-muted)]">
        <Link
          href="/forgot-password"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          {t("login.forgot")}
        </Link>
        {" · "}
        <Link
          href="/signup"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          {t("login.create")}
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="forgot-email">{t("fields.email")}</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      {state.error ? (
        <Alert tone="danger" title={t("forgot.errorTitle")} role="alert">
          {state.error}
        </Alert>
      ) : null}
      {state.message ? (
        <Alert tone="success" title={t("forgot.successTitle")}>
          {state.message}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        {t("forgot.submit")}
      </Button>
      <p className="text-center text-sm text-[var(--color-muted)]">
        <Link
          href="/login"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          {t("forgot.back")}
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="reset-password">{t("fields.newPassword")}</Label>
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
        />
      </div>
      {state.error ? (
        <Alert tone="danger" title={t("reset.errorTitle")} role="alert">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        {t("reset.submit")}
      </Button>
    </form>
  );
}

export function SocialAuthButtons({
  googleEnabled,
  appleEnabled,
}: {
  googleEnabled: boolean;
  appleEnabled: boolean;
}) {
  const t = useTranslations("Auth");

  if (!googleEnabled && !appleEnabled) return null;

  return (
    <div className="space-y-3">
      <div className="relative py-2 text-center text-xs uppercase tracking-[0.2em] text-[var(--color-subtle)]">
        <span className="relative z-10 bg-[var(--color-background)] px-3">
          {t("social.divider")}
        </span>
        <span
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-border)]"
        />
      </div>
      <div className="grid gap-2">
        {googleEnabled ? (
          <form action={googleSignInAction}>
            <Button type="submit" variant="secondary" className="w-full">
              {t("social.google")}
            </Button>
          </form>
        ) : null}
        {appleEnabled ? (
          <form action={appleSignInAction}>
            <Button type="submit" variant="secondary" className="w-full">
              {t("social.apple")}
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
