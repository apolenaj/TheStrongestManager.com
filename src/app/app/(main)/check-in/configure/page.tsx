import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CoachCheckInConfigPanel } from "@/components/check-in-system/CoachCheckInConfigPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { CHECK_IN_HONESTY } from "@/domain/check-in-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getCoachCheckInConfig } from "@/services/check-in-system";
import { getCoachDashboard, getUserRoles } from "@/services/coach/coach-service";

export const metadata: Metadata = {
  title: "Configure check-in",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ athlete?: string }>;
};

export default async function CheckInConfigurePage({ searchParams }: PageProps) {
  const session = await requireSession();
  const params = await searchParams;

  if (!featureFlags.checkInSystem) {
    return (
      <AppPage
        eyebrow="Coach"
        title="Configure check-in"
        description="Choose which weekly questions athletes see."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_CHECK_IN_SYSTEM.
        </Alert>
      </AppPage>
    );
  }

  const roles = await getUserRoles(session.user.id);
  if (!roles?.isCoach) {
    return (
      <FeatureGate
        flag="checkInSystem"
        title="Configure check-in"
        description="Coach configuration for weekly check-ins."
      >
        <AppPage
          eyebrow="Coach"
          title="Configure check-in"
          description={CHECK_IN_HONESTY[2]}
        >
          <EmptyState
            title="Coach Mode required"
            description="Enable Coach Mode to configure athlete check-in questions."
            action={<ButtonLink href="/app/settings">Open settings</ButtonLink>}
          />
        </AppPage>
      </FeatureGate>
    );
  }

  const athleteProfileId = params.athlete?.trim() || null;

  return (
    <FeatureGate
      flag="checkInSystem"
      title="Configure check-in"
      description="Coach configuration for weekly check-ins."
    >
      <AppPage
        eyebrow="Coach"
        title="Configure check-in"
        description={CHECK_IN_HONESTY[2]}
      >
        {!athleteProfileId ? (
          <CoachAthletePicker userId={session.user.id} />
        ) : (
          <CoachConfigForAthlete
            coachUserId={session.user.id}
            athleteProfileId={athleteProfileId}
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}

async function CoachAthletePicker({ userId }: { userId: string }) {
  const dashboard = await getCoachDashboard(userId);
  const athletes = dashboard?.athletes ?? [];
  if (athletes.length === 0) {
    return (
      <EmptyState
        title="No athletes linked"
        description="Connect an athlete with an access grant first."
        action={<ButtonLink href="/app/coach">Open Coach</ButtonLink>}
      />
    );
  }
  return (
    <section className="grid gap-3">
      <p className="text-sm text-[var(--color-muted)]">
        Choose an athlete to configure their weekly check-in questions.
      </p>
      <ul className="grid gap-2">
        {athletes.map((a) => (
          <li key={a.athleteProfileId}>
            <ButtonLink
              href={`/app/check-in/configure?athlete=${a.athleteProfileId}`}
              variant="secondary"
            >
              {a.displayName}
            </ButtonLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function CoachConfigForAthlete({
  coachUserId,
  athleteProfileId,
}: {
  coachUserId: string;
  athleteProfileId: string;
}) {
  const result = await getCoachCheckInConfig({
    coachUserId,
    athleteProfileId,
  });
  if (!result.ok) {
    return (
      <Alert tone="danger" title="Unavailable">
        {result.error}
      </Alert>
    );
  }
  return <CoachCheckInConfigPanel view={result.view} />;
}
