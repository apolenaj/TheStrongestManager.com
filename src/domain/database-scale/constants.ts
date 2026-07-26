/**
 * Database Scale Audit — readiness for 100k+ users (Prompt 153).
 * Do not prematurely shard. Prefer indexes, pagination, and analytics separation.
 */

export const DATABASE_SCALE_ENGINE_VERSION = "database_scale.v1" as const;

export const DATABASE_SCALE_HONESTY = [
  "Local development uses SQLite; production path is PostgreSQL — same Prisma schema, no premature sharding.",
  "Product analytics events stay out-of-band (adapters). OLTP holds athlete training, technique, and audit rows.",
  "Do not shard until single-primary Postgres with read replicas and partition candidates are exhausted.",
] as const;

/** Audit focus areas from Prompt 153. */
export const DATABASE_SCALE_FOCUS = [
  "indexes",
  "n_plus_one",
  "pagination",
  "large_tables",
  "analytics_separation",
  "technique_metrics",
  "video_metadata",
  "scaling_path",
] as const;
export type DatabaseScaleFocusId = (typeof DATABASE_SCALE_FOCUS)[number];

export type AuditSeverity = "ok" | "watch" | "action";

export type DatabaseScaleFinding = {
  id: string;
  focus: DatabaseScaleFocusId;
  title: string;
  detail: string;
  severity: AuditSeverity;
  /** Concrete remediation already shipped or still planned. */
  status: "shipped" | "planned";
};

export type ScalingPhase = {
  id: string;
  phase: number;
  title: string;
  triggers: string;
  actions: readonly string[];
  /** Explicit non-goals for this phase. */
  avoid: string;
};

/** Default page sizes for athlete-scoped lists (cursor-ready constants). */
export const DATABASE_SCALE_PAGE_SIZES = {
  techniqueList: 40,
  notificationInbox: 30,
  auditLog: 50,
  coachQueue: 50,
  progressHistory: 100,
} as const;
