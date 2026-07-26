/**
 * Backup & Disaster Recovery service — snapshot for admin.
 */

import {
  buildBackupRecoverySnapshot,
  type BackupRecoverySnapshot,
} from "@/domain/backup-recovery";

export function getBackupRecoverySnapshot(): BackupRecoverySnapshot {
  return buildBackupRecoverySnapshot();
}
