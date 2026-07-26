import {
  DATABASE_SCALE_ENGINE_VERSION,
  DATABASE_SCALE_HONESTY,
  DATABASE_SCALE_PAGE_SIZES,
  type DatabaseScaleFinding,
  type ScalingPhase,
} from "@/domain/database-scale/constants";

/**
 * Audit registry — indexes, N+1, pagination, large tables, analytics,
 * technique metrics, video metadata.
 */
export const DATABASE_SCALE_FINDINGS: readonly DatabaseScaleFinding[] = [
  {
    id: "idx.auth_fks",
    focus: "indexes",
    title: "Auth FK indexes",
    detail:
      "Account.userId, Session.userId, PasswordResetToken.userId indexed for cascade and session revoke at user scale.",
    severity: "action",
    status: "shipped",
  },
  {
    id: "idx.session_completed",
    focus: "indexes",
    title: "TrainingSession completedAt composite",
    detail:
      "@@index([athleteProfileId, completedAt]) supports coach dashboards, weekly/monthly reports, recovery correlation.",
    severity: "action",
    status: "shipped",
  },
  {
    id: "idx.session_set_completed",
    focus: "indexes",
    title: "SessionSet.completedAt",
    detail:
      "Date index for set-history scans (competition mode, PR windows, previous-performance lookups).",
    severity: "action",
    status: "shipped",
  },
  {
    id: "idx.technique_list",
    focus: "indexes",
    title: "Technique soft-delete list index",
    detail:
      "@@index([athleteProfileId, deletedAt, createdAt]) matches list filters (deletedAt null + recent first).",
    severity: "action",
    status: "shipped",
  },
  {
    id: "idx.technique_storage_key",
    focus: "indexes",
    title: "TechniqueAnalysis.storageKey",
    detail:
      "Supports signed-media lookup and purge without table scans on large video metadata rows.",
    severity: "watch",
    status: "shipped",
  },
  {
    id: "idx.hot_athlete_series",
    focus: "indexes",
    title: "Athlete time-series already indexed",
    detail:
      "ProgressMetric, BodyMetric, AthleteScore, RecoveryEntry, TechniqueMetric use composite athlete/analysis keys.",
    severity: "ok",
    status: "shipped",
  },
  {
    id: "n1.workout_previous",
    focus: "n_plus_one",
    title: "Workout previous-performance batching",
    detail:
      "getWorkoutSessionView loads prior sets in one batched query per unique exercise — not one findFirst per line.",
    severity: "action",
    status: "shipped",
  },
  {
    id: "n1.program_graphs",
    focus: "n_plus_one",
    title: "Deep program graph includes",
    detail:
      "Adaptive / prescription / version services still walk weeks→days→workouts unbounded — cap or select projections when programs grow large.",
    severity: "watch",
    status: "planned",
  },
  {
    id: "page.technique_list",
    focus: "pagination",
    title: "Technique analysis list bound",
    detail: `listTechniqueAnalysesForUser uses take: ${DATABASE_SCALE_PAGE_SIZES.techniqueList}; cursor pagination is the next step for infinite scroll.`,
    severity: "action",
    status: "shipped",
  },
  {
    id: "page.cursor_strategy",
    focus: "pagination",
    title: "Cursor pagination strategy",
    detail:
      "Prefer cursor (id + createdAt) over skip/offset for athlete feeds. skip is O(n) on large tables — avoid for 100k+ users.",
    severity: "watch",
    status: "planned",
  },
  {
    id: "large.session_set",
    focus: "large_tables",
    title: "SessionSet growth",
    detail:
      "Highest write volume OLTP table. Keep athlete-scoped queries + date windows; archive completed seasons only after Postgres partitions are ready.",
    severity: "watch",
    status: "planned",
  },
  {
    id: "large.technique_analysis",
    focus: "large_tables",
    title: "TechniqueAnalysis + movementReportJson",
    detail:
      "Pose JSON and video metadata live on the row. Soft-delete; do not denormalize landmarks into SessionSet. Consider object-store-only blobs later.",
    severity: "watch",
    status: "planned",
  },
  {
    id: "large.audit_logs",
    focus: "large_tables",
    title: "Append-only audit tables",
    detail:
      "AdminAuditLog and moderation logs grow forever. Retain in OLTP with time indexes; cold-archive to object storage after 12–24 months.",
    severity: "watch",
    status: "planned",
  },
  {
    id: "analytics.separation",
    focus: "analytics_separation",
    title: "Product analytics out-of-band",
    detail:
      "track() adapters (noop/console) — not Prisma. Data moat AggregationJob is consent-gated and must not become a PII warehouse.",
    severity: "ok",
    status: "shipped",
  },
  {
    id: "analytics.oltp_metrics",
    focus: "analytics_separation",
    title: "OLTP metrics stay athlete-scoped",
    detail:
      "ProgressMetric / RecoveryEntry / AthleteScore remain transactional. Warehouse/export is a later phase — never mix with shard experiments.",
    severity: "ok",
    status: "shipped",
  },
  {
    id: "tech.metrics_child",
    focus: "technique_metrics",
    title: "TechniqueMetric child rows",
    detail:
      "Indexed on [techniqueAnalysisId, metricKey]. Cascade delete with parent analysis. Prefer select projections; avoid loading all metrics for list views.",
    severity: "ok",
    status: "shipped",
  },
  {
    id: "video.metadata_on_row",
    focus: "video_metadata",
    title: "Video metadata on TechniqueAnalysis",
    detail:
      "storageKey, mime, dims, duration, cameraAngle stay on the analysis row. Bytes live in private object storage — never public CDN long-cache of private video.",
    severity: "ok",
    status: "shipped",
  },
  {
    id: "scale.no_premature_shard",
    focus: "scaling_path",
    title: "No premature sharding",
    detail:
      "Single Postgres primary + replicas + indexes + pagination + analytics separation before any horizontal shard. See SCALING_PATH phases.",
    severity: "ok",
    status: "shipped",
  },
] as const;

