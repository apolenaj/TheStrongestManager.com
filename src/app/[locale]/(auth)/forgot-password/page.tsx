import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return {
    title: t("forgot.metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthShell title={t("forgot.title")} description={t("forgot.description")}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
