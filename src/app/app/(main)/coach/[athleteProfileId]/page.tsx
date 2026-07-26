import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { CoachAiCopilotPanel } from "@/components/coach/CoachAiCopilotPanel";
import { CoachAthleteWorkspace } from "@/components/coach/CoachAthleteWorkspace";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getCoachAiCopilotPanel } from "@/services/coach-ai/coach-ai-service";
import { getCoachAthleteWorkspace } from "@/services/coach/coach-athlete-service";
import { getUserRoles } from "@/services/coach/coach-service";

type PageProps = {
  params: Promise<{ athleteProfileId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Coach athlete",
    robots: { index: false, follow: false },
  };
}

export default async function CoachAthletePage({ params }: PageProps) {
  return (
    <FeatureGate
      flag="appCoach"
      title="Coach"
      description="Coach tools appear when this flag is enabled."
    >
      <CoachAthletePageContent params={params} />
    </FeatureGate>
  );
}

async function CoachAthletePageContent({ params }: PageProps) {
  const session = await requireSession();
  const { athleteProfileId } = await params;
  const roles = await getUserRoles(session.user.id);

  if (!roles?.isCoach) {
    notFound();
  }

  const result = await getCoachAthleteWorkspace({
    coachUserId: session.user.id,
    athleteProfileId,
  });

  if (!result.ok) {
    notFound();
  }

  const aiCopilot = featureFlags.coachAiCopilot
    ? await getCoachAiCopilotPanel({
        coachUserId: session.user.id,
        athleteProfileId,
      })
    : null;

  return (
    <AppPage
      eyebrow="Coach tools"
      title={result.view.displayName}
      description={
        result.view.discipline
          ? `${result.view.discipline} · Permissioned athlete workspace`
          : "Permissioned athlete workspace — scoped by grant."
      }
    >
      <div className="space-y-10">
        <CoachAthleteWorkspace
          view={result.view}
          showAiCopilotNav={Boolean(aiCopilot?.ok)}
        />
        {aiCopilot?.ok ? (
          <CoachAiCopilotPanel
            athleteProfileId={athleteProfileId}
            view={aiCopilot.view}
          />
        ) : null}
      </div>
    </AppPage>
  );
}
