import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { HumanAnalysisExpertOrderPanel } from "@/components/human-analysis/HumanAnalysisExpertQueue";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { getHumanAnalysisOrderForExpert } from "@/services/human-analysis";

type Props = { params: Promise<{ orderId: string }> };

export const metadata: Metadata = {
  title: "Paid order review",
  robots: { index: false, follow: false },
};

export default async function HumanAnalysisExpertOrderPage({ params }: Props) {
  const session = await requireSession();
  const { orderId } = await params;
  const result = await getHumanAnalysisOrderForExpert({
    expertUserId: session.user.id,
    orderId,
  });

  if (!result.ok) notFound();

  return (
    <FeatureGate
      flag="humanAnalysisProduct"
      title="Paid order review"
      description="Paid Expert Technique Review is behind a feature flag."
    >
      <AppPage
        eyebrow="Expert review"
        title={result.order.productName}
        description="Deliver a written expert report — not an AI label."
      >
        <HumanAnalysisExpertOrderPanel order={result.order} />
      </AppPage>
    </FeatureGate>
  );
}
