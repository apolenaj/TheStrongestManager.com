import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PerformanceDashboard } from "@/components/dashboard/PerformanceDashboard";
import { CommandCenter } from "@/components/command-center/CommandCenter";
import { ButtonLink, EmptyState } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getPerformanceDashboard } from "@/services/dashboard/dashboard-service";
import { getAthleteState } from "@/services/performance-intelligence";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await requireSession();
  const [dashboard, athleteState] = await Promise.all([
    getPerformanceDashboard(session.user.id),
    getAthleteState(session.user.id),
  ]);

  if (!dashboard) {
    return (
      <AppPage
        title="Dashboard"
        description="Your performance home. Complete onboarding to start building an athlete profile."
      >
        <EmptyState
          title="No athlete profile yet"
          description="The dashboard stays empty until onboarding creates your profile — no demo scores are shown."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const useCommandCenter = featureFlags.commandCenter;

  const subtitle = dashboard.isNewAthlete
    ? `First session — ${dashboard.firstSession.completedCount} of ${dashboard.firstSession.totalCount} setup steps done. No empty score wall.`
    : [
        dashboard.goalTitle ? `Focus: ${dashboard.goalTitle}` : null,
        dashboard.discipline ? `Discipline: ${dashboard.discipline}` : null,
        dashboard.experienceLevel
          ? `Level: ${dashboard.experienceLevel}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ") ||
      "Status and next actions from your logged training signals.";

  return (
    <AppPage
      eyebrow={useCommandCenter ? "Command Center" : "Dashboard"}
      title={
        dashboard.isNewAthlete
          ? "Get your first win"
          : useCommandCenter
            ? `${dashboard.greetingName}'s Command Center`
            : `${dashboard.greetingName}'s dashboard`
      }
      description={
        useCommandCenter
          ? "TODAY above the fold — Performance through AI Coach below. Customize widgets anytime."
          : subtitle
      }
    >
      {useCommandCenter ? (
        <CommandCenter data={dashboard} athleteState={athleteState} />
      ) : (
        <PerformanceDashboard data={dashboard} athleteState={athleteState} />
      )}
    </AppPage>
  );
}
