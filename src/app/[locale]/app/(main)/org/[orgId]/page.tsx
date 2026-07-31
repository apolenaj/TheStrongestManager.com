import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { OrgDashboardPanel } from "@/components/org/OrgDashboardPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getOrgDashboard } from "@/services/org/org-service";

type PageProps = {
  params: Promise<{ orgId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Organization",
    robots: { index: false, follow: false },
  };
}

export default async function OrgDetailPage({ params }: PageProps) {
  return (
    <FeatureGate
      flag="gymTeamDashboard"
      title="Gym / team dashboard"
      description="Organization tools appear when this flag is enabled."
    >
      <OrgDetailContent params={params} />
    </FeatureGate>
  );
}

async function OrgDetailContent({ params }: PageProps) {
  const session = await requireSession();
  const { orgId } = await params;
  const result = await getOrgDashboard({
    userId: session.user.id,
    organizationId: orgId,
  });

  if (!result.ok) {
    notFound();
  }

  return (
    <AppPage
      eyebrow="Organization"
      title={result.view.organization.name}
      description={`${result.view.organization.kindLabel} · Aggregate analytics for opted-in athletes only.`}
    >
      <div className="mb-6">
        <ButtonLink href="/app/org" variant="secondary" size="sm">
          All organizations
        </ButtonLink>
      </div>
      <OrgDashboardPanel view={result.view} />
    </AppPage>
  );
}
