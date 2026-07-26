/**
 * Stage transition rules for premium coaching applications.
 */

import {
  isPremiumCoachingStage,
  type PremiumCoachingStage,
  type PremiumCoachingStatus,
} from "@/domain/premium-coaching-sales/constants";

const FORWARD: Record<PremiumCoachingStage, PremiumCoachingStage | null> = {
  applied: "in_review",
  in_review: "consultation",
  consultation: "offer",
  offer: null,
};

/**
 * Allowed next stage for happy-path progression.
 */
export function nextPremiumCoachingStage(
  current: PremiumCoachingStatus,
): PremiumCoachingStage | null {
  if (!isPremiumCoachingStage(current)) return null;
  return FORWARD[current];
}

export function canAdvancePremiumCoachingStage(
  from: PremiumCoachingStatus,
  to: PremiumCoachingStatus,
): boolean {
  if (!isPremiumCoachingStage(from) || !isPremiumCoachingStage(to)) {
    return false;
  }
  return FORWARD[from] === to;
}

export function canDeclineFrom(status: PremiumCoachingStatus): boolean {
  return (
    status === "applied" ||
    status === "in_review" ||
    status === "consultation" ||
    status === "offer"
  );
}

export function canWithdrawFrom(status: PremiumCoachingStatus): boolean {
  return (
    status === "applied" ||
    status === "in_review" ||
    status === "consultation" ||
    status === "offer"
  );
}

/** Ordered funnel for UI progress (excludes terminal). */
export function premiumCoachingFunnelSteps(): PremiumCoachingStage[] {
  return ["applied", "in_review", "consultation", "offer"];
}
