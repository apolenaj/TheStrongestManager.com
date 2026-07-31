import { ComingSoon } from "@/components/ui/ComingSoon";
import { DeviceDataNormalizationPanel } from "@/components/device-data-normalization/DeviceDataNormalizationPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getDeviceDataNormalizationSnapshot } from "@/services/device-data-normalization";

export default async function AdminDeviceDataNormalizationPage() {
  await requireAdmin();

  if (!featureFlags.deviceDataNormalization) {
    return (
      <ComingSoon
        title="Device data normalization"
        description="Canonical device metric normalization is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_DEVICE_DATA_NORMALIZATION=true to review sleep / HR / HRV / steps / workout schemas and cross-device caveats."
      />
    );
  }

  const snapshot = getDeviceDataNormalizationSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Device data normalization
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Canonical units + source metadata — never equate vendors without
          caveats. See <code className="text-xs">{snapshot.docPath}</code>.
          Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <DeviceDataNormalizationPanel snapshot={snapshot} />
    </div>
  );
}
