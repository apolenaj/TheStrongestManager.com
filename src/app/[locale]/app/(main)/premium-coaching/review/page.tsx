import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { PremiumCoachingReviewPanel } from "@/components/premium-coaching-sales/PremiumCoachingReviewPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, EmptyState, ButtonLink } from "@/design-system";
import { PREMIUM_COACHING_HONESTY } from "@/domain/premium-coaching-sales";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { listPremiumCoachingApplicationsForStaff } from "@/services/premium-coaching-sales";
import { getUserRoles } from "@/services/coach/coach-service";

export const metadata: Metadata = {
  title: "Review premium applications",
  robots: { index: false, follow: false },
};

export default async function PremiumCoachingReviewPage() {
  const session = await requireSession();

  if (!featureFlags.premiumCoachingSales) {
    return (
      <AppPage
        eyebrow="Coach"
        title="Review applications"
        description="Advance Apply → Review → Consultation → Offer."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_PREMIUM_COACHING_SALES.
        </Alert>
      </AppPage>
    );
  }

  const roles = await getUserRoles(session.user.id);
  const user = await import("@/lib/db").then(({ prisma }) =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    }),
  );

  if (!roles?.isCoach && !user?.isAdmin) {
    return (
      <FeatureGate
        flag="premiumCoachingSales"
        title="Review applications"
        description="Staff review inbox."
      >
        <AppPage
          eyebrow="Coach"
          title="Review applications"
          description={PREMIUM_COACHING_HONESTY[1]}
        >
          <EmptyState
            title="Staff or coach access required"
            description="Enable Coach Mode or use an admin account to review applications."
            action={<ButtonLink href="/app/settings">Open settings</ButtonLink>}
          />
        </AppPage>
      </FeatureGate>
    );
  }

  const result = await listPremiumCoachingApplicationsForStaff({
    actorUserId: session.user.id,
  });

  return (
    <FeatureGate
      flag="premiumCoachingSales"
      title="Review applications"
      description="Staff review inbox for premium coaching."
    >
      <AppPage
        eyebrow="Coach"
        title="Review applications"
        description="Advance Apply → Review → Consultation → Offer. Never auto-accept."
      >
        <Alert tone="info" title="Honesty">
          {PREMIUM_COACHING_HONESTY[1]} {PREMIUM_COACHING_HONESTY[2]}
        </Alert>
        {result.ok ? (
          <div className="mt-6">
            <PremiumCoachingReviewPanel applications={result.applications} />
          </div>
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
