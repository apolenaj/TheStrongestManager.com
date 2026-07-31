import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ReferralHubPanel } from "@/components/referral-program/ReferralHubPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { REFERRAL_HONESTY } from "@/domain/referral-program";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getReferralProgramView } from "@/services/referral-program";

export const metadata: Metadata = {
  title: "Referrals",
  robots: { index: false, follow: false },
};

export default async function ReferralPage() {
  const session = await requireSession();

  if (!featureFlags.referralProgram) {
    return (
      <AppPage
        eyebrow="Growth"
        title="Referrals"
        description="Invite friends with a personal code — single-level only."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_REFERRAL_PROGRAM.
        </Alert>
      </AppPage>
    );
  }

  const result = await getReferralProgramView({ userId: session.user.id });

  return (
    <FeatureGate
      flag="referralProgram"
      title="Referrals"
      description="Referral Program is behind a feature flag."
    >
      <AppPage
        eyebrow="Growth"
        title="Referrals"
        description={REFERRAL_HONESTY[0]}
      >
        {result.ok ? (
          <ReferralHubPanel view={result.view} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
