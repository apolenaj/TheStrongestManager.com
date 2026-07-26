import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { RecoveryDashboard } from "@/components/recovery/RecoveryDashboard";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getRecoveryDashboard } from "@/services/recovery/recovery-service";
import { getRecoveryNutritionDeepLinkPrompt } from "@/services/mealnexio-deep-linking";

export const metadata: Metadata = {
  title: "Recovery",
  robots: { index: false, follow: false },
};

export default async function RecoveryPage() {
  const session = await requireSession();
  const dashboard = await getRecoveryDashboard(session.user.id);
  const mealnexioPrompt = getRecoveryNutritionDeepLinkPrompt();

  if (!dashboard) {
    return (
      <AppPage
        eyebrow="Recovery"
        title="Recovery"
        description="Daily check-in and Recovery Readiness estimate. This product does not diagnose."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before recovery check-ins are available."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Recovery"
      title="Recovery"
      description="Fast daily check-in, Recovery Readiness estimate, trends, and training context — not medical accuracy."
    >
      <RecoveryDashboard view={dashboard} mealnexioPrompt={mealnexioPrompt} />
    </AppPage>
  );
}
