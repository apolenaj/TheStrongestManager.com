import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { OrgListPanel } from "@/components/org/OrgListPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { listOrganizationsForUser } from "@/services/org/org-service";

export const metadata: Metadata = {
  title: "Organizations",
  robots: { index: false, follow: false },
};

export default async function OrgIndexPage() {
  return (
    <FeatureGate
      flag="gymTeamDashboard"
      title="Gym / team dashboard"
      description="Organization tools appear when this flag is enabled."
    >
      <OrgIndexContent />
    </FeatureGate>
  );
}

async function OrgIndexContent() {
  const session = await requireSession();
  const orgs = await listOrganizationsForUser(session.user.id);

  return (
    <AppPage
      eyebrow="Organizations"
      title="Gyms & teams"
      description="Organization structure, coaches, athletes, and aggregate training analytics — never a bypass of private athlete data."
    >
      <OrgListPanel orgs={orgs} />
    </AppPage>
  );
}
