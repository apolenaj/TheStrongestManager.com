import { ComingSoon } from "@/components/ui/ComingSoon";
import { CustomDashboardsAdminPanel } from "@/components/custom-dashboards/CustomDashboardsAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getCustomDashboardsSnapshot } from "@/services/custom-dashboards";

export default async function AdminCustomDashboardsPage() {
  await requireAdmin();

  if (!featureFlags.customDashboards) {
    return (
      <ComingSoon
        title="Custom dashboards"
        description="Athlete dashboard focus presets are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_CUSTOM_DASHBOARDS=true to review Strength→Bodybuilding smart defaults and save layout."
      />
    );
  }

  const snapshot = getCustomDashboardsSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Custom dashboards
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Focus presets + saved layouts. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <CustomDashboardsAdminPanel snapshot={snapshot} />
    </div>
  );
}
