/**
 * Live Competition Mode (Prompt 196).
 * Future feature architecture for meet day — attempts, results,
 * next attempt, warm-up timing. Offline-friendly. No unsafe instructions.
 */

export const LIVE_COMPETITION_ENGINE_VERSION =
  "live_competition_mode.v1" as const;

export const LIVE_COMPETITION_HONESTY = [
  "Live Competition Mode architecture documents meet-day tracking — it does not invent attempts, results, or federation rulings.",
  "Warm-up timing is clock / schedule UX only — never an automatic load prescription or cut protocol.",
  "The product never tells you to attempt an unsafe jump, ignore pain, or dehydrate to make weight.",
  "Offline drafts stay local until sync; empty boards mean no session started, not fabricated lifts.",
] as const;

/** Meet-day session lifecycle. */
export const LIVE_MEET_STATUSES = [
  "planned",
  "active",
  "completed",
  "abandoned",
] as const;
export type LiveMeetStatus = (typeof LIVE_MEET_STATUSES)[number];

export const LIVE_MEET_STATUS_LABELS: Record<LiveMeetStatus, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  abandoned: "Abandoned",
};

export const LIVE_LIFT_KINDS = [
  "squat",
  "bench",
  "deadlift",
  "other",
] as const;
export type LiveLiftKind = (typeof LIVE_LIFT_KINDS)[number];

export const LIVE_LIFT_KIND_LABELS: Record<LiveLiftKind, string> = {
  squat: "Squat",
  bench: "Bench",
  deadlift: "Deadlift",
  other: "Other",
};

/** Classic three attempts per lift (powerlifting-shaped). */
export const LIVE_ATTEMPT_NUMBERS = [1, 2, 3] as const;
export type LiveAttemptNumber = (typeof LIVE_ATTEMPT_NUMBERS)[number];

export const LIVE_ATTEMPT_RESULTS = [
  "pending",
  "good",
  "no_lift",
  "not_taken",
] as const;
export type LiveAttemptResult = (typeof LIVE_ATTEMPT_RESULTS)[number];

export const LIVE_ATTEMPT_RESULT_LABELS: Record<LiveAttemptResult, string> = {
  pending: "Pending",
  good: "Good lift",
  no_lift: "No lift",
  not_taken: "Not taken",
};

/** Warm-up board slots — timing only, not load advice. */
export const LIVE_WARMUP_SLOT_KINDS = [
  "general",
  "bar",
  "build",
  "opener_rehearsal",
  "platform_ready",
] as const;
export type LiveWarmupSlotKind = (typeof LIVE_WARMUP_SLOT_KINDS)[number];

export const LIVE_WARMUP_SLOT_LABELS: Record<LiveWarmupSlotKind, string> = {
  general: "General warm-up window",
  bar: "Bar / technique window",
  build: "Build-up window",
  opener_rehearsal: "Opener rehearsal window",
  platform_ready: "Platform-ready window",
};

/**
 * Capabilities planned for a live meet day surface.
 * Architecture checklist — not a live claim of shipped UX.
 */
export const LIVE_COMPETITION_CAPABILITIES = [
  {
    id: "enter_competition",
    label: "Athlete enters competition",
    detail: "Start / resume a meet-day session linked to Competition Prep when present.",
  },
  {
    id: "track_attempts",
    label: "Track attempts",
    detail: "Planned load + attempt number per lift; athlete-entered, never invented.",
  },
  {
    id: "track_results",
    label: "Track results",
    detail: "Good / no lift / not taken — athlete or coach logged, not federation sync.",
  },
  {
    id: "next_attempt",
    label: "Next attempt",
    detail: "Resolve the next pending attempt on the board after a result is logged.",
  },
  {
    id: "warmup_timing",
    label: "Warm-up timing",
    detail: "Clock windows relative to flight / platform time — not load prescriptions.",
  },
  {
    id: "offline_friendly",
    label: "Offline-friendly",
    detail: "Local draft queue for attempts/results; sync when online (PWA pattern).",
  },
] as const;

export type LiveCompetitionCapabilityId =
  (typeof LIVE_COMPETITION_CAPABILITIES)[number]["id"];

/**
 * Unsafe / disallowed product behaviors for live meet day.
 */
export const LIVE_COMPETITION_SAFETY_REFUSALS = [
  "auto_prescribe_max_jumps",
  "ignore_pain_encouragement",
  "dehydration_or_cut_protocol",
  "guaranteed_make_claims",
  "federation_ruling_impersonation",
  "unsafe_warmup_load_protocol",
  "pressure_to_third_when_hurt",
] as const;

export const LIVE_COMPETITION_SAFETY_COPY = [
  "Never auto-prescribe attempt jumps or “must take” loads.",
  "Never encourage lifting through sharp pain, dizziness, or injury signals.",
  "Never provide dehydration, sauna, or extreme weight-cut instructions.",
  "Warm-up timing is scheduling only — loads stay athlete/coach decisions.",
  "Results are self-logged trackers, not official federation scoresheets.",
] as const;

/** Offline mutation kinds for a future local queue. */
export const LIVE_COMPETITION_OFFLINE_MUTATIONS = [
  "upsert_attempt_plan",
  "log_attempt_result",
  "update_warmup_slot",
  "update_meet_clock",
] as const;
export type LiveCompetitionOfflineMutation =
  (typeof LIVE_COMPETITION_OFFLINE_MUTATIONS)[number];

export const LIVE_COMPETITION_OFFLINE_STORAGE_KEY =
  "tsm-live-competition-pending" as const;
