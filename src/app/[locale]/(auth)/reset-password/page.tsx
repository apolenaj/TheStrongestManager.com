import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { ButtonLink } from "@/design-system";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return {
    title: t("reset.metaTitle"),
    robots: { index: false, follow: false },
  };
}

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const t = await getTranslations("Auth");
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        title={t("reset.invalidTitle")}
        description={t("reset.invalidDescription")}
      >
        <ButtonLink href="/forgot-password">{t("reset.requestNew")}</ButtonLink>
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          <Link
            href="/login"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            {t("reset.backToLogin")}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("reset.title")} description={t("reset.description")}>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
