import { ComingSoon } from "@/components/ui/ComingSoon";
import { ObservabilityPanel } from "@/components/observability/ObservabilityPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getObservabilitySnapshot } from "@/services/observability";

export default async function AdminObservabilityPage() {
  await requireAdmin();

  if (!featureFlags.productionObservability) {
    return (
      <ComingSoon
        title="Observability"
        description="Production monitoring is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PRODUCTION_OBSERVABILITY=true to review errors, latency, DB, jobs, payments, and technique failure signals."
      />
    );
  }

  const snapshot = getObservabilitySnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Observability
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Production monitoring with correlation IDs — sanitized logs only.
          Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ObservabilityPanel snapshot={snapshot} />
    </div>
  );
}
