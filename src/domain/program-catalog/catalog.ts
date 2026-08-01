/**
 * Commercial program catalog — seed definitions & public filter vocabulary.
 * Display prices are recommended GBP launch amounts in minor units (pence).
 */

export const PROGRAM_CATALOG_ENGINE_VERSION = "program_catalog.v1" as const;

export const PROGRAM_CATALOG_GOALS = [
  "strength",
  "powerlifting",
  "hypertrophy",
  "general_strength",
  "competition_prep",
] as const;

export type ProgramCatalogGoal = (typeof PROGRAM_CATALOG_GOALS)[number];

export const PROGRAM_CATALOG_EXPERIENCE = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type ProgramCatalogExperience =
  (typeof PROGRAM_CATALOG_EXPERIENCE)[number];

export const PROGRAM_CATALOG_SCHEDULES = [
  "3day",
  "4day",
  "5day",
  "6day",
] as const;

export type ProgramCatalogSchedule =
  (typeof PROGRAM_CATALOG_SCHEDULES)[number];

export type ProgramCatalogVariant = "free" | "paid" | "bundle";

export type ProgramCatalogSeedDefinition = {
  slug: string;
  name: string;
  description: string;
  familyId: string;
  variant: ProgramCatalogVariant;
  methodId: string | null;
  durationWeeks: number;
  availableSchedules: ProgramCatalogSchedule[];
  difficulty: ProgramCatalogExperience;
  recoveryDemand: "low" | "moderate" | "high";
  isFree: boolean;
  /** GBP pence. */
  displayPricePence: number;
  goals: ProgramCatalogGoal[];
  /** Paid product slugs included when variant === "bundle". */
  includesPaidSlugs?: string[];
};

/** Recommended GBP launch prices (pence). Free variants are always 0. */
export const PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE = {
  linearStrengthBuilder: 4900,
  dupPowerlifting: 5900,
  blockPeriodisation: 5900,
  conjugateStrength: 6900,
  highFrequencySbd: 6900,
  powerbuildingHybrid: 5900,
  completeMethodCollection: 19900,
  goldenEraHypertrophy: 5900,
  deadlift310Peak: 4900,
  squatOverloadBase: 4900,
  benchPressBlueprint: 4900,
  logliftMastery: 5900,
  strongmanBaseBuilder: 6900,
  ironFoundationStart: 3900,
  ironCutAggressive: 5900,
  ironRecompMedium: 5900,
  sustainableLeanQuality: 5900,
  explosivePowerSpeed: 4900,
  olympicWeightliftingBase: 5900,
} as const;

const PAID_FAMILY_SLUGS = [
  "linear-strength-builder",
  "dup-powerlifting-system",
  "block-periodisation",
  "conjugate-strength-system",
  "high-frequency-sbd",
  "powerbuilding-hybrid",
] as const;

function freeDesc(name: string): string {
  return `${name} — free 4-week starter. Structured introduction to the method so you can evaluate fit before committing to the full cycle. Not a complete meet peak or long-term plan.`;
}

function paidDesc(name: string, weeks: number, focus: string): string {
  return `${name} — full ${weeks}-week training cycle. ${focus} Educational programming for strength athletes; adjust to recovery and constraints rather than copying blindly.`;
}

/**
 * 6 core families × (free 4-week + paid 12–16-week) + Complete Method Collection bundle.
 */
