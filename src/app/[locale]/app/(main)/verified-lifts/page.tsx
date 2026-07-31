import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import {
  VerifiedLiftClaimForm,
  VerifiedLiftClaimsList,
} from "@/components/verified-lift/VerifiedLiftPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, Card, CardDescription, CardHeader, CardTitle, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getVerifiedLiftPage } from "@/services/verified-lift";

export const metadata: Metadata = {
  title: "Verified lifts",
  robots: { index: false, follow: false },
};

export default async function VerifiedLiftsPage() {
  const session = await requireSession();
  const view = await getVerifiedLiftPage(session.user.id);

  return (
    <FeatureGate
      flag="verifiedLifts"
      title="Verified Lift System"
      description="Lift verification is behind a feature flag."
    >
      <AppPage
        eyebrow="Performance"
        title="Verified lifts"
        description="Self-reported, video submitted, or competition verified — never “officially verified” unless criteria are met."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before logging lift claims."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Honesty</CardTitle>
                <CardDescription>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {view.honesty.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </CardDescription>
              </CardHeader>
            </Card>

            <VerifiedLiftClaimForm techniqueOptions={view.techniqueOptions} />
            <VerifiedLiftClaimsList claims={view.claims} />
          </div>
        )}
      </AppPage>
    </FeatureGate>
  );
}
