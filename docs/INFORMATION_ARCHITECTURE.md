# The Strongest — Information Architecture

**Date:** 2026-07-20  
**Prompt:** 2 — Information architecture and route system  
**Source of truth (code):** `src/config/routes.ts`, `src/config/feature-flags.ts`

---

## Purpose

Define a scalable route and navigation system that supports the Performance OS journey:

**Goal → Assessment → Athlete profile → Training → Technique → Recovery → Nutrition → Progress → Recommendations → Adaptation**

Public marketing surfaces attract and educate. Authenticated `/app/*` routes deliver the operating system. Unfinished modules are feature-flagged — never faked.

---

## Navigation

### Main public navigation

| Label | Route | Status now |
| --- | --- | --- |
| Home | `/` | Live brand entry |
| Features | `/features` | Capability overview (honest) |
| Exercises | `/exercises` | Index shell (Coming soon) |
| Training Methods | `/methods` | Live curated catalog |
| Compare | `/compare` | Method comparison (default on) |
| History | `/history` | Training history timeline (default on) |
| History archive | `/history/archive` | Historical Training Archive (default on) |
| Evidence | `/evidence` | Evidence Quality System legend (default on) |
| Trust Center | `/trust` | Public AI / privacy / scoring / safety honesty hub (default on) |
| Research | `/research` | Research Library (default on; citations required) |
| Myths | `/myths` | Myth vs Reality (default on; anti-clickbait) |
| Decision trees | `/decision-trees` | Coaching decision trees (default on; not medical advice) |
| Fit | `/fit` | What training approach fits me? (default on) |
| Coaching | `/coaching` | Flag `coachMarketplace` (default on; empty until published) |
| Find a coach | `/coaching/match` | Flag `coachMatching` (default on) |
| Learn | `/learn` | Topic cluster hub (SEO pillars) |
| Guides | `/guides` | Quality-gated programmatic SEO guides (default on; Prompt 165) |
| Goals | `/goals` | Sport/goal landings with product CTAs (default on; Prompt 167) |
| Tools | `/tools` | Calculator suite — 1RM, plates, DOTS, volume, attempts, TM (default on; Prompt 168) |
| Technique check | `/technique-check` | Free lift check — limited insight before signup (default on; Prompt 169) |
| Program audit | `/program-audit` | Paste program — deterministic basic audit; no fake score (default on; Prompt 170) |
| Athlete assessment | `/athlete-assessment` | Self-assessment estimate — Not full Athlete Score (default on; Prompt 171) |
| Academy | `/academy` | Course catalog + learning paths (Certificate of Completion; Academy 2.0) |
| Pricing | `/pricing` | Live catalog (checkout flagged) |

**Not in public nav (flagged):** `/exercises/[slug]` (when `exerciseDetail` off); `/compare` when `compare` off; `/history` when `history` off; `/fit` when `fit` off

### Authenticated navigation

| Label | Route | Default visibility |
| --- | --- | --- |
| Dashboard | `/app/dashboard` | On |
| Profile | `/app/profile` | On |
| Today | `/app/today` | On |
| Training | `/app/training` | On |
| Programs | `/app/programs` | On |
| Program Builder | `/app/program-builder` | Program Builder 2.0 (default on) |
| Experiments | `/app/experiments` | Personal training experiments (default on) |
| Programming insights | `/app/programming-insights` | A/B aggregate architecture (default on; n-gated) |
| Bodyweight & performance | `/app/bodyweight-performance` | BW / strength / relative trends (default on) |
| Recovery correlations | `/app/recovery-correlation` | Sleep/stress/soreness vs performance (default on; n-gated) |
| Training consistency | `/app/training-consistency` | Plan adherence (rest/deload/injury/change; default on) |
| Deload intelligence | `/app/deload-intelligence` | Consider deload (multi-signal; user decides; default on) |
| Fatigue alerts | `/app/fatigue-alerts` | Normal/Watch/Elevated/High concern (default on) |
| Pain-safe response | `/app/pain-safe-response` | Stop aggressive recs on red-flag reports (default on) |
| Exercise substitutions | `/app/exercise-substitutions` | Smart replacements + tradeoffs (default on) |
| Equipment profiles | `/app/equipment-profiles` | Commercial/home/PL/minimal gear profiles (default on) |
| Travel Mode | `/app/travel-mode` | Hotel / no gym / limited — temporary; restores after (default on) |
| Injury modification | `/app/injury-modification` | User-declared limitations — not diagnosis (default on) |
| Coaching notes | `/app/coaching-notes` | Coach notes + sourced AI summaries (default on) |
| Messages | `/app/messages` | Athlete–coach threads + attachments/refs (default on) |
| Weekly check-in | `/app/check-in` | Customizable weekly check-in (default on) |
| Premium coaching | `/coaching/premium` | Sales funnel Apply→Offer; never promises acceptance (default on) |
| Referrals | `/app/referral` | Personal code; credits / complimentary access; no pyramid (default on) |
| Affiliates | `/app/affiliate` | Creators/coaches/partners; clicks/conversions/commission; disclosure required (default on) |
| Creator Program | `/app/creator` | Creator partnership application; capabilities after approval only (default on) |
| Program marketplace | `/programs/marketplace` | Training programs; verified-purchaser ratings; copyright review (default on) |
| Content moderation | `/app/moderation` | Report → review → remove/suspend + audit log (default on; staff) |
| Trust Center | `/trust` | How AI works, limits, privacy, scoring, safety, evidence (default on) |
| Explainable AI | (cross-cutting) | “Why am I seeing this?” on AI insights (default on) |
| Confidence System | (cross-cutting) | High / Moderate / Low / Insufficient data (default on) |
| Data Freshness | (cross-cutting) | Technique / Recovery / Strength age; AI stale caps (default on) |
| AI Failure Modes | (cross-cutting) | Graceful AI unavailable; core app stays usable (default on) |
| AI Cost Control | `/app/admin/ai-cost` | Inference routing, cache, cost per feature (default on; admin) |
| AI Model Router | `/app/admin/ai-router` | Multi-provider chains, fallbacks, latency/errors (default on; admin) |
| AI Observability | `/app/admin/ai-observability` | Requests, success, latency, cost, feedback (default on; admin) |
| Internationalization | `/app/admin/i18n` | English catalogs; CS/DE/ES/AR planned; terminology review (default on; admin) |
| Unit system | `/app/admin/unit-system` | Canonical kg/cm/m; kg/lb, cm/ft/in, km/mi presentation (default on; admin) |
| Timezone system | `/app/admin/timezone-system` | Store UTC; local display for workouts/comps/notifications/messages (default on; admin) |
| Accessibility 2.0 | `/app/admin/accessibility` | WCAG audit; scores not color-only; focus traps (default on; admin) |
| Performance 2.0 | `/app/admin/performance` | CWV budgets — homepage, dashboard, exercises, technique (default on; admin) |
| Database scale | `/app/admin/database-scale` | 100k+ audit — indexes, N+1, pagination; no premature shard (default on; admin) |
| Event-driven | `/app/admin/event-driven` | Domain events + queue — technique, workout, PR, weekly review, billing (default on; admin) |
| Observability | `/app/admin/observability` | Production monitoring — errors, latency, DB, jobs, payments, technique (default on; admin) |
| Backup & recovery | `/app/admin/backup-recovery` | Disaster recovery runbook — DB/file backups, restore tests, video retention (default on; admin) |
| Enterprise security | `/app/admin/enterprise-security` | B2B procurement control registry — no unearned compliance certs (default on; admin) |
| GDPR readiness | `/app/admin/gdpr-readiness` | Consent, export, deletion, cookies, retention — legal review markers (default on; admin) |
| Video privacy | `/app/admin/video-privacy` | Per-video privacy opts — private by default; explicit opt-ins (default on; admin) |
| Model improvement consent | `/app/admin/model-improvement-consent` | Unbundled service / expert / research consent (default on; admin) |
| Billing 2.0 | `/app/admin/billing-2` | Trials, coupons, upgrades, grace, invoices, webhook idempotency (default on; admin) |
| Entitlements | `/app/admin/entitlements` | Central EntitlementService — technique, AI Coach, analytics, coach tools, programs (default on; admin) |
| Growth experiments | `/app/admin/growth-experiments` | Safe A/B — homepage CTA, onboarding, pricing; never safety/privacy/medical (default on; admin) |
| Activation metrics | `/app/admin/activation-metrics` | Product activation — onboarding, workout, technique, D7 return; not vanity (default on; admin) |
| Retention analytics | `/app/admin/retention-analytics` | D1/D7/D30, subscription & feature retention; correlation ≠ causation (default on; admin) |
| Conversion funnel | `/app/admin/conversion-funnel` | Homepage → Paid path visualization + ranked drop-offs (default on; admin) |
| User segmentation | `/app/admin/user-segmentation` | Beginner/Advanced/sport/Coach/Paid/High engagement — no sensitive demographics (default on; admin) |
| Personalized homepage | `/app/admin/personalized-homepage` | Traffic-intent soft variants — brand + SEO locked; no cloaking (default on; admin) |
| Programmatic SEO | `/app/admin/programmatic-seo-safety` | Quality-gated guides — refuse thin page factories (default on; admin) |
| Exercise comparison | `/app/admin/exercise-comparison` | Exercise A vs B — dimensions + SEO pairs (default on; admin) |
| Sport goal landings | `/app/admin/sport-goal-landings` | High-quality /goals with product CTAs — no SEO filler (default on; admin) |
| Calculator suite | `/app/admin/calculator-suite` | Training calculators — precision honesty + product CTAs (default on; admin) |
| Technique check funnel | `/app/admin/technique-check` | Free technique check — privacy + rate limits (default on; admin) |
| Program audit funnel | `/app/admin/program-audit` | Free program audit — deterministic checks, no fake score (default on; admin) |
| Athlete assessment funnel | `/app/admin/athlete-assessment` | Self-assessment estimate — Not full Athlete Score (default on; admin) |
| On-site education | `/app/admin/on-site-education` | Learn why on metrics — stay on dashboard (default on; admin) |
| Micro-learning | `/app/admin/micro-learning` | Personalized 1-minute cards — anti-spam (default on; admin) |
| Program review | `/app/program-review` | On |
| Training audit | `/app/training-audit` | Flag `trainingAudit` (default on) |
| Exercise picks | `/app/exercise-prescription` | Flag `exercisePrescription` (default on) |
| Weak points | `/app/weak-points` | Flag `weakPointIntelligence` (default on) |
| PR prediction | `/app/pr-prediction` | Flag `prPrediction` (default on) |
| Goal progress | `/app/goal-progress` | Flag `goalProbability` (default on) |
| Competition | `/app/competition` | Flag `competitionMode` (default on) |
| Attempt selector | `/app/attempt-selector` | Flag `attemptSelector` (default on) |
| Adaptations | `/app/adaptations` | On |
| Exercises | `/app/exercises` | Flag `appExercises` |
| Technique | `/app/technique` | On |
| Technique trends | `/app/technique-trends` | Flag `techniqueTrendEngine` (default on) |
| Compare lifts | `/app/technique/compare` | Flag `videoComparison` (default on) |
| Progress | `/app/progress` | On |
| PRs | `/app/prs` | Flag `prIntelligence` (default on) |
| Leaderboards | `/app/leaderboards` | Flag `leaderboards` (default on) |
| Verified lifts | `/app/verified-lifts` | Flag `verifiedLifts` (default on) |
| Challenges | `/app/challenges` | Flag `challengeEngine` (default on) |
| Achievements | `/app/achievements` | Flag `achievementSystem` (default on) |
| Athlete Level | `/app/athlete-level` | Flag `athleteLevel` (default on) |
| Knowledge Q&A | `/app/community-qa` | Flag `communityQa` (default on) |
| Expert Contributor | `/app/expert-contributor` | Flag `expertContributor` (default on) |
| Technique expert review | `/app/technique-review` | Flag `techniqueExpertReview` (default on) |
| Expert Technique Review (paid) | `/app/human-analysis` | Flag `humanAnalysisProduct` (default on) |
| Performance report PDF | `/app/performance-report` | Flag `performanceReportPdf` (default on) |
| Monthly report | `/app/monthly-report` | Flag `monthlyPerformanceReport` (default on) |
| Training style | `/app/training-style` | Flag `trainingStyleProfiler` (default on) |
| Personalization | `/app/personalization` | Flag `personalizationEngine` (default on) |
| Notifications | `/app/notifications` | Flag `smartNotifications` (default on) |
| Retention | `/app/retention` | Flag `behavioralRetention` (default on) |
| Powerlifting | `/app/powerlifting` | Flag `powerliftingMode` (default on) |
| Bodybuilding | `/app/bodybuilding` | Flag `bodybuildingMode` (default on) |
| Strongman | `/app/strongman` | Flag `strongmanMode` (default on) |
| Weightlifting | `/app/weightlifting` | Flag `weightliftingMode` (default on); advanced video off |
| Multi-Sport | `/app/multi-sport` | Flag `multiSportAthleteMode` (default on) |
| Exercise Graph | `/app/exercise-graph` | Flag `exerciseRelationshipGraph` (default on) |
| Method Graph | `/app/method-graph` | Flag `trainingMethodKnowledgeGraph` (default on) |
| Weekly review | `/app/weekly-review` | On |
| Recovery | `/app/recovery` | On |
| Nutrition | `/app/nutrition` | On |
| Insights | `/app/insights` | On (default; flag `appInsights`) |
| Methods | `/app/methods` | On (default) |
| Organizations | `/app/org` | On (default; flag `gymTeamDashboard`) |
| Coach | `/app/coach` | On (default; flag `appCoach` + attention via `multiAthleteCoachDashboard`) |
| Academy | `/app/academy` | On (default; flag `appAcademy`) |
| Settings | `/app/settings` | On |

