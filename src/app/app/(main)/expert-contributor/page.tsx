import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ExpertContributorWorkspace } from "@/components/expert-contributor/ExpertContributorWorkspace";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { getExpertWorkspace } from "@/services/expert-contributor";

export const metadata: Metadata = {
  title: "Expert Contributor",
  robots: { index: false, follow: false },
};

export default async function ExpertContributorPage() {
  const session = await requireSession();
  const view = await getExpertWorkspace(session.user.id);

  return (
    <FeatureGate
      flag="expertContributor"
      title="Expert Contributor"
      description="Expert Contributor tools are behind a feature flag."
    >
      <AppPage
        eyebrow="Community"
        title="Expert Contributor"
        description="Coach, Verified Coach, and Expert Contributor roles — verification is explicit, never automatic."
      >
        <ExpertContributorWorkspace view={view} />
      </AppPage>
    </FeatureGate>
  );
}
