import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { TechniqueExpertDecideForm } from "@/components/technique-review/TechniqueExpertDecideForm";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { getTechniqueExpertReviewForExpert } from "@/services/technique-review";

type Props = { params: Promise<{ reviewId: string }> };

export const metadata: Metadata = {
  title: "Review technique analysis",
  robots: { index: false, follow: false },
};

export default async function TechniqueReviewDetailPage({ params }: Props) {
  const session = await requireSession();
  const { reviewId } = await params;
  const result = await getTechniqueExpertReviewForExpert({
    expertUserId: session.user.id,
    reviewId,
  });

  if (!result.ok) {
    notFound();
  }

  return (
    <FeatureGate
      flag="techniqueExpertReview"
      title="Technique expert review"
      description="Optional expert review of technique analyses is behind a feature flag."
    >
      <AppPage
        eyebrow="Expert review"
        title={result.detail.exerciseName ?? "Technique analysis"}
        description="AI analysis stays labeled AI until you Confirm, Correct, or Comment."
      >
        <TechniqueExpertDecideForm detail={result.detail} />
      </AppPage>
    </FeatureGate>
  );
}
