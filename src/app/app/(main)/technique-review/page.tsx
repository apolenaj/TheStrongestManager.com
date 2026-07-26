import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { TechniqueExpertReviewQueue } from "@/components/technique-review/TechniqueExpertReviewQueue";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { listPendingTechniqueExpertReviews } from "@/services/technique-review";
import { TECHNIQUE_REVIEW_HONESTY } from "@/domain/technique-review";

export const metadata: Metadata = {
  title: "Technique expert review",
  robots: { index: false, follow: false },
};

export default async function TechniqueReviewQueuePage() {
  const session = await requireSession();
  const result = await listPendingTechniqueExpertReviews({
    expertUserId: session.user.id,
  });

  return (
    <FeatureGate
      flag="techniqueExpertReview"
      title="Technique expert review"
      description="Optional expert review of technique analyses is behind a feature flag."
    >
      <AppPage
        eyebrow="Expert tools"
        title="Technique review queue"
        description="Confirm, correct, or comment on AI technique analyses. Never auto-retrains production models."
      >
        <TechniqueExpertReviewQueue
          items={result.ok ? result.items : []}
          honesty={result.ok ? result.honesty : TECHNIQUE_REVIEW_HONESTY}
          error={result.ok ? undefined : result.error}
        />
      </AppPage>
    </FeatureGate>
  );
}
