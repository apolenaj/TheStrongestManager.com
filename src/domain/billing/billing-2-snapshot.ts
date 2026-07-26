import {
  BILLING_2_CAPABILITIES,
  BILLING_2_ENGINE_VERSION,
  BILLING_2_HONESTY,
  BILLING_GRACE_PERIOD_MS,
} from "@/domain/billing/billing-2";

export type Billing2Snapshot = {
  engineVersion: typeof BILLING_2_ENGINE_VERSION;
  capabilities: typeof BILLING_2_CAPABILITIES;
  honesty: typeof BILLING_2_HONESTY;
  gracePeriodDays: number;
  counts: { shipped: number; planned: number };
  generatedAt: string;
};

export function buildBilling2Snapshot(
  generatedAt: string = new Date().toISOString(),
): Billing2Snapshot {
  return {
    engineVersion: BILLING_2_ENGINE_VERSION,
    capabilities: BILLING_2_CAPABILITIES,
    honesty: BILLING_2_HONESTY,
    gracePeriodDays: BILLING_GRACE_PERIOD_MS / (24 * 60 * 60 * 1000),
    counts: {
      shipped: BILLING_2_CAPABILITIES.filter((c) => c.status === "shipped")
        .length,
      planned: BILLING_2_CAPABILITIES.filter(
        (c) => (c.status as string) === "planned",
      ).length,
    },
    generatedAt,
  };
}
