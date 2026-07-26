"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@/design-system";
import { TechniqueAnalysisReport } from "@/components/technique/TechniqueAnalysisReport";
import { TechniqueExpertReviewPanel } from "@/components/technique/TechniqueExpertReviewPanel";
import {
  deleteTechniqueAnalysisAction,
  type TechniqueActionState,
} from "@/services/technique/actions";
import { TECHNIQUE_PRIVACY_COPY } from "@/domain/technique/constants";
import type { MovementReport } from "@/domain/movement/types";
import type { TechniqueFeedbackAthleteContext } from "@/domain/technique/feedback/types";
import type { TechniqueAuthorshipPresentation } from "@/domain/technique-review";
import { VideoPrivacyControlsPanel } from "@/components/technique/VideoPrivacyControlsPanel";

const initial: TechniqueActionState = { ok: false };

type DetailModel = {
  id: string;
  status: string;
  analysisBackendStatus: string;
  overallScore: number | null;
  confidenceBasis: string | null;
  summary: string | null;
  cameraAngle: string | null;
  loadKg: number | null;
  reps: number | null;
  durationSeconds: number | null;
  signedMediaPath: string | null;
  movementReport: MovementReport | null;
  exercise: { name: string; slug: string } | null;
  createdAt: Date;
  canRunFixture: boolean;
  privacyNote: string | null;
  allowExpertReview: boolean;
  modelImprovementOptIn: boolean;
  athleteContext: TechniqueFeedbackAthleteContext | null;
  expertReview?: {
    enabled: boolean;
    expertReviewStatus: string;
    authorship: TechniqueAuthorshipPresentation;
    latestReview: {
      id: string;
      status: string;
      decision: string | null;
      comment: string | null;
      correctedOverallScore: number | null;
      correctedSummary: string | null;
      disagreementKind: string;
    } | null;
    honesty: readonly string[];
  };
  previous: {
    id: string;
    createdAt: Date;
    overallScore: number | null;
    confidenceBasis: string | null;
    movementReport: MovementReport | null;
  } | null;
};

export function TechniqueAnalysisDetail({
  analysis,
}: {
  analysis: DetailModel;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    deleteTechniqueAnalysisAction,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      router.push("/app/technique");
      router.refresh();
    }
  }, [state.ok, router]);

  const authorship = analysis.expertReview?.authorship;

  return (
    <div className="grid gap-6 sm:gap-8">
      <TechniqueAnalysisReport
        analysis={{
          id: analysis.id,
          status: analysis.status,
          analysisBackendStatus: analysis.analysisBackendStatus,
          overallScore: analysis.overallScore,
          confidenceBasis: analysis.confidenceBasis,
          summary: analysis.summary,
          cameraAngle: analysis.cameraAngle,
          loadKg: analysis.loadKg,
          reps: analysis.reps,
          durationSeconds: analysis.durationSeconds,
          signedMediaPath: analysis.signedMediaPath,
          movementReport: analysis.movementReport,
          exercise: analysis.exercise,
          createdAt: analysis.createdAt,
          canRunFixture: analysis.canRunFixture,
          athleteContext: analysis.athleteContext,
          authorshipBadge: authorship?.badge,
          authorshipDetail: authorship?.detail,
          isExpertReviewed: authorship?.isExpertReviewed,
          previous: analysis.previous,
        }}
      />

      {analysis.expertReview ? (
        <TechniqueExpertReviewPanel
          analysisId={analysis.id}
          enabled={analysis.expertReview.enabled}
          authorship={analysis.expertReview.authorship}
          expertReviewStatus={analysis.expertReview.expertReviewStatus}
          latestReview={analysis.expertReview.latestReview}
          honesty={analysis.expertReview.honesty}
        />
      ) : null}

      <details className="border-t border-[var(--color-border)] pt-6">
        <summary className="cursor-pointer text-sm text-[var(--color-muted)]">
          Privacy & delete
        </summary>
        <div className="mt-4 grid gap-4">
          <VideoPrivacyControlsPanel
            analysisId={analysis.id}
            allowExpertReview={analysis.allowExpertReview}
            modelImprovementOptIn={analysis.modelImprovementOptIn}
            privacyNote={analysis.privacyNote ?? TECHNIQUE_PRIVACY_COPY}
          />
          <form action={action} className="grid gap-3">
            <input type="hidden" name="analysisId" value={analysis.id} />
            <Alert tone="warning" title="Delete upload">
              Removes private media and marks this analysis deleted. Cannot be
              undone.
            </Alert>
            {state.error ? (
              <Alert tone="danger" title="Delete failed" role="alert">
                {state.error}
              </Alert>
            ) : null}
            <Button type="submit" variant="danger" loading={pending}>
              Delete video & analysis
            </Button>
          </form>
        </div>
      </details>

      <p className="text-sm">
        <Link
          href="/app/technique"
          className="text-[var(--color-accent)] hover:underline"
        >
          ← Technique hub
        </Link>
      </p>
    </div>
  );
}
