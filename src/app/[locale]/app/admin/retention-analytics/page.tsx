import { ComingSoon } from "@/components/ui/ComingSoon";
import { RetentionAnalyticsPanel } from "@/components/retention-analytics/RetentionAnalyticsPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getRetentionAnalyticsSnapshot } from "@/services/retention-analytics";

export default async function AdminRetentionAnalyticsPage() {
  await requireAdmin();

  if (!featureFlags.retentionAnalytics) {
    return (
      <ComingSoon
        title="Retention Analytics"
        description="D1/D7/D30, subscription, and feature retention analytics are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_RETENTION_ANALYTICS=true to review retention windows and action correlations (correlation ≠ causation)."
      />
    );
  }

  const snapshot = await getRetentionAnalyticsSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Retention analytics
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          D1 / D7 / D30, subscription, feature reuse, and action associations —
          correlation is not causation. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <RetentionAnalyticsPanel snapshot={snapshot} />
    </div>
  );
}
