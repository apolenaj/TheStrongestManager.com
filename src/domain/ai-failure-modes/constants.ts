/**
 * AI Failure Modes (Prompt 144).
 * Graceful degradation when AI is unavailable — core app keeps working.
 * Never show fabricated AI output.
 */

export const AI_FAILURE_MODES_ENGINE_VERSION = "ai_failure_modes.v1" as const;

export const AI_FAILURE_MODES_HONESTY = [
  "If AI is unavailable, the core app still works — training logging, programs, exercise library, and progress charts.",
  "Use fallback deterministic systems where possible — rule-based coaching is labelled, not sold as a live LLM.",
  "Never show fabricated AI output — empty or structured failure beats invented recommendations or scores.",
  "Coming soon means unshipped; AI unavailable means shipped but down, not configured, or degraded.",
] as const;

export const AI_FAILURE_KINDS = [
  "not_configured",
  "unavailable",
  "degraded",
  "timeout",
  "rejected",
  "failed",
] as const;

export type AiFailureKind = (typeof AI_FAILURE_KINDS)[number];

export const AI_FAILURE_KIND_LABELS: Record<AiFailureKind, string> = {
  not_configured: "Not configured",
  unavailable: "Unavailable",
  degraded: "Deterministic fallback",
  timeout: "Timed out",
  rejected: "Blocked for safety",
  failed: "Failed",
};

export const AI_FAILURE_KIND_TITLES: Record<AiFailureKind, string> = {
  not_configured: "AI isn’t set up yet",
  unavailable: "AI temporarily unavailable",
  degraded: "Using rule-based coaching",
  timeout: "AI timed out",
  rejected: "AI output was blocked",
  failed: "AI request failed",
};

/**
 * Capabilities that may fail independently.
 * Core app routes are never gated on these.
 */
export const AI_CAPABILITY_IDS = [
  "technique_backend",
  "coach_brain",
  "coach_chat",
  "coach_ai_copilot",
  "program_review",
  "daily_brief",
  "insights",
  "research_summarizer",
] as const;

export type AiCapabilityId = (typeof AI_CAPABILITY_IDS)[number];

export const AI_CAPABILITY_LABELS: Record<AiCapabilityId, string> = {
  technique_backend: "Technique analysis",
  coach_brain: "AI Coach Brain",
  coach_chat: "AI Coach chat",
  coach_ai_copilot: "Coach AI Copilot",
  program_review: "Program AI review",
  daily_brief: "Daily coaching brief",
  insights: "Cross-domain insights",
  research_summarizer: "Research summarizer",
};

export type AiCapabilityMode =
  | "none"
  | "deterministic_stub"
  | "rules"
  | "llm"
  | "pose_mvp";

export type AiCapabilityStatusLevel =
  | "ready"
  | "degraded"
  | "unavailable"
  | "not_configured";

export type AiFailure = {
  kind: AiFailureKind;
  /** Athlete-facing message — never invents a recommendation. */
  message: string;
  /** Core training loop remains usable. */
  coreStillAvailable: true;
  capabilityId: AiCapabilityId;
  detail?: string | null;
};

export type AiCapabilityStatus = {
  id: AiCapabilityId;
  label: string;
  status: AiCapabilityStatusLevel;
  mode: AiCapabilityMode;
  failure: AiFailure | null;
  /** When true, a deterministic fallback is actively providing limited output. */
  usingDeterministicFallback: boolean;
};

/** Core product surfaces that must work without AI. */
export const CORE_APP_LINKS = [
  { href: "/app/training", label: "Training logging" },
  { href: "/app/programs", label: "Programs" },
  { href: "/app/exercises", label: "Exercise library" },
  { href: "/app/progress", label: "Progress charts" },
] as const;

export type CoreAppLink = (typeof CORE_APP_LINKS)[number];

export function buildAiFailure(input: {
  kind: AiFailureKind;
  capabilityId: AiCapabilityId;
  message: string;
  detail?: string | null;
}): AiFailure {
  return {
    kind: input.kind,
    capabilityId: input.capabilityId,
    message: input.message.trim(),
    detail: input.detail?.trim() || null,
    coreStillAvailable: true,
  };
}

