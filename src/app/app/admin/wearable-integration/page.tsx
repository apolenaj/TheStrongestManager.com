import { ComingSoon } from "@/components/ui/ComingSoon";
import { WearableIntegrationPanel } from "@/components/wearable-integration/WearableIntegrationPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getWearableIntegrationSnapshot } from "@/services/wearable-integration";

export default async function AdminWearableIntegrationPage() {
  await requireAdmin();

  if (!featureFlags.wearableIntegration) {
    return (
      <ComingSoon
        title="Wearable integration"
        description="The wearable adapter registry is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_WEARABLE_INTEGRATION=true to review Apple Health, Health Connect, Garmin, Whoop, and Oura extension points — without fake connections."
      />
    );
  }

  const snapshot = getWearableIntegrationSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Wearable integration
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Adapter interfaces only — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <WearableIntegrationPanel snapshot={snapshot} />
    </div>
  );
}
