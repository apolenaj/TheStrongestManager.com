import { ComingSoon } from "@/components/ui/ComingSoon";
import { AiObservabilityPanel } from "@/components/ai-observability/AiObservabilityPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getAiObservabilitySnapshot } from "@/services/ai-observability";

export default async function AdminAiObservabilityPage() {
  await requireAdmin();

  if (!featureFlags.aiObservability) {
    return (
      <ComingSoon
        title="AI observability"
        description="The AI observability dashboard is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_AI_OBSERVABILITY=true to monitor requests, latency, cost, and feedback."
      />
    );
  }

  const snapshot = await getAiObservabilitySnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          AI observability
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Internal monitoring for AI requests, success rate, latency, cost,
          failures, hallucination proxies, and user feedback. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString()}.
        </p>
      </div>
      <AiObservabilityPanel snapshot={snapshot} />
    </div>
  );
}
