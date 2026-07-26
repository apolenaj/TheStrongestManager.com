import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { UniversalTimelinePanel } from "@/components/universal-timeline/UniversalTimelinePanel";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ButtonLink, EmptyState } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getUniversalTimeline } from "@/services/universal-timeline";
import { parseTimelineKindsParam } from "@/domain/universal-timeline";

export const metadata: Metadata = {
  title: "Timeline",
  robots: { index: false, follow: false },
};

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ kinds?: string | string[] }>;
}) {
  const session = await requireSession();
  const params = await searchParams;

  if (!featureFlags.universalTimeline) {
    return (
      <AppPage
        eyebrow="History"
        title="Timeline"
        description="Universal athlete history is not enabled yet."
      >
        <ComingSoon
          title="Universal timeline"
          description="Workout, PR, technique, program, competition, bodyweight, and coach-note history."
          reason="Set NEXT_PUBLIC_FF_UNIVERSAL_TIMELINE=true to enable."
        />
      </AppPage>
    );
  }

  const kinds = parseTimelineKindsParam(params.kinds);
  const view = await getUniversalTimeline({
    userId: session.user.id,
    kinds,
  });

  if (!view) {
    return (
      <AppPage
        eyebrow="History"
        title="Timeline"
        description="Your athlete history across training and coaching signals."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before timeline history is available."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="History"
      title="Timeline"
      description="Workouts, PRs, technique, program changes, competition, bodyweight milestones, and coach notes — filter what you need."
    >
      <UniversalTimelinePanel view={view} />
    </AppPage>
  );
}
