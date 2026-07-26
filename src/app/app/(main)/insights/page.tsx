import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { InsightsPanel } from "@/components/insights/InsightsPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getCrossDomainInsights } from "@/services/insights/insights-service";
import {
  formatEntitlementDenial,
  requireFeature,
} from "@/services/entitlements";

export const metadata: Metadata = {
  title: "Insights",
  robots: { index: false, follow: false },
};

export default async function InsightsPage() {
  return (
    <FeatureGate
      flag="appInsights"
      title="Insights"
      description="Cross-domain insights combining training, recovery, nutrition, and body metrics."
    >
      <InsightsPageContent />
    </FeatureGate>
  );
}

async function InsightsPageContent() {
  const session = await requireSession();

  const insightsGate = await requireFeature(
    session.user.id,
    "advanced_analytics",
  );
  if (!insightsGate.ok) {
    return (
      <AppPage
        eyebrow="Insights"
        title="Insights"
        description="Cross-domain patterns across training, recovery, nutrition, and body metrics."
      >
        <Alert tone="info" title="Plan limit">
          {formatEntitlementDenial(insightsGate)} Advanced insights are on
          Performance and Elite Coaching.
        </Alert>
        <EmptyState
          title="Advanced insights locked"
          description="We do not invent cross-domain insight charts on plans without this entitlement."
          action={
            <ButtonLink href="/pricing" variant="secondary">
              View pricing
            </ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const view = await getCrossDomainInsights(session.user.id);

  if (!view) {
    return (
      <AppPage
        eyebrow="Insights"
        title="Insights"
        description="Cross-domain patterns across training, recovery, nutrition, and body metrics."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before insights can run."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Insights"
      title="Cross-domain insights"
      description="Evidence-backed suggestions with confidence and a clear next action — never automatic calorie prescriptions without nutrition data."
    >
      <InsightsPanel view={view} />
    </AppPage>
  );
}
