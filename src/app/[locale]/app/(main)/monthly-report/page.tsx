import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { MonthlyAthleteReportPanel } from "@/components/monthly-report/MonthlyAthleteReportPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getMonthlyAthleteReport } from "@/services/monthly-report";

type Props = { searchParams: Promise<{ month?: string }> };

export const metadata: Metadata = {
  title: "Monthly report",
  robots: { index: false, follow: false },
};

export default async function MonthlyReportPage({ searchParams }: Props) {
  const session = await requireSession();
  const params = await searchParams;
  const view = await getMonthlyAthleteReport({
    userId: session.user.id,
    monthKey: params.month,
  });

  return (
    <FeatureGate
      flag="monthlyPerformanceReport"
      title="Monthly report"
      description="Automatic monthly performance reports are behind a feature flag."
    >
      <AppPage
        eyebrow="Reports"
        title="Monthly performance report"
        description="Automatic month summary with archive and shareable public-safe highlights."
      >
        {!view ? (
          <Alert tone="warning" title="Unavailable">
            Athlete profile required to generate a monthly report.
          </Alert>
        ) : (
          <MonthlyAthleteReportPanel
            report={view.report}
            history={view.history}
            previousHeadline={view.previousReport?.headline ?? null}
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}
