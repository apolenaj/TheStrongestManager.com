/**
 * Growth Experiment Framework (Prompt 159).
 * Safe A/B architecture — allowlisted surfaces only; never safety/privacy/medical.
 */

export const GROWTH_EXPERIMENT_ENGINE_VERSION = "growth_experiments.v1" as const;

export const GROWTH_EXPERIMENT_HONESTY = [
  "Only homepage CTA, onboarding framing, and pricing presentation may be experimented on.",
  "Safety warnings, privacy copy, and medical messaging are never A/B tested.",
  "Outcomes need statistically meaningful samples before any winner claim — underpowered arms show insufficient sample, never fake significance.",
] as const;

/** Surfaces allowed for growth experiments. */
export const GROWTH_ALLOWLIST_SURFACES = [
  "homepage_cta",
  "onboarding",
  "pricing_presentation",
] as const;
export type GrowthAllowlistSurface =
  (typeof GROWTH_ALLOWLIST_SURFACES)[number];

/** Categories that must never be experimented on. */
export const GROWTH_DENYLIST_CATEGORIES = [
  "safety_warnings",
  "privacy",
  "medical_messaging",
] as const;
export type GrowthDenylistCategory =
  (typeof GROWTH_DENYLIST_CATEGORIES)[number];

/** Minimum assignments per arm before reporting conversion estimates. */
export const GROWTH_MIN_SAMPLE_PER_ARM = 100;

export type GrowthExperimentArm = {
  id: string;
  label: string;
  weight: number;
  /** Variant payload — copy/layout only; never safety text. */
  payload: Record<string, string>;
};

export type GrowthExperimentDefinition = {
  id: string;
  name: string;
  surface: GrowthAllowlistSurface;
  hypothesis: string;
  /** Primary funnel outcome from product analytics catalog. */
  primaryOutcome: string;
  status: "draft" | "running" | "paused";
  arms: readonly GrowthExperimentArm[];
};

/**
 * Registered growth experiments (code-backed).
 * Keep payloads non-medical / non-privacy / non-safety.
 */
export const GROWTH_EXPERIMENTS: readonly GrowthExperimentDefinition[] = [
  {
    id: "homepage_cta_v1",
    name: "Homepage primary CTA label",
    surface: "homepage_cta",
    hypothesis:
      "A more specific CTA increases signup_started without changing brand or safety copy.",
    primaryOutcome: "signup_started",
    status: "running",
    arms: [
      {
        id: "control",
        label: "Start free",
        weight: 50,
        payload: { ctaLabel: "Start free" },
      },
      {
        id: "specific",
        label: "Create free athlete profile",
        weight: 50,
        payload: { ctaLabel: "Create free athlete profile" },
      },
    ],
  },
  {
    id: "onboarding_intro_v1",
    name: "Onboarding intro framing",
    surface: "onboarding",
    hypothesis:
      "Shorter intro framing increases onboarding_completed. Never changes pain/injury questions.",
    primaryOutcome: "onboarding_completed",
    status: "running",
    arms: [
      {
        id: "control",
        label: "Default intro",
        weight: 50,
        payload: {
          introEyebrow: "Onboarding",
          introSupport:
            "A few steps so Today and Progress can use your real training context.",
        },
      },
      {
        id: "outcome_led",
        label: "Outcome-led intro",
        weight: 50,
        payload: {
          introEyebrow: "Get set up",
          introSupport:
            "Tell us enough to make Today useful — you can refine goals later.",
        },
      },
    ],
  },
  {
    id: "pricing_cta_v1",
    name: "Pricing plan CTA wording",
    surface: "pricing_presentation",
    hypothesis:
      "Clearer free-tier CTA wording increases checkout_started / signup from pricing. Honesty alerts stay fixed.",
    primaryOutcome: "pricing_viewed",
    status: "running",
    arms: [
      {
        id: "control",
        label: "Continue free",
        weight: 50,
        payload: { freeCtaLabel: "Continue with Free" },
      },
      {
        id: "start",
        label: "Start on Free",
        weight: 50,
        payload: { freeCtaLabel: "Start on Free" },
      },
    ],
  },
] as const;

export const GROWTH_DENYLIST_EXAMPLES = [
  {
    category: "safety_warnings" as const,
    example: "Trust Center / pain-safe / movement disclaimers",
    reason: "Safety copy must stay identical for all visitors.",
  },
  {
    category: "privacy" as const,
    example: "Privacy Policy, consent, analytics privacy rules",
    reason: "Legal and privacy disclosures are not marketing levers.",
  },
  {
    category: "medical_messaging" as const,
    example: "Not medical advice, injury, diagnosis language",
    reason: "Medical framing is never A/B tested.",
  },
] as const;
