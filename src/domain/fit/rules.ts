import type { FitInputs } from "@/domain/fit/types";

/** Published method slug targeted by a rule effect. */
export type FitMethodSlug = string;

export type FitRuleEffect = {
  slug: FitMethodSlug;
  /** Positive boosts preference; negative is a soft penalty. */
  weight: number;
  reason: string;
};

export type FitRule = {
  id: string;
  /** Shown in the “rules that fired” transparency panel. */
  label: string;
  description: string;
  when: (input: FitInputs) => boolean;
  effects: FitRuleEffect[];
};

/**
 * Transparent recommendation rules (Prompt 30).
 * Deterministic: same inputs → same scores. Weights are coaching heuristics, not science scores.
 */
export const FIT_RULES: readonly FitRule[] = [
  {
    id: "beginner-keep-simple",
    label: "Beginners need simple progression",
    description:
      "Early trainees usually progress best with clear load progression and limited system complexity.",
    when: (i) => i.experience === "beginner",
    effects: [
      {
        slug: "linear-periodization",
        weight: 4,
        reason: "Phase-simple progression is easier to execute as a beginner.",
      },
      {
        slug: "high-intensity-training",
        weight: 2,
        reason: "Short, hard templates can work when recovery and skill demands stay modest.",
      },
      {
        slug: "conjugate",
        weight: -5,
        reason: "Full conjugate rotation is usually unnecessary complexity for beginners.",
      },
      {
        slug: "block-periodization",
        weight: -3,
        reason: "Concentrated blocks rarely beat simple progressive overload early on.",
      },
      {
        slug: "german-volume-training",
        weight: -3,
        reason: "Very high-volume blocks are a poor first language for most beginners.",
      },
    ],
  },
  {
    id: "goal-hypertrophy",
    label: "Hypertrophy / physique goal",
    description: "Muscle-focused goals favor volume tools and efficient hard sets.",
    when: (i) => i.goal === "hypertrophy",
    effects: [
      {
        slug: "myo-reps",
        weight: 4,
        reason: "Efficient hypertrophy densification when time or recovery is a constraint.",
      },
      {
        slug: "rest-pause",
        weight: 3,
        reason: "Useful intensity technique for accessories and hypertrophy work.",
      },
      {
        slug: "german-volume-training",
        weight: 2,
        reason: "Classic short high-volume hypertrophy block option when recovery allows.",
      },
      {
        slug: "daily-undulating-periodization",
        weight: 2,
        reason: "Weekly heavy/moderate/lighter roles support size without a single exclusive phase.",
      },
      {
        slug: "high-intensity-training",
        weight: 2,
        reason: "Low-volume high-effort hypertrophy when schedule is tight.",
      },
    ],
  },
  {
    id: "goal-strength-general",
    label: "General strength goal",
    description: "Broad strength goals favor progressive frameworks over specialty physique tactics.",
    when: (i) => i.goal === "strength" || i.goal === "general",
    effects: [
      {
        slug: "linear-periodization",
        weight: 3,
        reason: "Straightforward strength progression with readable phases.",
      },
      {
        slug: "daily-undulating-periodization",
        weight: 3,
        reason: "Weekly stimulus variety keeps strength work progressing without long exclusive phases.",
      },
      {
        slug: "high-frequency-training",
        weight: 1,
        reason: "More practice on key lifts when schedule and recovery allow.",
      },
    ],
  },
  {
    id: "goal-powerlifting",
    label: "Powerlifting-oriented goal",
    description: "SBD-focused goals map to competition-lift practice frameworks.",
    when: (i) => i.goal === "powerlifting" || i.sport === "powerlifting",
    effects: [
      {
        slug: "daily-undulating-periodization",
        weight: 4,
        reason: "Frequent competition-lift practice with varied weekly intents.",
      },
      {
        slug: "linear-periodization",
        weight: 2,
        reason: "Useful when peaking toward a fixed meet date.",
      },
      {
        slug: "high-frequency-training",
        weight: 2,
        reason: "Supports technical practice on squat/bench/deadlift.",
      },
      {
        slug: "cluster-sets",
        weight: 1,
        reason: "Quality under load for heavy triples/doubles when programmed carefully.",
      },
    ],
  },
  {
    id: "advanced-power-conjugate",
    label: "Advanced power sport → conjugate option",
    description:
      "Experienced powerlifters/strongman athletes may benefit from rotation and special exercises.",
    when: (i) =>
      i.experience === "advanced" &&
      (i.goal === "powerlifting" ||
        i.sport === "powerlifting" ||
        i.sport === "strongman"),
    effects: [
      {
        slug: "conjugate",
        weight: 5,
        reason: "Advanced concurrent max/dynamic/special-exercise logic fits this profile.",
      },
      {
        slug: "block-periodization",
        weight: 2,
        reason: "Concentrated blocks remain a strong alternative for multi-peak seasons.",
      },
    ],
  },
  {
    id: "goal-weightlifting",
    label: "Weightlifting / technical barbell sport",
    description: "Olympic lifting favors technical frequency and quality under load.",
    when: (i) => i.goal === "weightlifting" || i.sport === "weightlifting",
    effects: [
      {
        slug: "high-frequency-training",
        weight: 5,
        reason: "Snatch and clean & jerk improve with frequent technical practice.",
      },
      {
        slug: "block-periodization",
        weight: 3,
        reason: "Block sequencing is common in weightlifting season planning.",
      },
      {
        slug: "cluster-sets",
        weight: 2,
        reason: "Rest-between-reps clusters protect quality on heavy technical sets.",
      },
      {
        slug: "linear-periodization",
        weight: 1,
        reason: "Classic volume→intensity sequencing still appears in many WL calendars.",
      },
      {
        slug: "german-volume-training",
        weight: -3,
        reason: "Extreme bodybuilding volume blocks compete poorly with technical practice.",
      },
    ],
  },
  {
    id: "goal-athletic",
    label: "Athletic / sport performance",
    description: "Field and court athletes need planned qualities without gym-only maximalism.",
    when: (i) => i.goal === "athletic" || i.sport === "team_sport",
    effects: [
      {
        slug: "block-periodization",
        weight: 4,
        reason: "Concentrated qualities fit sport calendars with residual management.",
      },
      {
        slug: "daily-undulating-periodization",
        weight: 2,
        reason: "Weekly undulation can coexist with sport practice when dosed carefully.",
      },
      {
        slug: "cluster-sets",
        weight: 2,
        reason: "Power/quality work under fatigue constraints.",
      },
      {
        slug: "conjugate",
        weight: -2,
        reason: "Full powerlifting conjugate packages often over-specialize the gym day.",
      },
    ],
  },
  {
    id: "sport-strongman",
    label: "Strongman sport",
    description: "Event practice plus specialty strength work favors concurrent rotation.",
    when: (i) => i.sport === "strongman",
    effects: [
      {
        slug: "conjugate",
        weight: 4,
        reason: "Special-exercise rotation maps well to event weak points.",
      },
      {
        slug: "high-frequency-training",
        weight: 1,
        reason: "Event skill still needs practice frequency.",
      },
    ],
  },
  {
    id: "limited-recovery",
    label: "Limited recovery capacity",
    description: "When sleep/stress are constrained, prefer lower systemic fatigue templates.",
    when: (i) => i.recovery === "limited",
    effects: [
      {
        slug: "high-intensity-training",
        weight: 4,
        reason: "Lower weekly volume reduces recovery demand when effort stays high.",
      },
      {
        slug: "myo-reps",
        weight: 3,
        reason: "Dense hypertrophy work without marathon sessions.",
      },
      {
        slug: "rest-pause",
        weight: 1,
        reason: "Can shorten accessory work — still manage failure carefully.",
      },
      {
        slug: "german-volume-training",
        weight: -5,
        reason: "Very high set counts clash with limited recovery.",
      },
      {
        slug: "conjugate",
        weight: -4,
        reason: "Frequent heavy efforts demand recovery most limited athletes lack.",
      },
      {
        slug: "block-periodization",
        weight: -2,
        reason: "Concentrated overload blocks are hard to absorb under chronic stress.",
      },
    ],
  },
  {
    id: "high-recovery-volume",
    label: "High recovery supports higher demand options",
    description: "Solid recovery opens room for higher volume or concurrent intensity.",
    when: (i) => i.recovery === "high",
    effects: [
      {
        slug: "german-volume-training",
        weight: 2,
        reason: "Short GVT-style blocks are more plausible when recovery is solid.",
      },
      {
        slug: "conjugate",
        weight: 1,
        reason: "Heavy concurrent work is more realistic with strong recovery habits.",
      },
      {
        slug: "high-frequency-training",
        weight: 1,
        reason: "Tissue tolerance for frequent practice is more likely.",
      },
    ],
  },
  {
    id: "low-frequency-schedule",
    label: "Only 2–3 training days",
    description: "Sparse schedules favor efficient sessions over high-frequency specialty systems.",
    when: (i) => i.days === "2" || i.days === "3",
    effects: [
      {
        slug: "high-intensity-training",
        weight: 3,
        reason: "Fits limited weekly slots with high effort density.",
      },
      {
        slug: "linear-periodization",
        weight: 2,
        reason: "Full-body or upper/lower linear progressions fit 2–3 days well.",
      },
      {
        slug: "myo-reps",
        weight: 2,
        reason: "Gets productive hypertrophy work done in fewer sessions.",
      },
      {
        slug: "high-frequency-training",
        weight: -4,
        reason: "High lift frequency needs more than a sparse weekly calendar.",
      },
      {
        slug: "conjugate",
        weight: -3,
        reason: "Classic conjugate day structures assume more weekly training slots.",
      },
    ],
  },
  {
    id: "high-frequency-schedule",
    label: "4–6 training days available",
    description: "More days unlock undulating and high-frequency practice options.",
    when: (i) => i.days === "4" || i.days === "5" || i.days === "6",
    effects: [
      {
        slug: "daily-undulating-periodization",
        weight: 3,
        reason: "Weekly role variation needs enough sessions to express.",
      },
      {
        slug: "high-frequency-training",
        weight: 3,
        reason: "Schedule can support frequent practice of key lifts.",
      },
      {
        slug: "conjugate",
        weight: 1,
        reason: "More days make max/dynamic/repetition roles easier to place.",
      },
    ],
  },
  {
    id: "short-sessions",
    label: "Short sessions",
    description: "Time-boxed training favors density methods over long high-volume templates.",
    when: (i) => i.session === "short",
    effects: [
      {
        slug: "high-intensity-training",
        weight: 4,
        reason: "Brief hard sessions match the time box.",
      },
      {
        slug: "myo-reps",
        weight: 3,
        reason: "Short rest clusters pack stimulus into limited minutes.",
      },
      {
        slug: "rest-pause",
        weight: 2,
        reason: "Keeps accessories productive without long rest cycles.",
      },
      {
        slug: "german-volume-training",
        weight: -4,
        reason: "10×10 style work usually exceeds short session budgets.",
      },
      {
        slug: "cluster-sets",
        weight: -1,
        reason: "Intra-set rests lengthen sessions unless tightly capped.",
      },
    ],
  },
  {
    id: "minimal-equipment",
    label: "Minimal equipment",
    description: "Limited gear steers away from specialty-bar conjugate culture.",
    when: (i) => i.equipment === "minimal",
    effects: [
      {
        slug: "high-intensity-training",
        weight: 3,
        reason: "Works with basic tools when effort and recovery are managed.",
      },
      {
        slug: "myo-reps",
        weight: 3,
        reason: "Dumbbell/cable-friendly hypertrophy densification.",
      },
      {
        slug: "rest-pause",
        weight: 2,
        reason: "Accessible intensity technique without specialty equipment.",
      },
      {
        slug: "conjugate",
        weight: -4,
        reason: "Popular conjugate tooling assumes broader equipment access.",
      },
      {
        slug: "cluster-sets",
        weight: -1,
        reason: "Still usable, but less distinctive without a solid barbell setup.",
      },
    ],
  },
  {
    id: "pref-simplicity",
    label: "Preference: simplicity",
    description: "User asked for a plan that is easy to follow.",
    when: (i) => i.preference === "simplicity",
    effects: [
      {
        slug: "linear-periodization",
        weight: 4,
        reason: "Clear week-to-week story with fewer moving parts.",
      },
      {
        slug: "high-intensity-training",
        weight: 2,
        reason: "Simple session structure when volume stays low.",
      },
      {
        slug: "conjugate",
        weight: -3,
        reason: "Rotation and special exercises raise coaching load.",
      },
      {
        slug: "block-periodization",
        weight: -1,
        reason: "Block residuals add planning complexity.",
      },
    ],
  },
  {
    id: "pref-variety",
    label: "Preference: weekly variety",
    description: "User wants different session roles across the week.",
    when: (i) => i.preference === "variety",
    effects: [
      {
        slug: "daily-undulating-periodization",
        weight: 4,
        reason: "Built around within-week stimulus variation.",
      },
      {
        slug: "conjugate",
        weight: 2,
        reason: "Max/dynamic/repetition roles create intentional variety.",
      },
      {
        slug: "high-intensity-training",
        weight: -2,
        reason: "HIT culture is usually lower variety by design.",
      },
    ],
  },
  {
    id: "pref-high-effort-low-volume",
    label: "Preference: hard, lower-volume sessions",
    description: "User prefers effort density over accumulating many sets.",
    when: (i) => i.preference === "high_effort_low_volume",
    effects: [
      {
        slug: "high-intensity-training",
        weight: 5,
        reason: "Matches brief, high-effort philosophy.",
      },
      {
        slug: "rest-pause",
        weight: 3,
        reason: "Intensity technique that keeps set counts modest.",
      },
      {
        slug: "myo-reps",
        weight: 3,
        reason: "Dense effective reps without long volume days.",
      },
      {
        slug: "german-volume-training",
        weight: -5,
        reason: "Opposite end of the volume spectrum.",
      },
    ],
  },
  {
    id: "pref-high-frequency",
    label: "Preference: high practice frequency",
    description: "User wants main lifts often.",
    when: (i) => i.preference === "high_frequency",
    effects: [
      {
        slug: "high-frequency-training",
        weight: 5,
        reason: "Directly matches the practice-frequency preference.",
      },
      {
        slug: "daily-undulating-periodization",
        weight: 3,
        reason: "Often pairs frequent lifts with varied daily intents.",
      },
      {
        slug: "high-intensity-training",
        weight: -3,
        reason: "Classic HIT is typically low frequency.",
      },
    ],
  },
  {
    id: "pref-periodized",
    label: "Preference: phased toward a peak",
    description: "User wants calendars with clear preparatory and peaking phases.",
    when: (i) => i.preference === "periodized",
    effects: [
      {
        slug: "linear-periodization",
        weight: 4,
        reason: "Classic volume→intensity peaking narrative.",
      },
      {
        slug: "block-periodization",
        weight: 4,
        reason: "Concentrated blocks sequenced toward performance.",
      },
      {
        slug: "high-intensity-training",
        weight: -2,
        reason: "HIT is usually not organized as long peaking phases.",
      },
    ],
  },
  {
    id: "intermediate-dup-default",
    label: "Intermediate with midweek availability",
    description:
      "Many intermediate lifters with 3–5 days do well with undulating weekly roles.",
    when: (i) =>
      i.experience === "intermediate" &&
      (i.days === "3" || i.days === "4" || i.days === "5") &&
      i.goal !== "hypertrophy",
    effects: [
      {
        slug: "daily-undulating-periodization",
        weight: 2,
        reason: "Practical default when linear stalls and schedule supports variety.",
      },
    ],
  },
] as const;

export function listFitRules(): FitRule[] {
  return [...FIT_RULES];
}
