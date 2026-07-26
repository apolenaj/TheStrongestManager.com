import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { ButtonLink } from "@/design-system";

export const metadata: Metadata = {
  title: "Choose new password",
  robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        title="Invalid reset link"
        description="This password reset link is missing a token. Request a new link from the login page."
      >
        <ButtonLink href="/forgot-password">Request new link</ButtonLink>
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          <Link
            href="/login"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Enter a new password for your account. You will sign in afterward."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
