/**
 * Named scoring thresholds.
 *
 * Every constant here is a product rule with an explicit rationale —
 * not an unexplained “magic number” buried in a formula.
 */

/** Calendar window for session-based scores (consistency, programming). */
export const SESSION_WINDOW_DAYS = 28;
/** Rationale: one mesocycle-ish window; long enough for adherence signal, short enough to stay current. */

/** Recovery readiness sample window. */
export const RECOVERY_WINDOW_DAYS = 14;
/** Rationale: readiness is short-horizon; older entries dilute current recovery state. */

/** Strength: samples required per lift before history is meaningful. */
export const STRENGTH_MIN_SAMPLES_PER_LIFT = 2;
/** Rationale: two points establish a before/after on the same lift. */

/** Legacy aliases — prefer strength/thresholds context lift minima. */
export const STRENGTH_MIN_LIFTS_FOR_MEDIUM = 2;
export const STRENGTH_MIN_LIFTS_FOR_HIGH = 3;

/** Technique: analyses required before score may be displayed (medium). */
export const TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM = 2;
/** Rationale: one analysis is a snapshot, not a trend; hide until a second confirms signal. */

/** Technique: analyses required for high confidence. */
export const TECHNIQUE_MIN_ANALYSES_FOR_HIGH = 3;

/** Programming: resolved (completed|skipped) program-linked sessions for medium. */
export const PROGRAMMING_MIN_RESOLVED_FOR_MEDIUM = 3;
/** Rationale: adherence ratio is unstable below three resolved sessions. */

/** Recovery: readiness logs required for medium confidence. */
export const RECOVERY_MIN_ENTRIES_FOR_MEDIUM = 3;
/** Rationale: mean readiness with n<3 is dominated by noise / single bad night. */

/** Recovery: readiness logs required for high confidence. */
export const RECOVERY_MIN_ENTRIES_FOR_HIGH = 5;

/** Consistency: resolved sessions (completed|skipped) in window for medium. */
export const CONSISTENCY_MIN_RESOLVED_FOR_MEDIUM = 3;
/** Rationale: completion rate with fewer than three outcomes is not actionable. */

/** Consistency: resolved sessions required for high confidence. */
export const CONSISTENCY_MIN_RESOLVED_FOR_HIGH = 6;
/** Rationale: denser adherence history stabilizes the completion ratio. */

/** Overall: displayable pillar scores required before composite may show. */
export const OVERALL_MIN_DISPLAYABLE_PILLARS = 3;
/** Rationale: composite of 1–2 pillars misrepresents “athlete” status. */

/** Formula version tag for reasoning metadata (bump when formula text/logic changes). */
export const SCORING_FORMULA_VERSION = "1.1.0";
