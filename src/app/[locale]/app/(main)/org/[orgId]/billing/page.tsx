import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { OrgBillingPanel } from "@/components/org/OrgBillingPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { getOrgBillingView } from "@/services/org/org-billing-service";

type PageProps = {
  params: Promise<{ orgId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Organization billing",
    robots: { index: false, follow: false },
  };
}

export default async function OrgBillingPage({ params }: PageProps) {
  return (
    <FeatureGate
      flag="orgBilling"
      title="Organization billing"
      description="B2B organization billing appears when this flag is enabled."
    >
      <OrgBillingContent params={params} />
    </FeatureGate>
  );
}

async function OrgBillingContent({ params }: PageProps) {
  const session = await requireSession();
  const { orgId } = await params;
  const result = await getOrgBillingView({
    userId: session.user.id,
    organizationId: orgId,
  });

  if (!result.ok) {
    notFound();
  }

  return (
    <AppPage
      eyebrow="Organization billing"
      title={result.view.organization.name}
      description="Seats, usage limits, features, and upgrade paths — B2B prices only when published."
    >
      <OrgBillingPanel view={result.view} />
    </AppPage>
  );
}
