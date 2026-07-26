/**
 * Feature flags gate unfinished or future modules.
 * Unflagged routes stay out of navigation.
 * Direct URL hits render an honest “not available yet” state — never fake functionality.
 */
function flag(value: string | undefined, defaultOn = false): boolean {
  if (value === undefined || value === "") return defaultOn;
  return value === "true";
}

export const featureFlags = {
  /** Public method/exercise comparison — on by default once method compare ships */
  compare: flag(process.env.NEXT_PUBLIC_FF_COMPARE, true),
  /** Public training history timeline — on by default once Prompt 29 ships */
  history: flag(process.env.NEXT_PUBLIC_FF_HISTORY, true),
  /**
   * Historical Training Archive (Prompt 111).
   * Premium profiles: systems, coaches, methods — principles only; three analytical lenses.
   * Defaults on.
   */
  historicalTrainingArchive: flag(
    process.env.NEXT_PUBLIC_FF_HISTORICAL_TRAINING_ARCHIVE,
    true,
  ),
  /** Personalized “what fits me?” method recommender — on by default once Prompt 30 ships */
  fit: flag(process.env.NEXT_PUBLIC_FF_FIT, true),
  /** Public exercise detail pages /exercises/[slug] */
  exerciseDetail: flag(process.env.NEXT_PUBLIC_FF_EXERCISE_DETAIL),
  /** Public method detail pages /methods/[slug] — on by default once catalog ships */
  methodDetail: flag(process.env.NEXT_PUBLIC_FF_METHOD_DETAIL, true),
  /** Authenticated exercise intelligence browser */
  appExercises: flag(process.env.NEXT_PUBLIC_FF_APP_EXERCISES),
  /** Authenticated training-methods workspace — on by default once catalog ships */
  appMethods: flag(process.env.NEXT_PUBLIC_FF_APP_METHODS, true),
  /** Coach tools workspace — on by default once Prompt 35 ships */
  appCoach: flag(process.env.NEXT_PUBLIC_FF_APP_COACH, true),
  /** In-app academy — on by default once Prompt 38 ships */
  appAcademy: flag(process.env.NEXT_PUBLIC_FF_APP_ACADEMY, true),
  /** Program detail /app/programs/[id] */
  programDetail: flag(process.env.NEXT_PUBLIC_FF_PROGRAM_DETAIL),
  /**
   * Cross-domain insights (training × recovery × nutrition × body metrics).
   * Defaults on — empty/insufficient states stay honest.
   */
  appInsights: flag(process.env.NEXT_PUBLIC_FF_APP_INSIGHTS, true),
  /**
   * Stripe checkout / customer portal.
   * Keep off until Stripe keys + price IDs are configured and a ready adapter is registered.
   */
  billingCheckout: flag(process.env.NEXT_PUBLIC_FF_BILLING_CHECKOUT),
  /**
   * Mealnexio secure sync path.
   * Keep off until a real Mealnexio API client exists — never fake synced nutrition.
   */
  mealnexioSync: flag(process.env.NEXT_PUBLIC_FF_MEALNEXIO_SYNC),
  /**
   * Public coach marketplace browse (/coaching listings).
   * Defaults on for MVP request workflow — still never invents coaches.
   */
  coachMarketplace: flag(process.env.NEXT_PUBLIC_FF_COACH_MARKETPLACE, true),
  /**
   * Explicit Demo Mode (/demo) for sales, screenshots, and investor walkthroughs.
   * Uses isolated seeded/fixture athlete data — never production user accounts.
   */
  demoMode: flag(process.env.NEXT_PUBLIC_FF_DEMO_MODE, true),
  /**
   * Automatic Training Audit workflow (upload → analyze → understand → improve).
   * Defaults on — CSV / paste / manual only; never fabricates program lines.
   */
  trainingAudit: flag(process.env.NEXT_PUBLIC_FF_TRAINING_AUDIT, true),
  /**
   * PDF / image program parsing inside Training Audit.
   * Keep off until a real OCR/parser ships — never fake extracted programs.
   */
  trainingAuditPdfImage: flag(
    process.env.NEXT_PUBLIC_FF_TRAINING_AUDIT_PDF_IMAGE,
  ),
  /**
   * Exercise prescription engine (multi-rule catalog recommendations).
   * Defaults on — never single-heuristic auto-prescribe; catalog-backed only.
   */
  exercisePrescription: flag(
    process.env.NEXT_PUBLIC_FF_EXERCISE_PRESCRIPTION,
    true,
  ),
  /**
   * Weak Point Intelligence (evidence-backed findings).
   * Defaults on — never claims muscular weakness from appearance alone.
   */
  weakPointIntelligence: flag(
    process.env.NEXT_PUBLIC_FF_WEAK_POINT_INTELLIGENCE,
    true,
  ),
  /**
   * Technique Trend Engine — longitudinal scores / component trends.
   * Defaults on — never mixes incompatible camera angles.
   */
  techniqueTrendEngine: flag(
    process.env.NEXT_PUBLIC_FF_TECHNIQUE_TREND_ENGINE,
    true,
  ),
  /**
   * Side-by-side video comparison (old vs new lift).
   * Defaults on — synced playback; metrics gated by camera compatibility.
   */
  videoComparison: flag(process.env.NEXT_PUBLIC_FF_VIDEO_COMPARISON, true),
  /**
   * PR Prediction Engine — conservative estimated 1RM ranges.
   * Defaults on — never a single exact number; withhold when data is thin.
   */
  prPrediction: flag(process.env.NEXT_PUBLIC_FF_PR_PREDICTION, true),
  /**
   * Goal Probability Engine — qualitative goal trajectory (not a % chance).
   * Defaults on — never claims precise probability without model validation.
   */
  goalProbability: flag(process.env.NEXT_PUBLIC_FF_GOAL_PROBABILITY, true),
  /**
   * Competition Preparation Mode — meet countdown, taper sketches, attempts.
   * Defaults on — never auto-prescribes dehydration / risky weight cuts.
   */
  competitionMode: flag(process.env.NEXT_PUBLIC_FF_COMPETITION_MODE, true),
  /**
   * Powerlifting Attempt Selector — opener / second / conditional third.
   * Defaults on — never guarantees a make; risk preference is user-controlled.
   */
  attemptSelector: flag(process.env.NEXT_PUBLIC_FF_ATTEMPT_SELECTOR, true),
  /**
   * Personal Record Intelligence — typed PRs + timeline + sharing.
   * Defaults on — Estimated 1RM never presented as a verified meet PR.
   */
  prIntelligence: flag(process.env.NEXT_PUBLIC_FF_PR_INTELLIGENCE, true),
  /**
   * Optional public athlete profiles (/u/[slug]).
   * Defaults on — private by default; recovery/notes never exposed.
   */
  publicAthleteProfile: flag(
    process.env.NEXT_PUBLIC_FF_PUBLIC_ATHLETE_PROFILE,
    true,
  ),
  /**
   * Opt-in leaderboards — never invent ranks; no recovery/weight-loss boards.
   * Defaults on.
   */
  leaderboards: flag(process.env.NEXT_PUBLIC_FF_LEADERBOARDS, true),
  /**
   * Verified Lift System — self / video / competition; never “officially verified” without criteria.
   * Defaults on.
   */
  verifiedLifts: flag(process.env.NEXT_PUBLIC_FF_VERIFIED_LIFTS, true),
  /**
   * Challenge Engine — consistency / learning / improvement; never max-daily-lift races.
   * Defaults on.
   */
  challengeEngine: flag(process.env.NEXT_PUBLIC_FF_CHALLENGE_ENGINE, true),
  /**
   * Achievement System — small meaningful milestones; no vanity grind.
   * Defaults on.
   */
  achievementSystem: flag(process.env.NEXT_PUBLIC_FF_ACHIEVEMENT_SYSTEM, true),
  /**
   * Optional Athlete Level — multi-factor; Elite never from app usage alone.
   * Defaults on.
   */
  athleteLevel: flag(process.env.NEXT_PUBLIC_FF_ATHLETE_LEVEL, true),
  /**
   * Community Knowledge Q&A — human answers; AI may summarize, never impersonate.
   * Defaults on.
   */
  communityQa: flag(process.env.NEXT_PUBLIC_FF_COMMUNITY_QA, true),
  /**
   * Expert Contributor System — explicit verification; never auto-label experts.
   * Defaults on.
   */
  expertContributor: flag(process.env.NEXT_PUBLIC_FF_EXPERT_CONTRIBUTOR, true),
  /**
   * Coach Matching Engine — organic fit explanations; sponsored labeled separately.
   * Defaults on.
   */
  coachMatching: flag(process.env.NEXT_PUBLIC_FF_COACH_MATCHING, true),
  /**
   * Coach AI Copilot — week summary, performance changes, program drafts,
   * missing-data flags. Never auto-applies; coach Accept / Edit / Reject.
   * Defaults on.
   */
  coachAiCopilot: flag(process.env.NEXT_PUBLIC_FF_COACH_AI_COPILOT, true),
  /**
   * Multi-athlete coach dashboard — prioritized attention queue (Prompt 86).
   * Defaults on.
   */
  multiAthleteCoachDashboard: flag(
    process.env.NEXT_PUBLIC_FF_MULTI_ATHLETE_COACH_DASHBOARD,
    true,
  ),
  /**
   * Gym / team organization dashboard (Prompt 87).
   * Aggregate analytics only; never bypasses private athlete data.
   * Defaults on.
   */
  gymTeamDashboard: flag(process.env.NEXT_PUBLIC_FF_GYM_TEAM_DASHBOARD, true),
  /**
   * Organization (B2B) billing — seats, usage, upgrade; no hard-coded B2B prices.
   * Defaults on (checkout still requires Stripe + billingCheckout).
   */
  orgBilling: flag(process.env.NEXT_PUBLIC_FF_ORG_BILLING, true),
  /**
   * White-label readiness (Prompt 89) — branding config architecture only.
   * Default OFF. Does not enable custom domains or a white-label product.
   */
  whiteLabel: flag(process.env.NEXT_PUBLIC_FF_WHITE_LABEL, false),
  /**
   * API platform foundation (Prompt 90) — versioning/auth/rate-limit architecture.
   * Default OFF. Does not expose a public external API.
   */
  apiPlatform: flag(process.env.NEXT_PUBLIC_FF_API_PLATFORM, false),
  /**
   * Data moat (Prompt 91) — privacy-safe aggregation architecture for future model improvement.
   * Default OFF. No live training pipeline; consent defaults excluded.
   */
  dataMoat: flag(process.env.NEXT_PUBLIC_FF_DATA_MOAT, false),
  /**
   * Model feedback loop (Prompt 92) — helpful/not helpful + coach accept/modify/reject.
   * Never auto-retrains production AI. Defaults on.
   */
  modelFeedback: flag(process.env.NEXT_PUBLIC_FF_MODEL_FEEDBACK, true),
  /**
   * Optional expert review of technique analyses (Prompt 95).
   * Confirm / Correct / Comment; never label AI as expert-reviewed until decided.
   * Defaults on.
   */
  techniqueExpertReview: flag(
    process.env.NEXT_PUBLIC_FF_TECHNIQUE_EXPERT_REVIEW,
    true,
  ),
  /**
   * Paid Expert Technique Review products (Prompt 96).
   * Purchase → Upload → Queue → Expert report. No turnaround SLA without capacity.
   * Defaults on (checkout still requires Stripe + billingCheckout + published prices).
   */
  humanAnalysisProduct: flag(
    process.env.NEXT_PUBLIC_FF_HUMAN_ANALYSIS_PRODUCT,
    true,
  ),
  /**
   * Premium Performance Report PDF (Prompt 97).
   * Period-scoped athlete PDF with missing/estimated labels — no invented claims.
   * Defaults on.
   */
  performanceReportPdf: flag(
    process.env.NEXT_PUBLIC_FF_PERFORMANCE_REPORT_PDF,
    true,
  ),
  /**
   * Automatic monthly performance report (Prompt 98).
   * Lazy generate + archive + shareable public-safe summary. Defaults on.
   */
  monthlyPerformanceReport: flag(
    process.env.NEXT_PUBLIC_FF_MONTHLY_PERFORMANCE_REPORT,
    true,
  ),
  /**
   * Training Style Profiler (Prompt 99).
   * Practical intensity / frequency / volume preferences — never personality claims.
   * Defaults on.
   */
  trainingStyleProfiler: flag(
    process.env.NEXT_PUBLIC_FF_TRAINING_STYLE_PROFILER,
    true,
  ),
  /**
   * Personalization Engine (Prompt 100).
   * Ranks dashboard / recommendations / programs / alternatives / content / notifications.
   * Never personalizes pricing from sensitive characteristics. Defaults on.
   */
  personalizationEngine: flag(
    process.env.NEXT_PUBLIC_FF_PERSONALIZATION_ENGINE,
    true,
  ),
  /**
   * Smart Notification System (Prompt 101).
   * Useful alerts with channel + frequency prefs; anti-spam caps. Defaults on.
   */
  smartNotifications: flag(
    process.env.NEXT_PUBLIC_FF_SMART_NOTIFICATIONS,
    true,
  ),
  /**
   * Behavioral Retention System (Prompt 102).
   * Ethical follow-through loops — planned rest counts; no dark patterns.
   * Defaults on.
   */
  behavioralRetention: flag(
    process.env.NEXT_PUBLIC_FF_BEHAVIORAL_RETENTION,
    true,
  ),
  /**
   * Advanced Onboarding Personalization (Prompt 103).
   * Path-specific questions (beginner → coach). Defaults on.
   */
  advancedOnboardingPersonalization: flag(
    process.env.NEXT_PUBLIC_FF_ADVANCED_ONBOARDING,
    true,
  ),
  /**
   * Powerlifting Mode (Prompt 104).
   * SBD / total / competition priorities — no invented DOTS; federation later.
   * Defaults on.
   */
  powerliftingMode: flag(
    process.env.NEXT_PUBLIC_FF_POWERLIFTING_MODE,
    true,
  ),
  /**
   * Bodybuilding Mode (Prompt 105).
   * Muscle workload / volume / progression — no fake growth scores or photo BF.
   * Defaults on.
   */
  bodybuildingMode: flag(
    process.env.NEXT_PUBLIC_FF_BODYBUILDING_MODE,
    true,
  ),
  /**
   * Strongman Mode (Prompt 106).
   * Event PRs (weight/distance/time/reps) — never force powerlifting metrics.
   * Defaults on.
   */
  strongmanMode: flag(process.env.NEXT_PUBLIC_FF_STRONGMAN_MODE, true),
  /**
   * Weightlifting Mode (Prompt 107).
   * Snatch / clean / jerk / C&J + competition total. Defaults on.
   */
  weightliftingMode: flag(
    process.env.NEXT_PUBLIC_FF_WEIGHTLIFTING_MODE,
    true,
  ),
  /**
   * Advanced weightlifting video analysis (Prompt 107).
   * Defaults OFF — do not run technique analysis until lift-specific models exist.
   */
  weightliftingAdvancedVideoAnalysis: flag(
    process.env.NEXT_PUBLIC_FF_WEIGHTLIFTING_ADVANCED_VIDEO,
    false,
  ),
  /**
   * Multi-Sport Athlete Mode (Prompt 108).
   * Multiple focuses on one profile; dashboard adapts; PRs separated by sport.
   * Defaults on.
   */
  multiSportAthleteMode: flag(
    process.env.NEXT_PUBLIC_FF_MULTI_SPORT_ATHLETE_MODE,
    true,
  ),
  /**
   * Exercise Relationship Graph (Prompt 109).
   * Typed curated edges only — never invents arbitrary relationships.
   * Defaults on.
   */
  exerciseRelationshipGraph: flag(
    process.env.NEXT_PUBLIC_FF_EXERCISE_RELATIONSHIP_GRAPH,
    true,
  ),
  /**
   * Training Method Knowledge Graph (Prompt 110).
   * Methods ↔ coaches ↔ sports ↔ goals ↔ volume/intensity/recovery — curated only.
   * Defaults on.
   */
  trainingMethodKnowledgeGraph: flag(
    process.env.NEXT_PUBLIC_FF_TRAINING_METHOD_KNOWLEDGE_GRAPH,
    true,
  ),
  /**
   * Evidence Quality System (Prompt 112).
   * Content labels: strong/moderate/limited research + coaching consensus /
   * historical method / heuristic. Never fakes scientific certainty.
   * Defaults on.
   */
  evidenceQualitySystem: flag(
    process.env.NEXT_PUBLIC_FF_EVIDENCE_QUALITY_SYSTEM,
    true,
  ),
  /**
   * Research Library (Prompt 113).
   * Curated study architecture — never invents citations; import rejects missing ones.
   * Defaults on.
   */
  researchLibrary: flag(process.env.NEXT_PUBLIC_FF_RESEARCH_LIBRARY, true),
  /**
   * AI Research Summarizer (Prompt 114).
   * Verified paper input → structured draft; human review required before publish.
   * Never invents citations from model memory. Defaults on.
   */
  aiResearchSummarizer: flag(
    process.env.NEXT_PUBLIC_FF_AI_RESEARCH_SUMMARIZER,
    true,
  ),
  /**
   * Myth vs Reality Engine (Prompt 115).
   * SEO educational pages — careful answers, no clickbait misinformation.
   * Defaults on.
   */
  mythVsRealityEngine: flag(
    process.env.NEXT_PUBLIC_FF_MYTH_VS_REALITY,
    true,
  ),
  /**
   * Decision Tree Coaching Tools (Prompt 116).
   * Interactive structured rules with explained outputs — not medical advice.
   * Defaults on.
   */
  decisionTreeCoaching: flag(
    process.env.NEXT_PUBLIC_FF_DECISION_TREE_COACHING,
    true,
  ),
  /**
   * Program Builder 2.0 (Prompt 117).
   * Structured drafts from goal/days/session/equipment/priority lifts/experience.
   * Volume from tables only — never random AI set counts. Defaults on.
   */
  programBuilder: flag(process.env.NEXT_PUBLIC_FF_PROGRAM_BUILDER, true),
  /**
   * Program Version Control (Prompt 118).
   * v1/v2/v3 history with who/why/date, restore, completed sessions protected.
   * Defaults on.
   */
  programVersionControl: flag(
    process.env.NEXT_PUBLIC_FF_PROGRAM_VERSION_CONTROL,
    true,
  ),
  /**
   * Experiment Mode (Prompt 119).
   * Personal training experiments with before/after — never scientific research.
   * Defaults on.
   */
  experimentMode: flag(process.env.NEXT_PUBLIC_FF_EXPERIMENT_MODE, true),
  /**
   * A/B Programming Insights (Prompt 120).
   * Architecture for future anonymized aggregates — sample thresholds;
   * correlation ≠ causation. Defaults on (shell); results gated by n.
   */
  abProgrammingInsights: flag(
    process.env.NEXT_PUBLIC_FF_AB_PROGRAMMING_INSIGHTS,
    true,
  ),
  /**
   * Bodyweight / Performance Relationship (Prompt 121).
   * Trends for BW, estimated strength, relative strength — never implies
   * weight gain always improves strength. Defaults on.
   */
  bodyweightPerformance: flag(
    process.env.NEXT_PUBLIC_FF_BODYWEIGHT_PERFORMANCE,
    true,
  ),
  /**
   * Recovery Correlation Insights (Prompt 122).
   * Sleep / stress / soreness vs performance — observed association only;
   * sample-gated; not causal proof. Defaults on.
   */
  recoveryCorrelation: flag(
    process.env.NEXT_PUBLIC_FF_RECOVERY_CORRELATION,
    true,
  ),
  /**
   * Training Consistency Intelligence (Prompt 123).
   * Plan adherence — accounts for planned rest, deloads, injury breaks,
   * program changes. Does not reward blind session completion or gym days.
   * Defaults on.
   */
  trainingConsistencyIntelligence: flag(
    process.env.NEXT_PUBLIC_FF_TRAINING_CONSISTENCY_INTELLIGENCE,
    true,
  ),
  /**
   * Deload Intelligence (Prompt 124).
   * Multi-signal “Consider deload” — never from one bad workout; user decides;
   * never auto-applied. Defaults on.
   */
  deloadIntelligence: flag(
    process.env.NEXT_PUBLIC_FF_DELOAD_INTELLIGENCE,
    true,
  ),
  /**
   * Fatigue Alert System (Prompt 125).
   * Conservative levels: Normal / Watch / Elevated / High concern.
   * Training load + performance + recovery — no medical claims. Defaults on.
   */
  fatigueAlertSystem: flag(
    process.env.NEXT_PUBLIC_FF_FATIGUE_ALERT_SYSTEM,
    true,
  ),
  /**
   * Pain-Safe Response System (Prompt 126).
   * Sharp pain / neurological / serious injury → stop aggressive recs;
   * seek qualified medical evaluation; never diagnose. Defaults on.
   */
  painSafeResponseSystem: flag(
    process.env.NEXT_PUBLIC_FF_PAIN_SAFE_RESPONSE_SYSTEM,
    true,
  ),
  /**
   * Smart Exercise Substitutions (Prompt 127).
   * Replacement engine: goal, movement pattern, fatigue, skill + tradeoffs.
   * Defaults on.
   */
  exerciseSubstitutions: flag(
    process.env.NEXT_PUBLIC_FF_EXERCISE_SUBSTITUTIONS,
    true,
  ),
  /**
   * Equipment-Aware Programming (Prompt 128).
   * Profiles: commercial / home / powerlifting / minimal.
   * Generation & suggestions respect equipment; unavailable gear only as labelled alternatives.
   */
  equipmentAwareProgramming: flag(
    process.env.NEXT_PUBLIC_FF_EQUIPMENT_AWARE_PROGRAMMING,
    true,
  ),
  /**
   * Travel Training Mode (Prompt 129).
   * Hotel gym / no gym / limited equipment — temporary adaptation;
   * original program preserved; end travel restores normal.
   */
  travelTrainingMode: flag(
    process.env.NEXT_PUBLIC_FF_TRAVEL_TRAINING_MODE,
    true,
  ),
  /**
   * Injury-Modification Architecture (Prompt 130).
   * User-declared limitations (not diagnosis): avoid painful movement,
   * temporary restriction, professional instruction.
   * May suggest alternatives / reduced range / lower loading.
   * Always: follow qualified healthcare professional guidance.
   */
  injuryModification: flag(
    process.env.NEXT_PUBLIC_FF_INJURY_MODIFICATION,
    true,
  ),
  /**
   * Coaching Notes Intelligence (Prompt 131).
   * Coach notes + AI summaries with source labels.
   * Private notes never used for unrelated product purposes.
   */
  coachingNotesIntelligence: flag(
    process.env.NEXT_PUBLIC_FF_COACHING_NOTES_INTELLIGENCE,
    true,
  ),
  /**
   * Messaging System (Prompt 132).
   * Athlete–coach threads, attachments, workout/technique refs,
   * notifications, moderation/reporting, secure access via CoachAthleteAccess.
   */
  messagingSystem: flag(
    process.env.NEXT_PUBLIC_FF_MESSAGING_SYSTEM,
    true,
  ),
  /**
   * Check-in System (Prompt 133).
   * Customizable weekly check-in (training / recovery / bodyweight / goals).
   * Coach configures allowlisted questions; AI summarizes.
   * Never asks excessive sensitive health questions.
   */
  checkInSystem: flag(
    process.env.NEXT_PUBLIC_FF_CHECK_IN_SYSTEM,
    true,
  ),
  /**
   * Premium Coaching Sales Flow (Prompt 134).
   * Landing → Apply (goal/experience/budget/availability) → Review → Consultation → Offer.
   * Never promises acceptance. Conversion events tracked in analytics catalog.
   */
  premiumCoachingSales: flag(
    process.env.NEXT_PUBLIC_FF_PREMIUM_COACHING_SALES,
    true,
  ),
  /**
   * Referral Program (Prompt 135).
   * User receives a referral code. Possible rewards: technique credits,
   * complimentary month, premium features. Abuse caps; never pyramid incentives.
   */
  referralProgram: flag(
    process.env.NEXT_PUBLIC_FF_REFERRAL_PROGRAM,
    true,
  ),
  /**
   * Affiliate System (Prompt 136).
   * Creators, coaches, partners — track clicks, conversions, commission ledger.
   * Never display affiliate partnerships without disclosure.
   */
  affiliateSystem: flag(
    process.env.NEXT_PUBLIC_FF_AFFILIATE_SYSTEM,
    true,
  ),
  /**
   * Creator Program (Prompt 137).
   * Future creator partnerships: share technique score, publish programs,
   * share content, earn referral revenue. Do not imply partnership until approved.
   */
  creatorProgram: flag(
    process.env.NEXT_PUBLIC_FF_CREATOR_PROGRAM,
    true,
  ),
  /**
   * Program Marketplace (Prompt 138).
   * Creator listings with preview, sport, goal, duration, difficulty, equipment.
   * Ratings only from verified purchasers. Platform commission ledger.
   * Copyright attestation + staff review against unauthorized uploads.
   */
  programMarketplace: flag(
    process.env.NEXT_PUBLIC_FF_PROGRAM_MARKETPLACE,
    true,
  ),
  /**
   * Content Moderation (Prompt 139).
   * Unified queue for community, marketplace, coach profiles, and UGC.
   * Report · Review · Remove · Suspend · Audit log.
   */
  contentModeration: flag(
    process.env.NEXT_PUBLIC_FF_CONTENT_MODERATION,
    true,
  ),
  /**
   * Trust Center (Prompt 140).
   * Public honesty hub: AI limits, privacy, scoring, safety, evidence.
   * Major trust differentiator — composes shipped domain honesty only.
   */
  trustCenter: flag(process.env.NEXT_PUBLIC_FF_TRUST_CENTER, true),
  /**
   * Explainable AI UI (Prompt 141).
   * Shared “Why am I seeing this?” on AI insights — supporting data,
   * confidence, missing information. Default on.
   */
  explainableAiUi: flag(process.env.NEXT_PUBLIC_FF_EXPLAINABLE_AI_UI, true),
  /**
   * Confidence System (Prompt 142).
   * Universal High / Moderate / Low / Insufficient data labels.
   * Never shows uncalibrated confidence percentages. Default on.
   */
  confidenceSystem: flag(process.env.NEXT_PUBLIC_FF_CONFIDENCE_SYSTEM, true),
  /**
   * Data Freshness System (Prompt 143).
   * Technique / Recovery / Strength age labels; AI caps confidence on stale data.
   * Default on.
   */
  dataFreshnessSystem: flag(
    process.env.NEXT_PUBLIC_FF_DATA_FRESHNESS_SYSTEM,
    true,
  ),
  /**
   * AI Failure Modes (Prompt 144).
   * Graceful AI unavailable / degraded states; core app stays usable.
   * Never fabricates AI output. Default on.
   */
  aiFailureModes: flag(process.env.NEXT_PUBLIC_FF_AI_FAILURE_MODES, true),
  /**
   * AI Cost Control (Prompt 145).
   * Route LLM vs deterministic, cache, meter cost per feature.
   * Internal dashboard at /app/admin/ai-cost. Default on.
   */
  aiCostControl: flag(process.env.NEXT_PUBLIC_FF_AI_COST_CONTROL, true),
  /**
   * Multi-Model AI Router (Prompt 146).
   * Provider abstraction for reasoning / vision / summarization / classification.
   * Fallback + latency/error/cost logs. Dashboard at /app/admin/ai-router.
   */
  aiModelRouter: flag(process.env.NEXT_PUBLIC_FF_AI_MODEL_ROUTER, true),
  /**
   * AI Observability (Prompt 147).
   * Internal monitoring: requests, success, latency, cost, failures,
   * hallucination proxies, feedback — no private raw inputs.
   * Dashboard at /app/admin/ai-observability.
   */
  aiObservability: flag(process.env.NEXT_PUBLIC_FF_AI_OBSERVABILITY, true),
  /**
   * Internationalization (Prompt 148).
   * Message catalogs + terminology review; English active;
   * Czech / German / Spanish / Arabic planned. No auto-translate of
   * fitness terms. Console at /app/admin/i18n.
   */
  i18n: flag(process.env.NEXT_PUBLIC_FF_I18N, true),
  /**
   * Unit System (Prompt 149).
   * Canonical kg / cm / m storage; kg/lb, cm/ft/in, km/miles presentation.
   * Console at /app/admin/unit-system.
   */
  unitSystem: flag(process.env.NEXT_PUBLIC_FF_UNIT_SYSTEM, true),
  /**
   * Timezone System (Prompt 150).
   * Store UTC; display local via AthleteProfile.timezone (IANA).
   * Workouts, competition countdowns, notifications, coach messages.
   * Console at /app/admin/timezone-system.
   */
  timezoneSystem: flag(process.env.NEXT_PUBLIC_FF_TIMEZONE_SYSTEM, true),
  /**
   * Accessibility 2.0 (Prompt 151).
   * Advanced WCAG audit: keyboard, SR, charts, video, forms, modals,
   * focus traps, color blindness. Technique scores never color-only.
   * Console at /app/admin/accessibility.
   */
  accessibilitySystem: flag(
    process.env.NEXT_PUBLIC_FF_ACCESSIBILITY_SYSTEM,
    true,
  ),
  /**
   * Performance 2.0 (Prompt 152).
   * Core Web Vitals budgets + reporting for homepage, dashboard,
   * exercise pages, and technique analysis.
   * Console at /app/admin/performance.
   */
  performanceSystem: flag(
    process.env.NEXT_PUBLIC_FF_PERFORMANCE_SYSTEM,
    true,
  ),
  /**
   * Database Scale Audit (Prompt 153).
   * Indexes, N+1, pagination, large tables, analytics separation,
   * technique/video metadata — scaling path without premature sharding.
   * Console at /app/admin/database-scale.
   */
  databaseScale: flag(process.env.NEXT_PUBLIC_FF_DATABASE_SCALE, true),
  /**
   * Event-Driven Architecture (Prompt 154).
   * Background domain events + in-process queue; idempotent handlers.
   * Technique / workout / PR / weekly review / billing.
   * Console at /app/admin/event-driven.
   */
  eventDrivenArchitecture: flag(
    process.env.NEXT_PUBLIC_FF_EVENT_DRIVEN_ARCHITECTURE,
    true,
  ),
  /**
   * Production Observability (Prompt 155).
   * Errors, API latency, DB, jobs, payments, technique failures.
   * Correlation IDs; sanitized logs only.
   * Console at /app/admin/observability.
   */
  productionObservability: flag(
    process.env.NEXT_PUBLIC_FF_PRODUCTION_OBSERVABILITY,
    true,
  ),
  /**
   * Backup & Disaster Recovery (Prompt 156).
   * Runbook registry — DB/file backups, restore tests, video retention, DR.
   * See docs/DISASTER_RECOVERY.md. Console at /app/admin/backup-recovery.
   */
  backupRecovery: flag(process.env.NEXT_PUBLIC_FF_BACKUP_RECOVERY, true),
  /**
   * Billing 2.0 (Prompt 157).
   * Monthly/annual, trials, coupons, credits, upgrades/downgrades,
   * grace, invoices, webhook idempotency — never grant from frontend alone.
   * Console at /app/admin/billing-2.
   */
  billing2: flag(process.env.NEXT_PUBLIC_FF_BILLING_2, true),
  /**
   * Entitlement System (Prompt 158).
   * Central EntitlementService — technique, AI Coach, analytics, coach tools, programs.
   * Console at /app/admin/entitlements.
   */
  entitlementSystem: flag(
    process.env.NEXT_PUBLIC_FF_ENTITLEMENT_SYSTEM,
    true,
  ),
  /**
   * Growth Experiment Framework (Prompt 159).
   * Safe A/B — homepage CTA, onboarding, pricing presentation only.
   * Never safety warnings, privacy, or medical messaging.
   * Console at /app/admin/growth-experiments.
   */
  growthExperiments: flag(
    process.env.NEXT_PUBLIC_FF_GROWTH_EXPERIMENTS,
    true,
  ),
  /**
   * Activation Metrics (Prompt 160).
   * Product activation = onboarding + first workout + first technique + D7 return.
   * Not vanity metrics. Console at /app/admin/activation-metrics.
   */
  activationMetrics: flag(
    process.env.NEXT_PUBLIC_FF_ACTIVATION_METRICS,
    true,
  ),
  /**
   * Retention Analytics (Prompt 161).
   * D1/D7/D30, subscription & feature retention, action correlations.
   * Correlation ≠ causation. Console at /app/admin/retention-analytics.
   */
  retentionAnalytics: flag(
    process.env.NEXT_PUBLIC_FF_RETENTION_ANALYTICS,
    true,
  ),
  /**
   * Conversion Funnel (Prompt 162).
   * Homepage → Signup → Onboarding → First value → Pricing → Checkout → Paid.
   * Drop-off ranked visualization. Console at /app/admin/conversion-funnel.
   */
  conversionFunnel: flag(
    process.env.NEXT_PUBLIC_FF_CONVERSION_FUNNEL,
    true,
  ),
  /**
   * User Segmentation (Prompt 163).
   * Beginner / Advanced / Powerlifting / Bodybuilding / Coach / Paid / High engagement.
   * Behavior + product context only — never sensitive demographics.
   * Console at /app/admin/user-segmentation.
   */
  userSegmentation: flag(
    process.env.NEXT_PUBLIC_FF_USER_SEGMENTATION,
    true,
  ),
  /**
   * Personalized Homepage (Prompt 164).
   * Traffic-intent soft variants — brand + SEO metadata locked; no cloaking.
   * Console at /app/admin/personalized-homepage.
   */
  personalizedHomepage: flag(
    process.env.NEXT_PUBLIC_FF_PERSONALIZED_HOMEPAGE,
    true,
  ),
  /**
   * Programmatic SEO Safety (Prompt 165).
   * Allowlisted useful templates only — quality gates; refuse thin factories.
   * Guides at /guides/[slug]. Console at /app/admin/programmatic-seo-safety.
   */
  programmaticSeoSafety: flag(
    process.env.NEXT_PUBLIC_FF_PROGRAMMATIC_SEO_SAFETY,
    true,
  ),
  /**
   * Exercise Comparison Engine (Prompt 166).
   * Exercise A vs B — purpose/technique/muscles/fatigue/programming/who.
   * SEO pairs at /compare/exercises/[slug]. Console at /app/admin/exercise-comparison.
   */
  exerciseComparison: flag(
    process.env.NEXT_PUBLIC_FF_EXERCISE_COMPARISON,
    true,
  ),
  /**
   * Sport Goal Landing Pages (Prompt 167).
   * High-quality /goals/[slug] landings with product CTAs — no SEO filler.
   * Console at /app/admin/sport-goal-landings.
   */
  sportGoalLandings: flag(
    process.env.NEXT_PUBLIC_FF_SPORT_GOAL_LANDINGS,
    true,
  ),
  /**
   * Calculator Suite (Prompt 168).
   * Useful /tools calculators with precision honesty + product CTAs.
   * Console at /app/admin/calculator-suite.
   */
  calculatorSuite: flag(
    process.env.NEXT_PUBLIC_FF_CALCULATOR_SUITE,
    true,
  ),
  /**
   * Free Technique Check Funnel (Prompt 169).
   * Upload one lift → limited insight before signup; guest video stays local.
   * Console at /app/admin/technique-check.
   */
  techniqueCheck: flag(
    process.env.NEXT_PUBLIC_FF_TECHNIQUE_CHECK,
    true,
  ),
  /**
   * Free Program Audit Funnel (Prompt 170).
   * Paste program → deterministic basic audit → unlock details with account.
   * Console at /app/admin/program-audit. No fake scoring.
   */
  programAudit: flag(
    process.env.NEXT_PUBLIC_FF_PROGRAM_AUDIT,
    true,
  ),
  /**
   * Free Athlete Score Funnel (Prompt 171).
   * Limited questions → Self-assessment estimate — Not full Athlete Score.
   * Console at /app/admin/athlete-assessment.
   */
  athleteAssessment: flag(
    process.env.NEXT_PUBLIC_FF_ATHLETE_ASSESSMENT,
    true,
  ),
  /**
   * On-Site Education Engine (Prompt 172).
   * Learn why on metrics — explain in context without leaving the dashboard.
   * Console at /app/admin/on-site-education.
   */
  onSiteEducation: flag(
    process.env.NEXT_PUBLIC_FF_ON_SITE_EDUCATION,
    true,
  ),
  /**
   * Micro-Learning (Prompt 173).
   * Personalized 1-minute cards — anti-spam (max 1/day). Dashboard teaser.
   * Console at /app/admin/micro-learning.
   */
  microLearning: flag(
    process.env.NEXT_PUBLIC_FF_MICRO_LEARNING,
    true,
  ),
  /**
   * Academy 2.0 (Prompt 174).
   * Learning paths, prerequisites, practical assignments, technique examples,
   * coach curriculum, knowledge progress — extends Academy (Prompt 38).
   * Console at /app/admin/academy.
   */
  academy20: flag(process.env.NEXT_PUBLIC_FF_ACADEMY_20, true),
  /**
   * Certificate Verification (Prompt 175).
   * Public verify for Academy Certificates of Completion by unique ID.
   * Never implies accreditation unless officially accredited.
   * Console at /app/admin/certificate-verification.
   */
  certificateVerification: flag(
    process.env.NEXT_PUBLIC_FF_CERTIFICATE_VERIFICATION,
    true,
  ),
  /**
   * Enterprise Security Prep (Prompt 176).
   * B2B procurement control registry — access, encryption, processing,
   * logging, backups, incident response. Never claim unearned compliance certs.
   * Console at /app/admin/enterprise-security.
   */
  enterpriseSecurity: flag(
    process.env.NEXT_PUBLIC_FF_ENTERPRISE_SECURITY,
    true,
  ),
  /**
   * GDPR Readiness (Prompt 177).
   * Consent, export, deletion, processing docs, cookie controls, retention.
   * Legal pages marked for professional legal review — not a compliance cert.
   * Console at /app/admin/gdpr-readiness.
   */
  gdprReadiness: flag(process.env.NEXT_PUBLIC_FF_GDPR_READINESS, true),
  /**
   * Video Privacy Controls (Prompt 178).
   * Private by default; analysis / expert review / anonymous model improvement
   * require explicit opt-in — no hidden consent.
   * Console at /app/admin/video-privacy.
   */
  videoPrivacyControls: flag(
    process.env.NEXT_PUBLIC_FF_VIDEO_PRIVACY_CONTROLS,
    true,
  ),
  /**
   * Model Improvement Consent (Prompt 179).
   * Clear UI separating service use, expert review, and research/model improvement.
   * No bundled consent; revoke where applicable. /app/settings/consent
   * Console at /app/admin/model-improvement-consent.
   */
  modelImprovementConsent: flag(
    process.env.NEXT_PUBLIC_FF_MODEL_IMPROVEMENT_CONSENT,
    true,
  ),
  /**
   * Safety System 2.0 (Prompt 180).
   * Central recommendation validator — block/modify unsafe frequency, volume,
   * rapid weight loss, medical diagnosis, and pain-ignoring advice.
   * Console at /app/admin/safety-system.
   */
  safetySystem20: flag(process.env.NEXT_PUBLIC_FF_SAFETY_SYSTEM_20, true),
  /**
   * Red Team AI Coach (Prompt 181).
   * Adversarial QA for Coach chat — refuse injury/sleep maxes, diagnosis,
   * and guaranteed gains; document failures. Console at /app/admin/red-team-ai-coach.
   */
  redTeamAiCoach: flag(process.env.NEXT_PUBLIC_FF_RED_TEAM_AI_COACH, true),
  /**
   * Product Trust Audit (Prompt 182).
   * Registry + certainty chrome on AI surfaces — provenance, confidence,
   * medical/scientific certainty risk, challenge paths.
   * Console at /app/admin/product-trust-audit.
   */
  productTrustAudit: flag(
    process.env.NEXT_PUBLIC_FF_PRODUCT_TRUST_AUDIT,
    true,
  ),
  /**
   * Mobile-First Workout App Experience (Prompt 183).
   * One-exercise focus, large steppers, auto-save, sticky rest timer,
   * previous performance — no dashboard density during workout.
   * Console at /app/admin/mobile-workout.
   */
  mobileWorkoutExperience: flag(
    process.env.NEXT_PUBLIC_FF_MOBILE_WORKOUT_EXPERIENCE,
    true,
  ),
  /**
   * PWA Readiness (Prompt 184).
   * Installable app, offline shell, cached workout snapshot, sync when online.
   * Never caches auth/API/technique media insecurely.
   * Console at /app/admin/pwa-readiness.
   */
  pwaReadiness: flag(process.env.NEXT_PUBLIC_FF_PWA_READINESS, true),
  /**
   * Wearable Integration Abstraction (Prompt 185).
   * Architecture registry for Apple Health / Health Connect / Garmin / Whoop / Oura.
   * No fake live connections. Console at /app/admin/wearable-integration.
   */
  wearableIntegration: flag(
    process.env.NEXT_PUBLIC_FF_WEARABLE_INTEGRATION,
    true,
  ),
  /** Live Apple Health bridge — default OFF until a real client ships. */
  wearableAppleHealth: flag(
    process.env.NEXT_PUBLIC_FF_WEARABLE_APPLE_HEALTH,
    false,
  ),
  /** Live Google Health Connect — default OFF until a real client ships. */
  wearableGoogleHealthConnect: flag(
    process.env.NEXT_PUBLIC_FF_WEARABLE_GOOGLE_HEALTH_CONNECT,
    false,
  ),
  /** Live Garmin API — default OFF until credentials + client exist. */
  wearableGarmin: flag(process.env.NEXT_PUBLIC_FF_WEARABLE_GARMIN, false),
  /** Live Whoop API — default OFF until credentials + client exist. */
  wearableWhoop: flag(process.env.NEXT_PUBLIC_FF_WEARABLE_WHOOP, false),
  /** Live Oura API — default OFF until credentials + client exist. */
  wearableOura: flag(process.env.NEXT_PUBLIC_FF_WEARABLE_OURA, false),
  /**
   * Device Data Normalization (Prompt 186).
   * Canonical sleep / HR / HRV / steps / workouts + source metadata.
   * Cross-device values are never treated as identical without caveats.
   * Console at /app/admin/device-data-normalization.
   */
  deviceDataNormalization: flag(
    process.env.NEXT_PUBLIC_FF_DEVICE_DATA_NORMALIZATION,
    true,
  ),
  /**
   * Mealnexio Deep Linking (Prompt 187).
   * Cross-product CTAs + return landing + SSO architecture stub.
   * Does not fake sync or SSO sessions. Console at /app/admin/mealnexio-deep-linking.
   */
  mealnexioDeepLinking: flag(
    process.env.NEXT_PUBLIC_FF_MEALNEXIO_DEEP_LINKING,
    true,
  ),
  /**
   * Performance OS Command Center (Prompt 188).
   * Ultimate dashboard: TODAY above fold; Performance→AI Coach below;
   * adaptive density + customizable widgets. Console at /app/admin/command-center.
   */
  commandCenter: flag(process.env.NEXT_PUBLIC_FF_COMMAND_CENTER, true),
  /**
   * Custom Dashboards (Prompt 189).
   * Focus presets: Strength, Technique, Recovery, Nutrition, Competition, Bodybuilding.
   * Smart defaults + save layout. Console at /app/admin/custom-dashboards.
   */
  customDashboards: flag(process.env.NEXT_PUBLIC_FF_CUSTOM_DASHBOARDS, true),
  /**
   * Command Palette (Prompt 190).
   * Power-user commands (log workout, ask coach, …) via Ctrl/Cmd+Shift+P.
   * Distinct from ⌘K content search. Console at /app/admin/command-palette.
   */
  commandPalette: flag(process.env.NEXT_PUBLIC_FF_COMMAND_PALETTE, true),
  /**
   * Universal Timeline (Prompt 191).
   * Athlete history: workout, PR, technique, program, competition,
   * bodyweight milestone, coach note — with filters. /app/timeline.
   */
  universalTimeline: flag(process.env.NEXT_PUBLIC_FF_UNIVERSAL_TIMELINE, true),
  /**
   * Performance Story (Prompt 192).
   * Long-term narrative + shareable yearly review — no fake causal conclusions.
   * /app/performance-story · /share/story/[token]
   */
  performanceStory: flag(process.env.NEXT_PUBLIC_FF_PERFORMANCE_STORY, true),
  /**
   * Year in Review (Prompt 193).
   * Annual report cards: sessions, PRs, technique, top exercises,
   * most consistent month, competition — shareable. /app/year-in-review
   */
  yearInReview: flag(process.env.NEXT_PUBLIC_FF_YEAR_IN_REVIEW, true),
  /**
   * Social Graph Prep (Prompt 194).
   * Architecture for follow athletes/coaches, private accounts, activity feeds.
   * Console at /app/admin/social-graph. Does not launch a live social network.
   */
  socialGraphPrep: flag(process.env.NEXT_PUBLIC_FF_SOCIAL_GRAPH_PREP, true),
  /**
   * Social Activity Feed (Prompt 194).
   * Live follower activity feed — default OFF until moderation readiness
   * and intentional enable. See evaluateSocialFeedLaunchGate.
   */
  socialActivityFeed: flag(
    process.env.NEXT_PUBLIC_FF_SOCIAL_ACTIVITY_FEED,
    false,
  ),
  /**
   * Activity Feed MVP (Prompt 195).
   * Optional finite feed: PRs, competition results, achievements,
   * shared technique — user visibility controls; no endless engagement.
   * /app/activity-feed · Distinct from gated follower socialActivityFeed.
   */
  activityFeedMvp: flag(process.env.NEXT_PUBLIC_FF_ACTIVITY_FEED_MVP, true),
  /**
   * Live Competition Mode architecture (Prompt 196).
   * Meet-day contracts: enter competition, attempts, results, next attempt,
   * warm-up timing, offline queue. Console at /app/admin/live-competition.
   * Does not launch unsafe instructions or invent results.
   */
  liveCompetitionMode: flag(
    process.env.NEXT_PUBLIC_FF_LIVE_COMPETITION_MODE,
    true,
  ),
  /**
   * Live Competition meet-day runtime (Prompt 196).
   * Default OFF until persistence + safety review. Architecture can be on
   * while this stays off.
   */
  liveCompetitionRuntime: flag(
    process.env.NEXT_PUBLIC_FF_LIVE_COMPETITION_RUNTIME,
    false,
  ),
  /**
   * Warm-up Generator (Prompt 197).
   * Progressive warm-ups from target working weight, exercise, recent history.
   * Conservative defaults; user-editable; fatigue-aware shorter ladder.
   * /app/warmup
   */
  warmupGenerator: flag(process.env.NEXT_PUBLIC_FF_WARMUP_GENERATOR, true),
  /**
   * Session Readiness Adjuster (Prompt 198).
   * Pre-workout quick check-in: sleep, fatigue, soreness, motivation.
   * Recommends proceed / minor adjustment / review load — never cancel from one metric.
   * /app/session-readiness
   */
  sessionReadinessAdjuster: flag(
    process.env.NEXT_PUBLIC_FF_SESSION_READINESS_ADJUSTER,
    true,
  ),
  /**
   * Live Session Autoregulation (Prompt 199).
   * During workout: compare actual RPE vs planned; if significantly harder,
   * suggest reducing the next set — never auto-apply without confirmation.
   */
  liveSessionAutoregulation: flag(
    process.env.NEXT_PUBLIC_FF_LIVE_SESSION_AUTOREGULATION,
    true,
  ),
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;
