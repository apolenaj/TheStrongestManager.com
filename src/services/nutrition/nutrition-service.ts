import { featureFlags } from "@/config/feature-flags";
import {
  MEALNEXIO_SITE_URL,
  NUTRITION_CONNECTION_STATUS_LABELS,
  NUTRITION_HONESTY,
  NUTRITION_SHARED_DATA_KINDS,
  NUTRITION_SHARED_DATA_LABELS,
  getActiveNutritionProvider,
  type NutritionConnectionStatus,
  type NutritionDailySummary,
  type NutritionDailyTargets,
  type NutritionSharedDataKind,
} from "@/domain/nutrition";
import { buildMealnexioDeepLink } from "@/domain/mealnexio-deep-linking";
import { prisma } from "@/lib/db";

function todayUtcDateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export type NutritionDashboardView = {
  athleteProfileId: string;
  /** Feature flag: real sync UI/API path. Off until Mealnexio API exists. */
  syncFeatureEnabled: boolean;
  provider: {
    id: string;
    label: string;
    status: NutritionConnectionStatus;
    statusLabel: string;
    note: string;
  };
  connection: {
    status: NutritionConnectionStatus;
    externalAccountLabel: string | null;
    lastSyncAt: string | null;
    lastError: string | null;
  };
  /** Null until a real provider returns targets — never invented. */
  dailyTargets: NutritionDailyTargets | null;
  /** Null until a real provider returns intake — never invented. */
  dailySummary: NutritionDailySummary | null;
  /** Local profile bodyweight — not Mealnexio sync. */
  localBodyweight: {
    kg: number;
    recordedAt: string;
    sourceLabel: string;
  } | null;
  plannedSharedData: Array<{
    id: NutritionSharedDataKind;
    label: string;
  }>;
  mealnexio: {
    siteUrl: string;
    ctaLabel: string;
    ctaEnabled: boolean;
    ctaHint: string;
  };
  honesty: readonly string[];
};

/**
 * Nutrition dashboard for The Strongest ↔ Mealnexio architecture.
 * Never fabricates synced nutrition. Sync path stays behind feature flag.
 */
export async function getNutritionDashboard(
  userId: string,
): Promise<NutritionDashboardView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      bodyMetrics: {
        where: { metricKey: "bodyweight" },
        orderBy: { recordedAt: "desc" },
        take: 1,
        select: { value: true, recordedAt: true },
      },
    },
  });

  if (!profile) return null;

  const syncFeatureEnabled = featureFlags.mealnexioSync;
  const provider = getActiveNutritionProvider();
  const date = todayUtcDateKey();

  const connection = await provider.getConnection({
    athleteProfileId: profile.id,
  });

  // Until the sync flag is on, never present provider data as live sync —
  // even if a test registers a connected adapter.
  let dailyTargets: NutritionDailyTargets | null = null;
  let dailySummary: NutritionDailySummary | null = null;
  let effectiveStatus: NutritionConnectionStatus = connection.status;

  if (!syncFeatureEnabled) {
    effectiveStatus =
      connection.status === "unavailable"
        ? "unavailable"
        : "not_configured";
  } else if (connection.status === "connected") {
    dailyTargets = await provider.fetchDailyTargets({
      athleteProfileId: profile.id,
      date,
    });
    dailySummary = await provider.fetchDailySummary({
      athleteProfileId: profile.id,
      date,
    });
  }

  const latestBw = profile.bodyMetrics[0];
  const localBodyweight = latestBw
    ? {
        kg: latestBw.value,
        recordedAt: latestBw.recordedAt.toISOString(),
        sourceLabel: "Athlete profile (local) — not Mealnexio sync",
      }
    : null;

  const statusNote = !syncFeatureEnabled
    ? "Mealnexio sync is feature-flagged off until a real API is available. No calories or macros are invented here."
    : effectiveStatus === "connected"
      ? `Connected to ${provider.label}. Values below come from the provider only when sync returns them.`
      : effectiveStatus === "unavailable"
        ? "Mealnexio API adapter is not live. Architecture is ready; sync is not."
        : `Provider status: ${NUTRITION_CONNECTION_STATUS_LABELS[effectiveStatus]}.`;

  const deepLinkEnabled = featureFlags.mealnexioDeepLinking;
  const reviewLink = deepLinkEnabled
    ? buildMealnexioDeepLink({ intent: "nutrition_review" })
    : null;

  return {
    athleteProfileId: profile.id,
    syncFeatureEnabled,
    provider: {
      id: provider.id,
      label: provider.label,
      status: effectiveStatus,
      statusLabel: NUTRITION_CONNECTION_STATUS_LABELS[effectiveStatus],
      note: statusNote,
    },
    connection: {
      status: effectiveStatus,
      externalAccountLabel: syncFeatureEnabled
        ? connection.externalAccountLabel
        : null,
      lastSyncAt:
        syncFeatureEnabled && connection.lastSyncAt
          ? connection.lastSyncAt.toISOString()
          : null,
      lastError: syncFeatureEnabled ? connection.lastError : null,
    },
    dailyTargets,
    dailySummary,
    localBodyweight,
    plannedSharedData: NUTRITION_SHARED_DATA_KINDS.map((id) => ({
      id,
      label: NUTRITION_SHARED_DATA_LABELS[id],
    })),
    mealnexio: {
      siteUrl: reviewLink?.href ?? MEALNEXIO_SITE_URL,
      ctaLabel: syncFeatureEnabled
        ? "Connect Mealnexio"
        : deepLinkEnabled
          ? "Open Mealnexio nutrition review"
          : "Open Mealnexio.com",
      ctaEnabled: true,
      ctaHint: syncFeatureEnabled
        ? "Secure connect ships with the real Mealnexio OAuth/API client — not enabled in this build."
        : deepLinkEnabled
          ? "Deep link opens Mealnexio with TSM context params. Sync and SSO stay off until real infrastructure ships."
          : "Visit Mealnexio for nutrition workflows. In-app sync stays off until the API and flag are ready.",
    },
    honesty: NUTRITION_HONESTY,
  };
}
