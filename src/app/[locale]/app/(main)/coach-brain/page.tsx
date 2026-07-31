import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { CoachBrainPanel } from "@/components/coach-brain/CoachBrainPanel";
import { CoachChat } from "@/components/coach-brain/CoachChat";
import {
  AiDegradedBanner,
  AiUnavailableState,
} from "@/components/ai/AiUnavailableState";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { runCoachBrain } from "@/services/coach-brain";
import { getAiCapabilityRegistrySnapshot } from "@/services/ai-failure-modes";
import { getAiCapabilityStatus } from "@/domain/ai-failure-modes";
import { featureFlags } from "@/config/feature-flags";
import { prisma } from "@/lib/db";
import {
  formatEntitlementDenial,
  requireFeature,
} from "@/services/entitlements";

export const metadata: Metadata = {
  title: "AI Coach",
  robots: { index: false, follow: false },
};

export default async function CoachBrainPage() {
  const session = await requireSession();

  const aiGate = await requireFeature(session.user.id, "ai_coach");
  if (!aiGate.ok) {
    return (
      <AppPage
        eyebrow="AI Coach"
        title="AI Coach"
        description="Ask grounded questions about your training — not a generic chatbot."
      >
        <Alert tone="info" title="Plan limit">
          {formatEntitlementDenial(aiGate)} AI Coach maps to the adaptive
          coaching entitlement on Performance and Elite plans.
        </Alert>
        <EmptyState
          title="AI Coach locked"
          description="Upgrade when checkout is available — we do not invent a demo coach on Free."
          action={
            <ButtonLink href="/pricing" variant="secondary">
              View pricing
            </ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return (
      <AppPage
        eyebrow="AI Coach"
        title="AI Coach"
        description="Ask grounded questions about your training — not a generic chatbot."
      >
        <EmptyState
          title="No athlete profile"
          description="Complete onboarding before the AI Coach can use your real signals."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const result = await runCoachBrain({ userId: session.user.id });
  const registry = featureFlags.aiFailureModes
    ? getAiCapabilityRegistrySnapshot({
        coachBrainSafetyRejected: result?.rejected ?? false,
      })
    : null;
  const coachStatus = registry
    ? getAiCapabilityStatus("coach_brain", registry)
    : null;

  return (
    <AppPage
      eyebrow="AI Coach"
      title="AI Coach"
      description="Chat with answers from your logs. Open linked sessions, technique, and progress from each reply. Programs never change without your confirmation."
    >
      <div className="grid gap-8">
        {coachStatus?.failure?.kind === "rejected" ? (
          <AiUnavailableState
            failure={coachStatus.failure}
            capabilityLabel={coachStatus.label}
          />
        ) : coachStatus ? (
          <AiDegradedBanner status={coachStatus} />
        ) : null}
        <CoachChat />
        {result && !result.rejected ? (
          <CoachBrainPanel result={result} />
        ) : null}
      </div>
    </AppPage>
  );
}
