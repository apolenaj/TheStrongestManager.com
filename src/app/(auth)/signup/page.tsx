import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string;
    aff?: string;
    utm_source?: string;
  }>;
}) {
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

  return (
    <AuthShell
      title="Create account"
      description="Email and password create the account only. Athlete onboarding is required next inside the app before training tools open — it is not skipped."
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
          {inviteSource === "referral"
            ? "You were invited with a referral code. Completing onboarding may unlock product rewards for you and your inviter — never cash or multi-level payouts."
            : inviteSource === "technique"
              ? "You were invited via a technique score card share. After signup, open Technique to analyze your lift."
              : "You arrived with an invite code. After signup, complete athlete onboarding inside the app."}
        </p>
      ) : null}
      {affiliateCode && !referralCode ? (
        <p className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-muted)]">
          You arrived via a disclosed affiliate link. Signup may be attributed
          for commission tracking — ledger estimates only, not a payout promise.
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
