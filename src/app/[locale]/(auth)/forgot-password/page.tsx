import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      description="We will email a reset link if an account with that address exists. Links expire after one hour."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
