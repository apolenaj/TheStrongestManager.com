/**
 * Qualitative method comparison profiles (Prompt 28).
 * No invented numeric “superiority scores” — labels are coaching-practice descriptors.
 */

export const COMPARISON_DIMENSIONS = [
  {
    id: "primaryPurpose",
    label: "Primary purpose",
    description: "What the method is mainly organized to accomplish.",
  },
  {
    id: "complexity",
    label: "Complexity",
    description: "Planning and coaching literacy typically required.",
  },
  {
    id: "frequency",
    label: "Frequency",
    description: "How often key lifts or qualities are usually trained.",
  },
  {
    id: "volume",
    label: "Volume",
    description: "Typical set/rep dose character — dosing still decides outcomes.",
  },
  {
    id: "intensity",
    label: "Intensity",
    description: "Relative load / effort character (not a lab intensity metric).",
  },
  {
    id: "fatigue",
    label: "Fatigue",
    description: "Qualitative recovery demand when run as commonly described.",
  },
  {
    id: "skillRequirement",
    label: "Skill requirement",
    description: "Technical and autoregulation skill usually needed.",
  },
  {
    id: "bestSuitedFor",
    label: "Best suited for",
    description: "Athlete contexts where the method tends to fit.",
  },
  {
    id: "limitations",
    label: "Limitations",
    description: "Where the approach commonly breaks down or is a poor fit.",
  },
] as const;

export type ComparisonDimensionId =
  (typeof COMPARISON_DIMENSIONS)[number]["id"];

/** Qualitative bands — ordered for display only, not a validated score scale. */
export const QUALITATIVE_BANDS = [
  "low",
  "low_moderate",
  "moderate",
  "moderate_high",
  "high",
  "variable",
] as const;

export type QualitativeBand = (typeof QUALITATIVE_BANDS)[number];

export const QUALITATIVE_BAND_LABELS: Record<QualitativeBand, string> = {
  low: "Low",
  low_moderate: "Low–moderate",
  moderate: "Moderate",
  moderate_high: "Moderate–high",
  high: "High",
  variable: "Variable",
};

export type MethodComparisonProfile = {
  slug: string;
  primaryPurpose: string;
  complexity: QualitativeBand;
  complexityNote: string;
  frequency: QualitativeBand;
  frequencyNote: string;
  volume: QualitativeBand;
  volumeNote: string;
  intensity: QualitativeBand;
  intensityNote: string;
  fatigue: QualitativeBand;
  fatigueNote: string;
  skillRequirement: QualitativeBand;
  skillNote: string;
  bestSuitedFor: string;
  limitations: string;
};

