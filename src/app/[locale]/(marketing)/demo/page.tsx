import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import {
  DemoBanner,
  DemoModeNav,
} from "@/components/demo/DemoChrome";
import { PerformanceDashboard } from "@/components/dashboard/PerformanceDashboard";
import { Badge, ButtonLink, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import { DEMO_MODE_LABEL } from "@/domain/demo";
import {
  getDemoDashboard,
  isDemoModeEnabled,
} from "@/services/demo/demo-service";

export const metadata: Metadata = {
  title: "Demo Mode — example dashboard",
  description:
    "Explore an example The Strongest dashboard with clearly labeled demo athlete data.",
  robots: { index: false, follow: false },
};

export default async function DemoDashboardPage() {
  if (!isDemoModeEnabled()) notFound();

  const { view, source } = await getDemoDashboard();

  return (
    <div className="min-w-0">
      <DemoBanner source={source} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <AppPage
          eyebrow="Demo Mode"
          title="Example athlete dashboard"
          description={`${DEMO_MODE_LABEL} · Interactive walkthrough for sales, screenshots, recruiting, and investor demos.`}
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge variant="warning">{DEMO_MODE_LABEL}</Badge>
              <Badge variant="neutral">
                {source === "seeded" ? "Seeded data" : "Fixture data"}
              </Badge>
            </div>
          }
        >
          <DemoModeNav active="dashboard" />
          <PerformanceDashboard data={view} />
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ready for your own data?</CardTitle>
              <CardDescription>
                Create a free account. Production profiles start empty — they
                never inherit these demo statistics.
              </CardDescription>
            </CardHeader>
            <ButtonLink href="/signup">Start free</ButtonLink>
          </Card>
        </AppPage>
      </div>
    </div>
  );
}
