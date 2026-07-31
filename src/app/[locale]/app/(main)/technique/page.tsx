import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { TechniqueAnalysisList } from "@/components/technique/TechniqueAnalysisList";
import { TechniqueCreditsPanel } from "@/components/technique/TechniqueCreditsPanel";
import { TechniqueUploadWizard } from "@/components/technique/TechniqueUploadWizard";
import {
  AiDegradedBanner,
  AiUnavailableState,
} from "@/components/ai/AiUnavailableState";
import { Alert, ButtonLink } from "@/design-system";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { getCreditWalletView } from "@/services/billing/credit-service";
import {
  listTechniqueAnalysesForUser,
  resolveAnalysisBackendStatus,
} from "@/services/technique/analysis-service";
import { getAiCapabilityStatus } from "@/domain/ai-failure-modes";
import { getAiCapabilityRegistrySnapshot } from "@/services/ai-failure-modes";
import { featureFlags } from "@/config/feature-flags";
import { normalizeMassUnit } from "@/services/units/convert";

export const metadata: Metadata = {
  title: "Technique",
  robots: { index: false, follow: false },
};

export default async function TechniquePage() {
  const session = await requireSession();
  const [analyses, exercises, profile, wallet] = await Promise.all([
    listTechniqueAnalysesForUser(session.user.id),
    prisma.exercise.findMany({
      where: { isPublished: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      select: { units: true, id: true },
    }),
    getCreditWalletView(session.user.id),
  ]);

  const units = normalizeMassUnit(profile?.units);
  const backend = resolveAnalysisBackendStatus();
  const techniqueStatus = featureFlags.aiFailureModes
    ? getAiCapabilityStatus(
        "technique_backend",
        getAiCapabilityRegistrySnapshot({ techniqueBackend: backend }),
      )
    : null;

  return (
    <AppPage
      eyebrow="Technique"
      title="Technique"
      description="Upload private lift videos for technique analysis. Scores are never invented when the analysis backend is unavailable."
    >
      <div className="grid gap-8">
        {techniqueStatus?.status === "unavailable" && techniqueStatus.failure ? (
          <AiUnavailableState
            failure={techniqueStatus.failure}
            capabilityLabel={techniqueStatus.label}
          />
        ) : techniqueStatus ? (
          <AiDegradedBanner status={techniqueStatus} />
        ) : null}

        <TechniqueCreditsPanel wallet={wallet} />

        {!profile ? (
          <Alert tone="warning" title="Athlete profile required">
            Complete onboarding before uploading technique videos.
            <div className="mt-3">
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            </div>
          </Alert>
        ) : (
          <TechniqueUploadWizard exercises={exercises} units={units} />
        )}

        <section className="grid gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Your uploads
            </h2>
            <ButtonLink href="/app/technique-trends" variant="secondary">
              Technique trends
            </ButtonLink>
          </div>
          <TechniqueAnalysisList analyses={analyses} />
        </section>
      </div>
    </AppPage>
  );
}
