import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { HumanAnalysisExpertQueue } from "@/components/human-analysis/HumanAnalysisExpertQueue";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { HUMAN_ANALYSIS_HONESTY } from "@/domain/human-analysis";
import { requireSession } from "@/services/auth/session";
import { listQueuedHumanAnalysisOrders } from "@/services/human-analysis";

export const metadata: Metadata = {
  title: "Paid expert queue",
  robots: { index: false, follow: false },
};

export default async function HumanAnalysisExpertQueuePage() {
  const session = await requireSession();
  const result = await listQueuedHumanAnalysisOrders({
    expertUserId: session.user.id,
  });

  return (
    <FeatureGate
      flag="humanAnalysisProduct"
      title="Paid expert queue"
      description="Paid Expert Technique Review queue is behind a feature flag."
    >
      <AppPage
        eyebrow="Expert tools"
        title="Paid Expert Technique Review"
        description="Claim queued paid orders and deliver expert reports."
      >
        <HumanAnalysisExpertQueue
          items={result.ok ? result.items : []}
          honesty={result.ok ? result.honesty : HUMAN_ANALYSIS_HONESTY}
          capacityMessage={
            result.ok
              ? result.capacityMessage
              : "Verified Expert Contributor access required."
          }
          error={result.ok ? undefined : result.error}
        />
      </AppPage>
    </FeatureGate>
  );
}
