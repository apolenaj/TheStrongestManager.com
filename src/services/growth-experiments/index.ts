/**
 * Growth experiment assignment + exposure tracking (Prompt 159).
 */

import { cookies } from "next/headers";
import { featureFlags } from "@/config/feature-flags";
import {
  assignArm,
  buildGrowthExperimentSnapshot,
  getGrowthExperiment,
  listRunningGrowthExperiments,
  type GrowthExperimentArm,
  type GrowthExperimentDefinition,
} from "@/domain/growth-experiments";
import { trackProductEventSafe } from "@/services/analytics/track";
import { maySetFunctionalCookies } from "@/services/gdpr-readiness";

const SUBJECT_COOKIE = "ts_gid";
const ARM_COOKIE_PREFIX = "ts_exp_";

type CounterKey = string; // experimentId::armId
const exposureCounts = new Map<CounterKey, number>();
const conversionCounts = new Map<CounterKey, number>();

function counterKey(experimentId: string, armId: string): string {
  return `${experimentId}::${armId}`;
}

function bump(map: Map<CounterKey, number>, key: CounterKey): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function mintSubjectId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `gid_${rand}`;
}

/**
 * Sticky anonymous subject id (cookie). Prefer userId when authenticated.
 */
export async function resolveGrowthSubjectKey(
  userId?: string | null,
): Promise<string> {
  if (userId) return `user_${userId}`;
  const jar = await cookies();
  const existing = jar.get(SUBJECT_COOKIE)?.value;
  if (existing && /^gid_[\w-]+$/.test(existing)) return existing;
  return mintSubjectId();
}

export type GrowthAssignment = {
  experiment: GrowthExperimentDefinition;
  arm: GrowthExperimentArm;
  subjectKey: string;
};

/**
 * Assign (or read sticky) arm for a running experiment.
 * Sets cookies when flag is on. Returns null if flag off / unknown / not running.
 */
export async function getGrowthAssignment(
  experimentId: string,
  userId?: string | null,
): Promise<GrowthAssignment | null> {
  if (!featureFlags.growthExperiments) return null;
  const experiment = getGrowthExperiment(experimentId);
  if (!experiment || experiment.status !== "running") return null;

  const subjectKey = await resolveGrowthSubjectKey(userId);
  const jar = await cookies();
  const armCookie = `${ARM_COOKIE_PREFIX}${experimentId}`;
  const stickyArm = jar.get(armCookie)?.value;
  const arm =
    stickyArm && experiment.arms.some((a) => a.id === stickyArm)
      ? experiment.arms.find((a) => a.id === stickyArm)!
      : assignArm(experiment, subjectKey);

  try {
    const maySetCookies = await maySetFunctionalCookies();
    if (maySetCookies) {
      if (!userId) {
        jar.set(
          SUBJECT_COOKIE,
          subjectKey.startsWith("gid_") ? subjectKey : mintSubjectId(),
          {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          },
        );
      }
      jar.set(armCookie, arm.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 180,
      });
    }
  } catch {
    // cookies().set may throw in some RSC contexts — assignment still works in-memory.
  }

  return { experiment, arm, subjectKey };
}

export function recordGrowthExposure(assignment: GrowthAssignment): void {
  bump(exposureCounts, counterKey(assignment.experiment.id, assignment.arm.id));
  trackProductEventSafe({
    name: "growth_experiment_exposure",
    props: {
      experimentId: assignment.experiment.id,
      armId: assignment.arm.id,
      surface: assignment.experiment.surface,
    },
  });
}

export function recordGrowthConversion(
  assignment: GrowthAssignment,
  outcome?: string,
): void {
  bump(
    conversionCounts,
    counterKey(assignment.experiment.id, assignment.arm.id),
  );
  trackProductEventSafe({
    name: "growth_experiment_conversion",
    props: {
      experimentId: assignment.experiment.id,
      armId: assignment.arm.id,
      surface: assignment.experiment.surface,
      outcome: outcome ?? assignment.experiment.primaryOutcome,
    },
  });
}

export function getGrowthExperimentSnapshot() {
  const armCounts = listRunningGrowthExperiments().map((exp) => ({
    experimentId: exp.id,
    arms: exp.arms.map((a) => {
      const key = counterKey(exp.id, a.id);
      return {
        armId: a.id,
        exposures: exposureCounts.get(key) ?? 0,
        conversions: conversionCounts.get(key) ?? 0,
      };
    }),
  }));
  return buildGrowthExperimentSnapshot(armCounts);
}

export function resetGrowthExperimentCountersForTests(): void {
  exposureCounts.clear();
  conversionCounts.clear();
}

/** Homepage CTA assignment helper. */
export async function resolveHomepageCtaLabel(
  userId?: string | null,
): Promise<string> {
  const assignment = await getGrowthAssignment("homepage_cta_v1", userId);
  if (!assignment) return "Start free";
  recordGrowthExposure(assignment);
  return assignment.arm.payload.ctaLabel ?? "Start free";
}

/** Onboarding intro framing. */
export async function resolveOnboardingIntro(userId?: string | null): Promise<{
  introEyebrow: string;
  introSupport: string;
}> {
  const fallback = {
    introEyebrow: "Onboarding",
    introSupport:
      "A few steps so Today and Progress can use your real training context.",
  };
  const assignment = await getGrowthAssignment("onboarding_intro_v1", userId);
  if (!assignment) return fallback;
  recordGrowthExposure(assignment);
  return {
    introEyebrow: assignment.arm.payload.introEyebrow ?? fallback.introEyebrow,
    introSupport: assignment.arm.payload.introSupport ?? fallback.introSupport,
  };
}

/** Pricing free-tier CTA label (honesty alerts unchanged). */
export async function resolvePricingFreeCtaLabel(
  userId?: string | null,
): Promise<string> {
  const assignment = await getGrowthAssignment("pricing_cta_v1", userId);
  if (!assignment) return "Continue with Free";
  recordGrowthExposure(assignment);
  return assignment.arm.payload.freeCtaLabel ?? "Continue with Free";
}