`/app` redirects to `/app/dashboard`.

---

## Full route map

### Public

| Pattern | Implemented | Flag | Notes |
| --- | --- | --- | --- |
| `/` | Yes | — | Brand-first home |
| `/features` | Yes | — | Product capabilities |
| `/exercises` | Yes | — | Search + filters (shareable URL) + discovery rails |
| `/exercises/[slug]` | Yes | — | World-class exercise detail (sticky/compact section nav) |
| `/methods` | Yes | — | Methods index (search + category) |
| `/methods/[slug]` | Yes | `methodDetail` (default on) | Full method knowledge page |
| `/app/methods` | Yes | `appMethods` (default on) | In-app methods index |
| `/app/methods/[slug]` | Yes | `appMethods` | In-app method detail |
| `/compare` | Yes | `compare` (default on) | 2–3 method qualitative comparison (shareable `?methods=`) |
| `/history` | Yes | `history` (default on) | Evolution of strength & physique training timeline |
| `/history/archive` | Yes | `historicalTrainingArchive` | Historical Training Archive (systems / coaches / methods) |
| `/history/archive/[slug]` | Yes | `historicalTrainingArchive` | Archive profile with three analytical lenses |
| `/evidence` | Yes | `evidenceQualitySystem` | Evidence Quality System (research vs expert practice) |
| `/research` | Yes | `researchLibrary` | Research Library (curated; no invented citations) |
| `/research/[slug]` | Yes | `researchLibrary` | Research Library entry |
| `/myths` | Yes | `mythVsRealityEngine` | Myth vs Reality index (SEO educational) |
| `/myths/[slug]` | Yes | `mythVsRealityEngine` | Myth page: claim → nuance |
| `/decision-trees` | Yes | `decisionTreeCoaching` | Decision Tree Coaching Tools index |
| `/decision-trees/[slug]` | Yes | `decisionTreeCoaching` | Interactive decision tree (explained rules) |
| `/app/admin/research/summarizer` | Yes | `aiResearchSummarizer` | AI Research Summarizer (verified input → review gate) |
| `/history/[slug]` | Yes | `history` | Single era page (SSG) |
| `/fit` | Yes | `fit` (default on) | Personalized approach fit (shareable query) |
| `/share/pr/[token]` | Yes | `prIntelligence` | Public PR celebration card (noindex) |
| `/share/technique/[token]` | Yes | — | Technique score card + Analyze your lift CTA |
| `/u/[slug]` | Yes | `publicAthleteProfile` | Optional public athlete profile (private by default) |
| `/app/leaderboards` | Yes | `leaderboards` | Opt-in leaderboards (no fake ranks) |
| `/app/verified-lifts` | Yes | `verifiedLifts` | Lift verification + badges (no fake “official”) |
| `/app/challenges` | Yes | `challengeEngine` | Community challenges (safe rewards only) |
| `/app/achievements` | Yes | `achievementSystem` | Meaningful milestones (no vanity grind) |
| `/app/athlete-level` | Yes | `athleteLevel` | Optional multi-factor Athlete Level |
| `/app/community-qa` | Yes | `communityQa` | Community Knowledge Q&A |
| `/app/community-qa/[id]` | Yes | `communityQa` | Question detail + answers |
| `/app/expert-contributor` | Yes | `expertContributor` | Expert profile + articles |
| `/app/technique-review` | Yes | `techniqueExpertReview` | Optional expert review queue (verified experts) |
| `/app/technique-review/[reviewId]` | Yes | `techniqueExpertReview` | Confirm / Correct / Comment |
| `/app/human-analysis` | Yes | `humanAnalysisProduct` | Paid Expert Technique Review catalog + orders |
| `/app/human-analysis/[orderId]` | Yes | `humanAnalysisProduct` | Order status: Purchase → Upload → Queue → Report |
| `/app/human-analysis/expert` | Yes | `humanAnalysisProduct` | Paid expert queue |
| `/app/performance-report` | Yes | `performanceReportPdf` | Premium athlete PDF download |
| `/app/monthly-report` | Yes | `monthlyPerformanceReport` | Automatic monthly report + archive |
| `/app/training-style` | Yes | `trainingStyleProfiler` | Practical training preference profiler |
| `/app/personalization` | Yes | `personalizationEngine` | Central personalization engine (no pricing from sensitive traits) |
| `/app/notifications` | Yes | `smartNotifications` | Smart notifications + channel/frequency prefs |
| `/app/retention` | Yes | `behavioralRetention` | Ethical follow-through loops (planned rest counts) |
| `/app/powerlifting` | Yes | `powerliftingMode` | Powerlifting Mode (SBD / total / competition; DOTS via `/tools/dots`) |
| `/app/bodybuilding` | Yes | `bodybuildingMode` | Bodybuilding Mode (volume / muscles; no fake growth scores) |
| `/app/strongman` | Yes | `strongmanMode` | Strongman Mode (event PRs; no forced PL metrics) |
| `/app/weightlifting` | Yes | `weightliftingMode` | Weightlifting Mode (technique analysis deferred) |
| `/app/multi-sport` | Yes | `multiSportAthleteMode` | Multi-Sport Athlete Mode (one profile; PRs by sport) |
| `/app/exercise-graph` | Yes | `exerciseRelationshipGraph` | Exercise Relationship Graph (curated edges only) |
| `/app/method-graph` | Yes | `trainingMethodKnowledgeGraph` | Training Method Knowledge Graph (interactive) |
| `/share/monthly/[token]` | Yes | `monthlyPerformanceReport` | Public-safe monthly highlight |
| `/experts/[slug]` | Yes | — | Public verified Expert Contributor profile |
| `/experts/[slug]/articles/[articleSlug]` | Yes | — | Expert article + Person SEO author |
| `/app/admin/expert-contributors` | Yes | — | Explicit expert verification (`isAdmin`) |
| `/app/admin/community-qa` | Yes | — | Q&A moderation (`isAdmin`) |
| `/app/admin/verified-lifts` | Yes | — | Staff manual review queue (`isAdmin`) |
| `/app/admin/technique-eval` | Yes | — | Technique model offline benchmarks (`isAdmin`) |
| `/app/admin/ai-cost` | Yes* | `aiCostControl` | AI cost control dashboard (*admin only) |
| `/app/admin/ai-router` | Yes* | `aiModelRouter` | Multi-model AI router (*admin only) |
| `/app/admin/ai-observability` | Yes* | `aiObservability` | AI observability (*admin only; no raw inputs) |
| `/search` | Yes | — | Global search (mobile/full page; noindex) |
| `/learn` | Yes | — | SEO topic cluster hub |
| `/learn/[slug]` | Yes | — | Topic pillar (meaningful content only) |
| `/guides` | Yes | `programmaticSeoSafety` | Quality-gated programmatic guide hub |
| `/guides/[slug]` | Yes | `programmaticSeoSafety` | Allowlisted guide (fail quality → 404) |
| `/coaching` | Yes | `coachMarketplace` | Browse + sport filter (default on) |
| `/coaching/[slug]` | Yes | `coachMarketplace` | Coach profile + consultation request |
| `/coaching/match` | Yes | `coachMatching` | Coach matching engine (organic + labeled sponsored) |
| `/app/coach/marketplace` | Yes | `coachMarketplace` | Coach listing controls + inquiry inbox |
| `/academy` | Yes | — | Academy landing + catalog (+ paths when `academy20`) |
| `/academy/[slug]` | Yes | — | Course detail (prereqs / assignments when `academy20`) |
| `/verify/certificate` | Yes | `certificateVerification` | Public certificate verify form |
| `/verify/certificate/[code]` | Yes | `certificateVerification` | Public certificate verify result |
| `/pricing` | Yes | `billingCheckout` for live checkout only | Catalog tiers, monthly/annual, features, limits, cancellation |

