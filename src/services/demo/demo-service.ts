import { featureFlags } from "@/config/feature-flags";
import {
  DEMO_ATHLETE_EMAIL,
  buildDemoDashboardFixture,
  mapDashboardViewToDemoPaths,
} from "@/domain/demo";
import { prisma } from "@/lib/db";
import { getPerformanceDashboard } from "@/services/dashboard/dashboard-service";
import type { DashboardView } from "@/services/dashboard/types";

export type DemoDashboardSource = "fixture" | "seeded";

export type DemoDashboardResult = {
  view: DashboardView;
  source: DemoDashboardSource;
};

/**
 * Load Demo Mode dashboard.
 * Prefers the isolated isDemoAccount seed when present; otherwise uses the
 * deterministic fixture. Never reads the visitor's production athlete graph.
 */
export async function getDemoDashboard(): Promise<DemoDashboardResult> {
  const seeded = await findDemoAccountUserId();
  if (seeded) {
    const live = await getPerformanceDashboard(seeded);
    if (live && !live.isNewAthlete) {
      return {
        view: mapDashboardViewToDemoPaths(live),
        source: "seeded",
      };
    }
  }

  return {
    view: buildDemoDashboardFixture(),
    source: "fixture",
  };
}

export async function findDemoAccountUserId(): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      isDemoAccount: true,
      email: DEMO_ATHLETE_EMAIL,
    },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function isDemoAccountUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isDemoAccount: true, email: true },
  });
  if (!user) return false;
  return user.isDemoAccount === true;
}

/** Demo Mode is available when the feature flag is on. */
export function isDemoModeEnabled(): boolean {
  return featureFlags.demoMode;
}

/**
 * Safety: production athlete services must never copy demo profile ids onto
 * a non-demo user. Call before any cross-account merge (none exist today).
 */
export function assertDemoDataNotMergedIntoProduction(input: {
  targetUserIsDemo: boolean;
  sourceIsDemoPresentation: boolean;
}): void {
  if (input.sourceIsDemoPresentation && !input.targetUserIsDemo) {
    throw new Error(
      "Demo Mode data cannot be merged into a production athlete account.",
    );
  }
}
