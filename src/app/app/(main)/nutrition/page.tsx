import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { NutritionDashboard } from "@/components/nutrition/NutritionDashboard";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getNutritionDashboard } from "@/services/nutrition/nutrition-service";
import { getRecoveryNutritionDeepLinkPrompt } from "@/services/mealnexio-deep-linking";

export const metadata: Metadata = {
  title: "Nutrition",
  robots: { index: false, follow: false },
};

export default async function NutritionPage() {
  const session = await requireSession();
  const dashboard = await getNutritionDashboard(session.user.id);
  const deepLinkPrompt = getRecoveryNutritionDeepLinkPrompt();

  if (!dashboard) {
    return (
      <AppPage
        eyebrow="Nutrition"
        title="Nutrition"
        description="Nutrition workflows integrate with Mealnexio.com when a real API sync ships."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before nutrition status is available."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Nutrition"
      title="Nutrition"
      description="Status, daily targets (when synced), and Mealnexio — never fabricated macros."
    >
      <NutritionDashboard view={dashboard} deepLinkPrompt={deepLinkPrompt} />
    </AppPage>
  );
}
