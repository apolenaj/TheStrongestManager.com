import { ComingSoon } from "@/components/ui/ComingSoon";
import { AiCostDashboardPanel } from "@/components/ai-cost/AiCostDashboardPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getAiCostDashboardSnapshot } from "@/services/ai-cost-control";

export default async function AdminAiCostPage() {
  await requireAdmin();

  if (!featureFlags.aiCostControl) {
    return (
      <ComingSoon
        title="AI cost control"
        description="The AI cost dashboard is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_AI_COST_CONTROL=true to review inference routing and meters."
      />
    );
  }

  const snapshot = getAiCostDashboardSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          AI cost control
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Internal architecture for inference routing, caching, and cost per
          feature. Generated {new Date(snapshot.generatedAt).toLocaleString()}.
        </p>
      </div>
      <AiCostDashboardPanel snapshot={snapshot} />
    </div>
  );
}
