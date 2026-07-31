import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { WeeklyAthleteReviewPanel } from "@/components/weekly-review/WeeklyAthleteReviewPanel";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getWeeklyAthleteReview } from "@/services/weekly-review";

export const metadata: Metadata = {
  title: "Weekly review",
  robots: { index: false, follow: false },
};

export default async function WeeklyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const view = await getWeeklyAthleteReview({
    userId: session.user.id,
    weekKey: params.week ?? null,
  });

  if (!view) {
    return (
      <AppPage
        eyebrow="Performance"
        title="Weekly review"
        description="Automatic weekly performance review appears after onboarding."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding so weekly reviews can use your real logs."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Performance"
      title="Weekly review"
      description="This week vs last — summaries, not raw dumps. Historical reviews stay on file."
    >
      <WeeklyAthleteReviewPanel
        review={view.review}
        previousReview={view.previousReview}
        history={view.history}
      />
    </AppPage>
  );
}
