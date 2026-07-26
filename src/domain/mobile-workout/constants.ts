/**
 * Mobile-First Workout App Experience (Prompt 183).
 * Native-feeling live workout — not a dashboard during training.
 */

export const MOBILE_WORKOUT_ENGINE_VERSION = "mobile_workout.v1" as const;

export const MOBILE_WORKOUT_HONESTY = [
  "During an active workout the UI prioritizes one exercise, large controls, and fast logging — not dashboard density.",
  "Set values auto-save after a short pause; completing a set still starts the rest timer explicitly.",
  "Previous performance is shown from your last logged session for the same lift — never invented.",
  "Offline drafts queue locally and sync when online; the server remains source of truth after sync.",
] as const;

/** UX principles for the live workout player. */
export const MOBILE_WORKOUT_PRINCIPLES = [
  {
    id: "one_hand",
    title: "One-hand use",
    detail:
      "Primary actions sit in the thumb zone (bottom sticky dock). Exercise switching uses large Prev/Next controls.",
  },
  {
    id: "fast_set_logging",
    title: "Fast set logging",
    detail:
      "Load / reps / RPE use steppers with prescription seeds — Complete set is one tap.",
  },
  {
    id: "large_controls",
    title: "Large controls",
    detail: "Minimum touch targets ≥ 48px; display numerals for load and reps.",
  },
  {
    id: "minimal_typing",
    title: "Minimal typing",
    detail:
      "Steppers first; optional notes stay collapsed. No keyboard required for a normal set.",
  },
  {
    id: "auto_save",
    title: "Auto-save",
    detail:
      "Draft values debounce-save without leaving the set. Offline queue when disconnected.",
  },
  {
    id: "rest_timer",
    title: "Rest timer",
    detail:
      "Sticky rest timer; starts when a set is completed using prescribed rest when available.",
  },
  {
    id: "previous_performance",
    title: "Previous performance",
    detail:
      "Last logged load × reps × RPE for the lift stays visible on the focused exercise.",
  },
  {
    id: "no_dashboard_density",
    title: "No dashboard density",
    detail:
      "One exercise focus during the workout; metadata and session notes stay secondary.",
  },
] as const;

export const MOBILE_WORKOUT_AUTO_SAVE_MS = 900 as const;

export const MOBILE_WORKOUT_LOAD_STEP = {
  kg: 2.5,
  lb: 5,
} as const;

export const MOBILE_WORKOUT_REP_STEP = 1 as const;

export const MOBILE_WORKOUT_RPE_STEP = 0.5 as const;

export const MOBILE_WORKOUT_REST_PRESETS_SEC = [60, 90, 120, 180] as const;

export const MOBILE_WORKOUT_MIN_TOUCH_PX = 48 as const;
