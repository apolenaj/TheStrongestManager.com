import { ComingSoon } from "@/components/ui/ComingSoon";
import { AiModelRouterPanel } from "@/components/ai-model-router/AiModelRouterPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getAiModelRouterDashboardSnapshot } from "@/services/ai-model-router";

export default async function AdminAiRouterPage() {
  await requireAdmin();

  if (!featureFlags.aiModelRouter) {
    return (
      <ComingSoon
        title="Multi-model AI router"
        description="The AI model router dashboard is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_AI_MODEL_ROUTER=true to inspect provider chains and attempts."
      />
    );
  }

  const snapshot = getAiModelRouterDashboardSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Multi-model AI router
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Provider abstraction with fallbacks. Latency, errors, and cost are
          logged per attempt. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString()}.
        </p>
      </div>
      <AiModelRouterPanel snapshot={snapshot} />
    </div>
  );
}
