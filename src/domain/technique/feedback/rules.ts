import type { DeadliftTechniqueComponentId } from "@/domain/movement/deadlift/score/thresholds";
import {
  FEEDBACK_ISSUE_SCORE_MAX,
  FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
  FEEDBACK_REASSESS_AFTER_SESSIONS,
  FEEDBACK_SIGNIFICANT_SCORE_MAX,
} from "@/domain/technique/feedback/thresholds";
import type { FeedbackComponentRule } from "@/domain/technique/feedback/types";

const reassessDefault = `Re-film a side-view set after ${FEEDBACK_REASSESS_AFTER_SESSIONS} focused technique sessions and re-run analysis. Compare the same component score — do not chase load until it improves.`;

/**
 * Rule catalog: component issue → recommendation templates.
 * Example: early hip rise (low hip_rise_pattern score) → position drill,
 * paused deadlift, tempo work, load management, setup cue.
 */
export const DEADLIFT_FEEDBACK_RULES: FeedbackComponentRule[] = [
  {
    componentId: "hip_rise_pattern",
    issueLabel: "early or inconsistent hip rise",
    maxScoreInclusive: FEEDBACK_ISSUE_SCORE_MAX,
    minConfidence: FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    templates: [
      {
        id: "hip_rise.position_drill",
        kind: "position_drill",
        title: "Position drill — slow first pull",
        whyTemplate:
          "Hip rise scored {score}/100 ({issue}) with {confidence} confidence. A controlled first pull helps hips and shoulders leave together in the side-view frame.",
        how: "With a light bar, take 3 seconds from floor to knee. Cue “shoulders and hips rise together.” Stop the set if hips shoot up early.",
        reassess: reassessDefault,
      },
      {
        id: "hip_rise.paused_deadlift",
        kind: "exercise_variation",
        title: "Paused deadlift",
        whyTemplate:
          "Paused reps reduce rushing the hips off the floor when early hip rise is observed ({score}/100, {confidence} confidence).",
        how: "Pull slack, pause 1 second just off the floor (or at mid-shin), then finish. Keep the pause honest — no bounce.",
        reassess: reassessDefault,
        exerciseSlug: undefined,
      },
      {
        id: "hip_rise.tempo_deadlift",
        kind: "tempo_work",
        title: "Tempo deadlift",
        whyTemplate:
          "Tempo work slows the pattern so early hip rise ({score}/100) is easier to feel and correct on film.",
        how: "Use a 3-1-1 tempo (3s up to the knee, 1s pause, finish). Film one side-view working set.",
        reassess: reassessDefault,
      },
      {
        id: "hip_rise.load_management",
        kind: "load_management",
        title: "Load management",
        whyTemplate:
          "When hip rise is significantly early ({score}/100 ≤ {significantMax}), heavy loading often reinforces the pattern. Reduce load while positions improve.",
        how: "Drop to a technique weight where the first pull looks controlled on film. Do not add load until re-analysis improves this component.",
        reassess: reassessDefault,
        requiresSignificantIssue: true,
        blockWhenPainFlags: true,
      },
      {
        id: "hip_rise.setup_cue",
        kind: "setup_cue",
        title: "Setup cue — set the hips once",
        whyTemplate:
          "Hip rise scored {score}/100 ({issue}, {confidence} confidence). Early hip rise often starts from an unsettled setup — a single clear hip set before the pull reduces mid-rep adjustments.",
        how: "Cue: “Hips set → brace → push the floor.” Do not bounce the hips up and down before the bar leaves.",
        reassess: reassessDefault,
      },
    ],
  },
  {
    componentId: "start_position",
    issueLabel: "start position",
    maxScoreInclusive: FEEDBACK_ISSUE_SCORE_MAX,
    minConfidence: FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    templates: [
      {
        id: "start.setup_cue",
        kind: "setup_cue",
        title: "Setup cue — mid-foot and shin contact",
        whyTemplate:
          "Start position scored {score}/100 with {confidence} confidence. A repeatable mid-foot / shin relationship improves the first pull.",
        how: "Bar over mid-foot, shins to bar, pull slack, then leave. Check on side-view film before adding load.",
        reassess: reassessDefault,
      },
      {
        id: "start.paused",
        kind: "exercise_variation",
        title: "Paused deadlift off the floor",
        whyTemplate:
          "Pauses expose a rushed or inconsistent start when start position is limited ({score}/100).",
        how: "Pause 1 second after taking slack, then pull. Light to moderate load only.",
        reassess: reassessDefault,
      },
      {
        id: "start.position_drill",
        kind: "position_drill",
        title: "Position drill — setup holds",
        whyTemplate:
          "Holding the start without pulling grooves consistency when start position scores low ({score}/100).",
        how: "Set up fully, brace, hold 3 seconds, rack. 5–8 holds. No yanking.",
        reassess: reassessDefault,
      },
      {
        id: "start.load_management",
        kind: "load_management",
        title: "Load management",
        whyTemplate:
          "Significant start-position issues ({score}/100) are poor candidates for heavy singles.",
        how: "Keep loads in a technique range until re-analysis shows a clearer start.",
        reassess: reassessDefault,
        requiresSignificantIssue: true,
        blockWhenPainFlags: true,
      },
    ],
  },
  {
    componentId: "bar_proximity",
    issueLabel: "bar / body proximity (wrist–hip proxy)",
    maxScoreInclusive: FEEDBACK_ISSUE_SCORE_MAX,
    minConfidence: FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    templates: [
      {
        id: "bar.drag_cue",
        kind: "setup_cue",
        title: "Setup cue — keep it close",
        whyTemplate:
          "Bar proximity proxy scored {score}/100 ({confidence} confidence). Keeping the implement close is a coaching priority when the proxy is weak.",
        how: "Light contact up the shin/thigh on technique sets. Film side view — this is a wrist proxy, not true bar tracking.",
        reassess: reassessDefault,
      },
      {
        id: "bar.pause_knee",
        kind: "position_drill",
        title: "Position drill — pause below the knee",
        whyTemplate:
          "A pause below the knee reinforces staying close when proximity scores low ({score}/100).",
        how: "Pause 1 second below the knee with the bar close, then finish. Light load.",
        reassess: reassessDefault,
      },
      {
        id: "bar.rdl",
        kind: "exercise_variation",
        title: "Romanian deadlift",
        whyTemplate:
          "RDLs emphasize keeping the load close through the hinge when floor-pull proximity is limited.",
        how: "Soft knees, hinge, bar close to legs. Moderate volume, not max attempts.",
        reassess: reassessDefault,
        exerciseSlug: "romanian-deadlift",
        generalBias: true,
      },
    ],
  },
  {
    componentId: "back_angle_consistency",
    issueLabel: "torso-angle consistency (image plane)",
    maxScoreInclusive: FEEDBACK_ISSUE_SCORE_MAX,
    minConfidence: FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    templates: [
      {
        id: "torso.tempo",
        kind: "tempo_work",
        title: "Tempo conventional pulls",
        whyTemplate:
          "Torso-angle consistency scored {score}/100. Tempo work makes angle changes easier to see on film (image-plane only — not spine load).",
        how: "Light–moderate load, steady 3-second pull. Review side-view torso angle — not a medical claim.",
        reassess: reassessDefault,
      },
      {
        id: "torso.position",
        kind: "position_drill",
        title: "Position drill — wall hinge",
        whyTemplate:
          "A wall hinge grooves a repeatable torso set when consistency scores low ({score}/100).",
        how: "Hinge until glutes tap a wall target. Match that torso set on light deadlift setups.",
        reassess: reassessDefault,
      },
      {
        id: "torso.load",
        kind: "load_management",
        title: "Load management",
        whyTemplate:
          "Significant torso-angle variability ({score}/100) is a reason to keep loads technical.",
        how: "Reduce load until side-view angle looks steadier across the pull.",
        reassess: reassessDefault,
        requiresSignificantIssue: true,
        blockWhenPainFlags: true,
      },
    ],
  },
  {
    componentId: "lockout",
    issueLabel: "lockout stacking (in-frame)",
    maxScoreInclusive: FEEDBACK_ISSUE_SCORE_MAX,
    minConfidence: FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    templates: [
      {
        id: "lockout.cue",
        kind: "setup_cue",
        title: "Setup cue — stand tall, ribs down",
        whyTemplate:
          "Lockout scored {score}/100. Finishing stacked in the frame (hips through, ribs down) is the coaching target — not leaning back.",
        how: "Cue “hips through, tall finish.” Avoid chasing hyperextension.",
        reassess: reassessDefault,
      },
      {
        id: "lockout.hip_thrust",
        kind: "exercise_variation",
        title: "Hip thrust",
        whyTemplate:
          "Hip thrusts support hip extension capacity when lockout stacking is limited ({score}/100).",
        how: "Controlled lockouts at the top; leave a rep in reserve.",
        reassess: reassessDefault,
        exerciseSlug: "hip-thrust",
        generalBias: true,
      },
      {
        id: "lockout.block",
        kind: "exercise_variation",
        title: "Block / rack pull (shortened)",
        whyTemplate:
          "Shortened-range pulls can practice finishes when full-range lockout scores low — use carefully, not for ego loading.",
        how: "Light–moderate block pulls focusing on a stacked finish. Not a max-out variation.",
        reassess: reassessDefault,
        advancedOnly: true,
        competitionBias: true,
      },
    ],
  },
  {
    componentId: "setup_consistency",
    issueLabel: "setup consistency",
    maxScoreInclusive: FEEDBACK_ISSUE_SCORE_MAX,
    minConfidence: FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    templates: [
      {
        id: "setup.holds",
        kind: "position_drill",
        title: "Position drill — empty-bar setup holds",
        whyTemplate:
          "Setup consistency scored {score}/100. Holding identical setups grooves repeatability before the pull.",
        how: "Empty bar: set, brace, hold 3 seconds, reset. Match foot and grip every rep.",
        reassess: reassessDefault,
      },
      {
        id: "setup.cue",
        kind: "setup_cue",
        title: "Setup cue — same marks every rep",
        whyTemplate:
          "Inconsistent setups ({score}/100) amplify every later fault. Use floor/bar marks.",
        how: "Same stance width, same grip, same breath count before every pull.",
        reassess: reassessDefault,
      },
      {
        id: "setup.rdl",
        kind: "exercise_variation",
        title: "Romanian deadlift",
        whyTemplate:
          "RDLs reduce floor-pull complexity while practicing a repeatable hinge setup.",
        how: "Standing start, consistent foot/grip, controlled hinges.",
        reassess: reassessDefault,
        exerciseSlug: "romanian-deadlift",
      },
    ],
  },
  {
    componentId: "rep_consistency",
    issueLabel: "rep-to-rep consistency",
    maxScoreInclusive: FEEDBACK_ISSUE_SCORE_MAX,
    minConfidence: FEEDBACK_MIN_CONFIDENCE_FOR_PRESCRIPTION,
    templates: [
      {
        id: "reps.reset",
        kind: "setup_cue",
        title: "Setup cue — reset every rep",
        whyTemplate:
          "Rep consistency scored {score}/100. Resetting removes touch-and-go variance while you rebuild repeatability.",
        how: "Dead stop each rep. Same setup checklist before the bar leaves.",
        reassess: reassessDefault,
      },
      {
        id: "reps.load",
        kind: "load_management",
        title: "Load management",
        whyTemplate:
          "When reps look inconsistent ({score}/100), volume at heavy loads often widens the gap.",
        how: "Fewer hard sets; more identical light technique sets on film.",
        reassess: reassessDefault,
        requiresSignificantIssue: true,
        blockWhenPainFlags: true,
      },
    ],
  },
  {
    componentId: "bracing_indicators",
    issueLabel: "bracing (not pose-observable)",
    maxScoreInclusive: 100,
    minConfidence: "none",
    templates: [
      {
        id: "brace.cue",
        kind: "setup_cue",
        title: "Setup cue — breath and brace",
        whyTemplate:
          "Bracing cannot be scored from 2D pose. Practice breath/brace deliberately rather than inferring it from video.",
        how: "Big breath low, brace 360°, then pull. Video will not confirm IAP — use feel and coaching.",
        reassess:
          "Reassess with a coach or by feel after 2 sessions — pose analysis will still mark bracing unavailable.",
      },
    ],
  },
];

export function ruleForComponent(
  componentId: DeadliftTechniqueComponentId,
): FeedbackComponentRule | undefined {
  return DEADLIFT_FEEDBACK_RULES.find((r) => r.componentId === componentId);
}

/** Exported for docs/tests — significant band used in load-management copy. */
export const FEEDBACK_SIGNIFICANT_BAND = FEEDBACK_SIGNIFICANT_SCORE_MAX;
