import { ComingSoon } from "@/components/ui/ComingSoon";
import { BackupRecoveryPanel } from "@/components/backup-recovery/BackupRecoveryPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getBackupRecoverySnapshot } from "@/services/backup-recovery";

export default async function AdminBackupRecoveryPage() {
  await requireAdmin();

  if (!featureFlags.backupRecovery) {
    return (
      <ComingSoon
        title="Backup & Recovery"
        description="The disaster recovery console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_BACKUP_RECOVERY=true to review database/file backups, restore tests, video retention, and DR tiers."
      />
    );
  }

  const snapshot = getBackupRecoverySnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Backup & Recovery
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Ops disaster recovery runbook registry — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Not athletic
          recovery. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <BackupRecoveryPanel snapshot={snapshot} />
    </div>
  );
}
