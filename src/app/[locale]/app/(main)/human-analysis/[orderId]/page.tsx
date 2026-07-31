import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { HumanAnalysisOrderStatus } from "@/components/human-analysis/HumanAnalysisOrderStatus";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { getHumanAnalysisOrderForAthlete } from "@/services/human-analysis";

type Props = { params: Promise<{ orderId: string }> };

export const metadata: Metadata = {
  title: "Review order status",
  robots: { index: false, follow: false },
};

export default async function HumanAnalysisOrderPage({ params }: Props) {
  const session = await requireSession();
  const { orderId } = await params;
  const result = await getHumanAnalysisOrderForAthlete({
    userId: session.user.id,
    orderId,
  });

  if (!result.ok) notFound();

  return (
    <FeatureGate
      flag="humanAnalysisProduct"
      title="Expert Technique Review"
      description="Paid expert technique review products are behind a feature flag."
    >
      <AppPage
        eyebrow="Order status"
        title={result.order.productName}
        description="Track Purchase → Upload → Queue → Expert review → Report."
      >
        <HumanAnalysisOrderStatus
          order={result.order}
          capacityMessage={result.capacity.athleteMessage}
          turnaroundPromise={result.turnaroundPromise}
          honesty={result.honesty}
          isDevelopment={process.env.NODE_ENV === "development"}
        />
      </AppPage>
    </FeatureGate>
  );
}