### Authenticated (`/app`)

| Pattern | Implemented | Flag | Notes |
| --- | --- | --- | --- |
| `/app` | Yes | — | Redirect → dashboard |
| `/app/dashboard` | Yes | — / `commandCenter` | Performance dashboard / Command Center (honest scores / empty states) |
| `/app/profile` | Yes | `publicAthleteProfile` for public section | Persistent athlete profile + optional public visibility |
| `/app/today` | Yes | — | Daily coaching brief (max 3 insights) + today’s workout + start CTA |
| `/app/training` | Yes | — | Resumes in-progress workout; recent sessions |
| `/app/training/[sessionId]` | Yes | — | Live workout player (log sets, rest timer) |
| `/app/programs` | Yes | — | Assigned programs + adaptive suggestions |
| `/app/program-builder` | Yes | `programBuilder` | Program Builder 2.0 (structured volume; editable draft) |
| `/app/programs/[id]/versions` | Yes | `programVersionControl` | Program Version Control (v1/v2/v3; restore; history protected) |
| `/app/experiments` | Yes | `experimentMode` | Experiment Mode (personal training experiments) |
| `/app/experiments/[id]` | Yes | `experimentMode` | Experiment detail + before/after |
| `/app/programming-insights` | Yes | `abProgrammingInsights` | A/B Programming Insights (anonymized; sample-gated) |
| `/app/bodyweight-performance` | Yes | `bodyweightPerformance` | Bodyweight / strength / relative-strength trends |
| `/app/recovery-correlation` | Yes | `recoveryCorrelation` | Recovery ↔ performance associations (sample-gated; not causal) |
| `/app/training-consistency` | Yes | `trainingConsistencyIntelligence` | Plan adherence (not gym days; context-aware) |
| `/app/deload-intelligence` | Yes | `deloadIntelligence` | Consider deload (multi-signal; never auto-applied) |
| `/app/fatigue-alerts` | Yes | `fatigueAlertSystem` | Fatigue Alert System (Normal → High concern; non-medical) |
| `/app/pain-safe-response` | Yes | `painSafeResponseSystem` | Pain-safe: stop aggressive recs; seek medical evaluation; never diagnose |
| `/app/exercise-substitutions` | Yes | `exerciseSubstitutions` | Smart exercise substitutions (goal/pattern/fatigue/skill + tradeoffs) |
| `/app/equipment-profiles` | Yes | `equipmentAwareProgramming` | Equipment profiles — generation/suggestions respect gear |
| `/app/travel-mode` | Yes | `travelTrainingMode` | Travel Mode — temporary adaptation; restore on end |
| `/app/injury-modification` | Yes | `injuryModification` | User-declared limitations (not diagnosis); alts / ROM / load |
| `/app/coaching-notes` | Yes | `coachingNotesIntelligence` | Coach notes + AI summaries; private notes excluded from unrelated use |
| `/app/messages` | Yes | `messagingSystem` | Athlete–coach messaging (threads, attachments, refs, moderation) |
| `/app/check-in` | Yes | `checkInSystem` | Customizable weekly check-in (training/recovery/bodyweight/goals) |
| `/app/check-in/configure` | Yes | `checkInSystem` | Coach configures allowlisted check-in questions |
| `/coaching/premium` | Public | `premiumCoachingSales` | Premium coaching sales landing |
| `/coaching/premium/apply` | Public* | `premiumCoachingSales` | Application form (*sign-in to submit) |
| `/app/premium-coaching` | Yes | `premiumCoachingSales` | Athlete application status |
| `/app/premium-coaching/review` | Yes | `premiumCoachingSales` | Staff/coach stage advances |
| `/app/referral` | Yes | `referralProgram` | Personal referral code + single-level rewards |
| `/app/affiliate` | Yes | `affiliateSystem` | Creator/coach/partner affiliate hub |
| `/app/affiliate/review` | Yes | `affiliateSystem` | Staff activate affiliate partners |
| `/affiliates` | Public | `affiliateSystem` | Directory — disclosure required |
| `/a/[code]` | Public | `affiliateSystem` | Click landing with mandatory disclosure |
| `/app/creator` | Yes | `creatorProgram` | Creator partnership application (no partnership until approved) |
| `/app/creator/review` | Yes | `creatorProgram` | Staff approve/reject/suspend creators |
| `/programs/marketplace` | Public | `programMarketplace` | Program marketplace browse |
| `/programs/marketplace/[listingId]` | Public* | `programMarketplace` | Program preview (*purchase/rate when signed in) |
| `/app/program-marketplace` | Yes | `programMarketplace` | Creator publish hub |
| `/app/program-marketplace/review` | Yes | `programMarketplace` | Staff copyright review |
| `/app/moderation` | Yes* | `contentModeration` | Staff moderation queue (*admin only) |
| `/trust` | Public | `trustCenter` | Trust Center — AI, privacy, scoring, safety, evidence |
| `/app/program-review` | Yes | — | AI program analysis (contextual strengths/issues) |
| `/app/training-audit` | Yes | `trainingAudit` | Upload → analyze → understand → improve |
| `/app/exercise-prescription` | Yes | `exercisePrescription` | Multi-rule exercise recommendations |
| `/app/weak-points` | Yes | `weakPointIntelligence` | Evidence-backed weak-point intelligence |
| `/app/pr-prediction` | Yes | `prPrediction` | Conservative estimated 1RM ranges |
| `/app/goal-progress` | Yes | `goalProbability` | Qualitative goal trajectory (no fake %) |
| `/app/competition` | Yes | `competitionMode` | Competition Mode (no auto weight-cut) |
| `/app/attempt-selector` | Yes | `attemptSelector` | Opener / second / conditional third |
| `/app/adaptations` | Yes | — | Accept / Modify / Decline (auditable) |
| `/app/programs/[id]` | Yes | `programDetail` | Detail template |
| `/app/exercises` | Yes | `appExercises` | In-app library |
| `/app/technique` | Yes | — | Upload hub + list |
| `/app/technique-trends` | Yes | `techniqueTrendEngine` | Longitudinal technique analytics |
| `/app/technique/compare` | Yes | `videoComparison` | Side-by-side old vs new lift video |
| `/app/technique/[analysisId]` | Yes | — | Private media, movement report, deletion |
| `/app/technique/[analysisId]/diagnostics` | Yes | — | Developer pose/pipeline diagnostics |
| `/app/progress` | Yes | — | Progress analytics (ranges + exercise filter + charts) |
| `/app/prs` | Yes | `prIntelligence` | Typed PR timeline + shareable performance cards |
| `/app/weekly-review` | Yes | — | Weekly athlete review (this vs previous + history) |
| `/app/recovery` | Yes | — | Recovery check-in + Readiness estimate + trends |
| `/app/nutrition` | Yes | `mealnexioSync` for live sync only | Status + targets shell + Mealnexio CTA; sync flagged off |
| `/app/insights` | Yes | `appInsights` (default on) | Cross-domain insights (evidence, confidence, action) |
| `/app/methods` | Yes | `appMethods` | Methods workspace |
| `/app/org` | Yes | `gymTeamDashboard` | Gym / team organizations list + create |
| `/app/org/[orgId]` | Yes | `gymTeamDashboard` | Org dashboard (aggregates; no private data bypass) |
| `/app/org/[orgId]/billing` | Yes | `orgBilling` | B2B seats, usage, upgrade (prices via env) |
| `/app/coach` | Yes | `appCoach` (default on) | Multi-athlete coach dashboard (attention queue when `multiAthleteCoachDashboard`) |
| `/app/coach/[athleteProfileId]` | Yes | `appCoach` | Coach athlete workspace (scoped sections) |
| `/app/coach/[athleteProfileId]` (+ AI Copilot) | Yes | `coachAiCopilot` | Coach AI drafts; Accept / Edit / Reject |
| `/app/academy` | Yes | `appAcademy` (default on); paths via `academy20` | Student dashboard |
| `/app/academy/[slug]` | Yes | `appAcademy` | Course learning |
| `/app/admin/academy` | Yes | staff; `academy20` snapshot | Academy CMS + 2.0 paths |
| `/app/admin/certificate-verification` | Yes | staff; `certificateVerification` | Certificate verify honesty |
| `/app/admin/enterprise-security` | Yes | staff; `enterpriseSecurity` | B2B security prep registry |
| `/app/admin/gdpr-readiness` | Yes | staff; `gdprReadiness` | GDPR workflows + legal review |
| `/app/admin/video-privacy` | Yes | staff; `videoPrivacyControls` | Video privacy control registry |
| `/app/admin/model-improvement-consent` | Yes | staff; `modelImprovementConsent` | Unbundled consent kinds |
| `/app/admin/safety-system` | Yes | staff; `safetySystem20` | Central recommendation safety gates |
| `/app/admin/red-team-ai-coach` | Yes | staff; `redTeamAiCoach` | Adversarial Coach chat QA |
| `/app/admin/product-trust-audit` | Yes | staff; `productTrustAudit` | AI provenance / confidence / challenge audit |
| `/app/admin/mobile-workout` | Yes | staff; `mobileWorkoutExperience` | Mobile-first live workout principles |
| `/app/admin/pwa-readiness` | Yes | staff; `pwaReadiness` | PWA install / offline shell / secure cache |
| `/app/admin/wearable-integration` | Yes | staff; `wearableIntegration` | Wearable adapter registry (no fake sync) |
| `/app/admin/device-data-normalization` | Yes | staff; `deviceDataNormalization` | Device metric canonicalization + caveats |
| `/app/admin/mealnexio-deep-linking` | Yes | staff; `mealnexioDeepLinking` | Mealnexio deep links + return + SSO stub |
| `/app/admin/command-center` | Yes | staff; `commandCenter` | Command Center section / fold / adaptive layout |
| `/app/admin/custom-dashboards` | Yes | staff; `customDashboards` | Focus presets + smart defaults + save layout |
| `/app/admin/command-palette` | Yes | staff; `commandPalette` | Power-user command palette (⌘⇧P) |
| `/app/admin/universal-timeline` | Yes | staff; `universalTimeline` | Universal timeline event kinds |
| `/app/admin/performance-story` | Yes | staff; `performanceStory` | Performance Story narrative rules |
| `/app/admin/year-in-review` | Yes | staff; `yearInReview` | Year in Review card kinds |
| `/app/admin/social-graph` | Yes | staff; `socialGraphPrep` | Social graph prep — follows / privacy / feed gate |
| `/app/admin/activity-feed` | Yes | staff; `activityFeedMvp` | Activity Feed MVP kinds + anti-dark-pattern rules |
| `/app/admin/live-competition` | Yes | staff; `liveCompetitionMode` | Live Competition Mode meet-day architecture |
| `/app/admin/warmup-generator` | Yes | staff; `warmupGenerator` | Warm-up generator ladders + fatigue caps |
| `/app/admin/session-readiness` | Yes | staff; `sessionReadinessAdjuster` | Session readiness proceed / adjust / review rules |
| `/app/admin/live-session-autoregulation` | Yes | staff; `liveSessionAutoregulation` | Live RPE vs planned suggestion rules |
| `/app/performance-story` | Yes | athlete; `performanceStory` | Yearly performance narrative |
| `/app/year-in-review` | Yes | athlete; `yearInReview` | Annual Iron Almanac cards |
| `/app/activity-feed` | Yes | athlete; `activityFeedMvp` | Optional finite milestones + visibility controls |
| `/app/competition/live` | Yes | athlete; `liveCompetitionMode` | Live meet day (Coming Soon until runtime) |
| `/app/warmup` | Yes | athlete; `warmupGenerator` | Progressive warm-up planner |
| `/app/session-readiness` | Yes | athlete; `sessionReadinessAdjuster` | Pre-workout readiness adjuster |
| `/share/story/[token]` | Yes | public; `performanceStory` | Shared yearly review (public-safe) |
| `/share/year/[token]` | Yes | public; `yearInReview` | Shared Year in Review cards |
| `/app/nutrition/mealnexio-return` | Yes | athlete; `mealnexioDeepLinking` | Mealnexio return landing (no invented summary) |
| `/offline` | Yes | public | Offline shell (SW fallback) |
| `/app/settings/consent` | Yes | `modelImprovementConsent` | Athlete consent preferences |
| `/app/settings` | Yes | — | Account + Coach Mode grant/revoke |
| `/app/admin` | Yes | — | Staff CMS (`isAdmin` only; not in athlete nav) |
| `/app/admin/*` | Yes | — | Exercises, methods, articles, programs, academy, flags, technique eval, audit |

