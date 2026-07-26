/**
 * Production Observability (Prompt 155).
 * Errors, performance, API latency, DB, background jobs, payments, technique.
 * Correlation IDs — never log sensitive payloads.
 */

export const OBSERVABILITY_ENGINE_VERSION = "observability.v1" as const;

export const OBSERVABILITY_HONESTY = [
  "Logs use structured JSON with correlation IDs — never emails, passwords, video bytes, pose frames, or free-text health notes.",
  "AI cost/latency stays in Prompt 147 (ai-observability). This layer covers HTTP, DB, jobs, payments, and technique pipeline failures.",
  "In-process ring buffer + console adapter for v1. Swap to Datadog/Sentry sinks without changing signal names.",
] as const;

/** Monitoring signal categories from Prompt 155. */
export const OBSERVABILITY_CATEGORIES = [
  "errors",
  "performance",
  "api_latency",
  "database",
  "background_jobs",
  "payment_failures",
  "technique_failures",
] as const;

export type ObservabilityCategory = (typeof OBSERVABILITY_CATEGORIES)[number];

export type ObservabilityLevel = "debug" | "info" | "warn" | "error";

export type ObservabilitySignalDef = {
  id: string;
  category: ObservabilityCategory;
  title: string;
  detail: string;
  /** Where instrumentation is wired. */
  emitAt: string;
  status: "shipped" | "planned";
};

export const OBSERVABILITY_SIGNALS: readonly ObservabilitySignalDef[] = [
  {
    id: "corr.request_id",
    category: "performance",
    title: "Correlation IDs",
    detail:
      "x-correlation-id generated or accepted per API request; propagated via AsyncLocalStorage into logs.",
    emitAt: "withObservedApi / resolveCorrelationId",
    status: "shipped",
  },
  {
    id: "api.latency",
    category: "api_latency",
    title: "API latency",
    detail:
      "Observed routes log method, path, status, durationMs — no request bodies.",
    emitAt: "withObservedApi wrapper on technique + billing APIs",
    status: "shipped",
  },
  {
    id: "err.render",
    category: "errors",
    title: "React render errors",
    detail:
      "Client beacons digest-only to /api/observability — never stack dumps with user content.",
    emitAt: "error.tsx / global-error.tsx → POST /api/observability",
    status: "shipped",
  },
  {
    id: "db.prisma_error",
    category: "database",
    title: "Database errors",
    detail:
      "Prisma client error events → structured logger (message truncated, no query params with PII).",
    emitAt: "src/lib/db.ts $on('error')",
    status: "shipped",
  },
  {
    id: "jobs.handler_fail",
    category: "background_jobs",
    title: "Background job failures",
    detail:
      "Domain event queue soft-fails and catch blocks emit job signal with handler id + dedupeKey.",
    emitAt: "event-driven/queue.ts runHandler",
    status: "shipped",
  },
  {
    id: "pay.webhook_fail",
    category: "payment_failures",
    title: "Payment / webhook failures",
    detail:
      "Stripe webhook rate-limit, misconfig, bad signature, invalid JSON — no payload body logged.",
    emitAt: "api/billing/webhook",
    status: "shipped",
  },
  {
    id: "pay.checkout_fail",
    category: "payment_failures",
    title: "Checkout failures",
    detail:
      "tryCreateCheckoutSession {ok:false} emits code + planId — never customer email.",
    emitAt: "billing-service.tryCreateCheckoutSession",
    status: "shipped",
  },
  {
    id: "tech.upload_fail",
    category: "technique_failures",
    title: "Technique upload failures",
    detail:
      "Unexpected upload exceptions log analysis-safe codes only — no file buffers or filenames.",
    emitAt: "api/technique/analyses POST catch",
    status: "shipped",
  },
  {
    id: "tech.pipeline_fail",
    category: "technique_failures",
    title: "Technique processing failures",
    detail:
      "persistMovementReport {ok:false} and honesty-contract failures emit technique_failures.",
    emitAt: "persistMovementReport + movement API",
    status: "shipped",
  },
] as const;

/** HTTP header for correlation propagation. */
export const CORRELATION_HEADER = "x-correlation-id" as const;

/**
 * Keys never allowed on observability log props.
 * Broader than analytics — includes auth/payment secrets.
 */
export const FORBIDDEN_LOG_PROP_KEYS = [
  "email",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "idToken",
  "authorization",
  "cookie",
  "cookies",
  "stripeSignature",
  "stripe-signature",
  "webhookSecret",
  "secret",
  "apiKey",
  "name",
  "fullName",
  "phone",
  "address",
  "notes",
  "note",
  "comment",
  "message",
  "body",
  "summary",
  "payload",
  "rawBody",
  "bodyweight",
  "heartRate",
  "hrv",
  "sleepHours",
  "injury",
  "medical",
  "diagnosis",
  "video",
  "videoUrl",
  "storageKey",
  "fileBuffer",
  "buffer",
  "landmarks",
  "frames",
  "poseFrames",
  "movementReport",
  "movementReportJson",
  "originalFileName",
  "fileName",
  "mimeType",
  "stack",
] as const;
