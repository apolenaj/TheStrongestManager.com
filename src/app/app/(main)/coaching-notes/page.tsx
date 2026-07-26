import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CoachingNotesIntelligencePanel } from "@/components/coaching-notes-intelligence/CoachingNotesIntelligencePanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import {
  COACHING_NOTES_INTELLIGENCE_HONESTY,
  COACHING_NOTES_SOURCE_LABELS,
} from "@/domain/coaching-notes-intelligence";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getCoachingNotesIntelligenceView } from "@/services/coaching-notes-intelligence";
import {
  getCoachDashboard,
  getUserRoles,
} from "@/services/coach/coach-service";

export const metadata: Metadata = {
  title: "Coaching notes",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ athlete?: string }>;
};

export default async function CoachingNotesPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const params = await searchParams;

  if (!featureFlags.coachingNotesIntelligence) {
    return (
      <AppPage
        eyebrow="Coach"
        title="Coaching notes"
        description="Coach notes with sourced AI summaries."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_COACHING_NOTES_INTELLIGENCE.
        </Alert>
      </AppPage>
    );
  }

  const athleteProfileId = params.athlete?.trim() || null;

  return (
    <FeatureGate
      flag="coachingNotesIntelligence"
      title="Coaching notes"
      description="Coaching Notes Intelligence is behind a feature flag."
    >
      <AppPage
        eyebrow="Coach"
        title="Coaching notes"
        description={COACHING_NOTES_INTELLIGENCE_HONESTY[0]}
      >
        {!athleteProfileId ? (
          <CoachingNotesPicker userId={session.user.id} />
        ) : (
          <CoachingNotesForAthlete
            coachUserId={session.user.id}
            athleteProfileId={athleteProfileId}
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}

async function CoachingNotesPicker({ userId }: { userId: string }) {
  const roles = await getUserRoles(userId);
  if (!roles?.isCoach) {
    return (
      <EmptyState
        title="Coach Mode required"
        description="Enable Coach Mode to write notes and generate AI summaries for athletes who grant access."
        action={<ButtonLink href="/app/settings">Open settings</ButtonLink>}
      />
    );
  }

  const dashboard = await getCoachDashboard(userId);
  const athletes = dashboard?.athletes ?? [];

  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Source labels">
        Content is always labelled{" "}
        <strong>{COACHING_NOTES_SOURCE_LABELS.coach_note}</strong> or{" "}
        <strong>{COACHING_NOTES_SOURCE_LABELS.ai_summary}</strong>. Private notes
        are never used for unrelated product purposes.
      </Alert>
      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {COACHING_NOTES_INTELLIGENCE_HONESTY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {athletes.length === 0 ? (
        <EmptyState
          title="No athletes linked"
          description="Open Coach Mode and connect an athlete to use coaching notes intelligence."
          action={<ButtonLink href="/app/coach">Open Coach</ButtonLink>}
        />
      ) : (
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Choose an athlete
          </h2>
          <ul className="grid gap-2">
            {athletes.map((a) => (
              <li key={a.athleteProfileId}>
                <ButtonLink
                  href={`/app/coaching-notes?athlete=${a.athleteProfileId}`}
                  variant="secondary"
                >
                  {a.displayName}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

async function CoachingNotesForAthlete({
  coachUserId,
  athleteProfileId,
}: {
  coachUserId: string;
  athleteProfileId: string;
}) {
  const result = await getCoachingNotesIntelligenceView({
    coachUserId,
    athleteProfileId,
  });

  if (!result.ok) {
    return (
      <div className="grid gap-4">
        <Alert tone="danger" title="Unavailable">
          {result.error}
        </Alert>
        <ButtonLink href="/app/coaching-notes" variant="secondary">
          Back
        </ButtonLink>
      </div>
    );
  }

  return <CoachingNotesIntelligencePanel view={result.view} />;
}
