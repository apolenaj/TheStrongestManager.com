import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { TrainingAuditWizard } from "@/components/training-audit/TrainingAuditWizard";
import { ButtonLink, EmptyState } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Training audit",
  robots: { index: false, follow: false },
};

export default async function TrainingAuditPage() {
  const session = await requireSession();
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return (
    <FeatureGate
      flag="trainingAudit"
      title="Training audit"
      description="Automatic program audit is behind a feature flag."
    >
      <AppPage
        eyebrow="Programming"
        title="Training audit"
        description="Upload → Analyze → Understand → Improve. CSV, paste, or manual entry — never fabricates program details."
        actions={
          <ButtonLink href="/app/program-review" variant="secondary" size="lg">
            Program review
          </ButtonLink>
        }
      >
        {!profile ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding so the audit can optionally use your goal and experience context."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <TrainingAuditWizard
            pdfImageEnabled={featureFlags.trainingAuditPdfImage}
          />
        )}
      </AppPage>
    </FeatureGate>
  );
}
