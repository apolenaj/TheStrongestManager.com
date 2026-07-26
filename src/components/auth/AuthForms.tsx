"use client";

import { useActionState } from "react";
import Link from "next/link";
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
        <Label htmlFor="signup-email">Email</Label>
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
        <Label htmlFor="signup-password">Password</Label>
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
          At least 8 characters. After sign-in you will complete athlete
          onboarding before the training app opens.
        </p>
      </div>
      {state.error ? (
        <Alert tone="danger" title="Could not create account" role="alert">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        Create account
      </Button>
      <p className="text-center text-sm text-[var(--color-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          Log in
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
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {resetSuccess ? (
        <Alert tone="success" title="Password updated">
          Sign in with your new password.
        </Alert>
      ) : null}
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <Alert tone="danger" title="Sign in failed" role="alert">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        Log in
      </Button>
      <p className="text-center text-sm text-[var(--color-muted)]">
        <Link
          href="/forgot-password"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
        {" · "}
        <Link
          href="/signup"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      {state.error ? (
        <Alert tone="danger" title="Request failed" role="alert">
          {state.error}
        </Alert>
      ) : null}
      {state.message ? (
        <Alert tone="success" title="Check your email">
          {state.message}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        Send reset link
      </Button>
      <p className="text-center text-sm text-[var(--color-muted)]">
        <Link
          href="/login"
          className="text-[var(--color-accent)] underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initial,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="reset-password">New password</Label>
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
        <Alert tone="danger" title="Reset failed" role="alert">
          {state.error}
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        Update password
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
  if (!googleEnabled && !appleEnabled) return null;

  return (
    <div className="space-y-3">
      <div className="relative py-2 text-center text-xs uppercase tracking-[0.2em] text-[var(--color-subtle)]">
        <span className="relative z-10 bg-[var(--color-background)] px-3">
          Or continue with
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
              Continue with Google
            </Button>
          </form>
        ) : null}
        {appleEnabled ? (
          <form action={appleSignInAction}>
            <Button type="submit" variant="secondary" className="w-full">
              Continue with Apple
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
