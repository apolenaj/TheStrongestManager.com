import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ProgramAiReviewPanel } from "@/components/program-review/ProgramAiReviewPanel";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getProgramAiReview } from "@/services/program-review";

export const metadata: Metadata = {
  title: "AI Program Review",
  robots: { index: false, follow: false },
};

export default async function ProgramReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ programId?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const view = await getProgramAiReview({
    userId: session.user.id,
    programId: params.programId ?? null,
    persist: false,
  });

  if (!view) {
    return (
      <AppPage
        eyebrow="Programming"
        title="AI Program Review"
        description="Analyze a training program against your goal, experience, schedule, equipment, and recovery."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before reviewing programs."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Programming"
      title="AI Program Review"
      description="Full program analysis with context — never a blanket “bad program” label. Nothing auto-applies."
      actions={
        <ButtonLink href="/app/programs" variant="secondary" size="lg">
          Programs
        </ButtonLink>
      }
    >
      <ProgramAiReviewPanel
        review={view.review}
        options={view.options}
        selectedProgramId={view.selectedProgramId}
        history={view.history}
        storedId={view.storedId}
      />
    </AppPage>
  );
}
