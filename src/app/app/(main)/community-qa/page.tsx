import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CommunityQaIndex } from "@/components/community-qa/CommunityQaPanels";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { requireSession } from "@/services/auth/session";
import { listCommunityQuestions } from "@/services/community-qa";

export const metadata: Metadata = {
  title: "Community Q&A",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CommunityQaPage({ searchParams }: Props) {
  await requireSession();
  const params = await searchParams;
  const view = await listCommunityQuestions(params.category);

  return (
    <FeatureGate
      flag="communityQa"
      title="Community Knowledge Q&A"
      description="Community Q&A is behind a feature flag."
    >
      <AppPage
        eyebrow="Community"
        title="Knowledge Q&A"
        description="Technique, programming, sports, nutrition, and recovery — human answers, optional AI summaries."
      >
        <CommunityQaIndex view={view} />
      </AppPage>
    </FeatureGate>
  );
}
