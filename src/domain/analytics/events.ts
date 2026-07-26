/**
 * Central product analytics event catalog (Prompt 42).
 * Event names and allowed properties are the single source of truth.
 * Do not invent ad-hoc event strings in UI or services.
 */

/** Canonical product events — snake_case for vendor portability. */
export const PRODUCT_EVENT_NAMES = [
  "homepage_viewed",
  "signup_started",
  "signup_completed",
  "onboarding_completed",
  "workout_started",
  "workout_completed",
  "technique_analysis_uploaded",
  "technique_analysis_completed",
  "pricing_viewed",
  "checkout_started",
  "subscription_activated",
  "model_feedback_submitted",
  "premium_coaching_landing_viewed",
  "premium_coaching_application_submitted",
  "premium_coaching_stage_changed",
  "premium_coaching_offer_presented",
  "referral_code_issued",
  "referral_attributed",
  "referral_qualified",
  "referral_reward_granted",
  "referral_voided",
  "affiliate_partner_applied",
  "affiliate_partner_activated",
  "affiliate_link_clicked",
  "affiliate_conversion_attributed",
  "affiliate_commission_ledgered",
  "creator_program_applied",
  "creator_program_reviewed",
  "creator_program_approved",
  "program_marketplace_submitted",
  "program_marketplace_reviewed",
  "program_marketplace_published",
  "program_marketplace_purchased",
  "program_marketplace_rated",
  "program_marketplace_commission_ledgered",
  "content_moderation_reported",
  "content_moderation_reviewed",
  "content_moderation_removed",
  "content_moderation_suspended",
  "growth_experiment_exposure",
  "growth_experiment_conversion",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

export type SignupMethod = "email" | "google" | "apple";

/**
 * Typed payloads per event.
 * Only enums, opaque ids, booleans, and coarse counts — never free text,
 * notes, health values, video bytes/paths, or emails.
 */
export type ProductEventPropsMap = {
  /** Marketing homepage mount (Prompt 162 conversion funnel top). */
  homepage_viewed: Record<string, never>;
  signup_started: {
    method?: SignupMethod;
  };
  signup_completed: {
    method: SignupMethod;
  };
  onboarding_completed: {
    /** Opaque profile id only — no assessment answers. */
    athleteProfileId: string;
  };
  workout_started: {
    sessionId: string;
    /** True when resuming an in-progress session rather than creating one. */
    resumed?: boolean;
  };
  workout_completed: {
    sessionId: string;
  };
  technique_analysis_uploaded: {
    analysisId: string;
    /** Exercise slug is public catalog metadata, not private content. */
    exerciseSlug?: string;
    movementMvp?: boolean;
  };
  technique_analysis_completed: {
    analysisId: string;
    /** Backend status enum only — never scores, landmarks, or summaries. */
    backendStatus: string;
    supportedExercise?: boolean;
  };
  pricing_viewed: {
    checkoutEnabled: boolean;
  };
  checkout_started: {
    planId: string;
    interval: "monthly" | "annual";
  };
  subscription_activated: {
    planId: string;
    /** Prior plan when known (e.g. free → pro). */
    fromPlanId?: string;
  };
  model_feedback_submitted: {
    relatedType: string;
    verdict: string;
    role: string;
  };
  premium_coaching_landing_viewed: {
    checkoutEnabled: boolean;
  };
  premium_coaching_application_submitted: {
    applicationId: string;
    goal?: string;
    experienceLevel?: string;
    budgetBand?: string;
  };
  premium_coaching_stage_changed: {
    applicationId: string;
    fromStage: string;
    toStage: string;
  };
  premium_coaching_offer_presented: {
    applicationId: string;
  };
  referral_code_issued: {
    codeLength: number;
  };
  referral_attributed: {
    referralId: string;
  };
  referral_qualified: {
    referralId: string;
  };
  referral_reward_granted: {
    referralId: string;
    rewardKind: string;
    beneficiaryRole: string;
  };
  referral_voided: {
    referralId: string;
    voidReason: string;
  };
  affiliate_partner_applied: {
    partnerId: string;
    partnerType: string;
  };
  affiliate_partner_activated: {
    partnerId: string;
    partnerType: string;
  };
  affiliate_link_clicked: {
    partnerId: string;
    linkId: string;
  };
  affiliate_conversion_attributed: {
    partnerId: string;
    conversionId: string;
    eventType: string;
  };
  affiliate_commission_ledgered: {
    partnerId: string;
    conversionId: string;
    amountCents: number;
    commissionStatus: string;
  };
  creator_program_applied: {
    partnershipId: string;
    capabilityCount: number;
  };
  creator_program_reviewed: {
    partnershipId: string;
    toStatus: string;
  };
  creator_program_approved: {
    partnershipId: string;
  };
  program_marketplace_submitted: {
    listingId: string;
    sport: string;
    goal: string;
    difficulty: string;
  };
  program_marketplace_reviewed: {
    listingId: string;
    toStatus: string;
  };
  program_marketplace_published: {
    listingId: string;
  };
  program_marketplace_purchased: {
    listingId: string;
    purchaseId: string;
    priceCents: number;
  };
  program_marketplace_rated: {
    listingId: string;
    purchaseId: string;
    stars: number;
  };
  program_marketplace_commission_ledgered: {
    listingId: string;
    purchaseId: string;
    platformCents: number;
    commissionStatus: string;
    commissionBps: number;
  };
  content_moderation_reported: {
    reportId: string;
    target: string;
    relatedType: string;
    reason: string;
  };
  content_moderation_reviewed: {
    reportId: string;
    action: string;
    target: string;
    relatedType: string;
  };
  content_moderation_removed: {
    reportId: string;
    target: string;
    relatedType: string;
  };
  content_moderation_suspended: {
    reportId: string;
    target: string;
    relatedType: string;
  };
  /** Growth A/B exposure — opaque experiment/arm ids only (Prompt 159). */
  growth_experiment_exposure: {
    experimentId: string;
    armId: string;
    surface: string;
  };
  /** Growth A/B conversion tied to a catalog funnel outcome name. */
  growth_experiment_conversion: {
    experimentId: string;
    armId: string;
    surface: string;
    outcome: string;
  };
};

export type ProductEventPayload<N extends ProductEventName = ProductEventName> =
  {
    name: N;
    props: ProductEventPropsMap[N];
    /**
     * Opaque authenticated user id when known.
     * Never pass email, name, or other PII here.
     */
    userId?: string | null;
  };

export function isProductEventName(value: string): value is ProductEventName {
  return (PRODUCT_EVENT_NAMES as readonly string[]).includes(value);
}
