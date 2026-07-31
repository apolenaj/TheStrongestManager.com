import { ComingSoon } from "@/components/ui/ComingSoon";
import { EntitlementSystemPanel } from "@/components/entitlements/EntitlementSystemPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getEntitlementSystemSnapshot } from "@/services/entitlements";

export default async function AdminEntitlementsPage() {
  await requireAdmin();

  if (!featureFlags.entitlementSystem) {
    return (
      <ComingSoon
        title="Entitlement System"
        description="The central entitlements console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_ENTITLEMENT_SYSTEM=true to review feature → plan limit mapping and the EntitlementService."
      />
    );
  }

  const snapshot = getEntitlementSystemSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Entitlement System
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Central gates via EntitlementService — do not scatter plan checks in
          components. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <EntitlementSystemPanel snapshot={snapshot} />
    </div>
  );
}
