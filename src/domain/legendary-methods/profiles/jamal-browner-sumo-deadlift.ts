import {
  CONTENT_ACCESS_DATE,
  LEGENDARY_PUBLISH_DATE,
  sectionsWithBodiesForSlug,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Jamal Browner — sumo deadlift specialisation analysis (Prompt 5C).
 * Competition vs gym lifts are strictly separated; OpenPowerlifting anchors meet claims.
 */
export const JAMAL_BROWNER_SUMO_DEADLIFT: LegendaryMethodProfile = {
  slug: "jamal-browner-sumo-deadlift",
  status: "published",
  legalReviewStatus: "passed",
  publishedAt: LEGENDARY_PUBLISH_DATE,
  updatedAt: LEGENDARY_PUBLISH_DATE,
  athleteName: "Jamal Browner",
  profileTitle: "Jamal Browner — Sumo Deadlift Specialisation Analysis",
  shortTitle: "Sumo Deadlift Specialisation",
  category: "powerlifting",
  era: "Contemporary raw powerlifting deadlift specialisation (active; landmark 2020–2024 meets)",
  nationality: "American",
  sportLabel: "Powerlifting",
  summary:
    "An independent analysis of Jamal Browner’s publicly documented sumo deadlift specialisation: meet-dated competition pulls with federation and bodyweight, technical consistency, overload and variations, fatigue management, grip and lockout demands under raw rules, limited carryover assumptions to conventional pulling, and why elite sumo specialists are poor copy targets. Gym lifts are labelled separately from competition lifts.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Jamal Browner. Competition figures cite OpenPowerlifting and reputable meet reporting. Social-media and gym sessions — including strapped overloads — are not treated as full programmes or as equivalent to competition lifts. This page does not reproduce proprietary programmes or speculate about drug use, medical status, or private coaching systems.",
  keyCharacteristics: [
    "Elite raw sumo deadlift performances in full meets",
    "High technical consistency in stance, brace and lockout",
    "Clear competition-versus-gym performance gap in public media",
    "Occasional conventional practice for non-powerlifting rulesets",
    "Fatigue management around extreme pulling stress",
  ],
  bestFor: [
    "Intermediate-plus sumo pullers studying specialisation principles",
    "Coaches teaching competition vs gym evidence literacy",
    "Advanced lifters evaluating when sumo specificity helps or limits transfer",
  ],
  notRecommendedFor: [
    "Beginners without a stable hinge pattern",
    "Lifters copying strapped gym overloads as competition standards",
    "Conventional-only athletes assuming automatic transfer from elite sumo work",
  ],
  trainingDays:
    "Public media shows frequent heavy sumo practice and occasional conventional blocks for strongman-rules projects; exact proprietary weekly plans are unpublished",
  quickProfile: {
    primaryGoal: "Maximise raw sumo deadlift (and supporting total) under powerlifting rules",
    typicalFrequency: "High pulling emphasis in documented training media; exact long-term frequency unpublished",
    volumeLevel: "Moderate hard-set counts with very high absolute intensity on peak exposures",
    intensityProfile: "Near-maximal competition attempts; gym overloads often use straps/belt conditions that differ from meet rules",
    recoveryDemand: "Very high around maximal sumo sessions",
    technicalDifficulty: "Very high — stance width, hip position, brace and lockout under absolute loads",
    bestSuitedFor: "Advanced sumo specialists with coaching",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 10,
      justification:
        "Meet-dated raw sumo pulls above 450 kg place him among the strongest class deadlifters in modern raw powerlifting.",
    },
    hypertrophyPotential: {
      value: 4,
      justification:
        "Specialisation emphasises neural and technical maximal strength more than balanced hypertrophy programming.",
    },
    recoveryDemand: {
      value: 9,
      justification:
        "Absolute sumo loading and frequent hard exposures create large systemic and hip/adductor recovery costs.",
    },
    technicalDifficulty: {
      value: 9,
      justification:
        "Elite sumo positions under 450+ kg demand exceptional consistency; small leaks are punished.",
    },
    beginnerSuitability: {
      value: 1,
      justification:
        "Beginners should learn general deadlift skill first; elite sumo specialisation is a late-stage tool.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced sumo pullers can borrow technical standards, overload literacy and fatigue management — not loads.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Competition deadlifts and totals are high-confidence via OpenPowerlifting. Gym performances reported by BarBend/Breaking Muscle are useful for capacity context but are lower evidence for programming and must remain labelled as non-competition. Proprietary weekly plans are not public.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodiesForSlug(
    "jamal-browner-sumo-deadlift",
    {
      "athlete-and-era": `Jamal Browner is an active American raw powerlifter best known publicly for sumo deadlift specialisation in the 110 kg class. OpenPowerlifting lists a career spanning USAPL, NAPF, USPA, WRPF and related meets from 2016 onward.

Meet-dated competition anchors:

- 1 February 2020, WRPF Hybrid Showdown II: raw 110 kg-class meet including a 440.5 kg deadlift among a 990 kg total (OpenPowerlifting / contemporaneous reporting).
- 24 September 2022, USPA Pro Raw Championships (North Kansas City), bodyweight 109.4 kg: squat 370 kg, bench 227.5 kg, deadlift 455 kg (sumo, belt, hook grip per reputable meet reporting), total 1,052.5 kg. BarBend and Breaking Muscle covered the 455 kg pull as a class all-time raw deadlift mark and noted he is among the few men to deadlift 1,000+ lb in a full raw meet.
- 6 April 2024, WRPF The Ghost Clash 3, bodyweight 109.5 kg: deadlift 460 kg inside a 1,012.5 kg total (OpenPowerlifting).

These are competition lifts. Separately, reputable outlets have reported gym performances such as strapped sumo triples/quadruples at competition-record loads and conventional doubles prepared for strongman-rules deadlift contests. Those gym marks are not meet results and often use straps not allowed in raw powerlifting. An active career means later meets may add new rows; cite dates whenever discussing “the” record pull.`,

      "documented-training-method": `Fact: competition sumo pulls above are database-backed.

Fact (media-documented themes): Browner’s competition identity is wide-stance sumo with high technical repeatability. Meet reporting on the 24 September 2022 USPA Pro Raw performance emphasises belt + hook grip under raw rules. Training media frequently shows belt and straps for overload work — a ruleset difference that must be stated whenever gym clips are cited.

Documented variation practice includes conventional deadlifting when preparing for strongman contexts where sumo is disallowed (BarBend/Breaking Muscle coverage of 2023 World Deadlift Championships prep, including a reported 435 kg conventional double with straps on 4 August 2023). That is sport-rules adaptation, not proof that sumo specialists should abandon sumo in powerlifting.

Analysis: specialisation means most high-intensity practice stays in the competition stance, with overload variations and occasional conventional blocks serving specific goals. Fatigue management appears in public comments around deloads after brutal sessions. None of this authorises inventing a weekly routine from Instagram.

Lockout and grip deserve explicit attention under raw rules. Hook-grip competition pulls tax the hands differently than strapped gym overloads. Lifters who only train strapped often discover on meet day that grip, not hip strength, was the hidden limiter. Browner’s public competition reporting emphasises raw-legal conditions on record days — that is the standard this profile treats as primary.

Not documented: a complete proprietary programme, permanent frequency chart, or claim that every gym YOLO session is peaking methodology.`,

      "training-structure": `Structurally, sumo specialisation organises the week around high-quality sumo exposures, supporting squat/bench work for the total, and accessories that maintain hips, back and grip without destroying the next pull.

Intensity distribution is top-heavy on deadlift days. Volume distribution should stay honest: a few hard sumo sets beat endless grinding. Grip and lockout are decisive under raw rules; strapped gym overloads remove grip as a limiter and therefore overstate transferable competition readiness if misread.

Carryover to conventional deadlifting exists at the general strength level — Browner’s conventional training media shows high absolute conventional capacity — but positions, hip demands and weak points differ. Copying an elite sumo specialist’s stance and volume is a poor plan for a conventional-primary lifter. Frequency should fall when absolute intensity rises; fatigue management is part of specialisation, not an optional extra after the highlight reel.`,

      "volume-intensity-frequency": `Independent analysis: frequency of maximal sumo work must fall as absolute intensity rises. Gym media that shows frequent huge pulls is not automatic permission for recreational lifters to max twice weekly.

Volume should be counted as hard competition-stance sets that meet depth/lockout standards. Intensity techniques and straps change the stress profile. Competition preparation should prioritise raw-rules conditions (no straps) before meet day.

Ordinary lifters: one hard sumo day, optional light technique day, ruthless recovery. Do not copy strapped 455 kg for reps as a weekly identity.

Overload literacy is the skill most highlight-watchers lack. A strapped gym quadruple at a competition-record load can be real and still not answer the competition question: can you hook-grip (or legally grip) that load for a single under meet commands after squat and bench? Browner’s career makes that distinction visible because both evidence types exist in public — they simply must not be merged.`,

      "why-it-worked": `Elite sumo results track specificity, technical consistency, progressive overload across years of meets, exceptional athlete experience, bodyweight that still supports huge absolute pulls in the 110 kg class, and sport demands that reward the heaviest legal competition deadlift.

Long-term adaptation and selection effects matter: public archives favour athletes who survive extreme pulling. Gym overloads may expand capacity, but meet-dated raw pulls are the performance truth for powerlifting.

Setup consistency is not cosmetic. Wide-stance sumo under 450+ kg punishes hip shift, soft braces and early lockout leaks. The specialists who stay elite are usually the ones whose setup looks boringly similar attempt after attempt. That boring repeatability is more instructive than any single viral PR caption.`,

      "what-lifters-get-wrong": `Lifters get Browner wrong when they treat strapped gym sessions as competition equivalents; when they assume sumo specialisation automatically builds a conventional competition pull; when they copy stance width without hip structure and mobility to match; and when they invent programmes from highlight reels.

They also fail by ignoring that total-building still required squat and bench contributions on record days (e.g. 370/227.5/455 at USPA Pro Raw 2022). Deadlift specialisation is not “deadlift only” if the goal is a class total record.

A further error is treating strongman-rules conventional training as proof that sumo was “wrong.” Rulesets change the optimal stance. Powerlifting sumo and strongman conventional are related strength expressions, not identical skills.`,

      "risks-and-recovery": `Risks concentrate in adductors, hips, lumbar tissues and grip structures under raw maximal sumo. Conventional blocks add a second technical tax. YOLO max sessions after contests raise injury odds when technique is rusty.

Modern controls: raw-rules practice before meets, limited strapped overloads, planned deloads, and stance work that stays within technical ownership. If hips or adductors complain for more than a few easy days, cut pulling intensity before adding another absolute test. This is training-economy guidance, not medical advice.`,

      "verdict": `The Strongest Manager verdict: Browner is a case study in sumo specialisation done at the absolute edge — with mandatory literacy about competition versus gym conditions. Borrow technical standards and overload honesty. Do not copy elite loads or assume universal transfer to conventional pulling. Date every claim; label every ruleset.`,

      "modernised-application": `Modernise with competition-stance priority, one hard pull day, optional light technique work, and clear labelling of strapped overloads as non-meet practice. Beginners learn hinge patterns first.

Intermediates should build a meet-dated sumo single under raw rules before chasing gym theatre. Advanced lifters may use short overload blocks, then return to competition conditions for the final weeks. See modernAdaptation. Related generic programmes are safer than highlight cosplay.`,

      "example-training-week": `Original modernised sumo-specialisation illustration — not Jamal Browner’s programme. Use it to rehearse competition-stance quality and recovery spacing, then adjust every load to your technical ceiling. Do not treat any day as a transcript of an elite session.`,

      sources: `OpenPowerlifting for competition lifts; BarBend/Breaking Muscle/Fitness Volt for meet reports and clearly labelled gym performances.`,
    },
    {
      "athlete-and-era": [1, 2, 3],
      "documented-training-method": [1, 2, 4, 5],
      "training-structure": [2, 4],
      "volume-intensity-frequency": [4, 5],
      "why-it-worked": [1, 2],
    },
  ),
  trainingStructure: {
    trainingDays:
      "High-emphasis pulling weeks in public training media; exact proprietary split unpublished",
    exerciseFrequency:
      "Sumo as primary heavy exposure; conventional used in documented strongman-prep periods",
    volumeDistribution: [
      { label: "Competition-stance sumo", share: 45 },
      { label: "Squat / bench total support", share: 30 },
      { label: "Conventional / variation work (phase-dependent)", share: 15 },
      { label: "Accessories", share: 10 },
    ],
    intensityDistribution: [
      { label: "Heavy competition-stance pulls", share: 50 },
      { label: "Overload / variation exposures", share: 25 },
      { label: "Technique / recovery pulls", share: 25 },
    ],
    primaryMovements: ["Raw sumo deadlift (competition rules)", "Competition squat and bench for totals"],
    accessoryWork: [
      "Posterior-chain and upper-back accessories",
      "Grip work under raw-rules conditions",
      "Conventional practice when rulesets require it",
    ],
    progressionApproach:
      "Progress meet-dated raw sumo; use gym overloads cautiously and label equipment differences",
    recoveryStructure:
      "Space maximal exposures; deload after brutal sessions; prioritise raw-rules freshness before meets",
  },
  whyItWorked: {
    specificity: "Most high-intensity practice matches the competition sumo ruleset.",
    volume: "Hard sets stay focused; quality beats endless grinding.",
    intensity: "Meet attempts and carefully chosen overloads raise absolute force.",
    technicalPractice: "Years of wide-stance consistency under fatigue.",
    athleteExperience: "Multi-year OpenPowerlifting progression into 450+ kg competition pulls.",
    bodyweight: "110 kg-class bodyweights still support enormous absolute deadlifts.",
    recovery: "Elite recovery capacity around sparse maximal tests.",
    sportDemands: "Class deadlift and total records reward the heaviest legal competition pull.",
    longTermAdaptation: "Record meets sit on years of specialised practice, not one viral week.",
  },
  whatLiftersGetWrong: [
    "Treating strapped gym overloads as competition-equivalent",
    "Assuming elite sumo work fully transfers to conventional meets",
    "Copying stance width without technical ownership",
    "Ignoring squat/bench contributions on total-record days",
    "Inventing weekly routines from social-media sessions",
  ],
  exampleWeek: {
    title: "Modernised sumo-specialisation illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest Manager example. Not Jamal Browner’s programme. Prefer raw-rules conditions for meet prep. Scale loads to technical quality.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Heavy sumo (raw rules)",
        notes: "Work to 2–4 hard sets; belt OK; no straps if peaking for raw meets",
      },
      {
        dayLabel: "Day 2",
        focus: "Bench + upper back",
        notes: "Keep recoverable for the next pull",
      },
      {
        dayLabel: "Day 3",
        focus: "Rest",
        notes: "Hip and adductor recovery",
      },
      {
        dayLabel: "Day 4",
        focus: "Squat emphasis",
        notes: "Moderate intensity",
      },
      {
        dayLabel: "Day 5",
        focus: "Light sumo technique or optional conventional (phase goal)",
        notes: "Speed/technique; stop fresh",
      },
      {
        dayLabel: "Day 6–7",
        focus: "Rest",
        notes: "Deload after any maximal test week",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Prioritise competition-stance sumo under the rules you will be judged by; label gym overloads honestly; do not assume conventional transfer.",
    beginnerAdjustment:
      "Learn conventional or sumo hinge with modest loads 2×/week; no maximal specialisation.",
    intermediateAdjustment:
      "One hard sumo day + one light technique day; build total with squat/bench; raw-rules practice before meets.",
    advancedAdjustment:
      "Short overload blocks with clear equipment labels; optional conventional phases only when rules require; planned deloads after maximal tests.",
    recommendedFrequency: "1–2 deadlift exposures/week depending on intensity",
    recoveryControls: [
      "Limit strapped overloads near raw meets",
      "Deload after maximal tests",
      "Monitor adductors/hips",
      "Keep secondary days truly easy",
    ],
    progressionRules: [
      "Progress meet-dated raw pulls first",
      "Add overload only after competition-stance technique is stable",
      "Change stance projects one block at a time",
    ],
    whenToReduceVolume:
      "Hip/adductor irritation, lockout quality loss, or repeated failed gym maxes",
    whoShouldAvoid: [
      "Beginners",
      "Lifters with unmanaged hip pain",
      "Conventional-primary athletes copying elite sumo volume blindly",
    ],
  },
  relatedProgrammes: [
    {
      slug: "dup-powerlifting-system",
      title: "Deadlift Specialisation Strength",
      href: "/programs/dup-powerlifting-system",
      relationship:
        "Original The Strongest Manager programme applying related deadlift-specialisation principles without athlete naming",
    },
  ],
  sources: [
    {
      title: "Jamal Browner — OpenPowerlifting athlete results",
      publisher: "OpenPowerlifting",
      url: "https://www.openpowerlifting.org/u/jamalbrowner",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "competition-database",
      supports: ["athlete-and-era", "documented-training-method", "why-it-worked"],
    },
    {
      title: "Jamal Browner (110KG) Reclaims All-Time World Record Total at 2022 USPA Raw Pro",
      publisher: "BarBend",
      url: "https://barbend.com/news/jamal-browner-all-time-world-record-raw-total/",
      publicationDate: "2022-09-24",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "Jamal Browner Breaks 1,003-lb Raw Deadlift & Total Records at 2022 USPA Pro Raw",
      publisher: "Fitness Volt",
      url: "https://fitnessvolt.com/jamal-browner-records-2022-uspa-pro-raw/",
      publicationDate: "2022-09-24",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era"],
    },
    {
      title: "Jamal Browner Deadlifted 1,003 Pounds for 4 Reps (gym — straps)",
      publisher: "BarBend",
      url: "https://barbend.com/news/jamal-browner-sumo-deadlifts-455-kilogram-quadruple/",
      publicationDate: "2023-11-17",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["documented-training-method", "what-lifters-get-wrong"],
    },
    {
      title: "Jamal Browner Hits 435-kg Conventional Deadlift for 2 Reps in Training",
      publisher: "Breaking Muscle",
      url: "https://breakingmuscle.com/jamal-browner-deadlift-959-pounds-two-reps/",
      publicationDate: "2023-08-03",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: [
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
  ],
  seo: {
    title: "Jamal Browner Sumo Deadlift Specialisation Analysis",
    description:
      "Meet-dated independent analysis of Jamal Browner’s sumo deadlift specialisation — competition vs gym lifts, overload literacy, conventional carryover limits, and safer modern application.",
    canonicalPath: "/legendary-methods/jamal-browner-sumo-deadlift",
    keywords: [
      "jamal browner sumo deadlift analysis",
      "sumo deadlift specialisation",
      "competition vs gym deadlift",
      "raw sumo powerlifting",
    ],
  },
};
