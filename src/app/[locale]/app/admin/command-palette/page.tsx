import { ComingSoon } from "@/components/ui/ComingSoon";
import { CommandPaletteAdminPanel } from "@/components/command-palette/CommandPaletteAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getCommandPaletteSnapshot } from "@/services/command-palette";

export default async function AdminCommandPalettePage() {
  await requireAdmin();

  if (!featureFlags.commandPalette) {
    return (
      <ComingSoon
        title="Command palette"
        description="Power-user command palette is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_COMMAND_PALETTE=true to review commands and keyboard shortcuts."
      />
    );
  }

  const snapshot = getCommandPaletteSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Command palette
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Power-user commands — keyboard accessible. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <CommandPaletteAdminPanel snapshot={snapshot} />
    </div>
  );
}
