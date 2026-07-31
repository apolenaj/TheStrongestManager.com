import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { AttemptSelectorPanel } from "@/components/attempt-selector/AttemptSelectorPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getAttemptSelectorData } from "@/services/attempt-selector";

export const metadata: Metadata = {
  title: "Attempt selector",
  robots: { index: false, follow: false },
};

export default async function AttemptSelectorPage() {
  const session = await requireSession();
  const data = await getAttemptSelectorData(session.user.id);

  return (
    <FeatureGate
      flag="attemptSelector"
      title="Powerlifting Attempt Selector"
      description="Attempt planning is behind a feature flag."
    >
      <AppPage
        eyebrow="Competition"
        title="Attempt selector"
        description="Conservative opener, suggested second, and conditional third — risk preference controlled by you. Never a guaranteed make."
      >
        {!data ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding, then log lifts or set Competition Mode targets."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-4">
            <p className="text-sm text-[var(--color-muted)]">
              Pair with{" "}
              <Link
                href="/app/competition"
                className="text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                Competition Mode
              </Link>{" "}
              for countdown and taper context.
            </p>
            <AttemptSelectorPanel data={data} />
          </div>
        )}
      </AppPage>
    </FeatureGate>
  );
}
