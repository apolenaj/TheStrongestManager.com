import { ComingSoon } from "@/components/ui/ComingSoon";
import { SafetySystemPanel } from "@/components/safety-system/SafetySystemPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getSafetySystemSnapshot } from "@/services/safety-system";

export default async function AdminSafetySystemPage() {
  await requireAdmin();

  if (!featureFlags.safetySystem20) {
    return (
      <ComingSoon
        title="Safety System 2.0"
        description="The central recommendation safety console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_SAFETY_SYSTEM_20=true to review frequency, volume, weight-loss, diagnosis, and pain-ignoring gates."
      />
    );
  }

  const snapshot = getSafetySystemSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Safety System 2.0
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Central recommendation validator — block or modify unsafe advice. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <SafetySystemPanel snapshot={snapshot} />
    </div>
  );
}