export const PROGRAM_CATALOG_SEED: readonly ProgramCatalogSeedDefinition[] = [
  {
    slug: "linear-strength-builder-free",
    name: "Linear Strength Builder (Free 4-Week)",
    description: freeDesc("Linear Strength Builder"),
    familyId: "linear-strength-builder",
    variant: "free",
    methodId: "linear-periodization",
    durationWeeks: 4,
    availableSchedules: ["3day", "4day"],
    difficulty: "beginner",
    recoveryDemand: "moderate",
    isFree: true,
    displayPricePence: 0,
    goals: ["strength", "general_strength"],
  },
  {
    slug: "linear-strength-builder",
    name: "Linear Strength Builder",
    description: paidDesc(
      "Linear Strength Builder",
      12,
      "Classic volume-to-intensity progression for measurable strength gain.",
    ),
    familyId: "linear-strength-builder",
    variant: "paid",
    methodId: "linear-periodization",
    durationWeeks: 12,
    availableSchedules: ["3day", "4day"],
    difficulty: "beginner",
    recoveryDemand: "moderate",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.linearStrengthBuilder,
    goals: ["strength", "general_strength"],
  },
  {
    slug: "dup-powerlifting-system-free",
    name: "DUP Powerlifting System (Free 4-Week)",
    description: freeDesc("DUP Powerlifting System"),
    familyId: "dup-powerlifting-system",
    variant: "free",
    methodId: "daily-undulating-periodization",
    durationWeeks: 4,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: true,
    displayPricePence: 0,
    goals: ["powerlifting", "strength", "competition_prep"],
  },
  {
    slug: "dup-powerlifting-system",
    name: "DUP Powerlifting System",
    description: paidDesc(
      "DUP Powerlifting System",
      14,
      "Weekly undulating squat/bench/deadlift emphasis for powerlifting progress.",
    ),
    familyId: "dup-powerlifting-system",
    variant: "paid",
    methodId: "daily-undulating-periodization",
    durationWeeks: 14,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.dupPowerlifting,
    goals: ["powerlifting", "strength", "competition_prep"],
  },
  {
    slug: "block-periodisation-free",
    name: "Block Periodisation (Free 4-Week)",
    description: freeDesc("Block Periodisation"),
    familyId: "block-periodisation",
    variant: "free",
    methodId: "block-periodization",
    durationWeeks: 4,
    availableSchedules: ["4day", "5day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: true,
    displayPricePence: 0,
    goals: ["strength", "competition_prep", "powerlifting"],
  },
  {
    slug: "block-periodisation",
    name: "Block Periodisation",
    description: paidDesc(
      "Block Periodisation",
      12,
      "Concentrated accumulation → intensification → realization blocks.",
    ),
    familyId: "block-periodisation",
    variant: "paid",
    methodId: "block-periodization",
    durationWeeks: 12,
    availableSchedules: ["4day", "5day"],
    difficulty: "advanced",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.blockPeriodisation,
    goals: ["strength", "competition_prep", "powerlifting"],
  },
  {
    slug: "conjugate-strength-system-free",
    name: "Conjugate Strength System (Free 4-Week)",
    description: freeDesc("Conjugate Strength System"),
    familyId: "conjugate-strength-system",
    variant: "free",
    methodId: "conjugate",
    durationWeeks: 4,
    availableSchedules: ["4day"],
    difficulty: "advanced",
    recoveryDemand: "high",
    isFree: true,
    displayPricePence: 0,
    goals: ["powerlifting", "strength", "competition_prep"],
  },
  {
    slug: "conjugate-strength-system",
    name: "Conjugate Strength System",
    description: paidDesc(
      "Conjugate Strength System",
      16,
      "Max-effort / dynamic-effort rotation with special-exercise variation.",
    ),
    familyId: "conjugate-strength-system",
    variant: "paid",
    methodId: "conjugate",
    durationWeeks: 16,
    availableSchedules: ["4day"],
    difficulty: "advanced",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.conjugateStrength,
    goals: ["powerlifting", "strength", "competition_prep"],
  },
  {
    slug: "high-frequency-sbd-free",
    name: "High-Frequency SBD (Free 4-Week)",
    description: freeDesc("High-Frequency SBD"),
    familyId: "high-frequency-sbd",
    variant: "free",
    methodId: "high-frequency-training",
    durationWeeks: 4,
    availableSchedules: ["4day", "5day", "6day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: true,
    displayPricePence: 0,
    goals: ["powerlifting", "strength"],
  },
  {
    slug: "high-frequency-sbd",
    name: "High-Frequency SBD",
    description: paidDesc(
      "High-Frequency SBD",
      12,
      "Frequent squat/bench/deadlift exposures with managed fatigue.",
    ),
    familyId: "high-frequency-sbd",
    variant: "paid",
    methodId: "high-frequency-training",
    durationWeeks: 12,
    availableSchedules: ["4day", "5day", "6day"],
    difficulty: "advanced",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.highFrequencySbd,
    goals: ["powerlifting", "strength"],
  },
  {
    slug: "powerbuilding-hybrid-free",
    name: "Powerbuilding Hybrid (Free 4-Week)",
    description: freeDesc("Powerbuilding Hybrid"),
    familyId: "powerbuilding-hybrid",
    variant: "free",
    methodId: "daily-undulating-periodization",
    durationWeeks: 4,
    availableSchedules: ["4day", "5day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: true,
    displayPricePence: 0,
    goals: ["strength", "hypertrophy", "general_strength"],
  },
  {
    slug: "powerbuilding-hybrid",
    name: "Powerbuilding Hybrid",
    description: paidDesc(
      "Powerbuilding Hybrid",
      16,
      "Strength-primary main lifts with hypertrophy accessories.",
    ),
    familyId: "powerbuilding-hybrid",
    variant: "paid",
    methodId: "daily-undulating-periodization",
    durationWeeks: 16,
    availableSchedules: ["4day", "5day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.powerbuildingHybrid,
    goals: ["strength", "hypertrophy", "general_strength"],
  },
  {
    slug: "complete-method-collection",
    name: "Complete Method Collection",
    description:
      "Bundle of all six full paid program families at a launch discount versus buying each separately. Includes Linear Strength Builder, DUP Powerlifting System, Block Periodisation, Conjugate Strength System, High-Frequency SBD, and Powerbuilding Hybrid.",
    familyId: "complete-method-collection",
    variant: "bundle",
    methodId: null,
    durationWeeks: 16,
    availableSchedules: ["3day", "4day", "5day", "6day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence:
      PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.completeMethodCollection,
    goals: [
      "strength",
      "powerlifting",
      "hypertrophy",
      "general_strength",
      "competition_prep",
    ],
    includesPaidSlugs: [...PAID_FAMILY_SLUGS],
  },
  // --- Expanded catalog (marketing + seed; appears even before DB seed) ---
  {
    slug: "golden-era-hypertrophy",
    name: "Golden Era Hypertrophy",
    description: paidDesc(
      "Golden Era Hypertrophy",
      12,
      "High-volume, high-frequency aesthetic building based on classic principles.",
    ),
    familyId: "golden-era-hypertrophy",
    variant: "paid",
    methodId: "high-frequency-training",
    durationWeeks: 12,
    availableSchedules: ["4day", "5day", "6day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.goldenEraHypertrophy,
    goals: ["hypertrophy", "general_strength"],
  },
  {
    slug: "deadlift-310-peak",
    name: "The 310kg Deadlift Peak",
    description: paidDesc(
      "The 310kg Deadlift Peak",
      8,
      "A brutal, highly specific peaking block to maximize your 1RM on the platform.",
    ),
    familyId: "deadlift-310-peak",
    variant: "paid",
    methodId: "block-periodization",
    durationWeeks: 8,
    availableSchedules: ["3day", "4day"],
    difficulty: "advanced",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.deadlift310Peak,
    goals: ["powerlifting", "competition_prep", "strength"],
  },
  {
    slug: "squat-overload-base",
    name: "Squat Overload Base",
    description: paidDesc(
      "Squat Overload Base",
      12,
      "Build squat work capacity and overload tolerance before a heavier peaking phase.",
    ),
    familyId: "squat-overload-base",
    variant: "paid",
    methodId: "block-periodization",
    durationWeeks: 12,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.squatOverloadBase,
    goals: ["powerlifting", "strength"],
  },
  {
    slug: "bench-press-blueprint",
    name: "Bench Press Blueprint",
    description: paidDesc(
      "Bench Press Blueprint",
      12,
      "Structured bench frequency, technique grooves, and accessory work for pressing strength.",
    ),
    familyId: "bench-press-blueprint",
    variant: "paid",
    methodId: "daily-undulating-periodization",
    durationWeeks: 12,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.benchPressBlueprint,
    goals: ["powerlifting", "strength"],
  },
  {
    slug: "loglift-mastery",
    name: "Loglift Mastery",
    description: paidDesc(
      "Loglift Mastery",
      12,
      "Clean, press, and event-specific practice for a stronger, more repeatable log.",
    ),
    familyId: "loglift-mastery",
    variant: "paid",
    methodId: "block-periodization",
    durationWeeks: 12,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.logliftMastery,
    goals: ["strength", "competition_prep"],
  },
  {
    slug: "strongman-base-builder",
    name: "Strongman Base Builder",
    description: paidDesc(
      "Strongman Base Builder",
      12,
      "Raw static strength combined with event-specific conditioning.",
    ),
    familyId: "strongman-base-builder",
    variant: "paid",
    methodId: "conjugate",
    durationWeeks: 12,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.strongmanBaseBuilder,
    goals: ["strength", "general_strength"],
  },
  {
    slug: "iron-foundation-start",
    name: "Iron Foundation: Start",
    description: paidDesc(
      "Iron Foundation: Start",
      8,
      "A safe, linear introduction to strength training and caloric deficit. No complex movements, just building habits, basic strength, and initial fat loss.",
    ),
    familyId: "iron-foundation-start",
    variant: "paid",
    methodId: "linear-periodization",
    durationWeeks: 8,
    availableSchedules: ["3day"],
    difficulty: "beginner",
    recoveryDemand: "low",
    isFree: false,
    displayPricePence:
      PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.ironFoundationStart,
    goals: ["hypertrophy", "general_strength", "strength"],
  },
  {
    slug: "iron-cut-aggressive",
    name: "Iron Cut: Aggressive",
    description: paidDesc(
      "Iron Cut: Aggressive",
      12,
      "A relentless, high-deficit protocol for massive weight drops. Built on discipline.",
    ),
    familyId: "iron-cut-aggressive",
    variant: "paid",
    methodId: "daily-undulating-periodization",
    durationWeeks: 12,
    availableSchedules: ["4day", "5day"],
    difficulty: "advanced",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.ironCutAggressive,
    goals: ["hypertrophy", "general_strength"],
  },
  {
    slug: "iron-recomp-medium",
    name: "Iron Recomp: Medium",
    description: paidDesc(
      "Iron Recomp: Medium",
      14,
      "Steady fat loss while defending muscle mass and strength totals.",
    ),
    familyId: "iron-recomp-medium",
    variant: "paid",
    methodId: "daily-undulating-periodization",
    durationWeeks: 14,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.ironRecompMedium,
    goals: ["hypertrophy", "strength", "general_strength"],
  },
  {
    slug: "sustainable-lean-quality",
    name: "Sustainable Lean: Quality",
    description: paidDesc(
      "Sustainable Lean: Quality",
      16,
      "A slower, highly structured approach to leaning out without losing platform performance.",
    ),
    familyId: "sustainable-lean-quality",
    variant: "paid",
    methodId: "block-periodization",
    durationWeeks: 16,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: false,
    displayPricePence:
      PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.sustainableLeanQuality,
    goals: ["hypertrophy", "powerlifting", "general_strength"],
  },
  {
    slug: "explosive-power-speed",
    name: "Explosive Power & Speed",
    description: paidDesc(
      "Explosive Power & Speed",
      8,
      "Dynamic effort, jumps, and speed-strength work to transfer force faster.",
    ),
    familyId: "explosive-power-speed",
    variant: "paid",
    methodId: "conjugate",
    durationWeeks: 8,
    availableSchedules: ["3day", "4day"],
    difficulty: "intermediate",
    recoveryDemand: "moderate",
    isFree: false,
    displayPricePence: PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.explosivePowerSpeed,
    goals: ["strength", "general_strength"],
  },
  {
    slug: "olympic-weightlifting-base",
    name: "Olympic Weightlifting Base",
    description: paidDesc(
      "Olympic Weightlifting Base",
      12,
      "Snatch and clean & jerk foundations with strength support for the classic lifts.",
    ),
    familyId: "olympic-weightlifting-base",
    variant: "paid",
    methodId: "block-periodization",
    durationWeeks: 12,
    availableSchedules: ["3day", "4day", "5day"],
    difficulty: "intermediate",
    recoveryDemand: "high",
    isFree: false,
    displayPricePence:
      PROGRAM_CATALOG_GBP_LAUNCH_PRICES_PENCE.olympicWeightliftingBase,
    goals: ["strength", "competition_prep"],
  },
] as const;

export function isProgramCatalogGoal(value: string): value is ProgramCatalogGoal {
  return (PROGRAM_CATALOG_GOALS as readonly string[]).includes(value);
}

export function isProgramCatalogExperience(
  value: string,
): value is ProgramCatalogExperience {
  return (PROGRAM_CATALOG_EXPERIENCE as readonly string[]).includes(value);
}

export function isProgramCatalogSchedule(
  value: string,
): value is ProgramCatalogSchedule {
  return (PROGRAM_CATALOG_SCHEDULES as readonly string[]).includes(value);
}

export function seedDefinitionBySlug(
  slug: string,
): ProgramCatalogSeedDefinition | undefined {
  return PROGRAM_CATALOG_SEED.find((p) => p.slug === slug);
}

export function slugsMatchingGoal(goal: ProgramCatalogGoal): string[] {
  return PROGRAM_CATALOG_SEED.filter((p) => p.goals.includes(goal)).map(
    (p) => p.slug,
  );
}
