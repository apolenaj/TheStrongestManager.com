import {
  BACKUP_RECOVERY_AREAS,
  BACKUP_RECOVERY_ENGINE_VERSION,
  BACKUP_RECOVERY_FINDINGS,
  BACKUP_RECOVERY_HONESTY,
} from "@/domain/backup-recovery/constants";

export type BackupRecoverySnapshot = {
  engineVersion: typeof BACKUP_RECOVERY_ENGINE_VERSION;
  findings: typeof BACKUP_RECOVERY_FINDINGS;
  areas: typeof BACKUP_RECOVERY_AREAS;
  honesty: typeof BACKUP_RECOVERY_HONESTY;
  docPath: "docs/DISASTER_RECOVERY.md";
  counts: {
    documented: number;
    partial: number;
    planned: number;
  };
  generatedAt: string;
};

export function buildBackupRecoverySnapshot(
  generatedAt: string = new Date().toISOString(),
): BackupRecoverySnapshot {
  return {
    engineVersion: BACKUP_RECOVERY_ENGINE_VERSION,
    findings: BACKUP_RECOVERY_FINDINGS,
    areas: BACKUP_RECOVERY_AREAS,
    honesty: BACKUP_RECOVERY_HONESTY,
    docPath: "docs/DISASTER_RECOVERY.md",
    counts: {
      documented: BACKUP_RECOVERY_FINDINGS.filter(
        (f) => f.status === "documented",
      ).length,
      partial: BACKUP_RECOVERY_FINDINGS.filter((f) => f.status === "partial")
        .length,
      planned: BACKUP_RECOVERY_FINDINGS.filter((f) => f.status === "planned")
        .length,
    },
    generatedAt,
  };
}