**Intentionally not created:** hundreds of static empty exercise/method pages. Dynamic `[slug]` / `[id]` / `[analysisId]` templates reserve structure without content spam.

---

## Feature flags

Configured via `.env.example` / environment:

| Env var | Flag key | Gates |
| --- | --- | --- |
| `NEXT_PUBLIC_FF_COMPARE` | `compare` | `/compare` |
| `NEXT_PUBLIC_FF_HISTORY` | `history` | `/history` + `/history/[slug]` + nav |
| `NEXT_PUBLIC_FF_HISTORICAL_TRAINING_ARCHIVE` | `historicalTrainingArchive` | Historical Training Archive (default on; see `docs/HISTORICAL_TRAINING_ARCHIVE.md`) |
| `NEXT_PUBLIC_FF_EVIDENCE_QUALITY_SYSTEM` | `evidenceQualitySystem` | Evidence Quality System (default on; see `docs/EVIDENCE_QUALITY_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_RESEARCH_LIBRARY` | `researchLibrary` | Research Library (default on; see `docs/RESEARCH_LIBRARY.md`) |
| `NEXT_PUBLIC_FF_AI_RESEARCH_SUMMARIZER` | `aiResearchSummarizer` | AI Research Summarizer (default on; see `docs/AI_RESEARCH_SUMMARIZER.md`) |
| `NEXT_PUBLIC_FF_MYTH_VS_REALITY` | `mythVsRealityEngine` | Myth vs Reality Engine (default on; see `docs/MYTH_VS_REALITY.md`) |
| `NEXT_PUBLIC_FF_DECISION_TREE_COACHING` | `decisionTreeCoaching` | Decision Tree Coaching Tools (default on; see `docs/DECISION_TREE_COACHING.md`) |
| `NEXT_PUBLIC_FF_PROGRAM_BUILDER` | `programBuilder` | Program Builder 2.0 (default on; see `docs/PROGRAM_BUILDER_2.md`) |
| `NEXT_PUBLIC_FF_PROGRAM_VERSION_CONTROL` | `programVersionControl` | Program Version Control (default on; see `docs/PROGRAM_VERSION_CONTROL.md`) |
| `NEXT_PUBLIC_FF_EXPERIMENT_MODE` | `experimentMode` | Experiment Mode (default on; see `docs/EXPERIMENT_MODE.md`) |
| `NEXT_PUBLIC_FF_AB_PROGRAMMING_INSIGHTS` | `abProgrammingInsights` | A/B Programming Insights (default on; see `docs/AB_PROGRAMMING_INSIGHTS.md`) |
| `NEXT_PUBLIC_FF_BODYWEIGHT_PERFORMANCE` | `bodyweightPerformance` | Bodyweight / Performance Relationship (default on; see `docs/BODYWEIGHT_PERFORMANCE.md`) |
| `NEXT_PUBLIC_FF_RECOVERY_CORRELATION` | `recoveryCorrelation` | Recovery Correlation Insights (default on; see `docs/RECOVERY_CORRELATION.md`) |
| `NEXT_PUBLIC_FF_TRAINING_CONSISTENCY_INTELLIGENCE` | `trainingConsistencyIntelligence` | Training Consistency Intelligence (default on; see `docs/TRAINING_CONSISTENCY_INTELLIGENCE.md`) |
| `NEXT_PUBLIC_FF_DELOAD_INTELLIGENCE` | `deloadIntelligence` | Deload Intelligence (default on; see `docs/DELOAD_INTELLIGENCE.md`) |
| `NEXT_PUBLIC_FF_FATIGUE_ALERT_SYSTEM` | `fatigueAlertSystem` | Fatigue Alert System (default on; see `docs/FATIGUE_ALERT_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_PAIN_SAFE_RESPONSE_SYSTEM` | `painSafeResponseSystem` | Pain-Safe Response System (default on; see `docs/PAIN_SAFE_RESPONSE_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_EXERCISE_SUBSTITUTIONS` | `exerciseSubstitutions` | Smart Exercise Substitutions (default on; see `docs/EXERCISE_SUBSTITUTIONS.md`) |
| `NEXT_PUBLIC_FF_EQUIPMENT_AWARE_PROGRAMMING` | `equipmentAwareProgramming` | Equipment-Aware Programming (default on; see `docs/EQUIPMENT_AWARE_PROGRAMMING.md`) |
| `NEXT_PUBLIC_FF_TRAVEL_TRAINING_MODE` | `travelTrainingMode` | Travel Training Mode (default on; see `docs/TRAVEL_TRAINING_MODE.md`) |
| `NEXT_PUBLIC_FF_INJURY_MODIFICATION` | `injuryModification` | Injury-Modification Architecture (default on; see `docs/INJURY_MODIFICATION_ARCHITECTURE.md`) |
| `NEXT_PUBLIC_FF_COACHING_NOTES_INTELLIGENCE` | `coachingNotesIntelligence` | Coaching Notes Intelligence (default on; see `docs/COACHING_NOTES_INTELLIGENCE.md`) |
| `NEXT_PUBLIC_FF_MESSAGING_SYSTEM` | `messagingSystem` | Messaging System (default on; see `docs/MESSAGING_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_CHECK_IN_SYSTEM` | `checkInSystem` | Check-in System (default on; see `docs/CHECK_IN_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_PREMIUM_COACHING_SALES` | `premiumCoachingSales` | Premium Coaching Sales Flow (default on; see `docs/PREMIUM_COACHING_SALES.md`) |
| `NEXT_PUBLIC_FF_REFERRAL_PROGRAM` | `referralProgram` | Referral Program (default on; see `docs/REFERRAL_PROGRAM.md`) |
| `NEXT_PUBLIC_FF_AFFILIATE_SYSTEM` | `affiliateSystem` | Affiliate System (default on; see `docs/AFFILIATE_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_CREATOR_PROGRAM` | `creatorProgram` | Creator Program (default on; see `docs/CREATOR_PROGRAM.md`) |
| `NEXT_PUBLIC_FF_PROGRAM_MARKETPLACE` | `programMarketplace` | Program Marketplace (default on; see `docs/PROGRAM_MARKETPLACE.md`) |
| `NEXT_PUBLIC_FF_CONTENT_MODERATION` | `contentModeration` | Content Moderation (default on; see `docs/CONTENT_MODERATION.md`) |
| `NEXT_PUBLIC_FF_TRUST_CENTER` | `trustCenter` | Trust Center (default on; see `docs/TRUST_CENTER.md`) |
| `NEXT_PUBLIC_FF_EXPLAINABLE_AI_UI` | `explainableAiUi` | Explainable AI UI (default on; see `docs/EXPLAINABLE_AI_UI.md`) |
| `NEXT_PUBLIC_FF_CONFIDENCE_SYSTEM` | `confidenceSystem` | Confidence System (default on; see `docs/CONFIDENCE_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_DATA_FRESHNESS_SYSTEM` | `dataFreshnessSystem` | Data Freshness System (default on; see `docs/DATA_FRESHNESS_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_AI_FAILURE_MODES` | `aiFailureModes` | AI Failure Modes (default on; see `docs/AI_FAILURE_MODES.md`) |
| `NEXT_PUBLIC_FF_AI_COST_CONTROL` | `aiCostControl` | AI Cost Control (default on; see `docs/AI_COST_CONTROL.md`) |
| `NEXT_PUBLIC_FF_AI_MODEL_ROUTER` | `aiModelRouter` | Multi-Model AI Router (default on; see `docs/AI_MODEL_ROUTER.md`) |
| `NEXT_PUBLIC_FF_AI_OBSERVABILITY` | `aiObservability` | AI Observability (default on; see `docs/AI_OBSERVABILITY.md`) |
| `NEXT_PUBLIC_FF_I18N` | `i18n` | Internationalization architecture (default on; see `docs/I18N.md`) |
| `NEXT_PUBLIC_FF_UNIT_SYSTEM` | `unitSystem` | Global unit system (default on; see `docs/UNIT_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_TIMEZONE_SYSTEM` | `timezoneSystem` | Timezone system — store UTC, display local (default on; see `docs/TIMEZONE_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_ACCESSIBILITY_SYSTEM` | `accessibilitySystem` | Accessibility 2.0 WCAG audit (default on; see `docs/ACCESSIBILITY_2.md`) |
| `NEXT_PUBLIC_FF_PERFORMANCE_SYSTEM` | `performanceSystem` | Performance 2.0 CWV budgets (default on; see `docs/PERFORMANCE_2.md`) |
| `NEXT_PUBLIC_FF_DATABASE_SCALE` | `databaseScale` | Database Scale Audit (default on; see `docs/DATABASE_SCALE_AUDIT.md`) |
| `NEXT_PUBLIC_FF_EVENT_DRIVEN_ARCHITECTURE` | `eventDrivenArchitecture` | Event-Driven Architecture (default on; see `docs/EVENT_DRIVEN_ARCHITECTURE.md`) |
| `NEXT_PUBLIC_FF_PRODUCTION_OBSERVABILITY` | `productionObservability` | Production Observability (default on; see `docs/OBSERVABILITY.md`) |
| `NEXT_PUBLIC_FF_BACKUP_RECOVERY` | `backupRecovery` | Backup & Disaster Recovery (default on; see `docs/DISASTER_RECOVERY.md`) |
| `NEXT_PUBLIC_FF_BILLING_2` | `billing2` | Billing 2.0 — trials/coupons/grace/invoices/webhook idempotency (default on; see `docs/BILLING_2.md`) |
| `NEXT_PUBLIC_FF_ENTITLEMENT_SYSTEM` | `entitlementSystem` | Entitlement System / EntitlementService (default on; see `docs/ENTITLEMENT_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_GROWTH_EXPERIMENTS` | `growthExperiments` | Growth Experiment Framework — homepage CTA / onboarding / pricing only (default on; see `docs/GROWTH_EXPERIMENT_FRAMEWORK.md`) |
| `NEXT_PUBLIC_FF_ACTIVATION_METRICS` | `activationMetrics` | Activation Metrics — onboarding + workout + technique + D7 return (default on; see `docs/ACTIVATION_METRICS.md`) |
| `NEXT_PUBLIC_FF_RETENTION_ANALYTICS` | `retentionAnalytics` | Retention Analytics — D1/D7/D30 + subscription/feature; correlation ≠ causation (default on; see `docs/RETENTION_ANALYTICS.md`) |
| `NEXT_PUBLIC_FF_CONVERSION_FUNNEL` | `conversionFunnel` | Conversion Funnel — Homepage → Paid + drop-offs (default on; see `docs/CONVERSION_FUNNEL.md`) |
| `NEXT_PUBLIC_FF_USER_SEGMENTATION` | `userSegmentation` | User Segmentation — behavior/product context; no sensitive demographics (default on; see `docs/USER_SEGMENTATION.md`) |
| `NEXT_PUBLIC_FF_PERSONALIZED_HOMEPAGE` | `personalizedHomepage` | Personalized Homepage — traffic intent soft variants; no SEO cloaking (default on; see `docs/PERSONALIZED_HOMEPAGE.md`) |
| `NEXT_PUBLIC_FF_PROGRAMMATIC_SEO_SAFETY` | `programmaticSeoSafety` | Programmatic SEO Safety — quality-gated `/guides`; refuse thin factories (default on; see `docs/PROGRAMMATIC_SEO_SAFETY.md`) |
| `NEXT_PUBLIC_FF_EXERCISE_COMPARISON` | `exerciseComparison` | Exercise Comparison Engine — A vs B + SEO pairs (default on; see `docs/EXERCISE_COMPARISON.md`) |
| `NEXT_PUBLIC_FF_SPORT_GOAL_LANDINGS` | `sportGoalLandings` | Sport Goal Landing Pages — /goals with product CTAs; no filler (default on; see `docs/SPORT_GOAL_LANDINGS.md`) |
| `NEXT_PUBLIC_FF_CALCULATOR_SUITE` | `calculatorSuite` | Calculator Suite — /tools with precision honesty + product CTAs (default on; see `docs/CALCULATOR_SUITE.md`) |
| `NEXT_PUBLIC_FF_TECHNIQUE_CHECK` | `techniqueCheck` | Free Technique Check Funnel — limited insight before signup (default on; see `docs/TECHNIQUE_CHECK.md`) |
| `NEXT_PUBLIC_FF_PROGRAM_AUDIT` | `programAudit` | Free Program Audit Funnel — deterministic checks; no fake score (default on; see `docs/PROGRAM_AUDIT.md`) |
| `NEXT_PUBLIC_FF_ATHLETE_ASSESSMENT` | `athleteAssessment` | Free Athlete Assessment — Self-assessment estimate; Not full Athlete Score (default on; see `docs/ATHLETE_ASSESSMENT.md`) |
| `NEXT_PUBLIC_FF_ON_SITE_EDUCATION` | `onSiteEducation` | On-Site Education — Learn why on metrics (default on; see `docs/ON_SITE_EDUCATION.md`) |
| `NEXT_PUBLIC_FF_MICRO_LEARNING` | `microLearning` | Micro-Learning — personalized 1-minute cards; anti-spam (default on; see `docs/MICRO_LEARNING.md`) |
| `NEXT_PUBLIC_FF_ACADEMY_20` | `academy20` | Academy 2.0 — paths, prerequisites, assignments, knowledge progress (default on; see `docs/ACADEMY.md`) |
| `NEXT_PUBLIC_FF_CERTIFICATE_VERIFICATION` | `certificateVerification` | Public Certificate of Completion verify — unique ID, name, course, date, status; never accredited by default (default on; see `docs/CERTIFICATE_VERIFICATION.md`) |
| `NEXT_PUBLIC_FF_ENTERPRISE_SECURITY` | `enterpriseSecurity` | Enterprise Security Prep — B2B control registry; no unearned compliance certs (default on; see `docs/ENTERPRISE_SECURITY.md`) |
| `NEXT_PUBLIC_FF_GDPR_READINESS` | `gdprReadiness` | GDPR Readiness — consent, export, deletion, cookies, retention; legal pages for counsel review (default on; see `docs/GDPR_READINESS.md`) |
| `NEXT_PUBLIC_FF_VIDEO_PRIVACY_CONTROLS` | `videoPrivacyControls` | Video Privacy Controls — private by default; explicit opt-ins (default on; see `docs/VIDEO_PRIVACY_CONTROLS.md`) |
| `NEXT_PUBLIC_FF_MODEL_IMPROVEMENT_CONSENT` | `modelImprovementConsent` | Unbundled consent UI — service / expert / research; revoke (default on; see `docs/MODEL_IMPROVEMENT_CONSENT.md`) |
| `NEXT_PUBLIC_FF_SAFETY_SYSTEM_20` | `safetySystem20` | Safety System 2.0 — central recommendation validator; block/modify unsafe advice (default on; see `docs/SAFETY_SYSTEM.md`) |
| `NEXT_PUBLIC_FF_RED_TEAM_AI_COACH` | `redTeamAiCoach` | Red Team AI Coach — adversarial chat QA; refuse unsafe maxes / diagnosis / guarantees (default on; see `docs/RED_TEAM_AI_COACH.md`) |
| `NEXT_PUBLIC_FF_PRODUCT_TRUST_AUDIT` | `productTrustAudit` | Product Trust Audit — provenance, confidence, certainty, challenge on AI surfaces (default on; see `docs/PRODUCT_TRUST_AUDIT.md`) |
| `NEXT_PUBLIC_FF_MOBILE_WORKOUT_EXPERIENCE` | `mobileWorkoutExperience` | Mobile-first live workout — one-hand focus, steppers, auto-save, rest timer (default on; see `docs/MOBILE_WORKOUT.md`) |
| `NEXT_PUBLIC_FF_PWA_READINESS` | `pwaReadiness` | PWA — installable, offline shell, cached workout, sync; no sensitive SW cache (default on; see `docs/PWA_READINESS.md`) |
| `NEXT_PUBLIC_FF_WEARABLE_INTEGRATION` | `wearableIntegration` | Wearable adapter registry — Apple Health / Health Connect / Garmin / Whoop / Oura; no fake connections (default on; see `docs/WEARABLE_INTEGRATION.md`) |
| `NEXT_PUBLIC_FF_WEARABLE_APPLE_HEALTH` | `wearableAppleHealth` | Live Apple Health bridge (default **off**) |
| `NEXT_PUBLIC_FF_WEARABLE_GOOGLE_HEALTH_CONNECT` | `wearableGoogleHealthConnect` | Live Health Connect (default **off**) |
| `NEXT_PUBLIC_FF_WEARABLE_GARMIN` | `wearableGarmin` | Live Garmin API (default **off**) |
| `NEXT_PUBLIC_FF_WEARABLE_WHOOP` | `wearableWhoop` | Live Whoop API (default **off**) |
| `NEXT_PUBLIC_FF_WEARABLE_OURA` | `wearableOura` | Live Oura API (default **off**) |
| `NEXT_PUBLIC_FF_DEVICE_DATA_NORMALIZATION` | `deviceDataNormalization` | Device data normalization — sleep/HR/HRV/steps/workouts; cross-device caveats (default on; see `docs/DEVICE_DATA_NORMALIZATION.md`) |
| `NEXT_PUBLIC_FF_MEALNEXIO_DEEP_LINKING` | `mealnexioDeepLinking` | Mealnexio deep linking — outbound CTAs, return landing, SSO stub (default on; see `docs/MEALNEXIO_DEEP_LINKING.md`) |
| `NEXT_PUBLIC_FF_COMMAND_CENTER` | `commandCenter` | Performance OS Command Center — ultimate dashboard; TODAY above fold; customizable widgets (default on; see `docs/COMMAND_CENTER.md`) |
| `NEXT_PUBLIC_FF_CUSTOM_DASHBOARDS` | `customDashboards` | Custom dashboards — Strength/Technique/Recovery/Nutrition/Competition/Bodybuilding presets + save layout (default on; see `docs/CUSTOM_DASHBOARDS.md`) |
| `NEXT_PUBLIC_FF_COMMAND_PALETTE` | `commandPalette` | Command palette — power-user Ctrl/Cmd+Shift+P (default on; see `docs/COMMAND_PALETTE.md`) |
| `NEXT_PUBLIC_FF_UNIVERSAL_TIMELINE` | `universalTimeline` | Universal timeline — athlete history + filters (default on; see `docs/UNIVERSAL_TIMELINE.md`) |
| `NEXT_PUBLIC_FF_PERFORMANCE_STORY` | `performanceStory` | Performance Story — yearly narrative + shareable review; no fake causation (default on; see `docs/PERFORMANCE_STORY.md`) |
| `NEXT_PUBLIC_FF_YEAR_IN_REVIEW` | `yearInReview` | Year in Review — annual almanac cards + share (default on; see `docs/YEAR_IN_REVIEW.md`) |
| `NEXT_PUBLIC_FF_SOCIAL_GRAPH_PREP` | `socialGraphPrep` | Social graph prep — follow athletes/coaches, private accounts, feed contracts (default on; see `docs/SOCIAL_GRAPH.md`) |
| `NEXT_PUBLIC_FF_SOCIAL_ACTIVITY_FEED` | `socialActivityFeed` | Live social activity feed (default **off** until moderation ready; see `docs/SOCIAL_GRAPH.md`) |
| `NEXT_PUBLIC_FF_ACTIVITY_FEED_MVP` | `activityFeedMvp` | Activity Feed MVP — optional PRs/competition/achievements/shared technique; visibility controls; no endless engagement (default on; see `docs/ACTIVITY_FEED.md`) |
| `NEXT_PUBLIC_FF_LIVE_COMPETITION_MODE` | `liveCompetitionMode` | Live Competition Mode architecture — meet-day attempts/results/warm-up/offline contracts (default on; see `docs/LIVE_COMPETITION_MODE.md`) |
| `NEXT_PUBLIC_FF_LIVE_COMPETITION_RUNTIME` | `liveCompetitionRuntime` | Meet-day runtime persistence (default **off**; see `docs/LIVE_COMPETITION_MODE.md`) |
| `NEXT_PUBLIC_FF_WARMUP_GENERATOR` | `warmupGenerator` | Warm-up generator — progressive sets from target/exercise/history; editable; fatigue-aware (default on; see `docs/WARMUP_GENERATOR.md`) |
| `NEXT_PUBLIC_FF_SESSION_READINESS_ADJUSTER` | `sessionReadinessAdjuster` | Session readiness adjuster — pre-workout check-in; proceed / minor adjustment / review load; never cancel from one metric (default on; see `docs/SESSION_READINESS_ADJUSTER.md`) |
| `NEXT_PUBLIC_FF_LIVE_SESSION_AUTOREGULATION` | `liveSessionAutoregulation` | Live session autoregulation — actual vs planned RPE; suggest reduce next set; confirm required (default on; see `docs/LIVE_SESSION_AUTOREGULATION.md`) |
| `NEXT_PUBLIC_FF_FIT` | `fit` | `/fit` + nav |
| `NEXT_PUBLIC_FF_EXERCISE_DETAIL` | `exerciseDetail` | `/exercises/[slug]` |
| `NEXT_PUBLIC_FF_METHOD_DETAIL` | `methodDetail` | `/methods/[slug]` |
| `NEXT_PUBLIC_FF_APP_EXERCISES` | `appExercises` | `/app/exercises` + nav |
| `NEXT_PUBLIC_FF_APP_METHODS` | `appMethods` | `/app/methods` + nav |
| `NEXT_PUBLIC_FF_APP_COACH` | `appCoach` | `/app/coach` + nav (default on) |
| `NEXT_PUBLIC_FF_APP_ACADEMY` | `appAcademy` | `/app/academy` + nav (default on) |
| `NEXT_PUBLIC_FF_PROGRAM_DETAIL` | `programDetail` | `/app/programs/[id]` |
| `NEXT_PUBLIC_FF_APP_INSIGHTS` | `appInsights` | `/app/insights` + nav + dashboard teaser |
| `NEXT_PUBLIC_FF_BILLING_CHECKOUT` | `billingCheckout` | Live Stripe checkout on `/pricing` |
| `NEXT_PUBLIC_FF_MEALNEXIO_SYNC` | `mealnexioSync` | Live Mealnexio sync path on `/app/nutrition` |
| `NEXT_PUBLIC_FF_COACH_MARKETPLACE` | `coachMarketplace` | `/coaching` MVP (default on; never invents coaches) |
| `NEXT_PUBLIC_FF_COACH_MATCHING` | `coachMatching` | `/coaching/match` (default on) |
| `NEXT_PUBLIC_FF_COACH_AI_COPILOT` | `coachAiCopilot` | Coach athlete AI Copilot panel (default on) |
| `NEXT_PUBLIC_FF_MULTI_ATHLETE_COACH_DASHBOARD` | `multiAthleteCoachDashboard` | `/app/coach` attention queue (default on) |
| `NEXT_PUBLIC_FF_GYM_TEAM_DASHBOARD` | `gymTeamDashboard` | `/app/org` gym/team org dashboard (default on) |
| `NEXT_PUBLIC_FF_ORG_BILLING` | `orgBilling` | `/app/org/[orgId]/billing` B2B seats/upgrade (default on) |
| `NEXT_PUBLIC_FF_WHITE_LABEL` | `whiteLabel` | White-label branding resolver (default **off**; see `docs/WHITE_LABEL_ARCHITECTURE.md`) |
| `NEXT_PUBLIC_FF_API_PLATFORM` | `apiPlatform` | API platform helpers (default **off**; see `docs/API_STRATEGY.md`) |
| `NEXT_PUBLIC_FF_DATA_MOAT` | `dataMoat` | Data moat consent/aggregates architecture (default **off**; see `docs/DATA_MOAT_ARCHITECTURE.md`) |
| `NEXT_PUBLIC_FF_MODEL_FEEDBACK` | `modelFeedback` | AI recommendation feedback loop (default on; see `docs/MODEL_FEEDBACK.md`) |
| `NEXT_PUBLIC_FF_TECHNIQUE_EXPERT_REVIEW` | `techniqueExpertReview` | Optional technique expert review (default on; see `docs/TECHNIQUE_HUMAN_REVIEW.md`) |
| `NEXT_PUBLIC_FF_HUMAN_ANALYSIS_PRODUCT` | `humanAnalysisProduct` | Paid Expert Technique Review products (default on; see `docs/HUMAN_ANALYSIS.md`) |
| `NEXT_PUBLIC_FF_PERFORMANCE_REPORT_PDF` | `performanceReportPdf` | Premium Performance Report PDF (default on; see `docs/PERFORMANCE_REPORT_PDF.md`) |
| `NEXT_PUBLIC_FF_MONTHLY_PERFORMANCE_REPORT` | `monthlyPerformanceReport` | Automatic monthly report (default on; see `docs/MONTHLY_PERFORMANCE_REPORT.md`) |
| `NEXT_PUBLIC_FF_TRAINING_STYLE_PROFILER` | `trainingStyleProfiler` | Training style profiler (default on; see `docs/TRAINING_STYLE_PROFILER.md`) |
| `NEXT_PUBLIC_FF_PERSONALIZATION_ENGINE` | `personalizationEngine` | Personalization engine (default on; see `docs/PERSONALIZATION_ENGINE.md`) |
| `NEXT_PUBLIC_FF_SMART_NOTIFICATIONS` | `smartNotifications` | Smart notifications (default on; see `docs/SMART_NOTIFICATIONS.md`) |
| `NEXT_PUBLIC_FF_BEHAVIORAL_RETENTION` | `behavioralRetention` | Behavioral retention (default on; see `docs/BEHAVIORAL_RETENTION.md`) |
| `NEXT_PUBLIC_FF_ADVANCED_ONBOARDING` | `advancedOnboardingPersonalization` | Path-personalized onboarding (default on; see `docs/ADVANCED_ONBOARDING.md`) |
| `NEXT_PUBLIC_FF_POWERLIFTING_MODE` | `powerliftingMode` | Powerlifting Mode (default on; see `docs/POWERLIFTING_MODE.md`) |
| `NEXT_PUBLIC_FF_BODYBUILDING_MODE` | `bodybuildingMode` | Bodybuilding Mode (default on; see `docs/BODYBUILDING_MODE.md`) |
| `NEXT_PUBLIC_FF_STRONGMAN_MODE` | `strongmanMode` | Strongman Mode (default on; see `docs/STRONGMAN_MODE.md`) |
| `NEXT_PUBLIC_FF_WEIGHTLIFTING_MODE` | `weightliftingMode` | Weightlifting Mode (default on; see `docs/WEIGHTLIFTING_MODE.md`) |
| `NEXT_PUBLIC_FF_WEIGHTLIFTING_ADVANCED_VIDEO` | `weightliftingAdvancedVideoAnalysis` | WL advanced video analysis (default **off**) |
| `NEXT_PUBLIC_FF_MULTI_SPORT_ATHLETE_MODE` | `multiSportAthleteMode` | Multi-Sport Athlete Mode (default on; see `docs/MULTI_SPORT_ATHLETE_MODE.md`) |
| `NEXT_PUBLIC_FF_EXERCISE_RELATIONSHIP_GRAPH` | `exerciseRelationshipGraph` | Exercise Relationship Graph (default on; see `docs/EXERCISE_RELATIONSHIP_GRAPH.md`) |
| `NEXT_PUBLIC_FF_TRAINING_METHOD_KNOWLEDGE_GRAPH` | `trainingMethodKnowledgeGraph` | Training Method Knowledge Graph (default on; see `docs/TRAINING_METHOD_KNOWLEDGE_GRAPH.md`) |

Offline AI Coach evaluation (Prompt 93) lives in `src/domain/ai-eval/` — see `docs/AI_EVALUATION.md` (no feature flag; CI regression only).

Technique model evaluation (Prompt 94) lives in `src/domain/technique-eval/` with an internal dashboard at `/app/admin/technique-eval` — see `docs/TECHNIQUE_MODEL_EVALUATION.md`. Never publish accuracy % without human-labeled benchmark data.

| `NEXT_PUBLIC_FF_TRAINING_AUDIT` | `trainingAudit` | `/app/training-audit` (default on) |
| `NEXT_PUBLIC_FF_TRAINING_AUDIT_PDF_IMAGE` | `trainingAuditPdfImage` | PDF/image ingest in audit (default off) |
| `NEXT_PUBLIC_FF_EXERCISE_PRESCRIPTION` | `exercisePrescription` | `/app/exercise-prescription` (default on) |
| `NEXT_PUBLIC_FF_WEAK_POINT_INTELLIGENCE` | `weakPointIntelligence` | `/app/weak-points` (default on) |
| `NEXT_PUBLIC_FF_TECHNIQUE_TREND_ENGINE` | `techniqueTrendEngine` | `/app/technique-trends` (default on) |
| `NEXT_PUBLIC_FF_VIDEO_COMPARISON` | `videoComparison` | `/app/technique/compare` (default on) |
| `NEXT_PUBLIC_FF_PR_PREDICTION` | `prPrediction` | `/app/pr-prediction` (default on) |
| `NEXT_PUBLIC_FF_GOAL_PROBABILITY` | `goalProbability` | `/app/goal-progress` (default on) |
| `NEXT_PUBLIC_FF_COMPETITION_MODE` | `competitionMode` | `/app/competition` (default on) |
| `NEXT_PUBLIC_FF_ATTEMPT_SELECTOR` | `attemptSelector` | `/app/attempt-selector` (default on) |
| `NEXT_PUBLIC_FF_PR_INTELLIGENCE` | `prIntelligence` | `/app/prs` + `/share/pr/[token]` (default on) |
| `NEXT_PUBLIC_FF_PUBLIC_ATHLETE_PROFILE` | `publicAthleteProfile` | `/u/[slug]` + profile settings (default on) |
| `NEXT_PUBLIC_FF_LEADERBOARDS` | `leaderboards` | `/app/leaderboards` (default on) |
| `NEXT_PUBLIC_FF_VERIFIED_LIFTS` | `verifiedLifts` | `/app/verified-lifts` (default on) |
| `NEXT_PUBLIC_FF_CHALLENGE_ENGINE` | `challengeEngine` | `/app/challenges` (default on) |
| `NEXT_PUBLIC_FF_ACHIEVEMENT_SYSTEM` | `achievementSystem` | `/app/achievements` (default on) |
| `NEXT_PUBLIC_FF_ATHLETE_LEVEL` | `athleteLevel` | `/app/athlete-level` (default on) |
| `NEXT_PUBLIC_FF_COMMUNITY_QA` | `communityQa` | `/app/community-qa` (default on) |
| `NEXT_PUBLIC_FF_EXPERT_CONTRIBUTOR` | `expertContributor` | `/app/expert-contributor` (default on) |

Technique analysis detail is live (upload pipeline) — see `docs/TECHNIQUE_ANALYSIS.md`. No feature flag.

**Behavior when off:** removed from navigation; direct URL shows honest “Coming soon / not available” via `FeatureGate`. No fake interactive UI.

---

## Product flow mapping

| Stage | Primary surfaces |
| --- | --- |
| Goal | Onboarding (future) → Dashboard empty-state CTA |
| Assessment | Future assessment flow → feeds profile |
| Athlete profile | `/app/profile` (Settings links here) |
| Training | Today, Training, Programs |
| Technique | Technique hub + owned analysis detail |
| Recovery | Recovery |
| Nutrition | Nutrition → Mealnexio |
| Insights | Insights + Dashboard teaser |
| Progress | Progress |
| Recommendations | Dashboard + Today (“what next”) |
| Adaptation | Programs + Training (engine later) |

---

## Audience & access (target model)

| Audience | Public site | `/app` | Notes |
| --- | --- | --- | --- |
| Free visitor | Full public nav | Blocked after auth ships | Browse Features / Exercises / Methods |
| New athlete | Public → sign up | Dashboard empty states | Guided setup |
| Returning athlete | — | Full athlete nav | Resume Today |
| Paid athlete | — | Athlete + paid modules | Billing later |
| Coach | Coaching marketing | Coach tools (flag) | Role-gated later |
| Premium coaching client | Coaching + Pricing | Athlete + coach relationship | Human coaching later |

**Current reality:** Authentication is **not connected**. `/app` routes are structural shells with an explicit auth notice. They do not imply a logged-in session or demo data.

---

## User journeys

### 1. New athlete

1. Lands on `/` — sees brand and tagline *What should I do next to improve?*
2. Reviews `/features` to understand the Performance OS.
3. Browses `/exercises` and `/methods` for knowledge.
4. Checks `/pricing` for catalog tiers, limits, and cancellation — checkout stays flagged until Stripe is ready.
5. Enters `/app/dashboard` → completes future Goal → Assessment → Profile flow.
6. Lands in honest empty states; first CTA is assessment / first program — not fake charts.

**Success:** Clear path from curiosity → account → first real next action.

### 2. Returning athlete

1. Opens `/app/today` (or Dashboard).
2. Sees today’s session or the single recommended next step.
3. Trains via `/app/training`; logs progress.
4. Reviews technique if relevant (`/app/technique`).
5. Checks recovery and nutrition; adjusts via recommendations.

**Success:** Minimal friction to “what do I do now?”

### 3. Free visitor

1. Explores public IA: Home → Features → Exercises → Methods → History → Fit → Compare → Academy → Coaching → Pricing.
2. Does **not** see fabricated testimonials, user counts, or partner logos.
3. May compare methods at `/compare`, read `/history`, and get rule-based fit suggestions at `/fit`; flagged URLs still show Coming soon when off — not broken buttons.
4. CTA to enter app / sign up when auth exists.

**Success:** Trust through honesty; SEO-ready public structure.

### 4. Paid athlete

1. Same core loop as returning athlete.
2. Unlock paid surfaces when billing ships (advanced technique, premium programs, academy content).
3. Pricing page reflects real entitlements only.

**Success:** Clear upgrade value without fake social proof.

### 5. Coach

1. Discovers offering on `/coaching`.
2. Enables Coach Mode in Settings; athletes grant access by email.
3. Opens `/app/coach` (flag `appCoach`, default on) for athlete list, activity, alerts, adherence, technique trends, reviews — **only active grants**.
4. Opens `/app/coach/[athleteProfileId]` for overview, training review, comments, progress, recovery (if scoped), notes, recommendations, and AI Copilot (flag `coachAiCopilot` — drafts only; coach Accept / Edit / Reject).
5. Human coach suggestions are timestamped/auditable; AI suggestions stay labelled separately.
6. Never sees recovery / detailed body metrics / technique media unless the athlete opts those scopes in.
7. Uses Academy for coach education when available.

**Success:** Explicit grant/revoke permissions; no accidental health exposure. See `docs/COACH_PLATFORM.md` and `docs/COACH_ATHLETE_DETAIL.md`.

### 6. Premium coaching client

1. Converts via `/coaching` + `/pricing` when marketplace supply and billing are live.
2. Until then sees honest Marketplace coming soon (no invented coaches).
3. Uses athlete Performance OS daily.
4. Receives human coach feedback through coach-linked workflows after match + grant.
5. Nutrition coordination via Mealnexio when integration is live.

**Success:** Human coaching layered on the OS — marketplace discovery separate from data grants. See `docs/COACH_MARKETPLACE.md`.

---

## Layout architecture

```
src/app/
  layout.tsx                 # Root: fonts, metadata, dark tokens
  (marketing)/layout.tsx     # Public header + footer
  (marketing)/…              # Public routes
  app/layout.tsx             # Authenticated shell + sidebar
  app/…                      # Performance OS routes
```

Nav items are derived from `getPublicNavRoutes()` / `getAuthenticatedNavRoutes()` so flags and IA stay in sync.

---

## SEO & metadata rules

- Public pages: unique `title`, `description`, `alternates.canonical` where applicable.
- Authenticated `/app/*`: `robots: { index: false, follow: false }`.
- Flagged detail pages: noindex until real content exists.
- Root layout sets Open Graph / Twitter defaults; no fake stats in copy.

---

## What was deliberately deferred

- Auth middleware / protected routes
- Database-backed exercise & method catalogs
- Real pricing tables and checkout
- Marketplace, B2B API, certifications issuance
- Hundreds of static content pages

These belong in later prompts once services exist.

---

## Maintenance rules

1. Add new routes to `src/config/routes.ts` first.
2. Wire nav only via helpers (no hard-coded duplicate menus).
3. Gate unfinished modules with flags + `FeatureGate`.
4. Prefer one dynamic template over many empty static pages.
5. Never ship a control that looks interactive but does nothing.
