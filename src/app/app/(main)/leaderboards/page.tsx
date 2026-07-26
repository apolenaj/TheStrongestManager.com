import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { LeaderboardBoardPanel } from "@/components/leaderboard/LeaderboardBoardPanel";
import { LeaderboardOptInForm } from "@/components/leaderboard/LeaderboardOptInForm";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getLeaderboardPage } from "@/services/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboards",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    category?: string;
    country?: string;
    sport?: string;
    classKg?: string;
    verification?: string;
  }>;
};

export default async function LeaderboardsPage({ searchParams }: Props) {
  const session = await requireSession();
  const params = await searchParams;
  const view = await getLeaderboardPage(session.user.id, params);

  return (
    <FeatureGate
      flag="leaderboards"
      title="Leaderboards"
      description="Opt-in leaderboards are behind a feature flag."
    >
      <AppPage
        eyebrow="Community"
        title="Leaderboards"
        description="Opt-in boards for lifts, rep PRs, technique improvement, and consistency — never fake ranks, never recovery or weight-loss races."
      >
        {!view ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding before joining leaderboards."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-8">
            <LeaderboardOptInForm settings={view.optIn} />
            <LeaderboardBoardPanel
              board={view.board}
              category={view.category}
              filters={view.filters}
            />
          </div>
        )}
      </AppPage>
    </FeatureGate>
  );
}
