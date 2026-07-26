import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { MessagingInboxPanel } from "@/components/messaging/MessagingInboxPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, EmptyState, ButtonLink } from "@/design-system";
import { MESSAGING_HONESTY } from "@/domain/messaging";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import {
  getMessageThread,
  getMessagingInbox,
  listMessageableAthletes,
  listMessageableCoaches,
} from "@/services/messaging";
import { getAthleteTimezone } from "@/services/timezone-system";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ thread?: string }>;
};

export default async function MessagesPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const params = await searchParams;

  if (!featureFlags.messagingSystem) {
    return (
      <AppPage
        eyebrow="Coach"
        title="Messages"
        description="Athlete–coach messaging with secure access."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_MESSAGING_SYSTEM.
        </Alert>
      </AppPage>
    );
  }

  const [inbox, coaches, athletes, timeZone] = await Promise.all([
    getMessagingInbox({ userId: session.user.id }),
    listMessageableCoaches({ athleteUserId: session.user.id }),
    listMessageableAthletes({ coachUserId: session.user.id }),
    getAthleteTimezone(session.user.id),
  ]);

  if (!inbox.ok) {
    return (
      <FeatureGate
        flag="messagingSystem"
        title="Messages"
        description="Messaging System is behind a feature flag."
      >
        <AppPage eyebrow="Coach" title="Messages" description={MESSAGING_HONESTY[0]}>
          {inbox.error.includes("profile") ? (
            <EmptyState
              title="Complete onboarding"
              description="Athletes need a profile; coaches need Coach Mode and an access grant."
              action={
                <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
              }
            />
          ) : (
            <Alert tone="danger" title="Unavailable">
              {inbox.error}
            </Alert>
          )}
        </AppPage>
      </FeatureGate>
    );
  }

  let threadView = null;
  if (params.thread) {
    const detail = await getMessageThread({
      userId: session.user.id,
      threadId: params.thread,
    });
    if (detail.ok) threadView = detail.view;
  }

  return (
    <FeatureGate
      flag="messagingSystem"
      title="Messages"
      description="Messaging System is behind a feature flag."
    >
      <AppPage
        eyebrow="Coach"
        title="Messages"
        description={MESSAGING_HONESTY[0]}
      >
        <MessagingInboxPanel
          inbox={inbox.view}
          thread={threadView}
          timeZone={timeZone}
          messageable={{
            coaches: coaches.ok ? coaches.coaches : [],
            athletes: athletes.ok ? athletes.athletes : [],
          }}
        />
      </AppPage>
    </FeatureGate>
  );
}