/**
 * Map technique backend resolve status → capability status.
 */
export function techniqueBackendCapabilityStatus(
  backend: "unavailable" | "development_stub" | "pose_mvp_ready" | string,
): AiCapabilityStatus {
  const id = "technique_backend" as const;
  const label = AI_CAPABILITY_LABELS[id];

  if (backend === "pose_mvp_ready") {
    return {
      id,
      label,
      status: "ready",
      mode: "pose_mvp",
      failure: null,
      usingDeterministicFallback: false,
    };
  }

  if (backend === "development_stub") {
    return {
      id,
      label,
      status: "degraded",
      mode: "deterministic_stub",
      failure: buildAiFailure({
        kind: "degraded",
        capabilityId: id,
        message:
          "Technique analysis backend is not configured. Videos still save privately — no technique score is invented.",
        detail: "development_stub",
      }),
      usingDeterministicFallback: true,
    };
  }

  return {
    id,
    label,
    status: "unavailable",
    mode: "none",
    failure: buildAiFailure({
      kind: "unavailable",
      capabilityId: id,
      message:
        "Technique analysis is unavailable. Your video stays private. No fabricated scores are shown.",
    }),
    usingDeterministicFallback: false,
  };
}

/**
 * Coach Brain / chat today: deterministic rules + stub adapter (honest degraded).
 */
export function coachBrainCapabilityStatus(input?: {
  safetyRejected?: boolean;
  llmConfigured?: boolean;
}): AiCapabilityStatus {
  const id = "coach_brain" as const;
  const label = AI_CAPABILITY_LABELS[id];

  if (input?.safetyRejected) {
    return {
      id,
      label,
      status: "unavailable",
      mode: "rules",
      failure: buildAiFailure({
        kind: "rejected",
        capabilityId: id,
        message:
          "Safety checks blocked AI output. Nothing was auto-applied. Core training tools still work.",
      }),
      usingDeterministicFallback: false,
    };
  }

  if (input?.llmConfigured) {
    return {
      id,
      label,
      status: "ready",
      mode: "llm",
      failure: null,
      usingDeterministicFallback: false,
    };
  }

  return {
    id,
    label,
    status: "degraded",
    mode: "deterministic_stub",
    failure: buildAiFailure({
      kind: "degraded",
      capabilityId: id,
      message:
        "Using rule-based coaching from your logged signals — not a live language-model session. Recommendations stay structured and empty when data is missing.",
    }),
    usingDeterministicFallback: true,
  };
}

export function flagGatedCapabilityStatus(
  id: AiCapabilityId,
  enabled: boolean,
  mode: AiCapabilityMode = "rules",
): AiCapabilityStatus {
  const label = AI_CAPABILITY_LABELS[id];
  if (!enabled) {
    return {
      id,
      label,
      status: "unavailable",
      mode: "none",
      failure: buildAiFailure({
        kind: "unavailable",
        capabilityId: id,
        message: `${label} is turned off. Core training, programs, exercises, and progress still work.`,
      }),
      usingDeterministicFallback: false,
    };
  }
  return {
    id,
    label,
    status: mode === "deterministic_stub" || mode === "rules" ? "degraded" : "ready",
    mode,
    failure:
      mode === "deterministic_stub" || mode === "rules"
        ? buildAiFailure({
            kind: "degraded",
            capabilityId: id,
            message: `${label} is running on deterministic rules — not a live LLM.`,
          })
        : null,
    usingDeterministicFallback: mode === "deterministic_stub" || mode === "rules",
  };
}

/**
 * Product rule: never invent AI text or scores when the capability failed.
 */
export function shouldSuppressAiOutput(
  status: AiCapabilityStatus,
): boolean {
  if (status.status === "ready") return false;
  if (status.status === "degraded" && status.usingDeterministicFallback) {
    return false; // allow labelled deterministic output
  }
  return true;
}

export function failureKindFromTechniqueBackend(
  backend: string,
): AiFailureKind {
  if (backend === "development_stub") return "degraded";
  if (backend === "failed") return "failed";
  return "unavailable";
}
