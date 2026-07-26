import { ComingSoon } from "@/components/ui/ComingSoon";
import { WarmupGeneratorAdminPanel } from "@/components/warmup-generator/WarmupGeneratorAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getWarmupGeneratorAdminSnapshot } from "@/services/warmup-generator";

export default async function AdminWarmupGeneratorPage() {
  await requireAdmin();

  if (!featureFlags.warmupGenerator) {
    return (
      <ComingSoon
        title="Warm-up generator"
        description="Warm-up generator is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_WARMUP_GENERATOR=true to review conservative ladders and fatigue caps."
      />
    );
  }

  const snapshot = getWarmupGeneratorAdminSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Warm-up generator
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Progressive warm-ups — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <WarmupGeneratorAdminPanel snapshot={snapshot} />
    </div>
  );
}
