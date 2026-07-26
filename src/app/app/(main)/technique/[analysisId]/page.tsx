import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { TechniqueAnalysisDetail } from "@/components/technique/TechniqueAnalysisDetail";
import { buildFeedbackAthleteContext } from "@/domain/technique/feedback/athlete-context";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { getTechniqueAnalysisForUser } from "@/services/technique/analysis-service";
import { getPreviousTechniqueAnalysisForUser } from "@/services/technique/previous-analysis";
import { getTechniqueReviewStateForOwner } from "@/services/technique-review";
import {
  presentTechniqueAuthorship,
  resolveDisplayedTechniqueScore,
} from "@/domain/technique-review";

type TechniqueAnalysisPageProps = {
  params: Promise<{ analysisId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Technique report",
    robots: { index: false, follow: false },
  };
}

export default async function TechniqueAnalysisPage({
  params,
}: TechniqueAnalysisPageProps) {
  const session = await requireSession();
  const { analysisId } = await params;
  const analysis = await getTechniqueAnalysisForUser(
    session.user.id,
    analysisId,
  );

  if (!analysis || analysis.status === "deleted") {
    notFound();
  }

  const [previous, profile, expertReview] = await Promise.all([
    getPreviousTechniqueAnalysisForUser(session.user.id, analysisId),
    prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        primaryDiscipline: true,
        movementNotes: true,
        painCautionAcknowledgedAt: true,
        trainingExperience: { select: { level: true } },
        goals: {
          where: { status: "active" },
          orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
          take: 1,
          select: { category: true, title: true },
        },
      },
    }),
    getTechniqueReviewStateForOwner({
      userId: session.user.id,
      analysisId,
    }),
  ]);

  const athleteContext = profile
    ? buildFeedbackAthleteContext({
        experienceLevel: profile.trainingExperience?.level ?? null,
        goalCategory: profile.goals[0]?.category ?? null,
        goalTitle: profile.goals[0]?.title ?? null,
        primaryDiscipline: profile.primaryDiscipline,
        movementNotes: profile.movementNotes,
        painCautionAcknowledgedAt: profile.painCautionAcknowledgedAt,
      })
    : null;

  const displayedScore = resolveDisplayedTechniqueScore({
    aiOverallScore: analysis.overallScore,
    expertReviewStatus: expertReview.expertReviewStatus,
    correctedOverallScore:
      expertReview.latestReview?.correctedOverallScore ?? null,
  });

  const authorship =
    expertReview.authorship ?? presentTechniqueAuthorship("none");

  return (
    <AppPage
      eyebrow="Technique report"
      title={analysis.exercise?.name ?? "Technique analysis"}
      description="Premium technique report — AI analysis with optional expert review. Never labeled expert-reviewed until an expert decides."
    >
      <TechniqueAnalysisDetail
        analysis={{
          id: analysis.id,
          status: analysis.status,
          analysisBackendStatus: analysis.analysisBackendStatus,
          overallScore: displayedScore,
          confidenceBasis: analysis.confidenceBasis,
          summary:
            expertReview.latestReview?.correctedSummary?.trim() ||
            analysis.summary,
          cameraAngle: analysis.cameraAngle,
          loadKg: analysis.loadKg,
          reps: analysis.reps,
          durationSeconds: analysis.durationSeconds,
          signedMediaPath: analysis.signedMediaPath,
          movementReport: analysis.movementReport,
          exercise: analysis.exercise,
          createdAt: analysis.createdAt,
          canRunFixture: process.env.NODE_ENV === "development",
          privacyNote: analysis.privacyNote,
          allowExpertReview: analysis.allowExpertReview,
          modelImprovementOptIn: Boolean(analysis.modelImprovementConsentAt),
          athleteContext,
          expertReview: {
            ...expertReview,
            authorship,
          },
          previous,
        }}
      />
    </AppPage>
  );
}
