import { ComingSoon } from "@/components/ui/ComingSoon";
import { GrowthExperimentPanel } from "@/components/growth-experiments/GrowthExperimentPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getGrowthExperimentSnapshot } from "@/services/growth-experiments";

export default async function AdminGrowthExperimentsPage() {
  await requireAdmin();

  if (!featureFlags.growthExperiments) {
    return (
      <ComingSoon
        title="Growth Experiment Framework"
        description="Safe A/B testing for homepage CTA, onboarding, and pricing is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_GROWTH_EXPERIMENTS=true to review allowlisted experiments and outcome reports."
      />
    );
  }

  const snapshot = getGrowthExperimentSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Growth experiments
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Allowlisted marketing surfaces only — never safety, privacy, or medical
          copy. Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}
          .
        </p>
      </div>
      <GrowthExperimentPanel snapshot={snapshot} />
    </div>
  );
}
