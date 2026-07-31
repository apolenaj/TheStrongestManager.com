import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { HumanAnalysisCatalog } from "@/components/human-analysis/HumanAnalysisCatalog";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { getHumanAnalysisAthleteHome } from "@/services/human-analysis";

export const metadata: Metadata = {
  title: "Expert Technique Review",
  robots: { index: false, follow: false },
};

export default async function HumanAnalysisPage() {
  const session = await requireSession();
  const home = await getHumanAnalysisAthleteHome(session.user.id);

  return (
    <FeatureGate
      flag="humanAnalysisProduct"
      title="Expert Technique Review"
      description="Paid expert technique review products are behind a feature flag."
    >
      <AppPage
        eyebrow="Premium"
        title="Expert Technique Review"
        description="Purchase → Upload → Queue → Expert review → Report. Status tracking without invented turnaround times."
      >
        <HumanAnalysisCatalog
          catalog={home.catalog}
          honesty={home.honesty}
          capacityMessage={home.capacity.athleteMessage}
          turnaroundPromise={home.turnaroundPromise}
          checkoutReady={home.checkoutReady}
          orders={home.orders.map((o) => ({
            id: o.id,
            productName: o.productName,
            statusLabel: o.statusLabel,
            status: o.status,
          }))}
        />
      </AppPage>
    </FeatureGate>
  );
}
