import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PerformanceStoryPanel } from "@/components/performance-story/PerformanceStoryPanel";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ButtonLink, EmptyState } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getPerformanceStory } from "@/services/performance-story";

export const metadata: Metadata = {
  title: "Performance Story",
  robots: { index: false, follow: false },
};

export default async function PerformanceStoryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const yearRaw = params.year ? Number(params.year) : undefined;
  const year =
    yearRaw != null && Number.isFinite(yearRaw) ? yearRaw : undefined;

  if (!featureFlags.performanceStory) {
    return (
      <AppPage
        eyebrow="Story"
        title="Performance Story"
        description="Long-term narrative from your training history."
      >
        <ComingSoon
          title="Performance Story"
          description="Yearly chapters from logged lifts, technique, and bodyweight — shareable, never causal fiction."
          reason="Set NEXT_PUBLIC_FF_PERFORMANCE_STORY=true to enable."
        />
      </AppPage>
    );
  }

  const view = await getPerformanceStory({
    userId: session.user.id,
    year,
  });

  if (!view) {
    return (
      <AppPage
        eyebrow="Story"
        title="Performance Story"
        description="Long-term narrative from your training history."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before a Performance Story can be built."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const y = Number(view.story.yearKey);
  const prev = y - 1;
  const next = y + 1;

  return (
    <AppPage
      eyebrow="Story"
      title="Performance Story"
      description="Turn your history into a long-term narrative — chronological facts only, never fake causal conclusions."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <ButtonLink
          href={`/app/performance-story?year=${prev}`}
          variant="secondary"
          size="sm"
        >
          {prev}
        </ButtonLink>
        <span className="font-medium text-[var(--color-foreground)]">
          {view.story.yearKey}
        </span>
        <ButtonLink
          href={`/app/performance-story?year=${next}`}
          variant="secondary"
          size="sm"
        >
          {next}
        </ButtonLink>
      </div>
      <PerformanceStoryPanel
        story={view.story}
        athleteDisplayName={view.athleteDisplayName}
        sharePath={view.sharePath}
      />
    </AppPage>
  );
}
