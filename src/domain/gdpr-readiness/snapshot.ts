import {
  GDPR_ENGINE_VERSION,
  GDPR_HONESTY,
  GDPR_PROCESSING_ACTIVITIES,
  GDPR_RETENTION_INTENTIONS,
  GDPR_WORKFLOW_AREAS,
  GDPR_WORKFLOWS,
  LEGAL_CONTENT_SURFACES,
  LEGAL_REVIEW_BANNER,
} from "@/domain/gdpr-readiness/constants";

export type GdprReadinessSnapshot = {
  engineVersion: typeof GDPR_ENGINE_VERSION;
  honesty: typeof GDPR_HONESTY;
  legalReviewBanner: typeof LEGAL_REVIEW_BANNER;
  workflows: typeof GDPR_WORKFLOWS;
  areas: typeof GDPR_WORKFLOW_AREAS;
  processingActivities: typeof GDPR_PROCESSING_ACTIVITIES;
  retentionIntentions: typeof GDPR_RETENTION_INTENTIONS;
  legalSurfaces: typeof LEGAL_CONTENT_SURFACES;
  docPath: "docs/GDPR_READINESS.md";
  counts: {
    ready: number;
    partial: number;
    planned: number;
    legalReviewRequired: number;
  };
  generatedAt: string;
};

export function buildGdprReadinessSnapshot(
  generatedAt: string = new Date().toISOString(),
): GdprReadinessSnapshot {
  return {
    engineVersion: GDPR_ENGINE_VERSION,
    honesty: GDPR_HONESTY,
    legalReviewBanner: LEGAL_REVIEW_BANNER,
    workflows: GDPR_WORKFLOWS,
    areas: GDPR_WORKFLOW_AREAS,
    processingActivities: GDPR_PROCESSING_ACTIVITIES,
    retentionIntentions: GDPR_RETENTION_INTENTIONS,
    legalSurfaces: LEGAL_CONTENT_SURFACES,
    docPath: "docs/GDPR_READINESS.md",
    counts: {
      ready: GDPR_WORKFLOWS.filter((w) => w.status === "ready").length,
      partial: GDPR_WORKFLOWS.filter((w) => w.status === "partial").length,
      planned: GDPR_WORKFLOWS.filter((w) => w.status === "planned").length,
      legalReviewRequired: GDPR_WORKFLOWS.filter(
        (w) => w.status === "legal_review_required",
      ).length,
    },
    generatedAt,
  };
}
