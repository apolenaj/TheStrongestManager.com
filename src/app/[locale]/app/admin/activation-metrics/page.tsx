import { ComingSoon } from "@/components/ui/ComingSoon";
import { ActivationMetricsPanel } from "@/components/activation-metrics/ActivationMetricsPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getActivationMetricsSnapshot } from "@/services/activation-metrics";

export default async function AdminActivationMetricsPage() {
  await requireAdmin();

  if (!featureFlags.activationMetrics) {
    return (
      <ComingSoon
        title="Activation Metrics"
        description="Product activation cohort dashboard is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_ACTIVATION_METRICS=true to review onboarding → workout → technique → D7 return activation."
      />
    );
  }

  const snapshot = await getActivationMetricsSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Activation metrics
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Product activation — not vanity traffic. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ActivationMetricsPanel snapshot={snapshot} />
    </div>
  );
}
