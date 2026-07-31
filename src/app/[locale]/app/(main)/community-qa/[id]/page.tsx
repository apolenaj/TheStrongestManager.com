import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CommunityQaDetail } from "@/components/community-qa/CommunityQaPanels";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getCommunityQuestionDetail } from "@/services/community-qa";

export const metadata: Metadata = {
  title: "Question",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function CommunityQaQuestionPage({ params }: Props) {
  const session = await requireSession();
  const { id } = await params;
  const detail = await getCommunityQuestionDetail(session.user.id, id);

  return (
    <FeatureGate
      flag="communityQa"
      title="Community Knowledge Q&A"
      description="Community Q&A is behind a feature flag."
    >
      <AppPage
        eyebrow="Community"
        title={detail?.title ?? "Question"}
        description="Human answers · voting · accepted answer · expert badge when verified."
      >
        {!detail ? (
          <EmptyState
            title="Question not found"
            description="It may be hidden, removed, or you need an athlete profile."
            action={
              <ButtonLink href="/app/community-qa">Back to Q&A</ButtonLink>
            }
          />
        ) : (
          <CommunityQaDetail detail={detail} />
        )}
      </AppPage>
    </FeatureGate>
  );
}
