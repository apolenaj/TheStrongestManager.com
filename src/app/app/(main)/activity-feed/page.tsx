import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ActivityFeedPanel } from "@/components/activity-feed/ActivityFeedPanel";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { EmptyState } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getActivityFeed } from "@/services/activity-feed";

export const metadata: Metadata = {
  title: "Activity feed",
  robots: { index: false, follow: false },
};

export default async function ActivityFeedPage() {
  const session = await requireSession();

  if (!featureFlags.activityFeedMvp) {
    return (
      <AppPage
        eyebrow="Milestones"
        title="Activity feed"
        description="Optional PRs, competition results, achievements, and shared technique."
      >
        <ComingSoon
          title="Activity feed"
          description="Optional milestone feed with visibility controls."
          reason="Set NEXT_PUBLIC_FF_ACTIVITY_FEED_MVP=true to enable."
        />
      </AppPage>
    );
  }

  const view = await getActivityFeed({ userId: session.user.id });

  if (!view) {
    return (
      <AppPage
        eyebrow="Milestones"
        title="Activity feed"
        description="Optional PRs, competition results, achievements, and shared technique."
      >
        <EmptyState
          title="No athlete profile"
          description="Finish onboarding so milestones can appear when you log them."
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Milestones"
      title="Activity feed"
      description="Optional, finite milestones — you control visibility. No endless engagement loops."
    >
      <ActivityFeedPanel view={view} />
    </AppPage>
  );
}
