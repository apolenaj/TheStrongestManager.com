/**
 * Backup & Disaster Recovery audit registry (Prompt 156).
 * Runbook lives in docs/DISASTER_RECOVERY.md — no automated backup product yet.
 */

export const BACKUP_RECOVERY_ENGINE_VERSION = "backup_recovery.v1" as const;

export const BACKUP_RECOVERY_HONESTY = [
  "No automated backup cron or managed Postgres PITR is shipped in-repo — this is a runbook + audit registry.",
  "Database and technique/messaging files must be restored together; secrets are required for signed media and auth.",
  "Athletic Recovery docs are unrelated — this module is ops disaster recovery only.",
] as const;

export const BACKUP_RECOVERY_AREAS = [
  "database_backups",
  "file_backup",
  "restore_tests",
  "video_retention",
  "disaster_recovery",
] as const;

export type BackupRecoveryAreaId = (typeof BACKUP_RECOVERY_AREAS)[number];

export type BackupRecoveryStatus = "documented" | "partial" | "planned";

export type BackupRecoveryFinding = {
  id: string;
  area: BackupRecoveryAreaId;
  title: string;
  detail: string;
  status: BackupRecoveryStatus;
};

export const BACKUP_RECOVERY_FINDINGS: readonly BackupRecoveryFinding[] = [
  {
    id: "db.sqlite_copy",
    area: "database_backups",
    title: "SQLite file copy (local / staging)",
    detail:
      "DATABASE_URL file:./dev.db — manual cp of prisma/dev.db while app stopped. Gitignored.",
    status: "documented",
  },
  {
    id: "db.postgres_path",
    area: "database_backups",
    title: "Managed Postgres backups (production path)",
    detail:
      "Provider change per DATA_MODEL.md; enable host automated backups + restore drill when cut over. RPO/RTO TBD.",
    status: "planned",
  },
  {
    id: "file.technique_disk",
    area: "file_backup",
    title: "Technique video disk tree",
    detail:
      "TECHNIQUE_STORAGE_DIR or ./storage/technique — rsync/snapshot with matching DB backup. No S3 adapter yet.",
    status: "documented",
  },
  {
    id: "file.messaging_disk",
    area: "file_backup",
    title: "Messaging attachment disk tree",
    detail:
      "MESSAGING_STORAGE_DIR or ./storage/messaging — include when messaging is in use.",
    status: "documented",
  },
  {
    id: "restore.checklist",
    area: "restore_tests",
    title: "Non-prod restore checklist",
    detail:
      "Stop → restore DB + storage → secrets → migrate if needed → verify login + signed technique media. See DISASTER_RECOVERY.md.",
    status: "documented",
  },
  {
    id: "restore.cadence",
    area: "restore_tests",
    title: "Restore test cadence",
    detail:
      "Staging: after major migrations / quarterly. Production: after Postgres cutover, then ≥ semi-annually.",
    status: "documented",
  },
  {
    id: "video.user_purge",
    area: "video_retention",
    title: "User-triggered soft-delete and purge",
    detail:
      "deleteTechniqueAnalysisForUser unlinks files; account delete runs purgeTechniqueVideosForUser then hard-deletes User.",
    status: "partial",
  },
  {
    id: "video.no_ttl_job",
    area: "video_retention",
    title: "No scheduled video TTL / hard-purge job",
    detail:
      "Soft-deleted TechniqueAnalysis rows are not auto-purged. Product retention window must be defined before coding a worker.",
    status: "planned",
  },
  {
    id: "dr.severity_tiers",
    area: "disaster_recovery",
    title: "Severity tiers S1–S4",
    detail:
      "DB loss, media-only loss, secret leak, host/region failure — responses in DISASTER_RECOVERY.md. Multi-region not implemented.",
    status: "documented",
  },
  {
    id: "dr.secrets",
    area: "disaster_recovery",
    title: "Secrets out of band",
    detail:
      "AUTH_SECRET / TECHNIQUE_MEDIA_SECRET / Stripe — never in git; rotate on S3 leak tier.",
    status: "documented",
  },
] as const;
