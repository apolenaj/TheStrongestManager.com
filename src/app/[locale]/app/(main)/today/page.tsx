import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { DailyCoachingBriefPanel } from "@/components/daily-brief/DailyCoachingBriefPanel";
import { TodayWorkoutPanel } from "@/components/workout/TodayWorkoutPanel";
import { DataFreshnessPanel } from "@/components/data-freshness/DataFreshnessPanel";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getDailyCoachingBrief } from "@/services/daily-brief";
import { getTravelModeView } from "@/services/travel-training-mode";
import { getTodayWorkout } from "@/services/workout/workout-service";
import { getAthleteState } from "@/services/performance-intelligence";
import { freshnessSnapshotFromAthleteState } from "@/domain/data-freshness";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Today",
  robots: { index: false, follow: false },
};

export default async function TodayPage() {
  const session = await requireSession();
  const [today, brief, travel, athleteState] = await Promise.all([
    getTodayWorkout(session.user.id),
    getDailyCoachingBrief(session.user.id),
    featureFlags.travelTrainingMode
      ? getTravelModeView({ userId: session.user.id })
      : Promise.resolve(null),
    featureFlags.dataFreshnessSystem
      ? getAthleteState(session.user.id)
      : Promise.resolve(null),
  ]);

  if (!today) {
    return (
      <AppPage
        eyebrow="Daily coaching"
        title="Today"
        description="Your daily brief appears after onboarding creates your athlete profile."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding to unlock Today and the daily coaching brief."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const travelActive =
    travel && travel.ok && travel.view.active && travel.view.current
      ? travel.view.current
      : null;

  const freshnessSnapshot =
    athleteState != null
      ? freshnessSnapshotFromAthleteState(athleteState.state)
      : null;

  return (
    <AppPage
      eyebrow="Daily coaching"
      title="Today"
      description="Your high-value brief for this day — then start the session when ready."
    >
      <div className="grid gap-8">
        {travelActive ? (
          <Alert tone="warning" title={`Travel Mode — ${travelActive.label}`}>
            Programming temporarily uses travel gear (
            {travelActive.catalogKeys.join(", ") || "limited"}). End travel to
            restore your normal program.{" "}
            <Link
              href="/app/travel-mode"
              className="underline underline-offset-2"
            >
              Manage Travel Mode
            </Link>
          </Alert>
        ) : null}
        {freshnessSnapshot ? (
          <DataFreshnessPanel snapshot={freshnessSnapshot} />
        ) : null}
        {brief ? <DailyCoachingBriefPanel brief={brief} /> : null}
        {featureFlags.sessionReadinessAdjuster ? (
          <p className="text-sm text-[var(--color-muted)]">
            Before you start:{" "}
            <ButtonLink href="/app/session-readiness" variant="secondary">
              Session readiness
            </ButtonLink>
          </p>
        ) : null}
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-fg)]">
            Today’s workout
          </h2>
          <TodayWorkoutPanel view={today} />
        </section>
      </div>
    </AppPage>
  );
}
