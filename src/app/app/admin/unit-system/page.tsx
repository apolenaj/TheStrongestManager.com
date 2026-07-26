import { ComingSoon } from "@/components/ui/ComingSoon";
import { UnitSystemPanel } from "@/components/unit-system/UnitSystemPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getUnitSystemSnapshot } from "@/services/unit-system";

export default async function AdminUnitSystemPage() {
  await requireAdmin();

  if (!featureFlags.unitSystem) {
    return (
      <ComingSoon
        title="Unit system"
        description="The global unit system console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_UNIT_SYSTEM=true to review canonical kg/cm/m storage and presentation conversions."
      />
    );
  }

  const snapshot = getUnitSystemSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Unit system
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Global units: kg/lb, cm/ft/in, km/miles where relevant. Values are
          stored canonically; preferences convert presentation only. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <UnitSystemPanel snapshot={snapshot} />
    </div>
  );
}