/**
 * Explicit scaling path — ordered phases. Phase 1–3 before any shard.
 */
export const DATABASE_SCALING_PATH: readonly ScalingPhase[] = [
  {
    id: "phase1_indexes_bounds",
    phase: 1,
    title: "Indexes + query bounds (now)",
    triggers: "Any production deploy; before 10k users",
    actions: [
      "Ship hot-path composite indexes (this audit)",
      "Bound every athlete list (take / date window)",
      "Eliminate obvious N+1 on workout and coach dashboards",
      "Keep SQLite for local; Postgres for production",
    ],
    avoid: "Do not introduce application-level sharding or multi-DB writes",
  },
  {
    id: "phase2_postgres_replicas",
    phase: 2,
    title: "Postgres + read replicas",
    triggers: "~10k–50k MAU or CPU/IO saturation on primary",
    actions: [
      "Migrate DATABASE_URL to managed Postgres",
      "Connection pooling (PgBouncer / Prisma accelerate)",
      "Read replicas for coach multi-athlete and report jobs",
      "Introduce cursor pagination on technique, progress, notifications",
    ],
    avoid: "Do not split athlete OLTP across shards by userId yet",
  },
  {
    id: "phase3_analytics_archive",
    phase: 3,
    title: "Analytics separation + cold archive",
    triggers: "SessionSet / audit / technique JSON dominate storage or slow backups",
    actions: [
      "Export product analytics to warehouse (BigQuery/Snowflake/ClickHouse)",
      "Move large movementReportJson / video derivatives to object storage references",
      "Time-partition or cold-archive audit + old SessionSet seasons",
      "Keep TechniqueMetric in OLTP for athlete UX; aggregate offline for moat",
    ],
    avoid: "Do not build a second write path that diverges athlete truth",
  },
  {
    id: "phase4_partition_consider",
    phase: 4,
    title: "Partition large tables (optional)",
    triggers: "Single-table SessionSet or TechniqueAnalysis > ~100M rows / backup pain",
    actions: [
      "Postgres range partition SessionSet by completedAt month",
      "Evaluate TechniqueAnalysis partition by createdAt",
      "Revisit BRIN indexes for append-only audit logs",
    ],
    avoid: "Still prefer partition over application sharding",
  },
  {
    id: "phase5_shard_last",
    phase: 5,
    title: "Shard only if forced",
    triggers: "Single primary cannot meet SLO after replicas, partitions, and archive",
    actions: [
      "Shard by athleteProfileId ranges with careful cross-athlete coach queries",
      "Keep catalogs (Exercise) and billing global",
      "Document dual-write / migration runbooks before cutting over",
    ],
    avoid: "Never shard prematurely for “100k users” — Postgres handles that with phases 1–3",
  },
] as const;

export type DatabaseScaleSnapshot = {
  engineVersion: typeof DATABASE_SCALE_ENGINE_VERSION;
  findings: readonly DatabaseScaleFinding[];
  scalingPath: readonly ScalingPhase[];
  pageSizes: typeof DATABASE_SCALE_PAGE_SIZES;
  honesty: readonly string[];
  counts: {
    ok: number;
    watch: number;
    action: number;
    shipped: number;
    planned: number;
  };
  generatedAt: string;
};

export function buildDatabaseScaleSnapshot(
  generatedAt: string = new Date().toISOString(),
): DatabaseScaleSnapshot {
  const findings = DATABASE_SCALE_FINDINGS;
  return {
    engineVersion: DATABASE_SCALE_ENGINE_VERSION,
    findings,
    scalingPath: DATABASE_SCALING_PATH,
    pageSizes: DATABASE_SCALE_PAGE_SIZES,
    honesty: DATABASE_SCALE_HONESTY,
    counts: {
      ok: findings.filter((f) => f.severity === "ok").length,
      watch: findings.filter((f) => f.severity === "watch").length,
      action: findings.filter((f) => f.severity === "action").length,
      shipped: findings.filter((f) => f.status === "shipped").length,
      planned: findings.filter((f) => f.status === "planned").length,
    },
    generatedAt,
  };
}
