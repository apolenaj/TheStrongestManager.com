import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getLiveCompetitionMeetDay } from "@/services/live-competition-mode";

export const metadata: Metadata = {
  title: "Live Competition",
  robots: { index: false, follow: false },
};

export default async function LiveCompetitionPage() {
  await requireSession();

  if (!featureFlags.liveCompetitionMode) {
    return (
      <AppPage
        eyebrow="Meet day"
        title="Live Competition"
        description="Track attempts, results, next attempt, and warm-up timing — offline-friendly."
      >
        <ComingSoon
          title="Live Competition"
          description="Meet-day architecture is not enabled."
          reason="Set NEXT_PUBLIC_FF_LIVE_COMPETITION_MODE=true to preview the contract."
        />
      </AppPage>
    );
  }

  const meetDay = getLiveCompetitionMeetDay();

  return (
    <AppPage
      eyebrow="Meet day"
      title="Live Competition"
      description="Future meet-day tracker — architecture ready; runtime not launched. Never unsafe load or cut instructions."
    >
      <ComingSoon
        title="Meet-day tracking not launched"
        description={meetDay.honesty}
        reason={
          meetDay.runtimeEnabled
            ? "Runtime flag is on, but persistence is not shipped — no invented attempts."
            : "Enable NEXT_PUBLIC_FF_LIVE_COMPETITION_RUNTIME only when ready to ship offline sync and safety review. Warm-up timing stays clocks-only."
        }
      />
      <p className="mt-6 text-sm text-[var(--color-muted)]">
        Prep for a meet still lives on Competition Mode. Attempt sketches:{" "}
        <ButtonLink href="/app/competition" variant="secondary">
          Competition Mode
        </ButtonLink>{" "}
        <ButtonLink href="/app/attempt-selector" variant="secondary">
          Attempt selector
        </ButtonLink>
      </p>
    </AppPage>
  );
}
