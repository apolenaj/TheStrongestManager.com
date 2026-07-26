import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ProgramBuilderExperience } from "@/components/program-builder/ProgramBuilderExperience";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { PROGRAM_BUILDER_HONESTY } from "@/domain/program-builder";
import { requireSession } from "@/services/auth/session";
import { featureFlags } from "@/config/feature-flags";
import { Alert } from "@/design-system";

export const metadata: Metadata = {
  title: "Program Builder 2.0",
  robots: { index: false, follow: false },
};

export default async function ProgramBuilderPage() {
  await requireSession();

  if (!featureFlags.programBuilder) {
    return (
      <AppPage
        eyebrow="Programming"
        title="Program Builder 2.0"
        description="Structured program drafts from your inputs."
      >
        <Alert tone="warning" title="Program Builder off">
          Enable NEXT_PUBLIC_FF_PROGRAM_BUILDER to use Program Builder 2.0.
        </Alert>
      </AppPage>
    );
  }

  return (
    <FeatureGate
      flag="programBuilder"
      title="Program Builder 2.0"
      description="Program Builder 2.0 is behind a feature flag."
    >
      <AppPage
        eyebrow="Programming"
        title="Program Builder 2.0"
        description={PROGRAM_BUILDER_HONESTY[0]}
      >
        <ProgramBuilderExperience />
      </AppPage>
    </FeatureGate>
  );
}
