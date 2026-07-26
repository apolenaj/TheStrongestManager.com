import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ProgressAnalytics } from "@/components/progress/ProgressAnalytics";
import { StrengthScorePanel } from "@/components/strength/StrengthScorePanel";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import {
  formatEntitlementDenial,
  requireFeature,
} from "@/services/entitlements";
import { getProgressAnalytics } from "@/services/progress/progress-analytics-service";
import { getStrengthScoreForUser } from "@/services/strength/strength-score-service";

export const metadata: Metadata = {
  title: "Progress",
  robots: { index: false, follow: false },
};

type ProgressPageProps = {
  searchParams: Promise<{ range?: string; exercise?: string }>;
};

export default async function ProgressPage({ searchParams }: ProgressPageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const progressGate = await requireFeature(
    session.user.id,
    "progress_analytics",
  );
  const canUseProgressAnalytics = progressGate.ok;

  const [analytics, strength] = await Promise.all([
    canUseProgressAnalytics
      ? getProgressAnalytics({
          userId: session.user.id,
          rangeId: params.range,
          exerciseId: params.exercise,
        })
      : Promise.resolve(null),
    getStrengthScoreForUser(session.user.id),
  ]);

  if (!progressGate.ok) {
    return (
      <AppPage
        eyebrow="Tracking"
        title="Progress"
        description="Full progress analytics are included on Pro and Performance plans."
      >
        <div className="space-y-8">
          <Alert tone="info" title="Plan limit">
            {formatEntitlementDenial(progressGate)}. Strength overview below
            still uses logged training when available. Checkout is not live yet
            — see Pricing for catalog details.
          </Alert>

          {strength ? (
            <section className="space-y-4">
              <h2 className="font-display text-2xl text-[var(--color-foreground)]">
                Strength overview
              </h2>
              <StrengthScorePanel view={strength} />
            </section>
          ) : (
            <EmptyState
              title="No strength overview yet"
              description="Log training sessions to build an observed strength picture."
              action={
                <ButtonLink href="/app/today" variant="secondary">
                  Open Today
                </ButtonLink>
              }
            />
          )}

          <EmptyState
            title="Progress analytics locked"
            description="Charts for volume, bodyweight trends, technique, and adherence unlock on Pro. We do not invent demo charts on Free."
            action={
              <ButtonLink href="/pricing" variant="secondary">
                View pricing
              </ButtonLink>
            }
          />
        </div>
      </AppPage>
    );
  }

  if (!analytics) {
    return (
      <AppPage
        eyebrow="Tracking"
        title="Progress"
        description="Strength, volume, bodyweight, technique, and adherence from real logs."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before progress analytics can load."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Tracking"
      title="Progress"
      description="Compare trends across ranges. Charts show units, axes, and tooltips — empty when data is missing."
    >
      <div className="space-y-12">
        {strength ? (
          <section className="space-y-4">
            <h2 className="font-display text-2xl text-[var(--color-foreground)]">
              Strength overview
            </h2>
            <StrengthScorePanel view={strength} />
          </section>
        ) : null}

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--color-foreground)]">
            Analytics
          </h2>
          <ProgressAnalytics view={analytics} />
        </section>
      </div>
    </AppPage>
  );
}
