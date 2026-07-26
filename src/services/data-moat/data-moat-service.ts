/**
 * Data moat consent service (Prompt 91).
 * No live aggregation pipeline — consent + eligibility only.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  DATA_MOAT_HONESTY,
  DATA_MOAT_POLICY_VERSION,
  athleteEligibleForInsight,
  emptyConsentScopes,
  parseConsentScopesJson,
  serializeConsentScopes,
  type DataMoatConsentRecord,
  type DataMoatConsentScopes,
  type DataMoatInsightKind,
} from "@/domain/data-moat";
import { prisma } from "@/lib/db";

export type DataMoatConsentView = {
  honesty: readonly string[];
  enabled: boolean;
  consent: {
    optedIn: boolean;
    scopes: DataMoatConsentScopes;
    policyVersion: string;
    consentedAt: string | null;
    revokedAt: string | null;
  };
};

function toRecord(row: {
  optedIn: boolean;
  scopesJson: string;
  policyVersion: string;
  consentedAt: Date | null;
  revokedAt: Date | null;
}): DataMoatConsentRecord {
  return {
    optedIn: row.optedIn,
    scopes: parseConsentScopesJson(row.scopesJson),
    policyVersion: row.policyVersion,
    consentedAt: row.consentedAt,
    revokedAt: row.revokedAt,
  };
}

export async function getDataMoatConsentForUser(
  userId: string,
): Promise<DataMoatConsentView | null> {
  if (!featureFlags.dataMoat && !featureFlags.modelImprovementConsent) {
    return {
      honesty: DATA_MOAT_HONESTY,
      enabled: false,
      consent: {
        optedIn: false,
        scopes: emptyConsentScopes(),
        policyVersion: DATA_MOAT_POLICY_VERSION,
        consentedAt: null,
        revokedAt: null,
      },
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const row = await prisma.dataMoatConsent.findUnique({
    where: { athleteProfileId: profile.id },
  });

  if (!row) {
    return {
      honesty: DATA_MOAT_HONESTY,
      enabled: true,
      consent: {
        optedIn: false,
        scopes: emptyConsentScopes(),
        policyVersion: DATA_MOAT_POLICY_VERSION,
        consentedAt: null,
        revokedAt: null,
      },
    };
  }

  const record = toRecord(row);
  return {
    honesty: DATA_MOAT_HONESTY,
    enabled: true,
    consent: {
      optedIn: record.optedIn,
      scopes: record.scopes,
      policyVersion: record.policyVersion,
      consentedAt: record.consentedAt?.toISOString() ?? null,
      revokedAt: record.revokedAt?.toISOString() ?? null,
    },
  };
}

export async function setDataMoatConsent(input: {
  userId: string;
  optedIn: boolean;
  scopes?: Partial<DataMoatConsentScopes>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.dataMoat && !featureFlags.modelImprovementConsent) {
    return { ok: false, error: "Data moat / research consent is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const existing = await prisma.dataMoatConsent.findUnique({
    where: { athleteProfileId: profile.id },
  });
  const scopes: DataMoatConsentScopes = {
    ...emptyConsentScopes(),
    ...(existing
      ? parseConsentScopesJson(existing.scopesJson)
      : emptyConsentScopes()),
    ...(input.scopes ?? {}),
  };

  const now = new Date();
  await prisma.dataMoatConsent.upsert({
    where: { athleteProfileId: profile.id },
    create: {
      athleteProfileId: profile.id,
      optedIn: input.optedIn,
      scopesJson: serializeConsentScopes(scopes),
      policyVersion: DATA_MOAT_POLICY_VERSION,
      consentedAt: input.optedIn ? now : null,
      revokedAt: input.optedIn ? null : now,
    },
    update: {
      optedIn: input.optedIn,
      scopesJson: serializeConsentScopes(scopes),
      policyVersion: DATA_MOAT_POLICY_VERSION,
      consentedAt: input.optedIn ? now : existing?.consentedAt ?? null,
      revokedAt: input.optedIn ? null : now,
    },
  });

  return { ok: true };
}

/**
 * Eligibility check for a future job worker — no data extraction here.
 */
export async function isAthleteEligibleForMoatInsight(input: {
  athleteProfileId: string;
  insightKind: DataMoatInsightKind;
}): Promise<boolean> {
  if (!featureFlags.dataMoat && !featureFlags.modelImprovementConsent) {
    return false;
  }

  const row = await prisma.dataMoatConsent.findUnique({
    where: { athleteProfileId: input.athleteProfileId },
  });
  if (!row) return false;

  return athleteEligibleForInsight({
    consent: toRecord(row),
    insightKind: input.insightKind,
  });
}