export const METHOD_COMPARISON_PROFILES: MethodComparisonProfile[] = [
  {
    slug: "linear-periodization",
    primaryPurpose:
      "Sequence preparation toward a peak by shifting volume and intensity across phases.",
    complexity: "moderate",
    complexityNote: "Clear phase story; longer calendars need discipline to maintain.",
    frequency: "moderate",
    frequencyNote: "Often moderate lift frequency within each phase theme.",
    volume: "variable",
    volumeNote: "Higher early / lower near peak in classic framing.",
    intensity: "variable",
    intensityNote: "Rises toward the competitive or test phase.",
    fatigue: "variable",
    fatigueNote: "Depends on phase — accumulation vs peaking differ sharply.",
    skillRequirement: "low_moderate",
    skillNote: "Accessible conceptually; advanced peaking still needs judgment.",
    bestSuitedFor:
      "Athletes with a fixed meet/test date who like phase themes.",
    limitations:
      "Long exclusive phases can neglect non-emphasized qualities; rigid plans age poorly.",
  },
  {
    slug: "block-periodization",
    primaryPurpose:
      "Concentrate one or few abilities per block, then sequence residual effects.",
    complexity: "moderate_high",
    complexityNote: "Residuals and transitions matter more than a simple calendar label.",
    frequency: "moderate",
    frequencyNote: "Frequency follows the block’s target quality.",
    volume: "variable",
    volumeNote: "Accumulation blocks can be high; realization blocks cut volume.",
    intensity: "variable",
    intensityNote: "Shifts with block goal — not flat across the mesocycle.",
    fatigue: "high",
    fatigueNote: "Concentrated loading is often deliberately fatiguing.",
    skillRequirement: "high",
    skillNote: "Best with monitoring literacy and advanced training age.",
    bestSuitedFor:
      "Advanced athletes needing focused overload and short preparation windows.",
    limitations:
      "Poor sequencing leaves qualities cold; novices rarely need true concentrated blocks.",
  },
  {
    slug: "daily-undulating-periodization",
    primaryPurpose:
      "Vary stimulus within the week so multiple qualities stay in rotation.",
    complexity: "moderate",
    complexityNote: "Easy to sketch; hard to progress without weekly rules.",
    frequency: "moderate_high",
    frequencyNote: "Often trains main lifts multiple times with different intents.",
    volume: "moderate",
    volumeNote: "Weekly volume is distributed; can climb if every day is hard.",
    intensity: "variable",
    intensityNote: "Undulates by design across sessions in the microcycle.",
    fatigue: "moderate_high",
    fatigueNote: "Multiple quality days can stack if autoregulation is weak.",
    skillRequirement: "moderate",
    skillNote: "Needs honest RPE/intent per day — not random workout roulette.",
    bestSuitedFor:
      "Intermediate powerlifters and strength trainees who stall on monotonous weeks.",
    limitations:
      "Noisy undulation without progression; high frequency plus high effort buries recovery.",
  },
  {
    slug: "conjugate",
    primaryPurpose:
      "Develop max strength, speed-strength, and work capacity concurrently with rotating variations.",
    complexity: "high",
    complexityNote: "Variation choice, ME dosing, and specials require experience.",
    frequency: "moderate_high",
    frequencyNote: "Classic templates hit lower/upper max and dynamic days weekly.",
    volume: "moderate_high",
    volumeNote: "Accessories and specials can push weekly volume high.",
    intensity: "high",
    intensityNote: "Max-effort days are heavy by definition; DE is not automatically easy.",
    fatigue: "high",
    fatigueNote: "Frequent heavy variations plus volume work tax recovery.",
    skillRequirement: "high",
    skillNote: "Needs technical breadth and recovery literacy.",
    bestSuitedFor:
      "Advanced powerlifters and strongman athletes with coaching support.",
    limitations:
      "Overkill for beginners; ME abuse and poor DE execution are common failure modes.",
  },
  {
    slug: "high-frequency-training",
    primaryPurpose:
      "Distribute practice and weekly volume across many exposures to a lift or muscle.",
    complexity: "moderate",
    complexityNote: "Simple idea; session budgeting and tissue management are the craft.",
    frequency: "high",
    frequencyNote: "Defining feature — many exposures per week.",
    volume: "moderate",
    volumeNote: "Per-session volume often smaller; weekly volume can still be large.",
    intensity: "moderate",
    intensityNote: "Must stay constrained so frequency remains sustainable.",
    fatigue: "moderate_high",
    fatigueNote: "Tissue and cumulative hard-set fatigue can outrun muscle recovery.",
    skillRequirement: "moderate",
    skillNote: "Technique-sensitive lifts benefit; requires restraint on grinders.",
    bestSuitedFor:
      "Weightlifters and lifters who recover better from smaller, repeated sessions.",
    limitations:
      "Schedule and joint budgets; junk volume if every day is pushed hard.",
  },
  {
    slug: "high-intensity-training",
    primaryPurpose:
      "Drive adaptation with brief, very hard, infrequent efforts (bodybuilding HIT lineage).",
    complexity: "low_moderate",
    complexityNote: "Workouts are short; effort honesty and exercise selection matter.",
    frequency: "low",
    frequencyNote: "Historically infrequent by design to allow recovery.",
    volume: "low",
    volumeNote: "Low set counts; effort per set is extreme.",
    intensity: "high",
    intensityNote: "Effort/failure intensity — not the same as high %1RM peaking.",
    fatigue: "moderate",
    fatigueNote: "Short sessions, high per-set cost; frequency is usually low.",
    skillRequirement: "moderate",
    skillNote: "Failure management on safe movements; poor fit for maximal skill practice.",
    bestSuitedFor:
      "Time-constrained hypertrophy trainees who recover poorly from high volume.",
    limitations:
      "Underdoses skill practice; historical superiority claims outran the evidence base.",
  },
  {
    slug: "rest-pause",
    primaryPurpose:
      "Extend effective reps near failure with short intra-set rests.",
    complexity: "low_moderate",
    complexityNote: "A technique more than a full periodization system.",
    frequency: "variable",
    frequencyNote: "Depends on the parent program — not a frequency model itself.",
    volume: "moderate",
    volumeNote: "Raises effective reps in less time when used selectively.",
    intensity: "high",
    intensityNote: "Operates near failure by design.",
    fatigue: "moderate_high",
    fatigueNote: "Local muscular fatigue can be high relative to straight sets.",
    skillRequirement: "moderate",
    skillNote: "Form must hold across mini-sets; risky on technical max lifts.",
    bestSuitedFor:
      "Hypertrophy accessories and stable machine work for intermediates+.",
    limitations:
      "Not a complete program; ego failure and form collapse are common.",
  },
  {
    slug: "myo-reps",
    primaryPurpose:
      "Accumulate effective hypertrophy reps efficiently via activation + mini-sets.",
    complexity: "moderate",
    complexityNote: "Needs clear stop rules and proximity-to-failure awareness.",
    frequency: "variable",
    frequencyNote: "Fits inside broader programs; not a standalone frequency scheme.",
    volume: "moderate",
    volumeNote: "Efficient effective-rep density when dosed well.",
    intensity: "high",
    intensityNote: "Activation and mini-sets stay in a hard effort zone.",
    fatigue: "moderate",
    fatigueNote: "Often lower time cost than many straight sets to similar stimulus.",
    skillRequirement: "moderate",
    skillNote: "Honest effort perception required.",
    bestSuitedFor:
      "Intermediate bodybuilding trainees seeking time-efficient hard sets.",
    limitations:
      "Poor default for heavy competition lifts; easy to underdose if too far from failure.",
  },
  {
    slug: "cluster-sets",
    primaryPurpose:
      "Preserve rep quality/velocity with planned intra-set rests under load.",
    complexity: "moderate",
    complexityNote: "Rest schemes and intent (strength vs power) must be explicit.",
    frequency: "variable",
    frequencyNote: "Used inside sessions; frequency follows the parent plan.",
    volume: "moderate",
    volumeNote: "Can match straight-set reps at higher quality; sessions run longer.",
    intensity: "moderate_high",
    intensityNote: "Often used at meaningful percentages with quality focus.",
    fatigue: "moderate",
    fatigueNote: "Neurological quality stays higher; tonnage still counts.",
    skillRequirement: "moderate_high",
    skillNote: "Best when bar speed/technique standards are enforced.",
    bestSuitedFor:
      "Weightlifters, power athletes, and heavy technique volume for strength.",
    limitations:
      "Longer sessions; overcomplicated for beginners needing simple progression.",
  },
  {
    slug: "german-volume-training",
    primaryPurpose:
      "Drive hypertrophy/work capacity with very high set counts on primaries (classically 10×10).",
    complexity: "low_moderate",
    complexityNote: "Simple structure; recovery management is the hard part.",
    frequency: "low_moderate",
    frequencyNote: "Primaries often hit with lower weekly frequency because dose is huge.",
    volume: "high",
    volumeNote: "Defining feature when run as true high-set protocols.",
    intensity: "moderate",
    intensityNote: "Starts moderate; late sets become extremely hard.",
    fatigue: "high",
    fatigueNote: "Among the more fatiguing popular hypertrophy templates.",
    skillRequirement: "moderate",
    skillNote: "Needs solid technique before volume multiplies grinders.",
    bestSuitedFor:
      "Short hypertrophy specialization blocks for intermediates who recover well.",
    limitations:
      "Joint/motivation cost; poor near strength peaks; not a year-round default.",
  },
];

export const COMPARE_MIN_METHODS = 2;
export const COMPARE_MAX_METHODS = 3;

export const COMPARISON_DISCLAIMERS = [
  "Comparisons are qualitative coaching descriptors — not laboratory measurements or ranking scores.",
  "No method “wins” with a numeric total. Suitability depends on athlete, goal, recovery, and dosing.",
  "Bands (low → high) are for readable contrast only; they are not a validated psychometric scale.",
] as const;
