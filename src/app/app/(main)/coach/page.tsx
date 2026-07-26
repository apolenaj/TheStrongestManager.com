import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CoachDashboard } from "@/components/coach/CoachDashboard";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import {
  getCoachDashboard,
  getUserRoles,
} from "@/services/coach/coach-service";
import {
  formatEntitlementDenial,
  requireFeature,
} from "@/services/entitlements";

export const metadata: Metadata = {
  title: "Coach",
  robots: { index: false, follow: false },
};

export default async function CoachPage() {
  return (
    <FeatureGate
      flag="appCoach"
      title="Coach"
      description="Coach tools appear when this flag is enabled."
    >
      <CoachPageContent />
    </FeatureGate>
  );
}

async function CoachPageContent() {
  const session = await requireSession();
  const roles = await getUserRoles(session.user.id);

  if (!roles?.isCoach) {
    return (
      <AppPage
        eyebrow="Coach tools"
        title="Coach"
        description="Enable Coach Mode in Settings, then athletes can grant you access by email."
      >
        <EmptyState
          title="Coach Mode is off"
          description="Turn on Coach Mode from Settings. You will only see athletes who explicitly grant access — never browse profiles without a grant."
          action={
            <ButtonLink href="/app/settings">Open settings</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const coachToolsGate = await requireFeature(session.user.id, "coach_tools");
  if (!coachToolsGate.ok) {
    return (
      <AppPage
        eyebrow="Coach tools"
        title="Coach"
        description="Permissioned athlete overview."
      >
        <Alert tone="info" title="Plan limit">
          {formatEntitlementDenial(coachToolsGate)} Coach workspace is on Elite
          Coaching. Coach Mode alone does not unlock the paid workspace.
        </Alert>
        <EmptyState
          title="Coach workspace locked"
          description="Enable Coach Mode and use a plan that includes coach tools."
          action={
            <ButtonLink href="/pricing" variant="secondary">
              View pricing
            </ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const dashboard = await getCoachDashboard(session.user.id);
  if (!dashboard) {
    return (
      <AppPage
        eyebrow="Coach tools"
        title="Coach"
        description="Permissioned athlete overview."
      >
        <EmptyState
          title="Coach dashboard unavailable"
          description="Enable Coach Mode and ask athletes to grant access."
          action={
            <ButtonLink href="/app/settings">Open settings</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Coach tools"
      title="Coach dashboard"
      description="Prioritized attention queue, athlete roster, and recent activity — only for athletes who granted access."
    >
      <CoachDashboard view={dashboard} />
    </AppPage>
  );
}
