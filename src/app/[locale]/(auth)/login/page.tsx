import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  LoginForm,
  SocialAuthButtons,
} from "@/components/auth/AuthForms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return {
    title: t("login.metaTitle"),
    robots: { index: false, follow: false },
  };
}

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const t = await getTranslations("Auth");
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl &&
    params.callbackUrl.startsWith("/") &&
    !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : "/app";

  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const appleEnabled = Boolean(
    process.env.APPLE_ID && process.env.APPLE_SECRET,
  );

  return (
    <AuthShell title={t("login.title")} description={t("login.description")}>
      <LoginForm
        callbackUrl={callbackUrl}
        resetSuccess={params.reset === "1"}
      />
      <div className="mt-6">
        <SocialAuthButtons
          googleEnabled={googleEnabled}
          appleEnabled={appleEnabled}
        />
      </div>
    </AuthShell>
  );
}
