/**
 * Unbundled consent dashboard (Prompt 179).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  CONSENT_KINDS,
  MODEL_IMPROVEMENT_CONSENT_HONESTY,
  MODEL_IMPROVEMENT_CONSENT_VERSION,
  type ConsentKindStatus,
} from "@/domain/model-improvement-consent";
import {
  emptyConsentScopes,
  type DataMoatConsentScopes,
} from "@/domain/data-moat";
import { prisma } from "@/lib/db";
import {
  getDataMoatConsentForUser,
  setDataMoatConsent,
} from "@/services/data-moat/data-moat-service";

export type ConsentDashboard = {
  honesty: readonly string[];
  policyVersion: typeof MODEL_IMPROVEMENT_CONSENT_VERSION;
  kinds: typeof CONSENT_KINDS;
  statuses: ConsentKindStatus[];
  expertReview: {
    accountOptIn: boolean;
    videosAllowingExpert: number;
    updatedAt: string | null;
  };
  research: {
    accountOptIn: boolean;
    scopes: DataMoatConsentScopes;
    videosAllowingModelImprovement: number;
    consentedAt: string | null;
    revokedAt: string | null;
    moatEnabled: boolean;
  };
  serviceUse: {
    techniqueVideos: number;
    detail: string;
  };
};

function researchWritesAllowed(): boolean {
  return featureFlags.modelImprovementConsent || featureFlags.dataMoat;
}

export async function getConsentDashboard(
  userId: string,
): Promise<ConsentDashboard | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const [pref, moat, expertOnCount, techniqueVideos, modelOnCount] =
    await Promise.all([
      prisma.athleteConsentPreference.findUnique({
        where: { athleteProfileId: profile.id },
      }),
      getDataMoatConsentForUser(userId),
      prisma.techniqueAnalysis.count({
        where: {
          athleteProfileId: profile.id,
          deletedAt: null,
          status: { not: "deleted" },
          allowExpertReview: true,
        },
      }),
      prisma.techniqueAnalysis.count({
        where: {
          athleteProfileId: profile.id,
          deletedAt: null,
          status: { not: "deleted" },
        },
      }),
      prisma.techniqueAnalysis.count({
        where: {
          athleteProfileId: profile.id,
          deletedAt: null,
          status: { not: "deleted" },
          modelImprovementConsentAt: { not: null },
        },
      }),
    ]);

  const researchOptIn = Boolean(moat?.consent.optedIn);
  const expertOptIn = Boolean(pref?.expertReviewOptIn);

  const statuses: ConsentKindStatus[] = [
    {
      kind: "service_use",
      active: true,
      detail:
        techniqueVideos > 0
          ? `${techniqueVideos} private technique video${techniqueVideos === 1 ? "" : "s"} on file (analysis required explicit consent per upload).`
          : "Account active. Technique analysis still requires per-upload consent.",
      updatedAt: null,
    },
    {
      kind: "expert_review",
      active: expertOptIn || expertOnCount > 0,
      detail: expertOptIn
        ? `Account preference on · ${expertOnCount} video${expertOnCount === 1 ? "" : "s"} currently allowing expert share.`
        : `Account preference off · ${expertOnCount} video${expertOnCount === 1 ? "" : "s"} allowing expert share.`,
      updatedAt: pref?.expertReviewUpdatedAt?.toISOString() ?? null,
    },
    {
      kind: "research_model_improvement",
      active: researchOptIn,
      detail: researchOptIn
        ? `Account research opt-in on · ${modelOnCount} video${modelOnCount === 1 ? "" : "s"} with model-improvement flag.`
        : `Account research opt-in off · ${modelOnCount} video${modelOnCount === 1 ? "" : "s"} still flagged (revoke clears them).`,
      updatedAt: moat?.consent.consentedAt ?? moat?.consent.revokedAt ?? null,
    },
  ];

  return {
    honesty: MODEL_IMPROVEMENT_CONSENT_HONESTY,
    policyVersion: MODEL_IMPROVEMENT_CONSENT_VERSION,
    kinds: CONSENT_KINDS,
    statuses,
    expertReview: {
      accountOptIn: expertOptIn,
      videosAllowingExpert: expertOnCount,
      updatedAt: pref?.expertReviewUpdatedAt?.toISOString() ?? null,
    },
    research: {
      accountOptIn: researchOptIn,
      scopes: moat?.consent.scopes ?? emptyConsentScopes(),
      videosAllowingModelImprovement: modelOnCount,
      consentedAt: moat?.consent.consentedAt ?? null,
      revokedAt: moat?.consent.revokedAt ?? null,
      moatEnabled: researchWritesAllowed(),
    },
    serviceUse: {
      techniqueVideos,
      detail:
        "Service use is separate from expert review and research. Per-video analysis consent is still required at upload.",
    },
  };
}

export async function setExpertReviewAccountConsent(input: {
  userId: string;
  optedIn: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.modelImprovementConsent) {
    return { ok: false, error: "Consent preferences are not enabled." };
  }
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const now = new Date();
  await prisma.athleteConsentPreference.upsert({
    where: { athleteProfileId: profile.id },
    create: {
      athleteProfileId: profile.id,
      expertReviewOptIn: input.optedIn,
      expertReviewUpdatedAt: now,
      expertReviewPolicyVersion: MODEL_IMPROVEMENT_CONSENT_VERSION,
    },
    update: {
      expertReviewOptIn: input.optedIn,
      expertReviewUpdatedAt: now,
      expertReviewPolicyVersion: MODEL_IMPROVEMENT_CONSENT_VERSION,
    },
  });
  return { ok: true };
}

export async function revokeExpertReviewOnAllVideos(input: {
  userId: string;
}): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  if (!featureFlags.modelImprovementConsent) {
    return { ok: false, error: "Consent preferences are not enabled." };
  }
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const result = await prisma.techniqueAnalysis.updateMany({
    where: {
      athleteProfileId: profile.id,
      deletedAt: null,
      OR: [
        { allowExpertReview: true },
        { expertReviewConsentAt: { not: null } },
      ],
    },
    data: {
      allowExpertReview: false,
      expertReviewConsentAt: null,
    },
  });

  await setExpertReviewAccountConsent({
    userId: input.userId,
    optedIn: false,
  });

  return { ok: true, updated: result.count };
}

export async function setResearchModelImprovementConsent(input: {
  userId: string;
  optedIn: boolean;
  includeTechniqueAggregates?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!researchWritesAllowed()) {
    return {
      ok: false,
      error: "Research / model-improvement consent is not enabled.",
    };
  }

  const scopes = input.optedIn
    ? {
        technique_aggregates: input.includeTechniqueAggregates !== false,
        training_aggregates: false,
        strength_aggregates: false,
      }
    : emptyConsentScopes();

  const result = await setDataMoatConsent({
    userId: input.userId,
    optedIn: input.optedIn,
    scopes,
  });
  if (!result.ok) return result;

  if (!input.optedIn) {
    await clearVideoModelImprovementFlags(input.userId);
  }
  return { ok: true };
}

async function clearVideoModelImprovementFlags(userId: string): Promise<number> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return 0;
  const result = await prisma.techniqueAnalysis.updateMany({
    where: {
      athleteProfileId: profile.id,
      modelImprovementConsentAt: { not: null },
    },
    data: { modelImprovementConsentAt: null },
  });
  return result.count;
}

export async function revokeResearchOnAllVideos(input: {
  userId: string;
}): Promise<{ ok: true; updated: number } | { ok: false; error: string }> {
  if (!featureFlags.modelImprovementConsent) {
    return { ok: false, error: "Consent preferences are not enabled." };
  }
  const updated = await clearVideoModelImprovementFlags(input.userId);
  return { ok: true, updated };
}
