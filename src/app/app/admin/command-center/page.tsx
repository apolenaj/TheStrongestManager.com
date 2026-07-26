import { ComingSoon } from "@/components/ui/ComingSoon";
import { CommandCenterAdminPanel } from "@/components/command-center/CommandCenterAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getCommandCenterSnapshot } from "@/services/command-center";

export default async function AdminCommandCenterPage() {
  await requireAdmin();

  if (!featureFlags.commandCenter) {
    return (
      <ComingSoon
        title="Performance OS Command Center"
        description="Command Center architecture is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_COMMAND_CENTER=true to review section catalog, fold policy, and adaptive layout."
      />
    );
  }

  const snapshot = getCommandCenterSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Performance OS Command Center
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Ultimate dashboard shell — TODAY above fold by default; widgets
          customizable. See <code className="text-xs">{snapshot.docPath}</code>.
          Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <CommandCenterAdminPanel snapshot={snapshot} />
    </div>
  );
}
