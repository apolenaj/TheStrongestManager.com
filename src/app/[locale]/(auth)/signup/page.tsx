import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  SignUpForm,
  SocialAuthButtons,
} from "@/components/auth/AuthForms";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { AffiliateDisclosureBanner } from "@/components/affiliate-system/AffiliateDisclosureBanner";
import {
  AFFILIATE_DISCLOSURE,
  AFFILIATE_DISCLOSURE_SHORT,
} from "@/domain/affiliate-system";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return {
    title: t("signup.metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string;
    aff?: string;
    utm_source?: string;
  }>;
}) {
  const t = await getTranslations("Auth");
  const params = await searchParams;
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  const appleEnabled = Boolean(
    process.env.APPLE_ID && process.env.APPLE_SECRET,
  );
  const referralCode =
    params.ref && /^[a-zA-Z0-9]{6,16}$/.test(params.ref) ? params.ref : null;
  const affiliateCode =
    params.aff && /^[a-zA-Z0-9]{6,20}$/.test(params.aff) ? params.aff : null;

  const inviteSource =
    params.utm_source === "referral_program"
      ? "referral"
      : params.utm_source === "technique_card"
        ? "technique"
        : params.utm_source === "affiliate_system"
          ? "affiliate"
          : referralCode
            ? "invite"
            : null;

  const inviteMessage =
    inviteSource === "referral"
      ? t("signup.inviteReferral")
      : inviteSource === "technique"
        ? t("signup.inviteTechnique")
        : t("signup.inviteDefault");

  return (
    <AuthShell
      title={t("signup.title")}
      description={t("signup.description")}
    >
      {affiliateCode ? (
        <div className="mb-4">
          <AffiliateDisclosureBanner
            lines={AFFILIATE_DISCLOSURE}
            short={AFFILIATE_DISCLOSURE_SHORT}
          />
        </div>
      ) : null}
      {referralCode ? (
        <p className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-muted)]">
          {inviteMessage}
        </p>
      ) : null}
      {affiliateCode && !referralCode ? (
        <p className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-muted)]">
          {t("signup.inviteAffiliate")}
        </p>
      ) : null}
      <AnalyticsBeacon name="signup_started" method="email" />
      <SignUpForm referralCode={referralCode} affiliateCode={affiliateCode} />
      <div className="mt-6">
        <SocialAuthButtons
          googleEnabled={googleEnabled}
          appleEnabled={appleEnabled}
        />
      </div>
    </AuthShell>
  );
}
