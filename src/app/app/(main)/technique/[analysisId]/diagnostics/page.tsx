import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { MovementDiagnosticsPanel } from "@/components/technique/MovementDiagnosticsPanel";
import { requireSession } from "@/services/auth/session";
import { getTechniqueAnalysisForUser } from "@/services/technique/analysis-service";

type Props = {
  params: Promise<{ analysisId: string }>;
};

export const metadata: Metadata = {
  title: "Movement diagnostics",
  robots: { index: false, follow: false },
};

export default async function TechniqueDiagnosticsPage({ params }: Props) {
  const session = await requireSession();
  const { analysisId } = await params;
  const analysis = await getTechniqueAnalysisForUser(
    session.user.id,
    analysisId,
  );

  if (!analysis || analysis.status === "deleted") {
    notFound();
  }

  return (
    <AppPage
      eyebrow="Diagnostics"
      title="Movement diagnostics"
      description="Developer view of pose coverage, pipeline confidence, and raw report JSON."
    >
      <MovementDiagnosticsPanel
        analysisId={analysis.id}
        report={analysis.movementReport}
      />
    </AppPage>
  );
}
