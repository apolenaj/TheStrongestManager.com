import {
  CONTENT_ACCESS_DATE,
  LEGENDARY_PUBLISH_DATE,
  sectionsWithBodiesForSlug,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * John Haack — elite relative strength at lower bodyweight (Prompt 5C).
 * Competition claims are meet-dated via OpenPowerlifting; training themes from public interviews.
 */
export const JOHN_HAACK_RELATIVE_STRENGTH: LegendaryMethodProfile = {
  slug: "john-haack-relative-strength",
  status: "published",
  legalReviewStatus: "passed",
  publishedAt: LEGENDARY_PUBLISH_DATE,
  updatedAt: LEGENDARY_PUBLISH_DATE,
  athleteName: "John Haack",
  profileTitle: "John Haack — Elite Strength at a Lower Bodyweight",
  shortTitle: "Elite Strength at a Lower Bodyweight",
  category: "powerlifting",
  era: "Contemporary raw powerlifting (IPF classic era through multi-fed raw records; active)",
  nationality: "American",
  sportLabel: "Powerlifting",
  summary:
    "An independent analysis of John Haack’s publicly documented relative-strength career: meet-dated performances across weight classes with federation and bodyweight attached, squat–bench–deadlift balance, interview-supported frequency and fatigue management, competition preparation under IPF classic and multi-fed raw rules, and why absolute totals cannot be compared honestly without bodyweight context. Not a proprietary programme reprint.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by John Haack. Competition figures cite OpenPowerlifting and reputable meet reporting. Gym lifts are labelled separately. This page does not reproduce proprietary programmes or speculate about drug use, medical status, or private coaching systems.",
  keyCharacteristics: [
    "Elite totals at lower bodyweights than superheavyweights",
    "Strong squat–bench–deadlift balance across career phases",
    "Higher weekly frequency of competition-lift practice where documented in interviews",
    "Fatigue management via heavy/rep/light contrasts",
    "Bodyweight literacy when comparing absolute totals",
  ],
  bestFor: [
    "Intermediate-plus lifters chasing relative strength",
    "Coaches teaching DOTS/GLP and class-context comparisons",
    "Athletes studying high-frequency competition-lift practice with autoregulation",
  ],
  notRecommendedFor: [
    "Beginners",
    "Lifters comparing their totals to SHW absolute numbers without bodyweight context",
    "Anyone treating interview outlines as a paid programme clone",
  ],
  trainingDays:
    "Public interviews have described roughly five training days/week with heavy squat+bench, heavy deadlift, and secondary rep/light days",
  quickProfile: {
    primaryGoal: "Maximise raw total relative to bodyweight / weight class",
    typicalFrequency: "Interview accounts: ~5 days/week with multiple bench exposures and weekly heavy squat/deadlift emphases",
    volumeLevel: "Moderate-to-high skill practice volume; intensity autoregulated",
    intensityProfile: "Heavy singles on primary days; rep work and lighter technique days for fatigue management",
    recoveryDemand: "High when peaking; more manageable than unlimited SHW absolute loading if bodyweight is controlled",
    technicalDifficulty: "High — competitive efficiency and command standards across federations",
    bestSuitedFor: "Advanced relative-strength powerlifters",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 9,
      justification:
        "Meet-dated class totals and IPF classic winning performances demonstrate elite strength expression; absolute loads are lower than SHW specialists by design.",
    },
    hypertrophyPotential: {
      value: 5,
      justification:
        "Training supports muscle needed for strength, but public goals are competition totals and class performance, not hypertrophy programming.",
    },
    recoveryDemand: {
      value: 7,
      justification:
        "Five-day competition-lift frequency raises fatigue management needs, though bodyweight is typically far below unlimited SHW.",
    },
    technicalDifficulty: {
      value: 8,
      justification:
        "Requires efficient technique and federation-literate peaking across IPF-style and multi-fed raw rulesets.",
    },
    beginnerSuitability: {
      value: 2,
      justification:
        "Beginners need lower frequency and simpler progressions before adopting elite relative-strength schedules.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced lifters can borrow frequency, heavy/rep contrasts and bodyweight-aware goal setting.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Competition results are high-confidence via OpenPowerlifting. Weekly structure comes from reputable long-form interviews and should be treated as athlete-reported outlines that change over time — not a permanent proprietary programme.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodiesForSlug(
    "john-haack-relative-strength",
    {
      "athlete-and-era": `John Haack is an active American raw powerlifter whose OpenPowerlifting record spans IPF/USAPL classic competition and later multi-federation raw meets (USPA, WRPF, PLU and others). The educational theme is relative strength: producing world-class totals at bodyweights far below superheavyweight specialists.

Meet-dated anchors (competition lifts only):

- 19 June 2016, IPF World Classic Powerlifting Championships (Killeen, USA), 83 kg class, bodyweight 82.8 kg: OpenPowerlifting lists squat 298 kg, bench 200 kg, deadlift 315 kg, total 813 kg — an Open classic world title performance under IPF commands.
- 29 July 2022, WRPF American Pro, 90 kg class, bodyweight 89.9 kg: 345 kg squat, 267.5 kg bench, 410 kg deadlift, total 1,022.5 kg (raw).
- 6 April 2024, WRPF The Ghost Clash 3, 100 kg class, bodyweight 93.5 kg: 365 / 252.5 / 426 kg, total 1,043.5 kg (raw).
- 28 September 2024, PLU Power Surge Pro/Am VIII, 90 kg class, bodyweight 87.2 kg: squat 365.5 kg inside a 1,013 kg total (raw).
- 13 September 2025, PLU POWER SURGE PRO/AM IX, 90 kg class, bodyweight 87.7 kg: deadlift 413 kg inside a 1,010.5 kg-class total display on OpenPowerlifting (910.5 lb deadlift / 2227.7 lb total in lbs view).

These are competition lifts with federation, date, class and bodyweight. Gym lifts and livestream exhibitions must be labelled separately when discussed in media. Because Haack remains active, later meets can change personal bests; this profile treats cited rows as dated evidence, not as a promise that the numbers are permanent forever.`,

      "documented-training-method": `Fact: the meet results above are database-backed.

Fact (interview-supported method themes): In Men’s Health and Men’s Fitness features, Haack has described training about five days per week, treating Saturday as the heaviest squat-and-bench day (often working to a moderately heavy single), Monday as a heavy deadlift day, Tuesday as a higher-rep bench day, Wednesday as a squat rep day, and Thursday as a lighter/speed-oriented bench and upper accessory day. He has publicly warned that maxing too often and failing reps are common plateau drivers (Fit University Q&A after the 2016 IPF win). He has also discussed technical refinements (e.g. tighter squat setups; deadlift hip-snap cues studied from other elite lifters) as efficiency tools — not as universal prescriptions.

Analysis: the durable method story is high practice frequency on the competition lifts, heavy-versus-rep contrast for fatigue management, and relentless specificity. It is not a licence to publish a fake “Haack spreadsheet.”

Not documented as a complete public programme: proprietary set-by-set files, year-round undulating templates claimed as permanent, or any assertion that one YouTube breakdown is official programming. Where public outlines conflict across years, prefer the principle (practice the lifts often; manage fatigue; peak for meets) over any single remembered weekday list.`,

      "training-structure": `Interview-described structure spreads squat, bench and deadlift stress across the week rather than concentrating all intensity on one day. Bench receives multiple exposures; squat and deadlift receive a heavy day plus secondary practice. That is a relative-strength-friendly pattern: technical efficiency improves with frequent submaximal practice when recovery allows.

Volume distribution favours the competition three. Intensity distribution uses heavy singles on primary days and moderate rep ranges on secondary days. Progression is meet-to-meet improvement inside a chosen class, not unbounded mass gain.

Bodyweight is a first-class structural variable. Moving from 83 kg IPF classic to 90 kg and occasional 100 kg raw appearances changes absolute totals and should change expectations. Comparing Haack’s totals to unlimited SHW totals without bodyweight context is analytically invalid.

Competition preparation, in public telling, still respects peaking reality: off-season practice can spread mental energy across rep ranges, while meet prep concentrates quality on heavier singles. The educational point is role clarity across the week — not copying any one remembered accessory list from an interview.`,

      "volume-intensity-frequency": `Independent analysis: frequency is the signature relative to many low-frequency raw templates. Intensity is high on designated heavy days but not every day. Volume on secondary days fills technique and hypertrophy-support roles without requiring daily maxes.

Fatigue management is the constraint. Interview warnings against chronic failure suggest autoregulation: leave reps in reserve when quality falls. Competition preparation compresses toward heavier singles while preserving enough practice frequency to keep commands sharp.

Ordinary lifters should scale frequency to recovery. Five hard competition-lift days is not a beginner schedule.

A useful relative-strength heuristic: if bodyweight is the constraint that makes the total impressive, then bodyweight management is part of training — not an afterthought. Cutting hard into a meet while also copying elite frequency is a common way intermediates stall. Prefer stable bodyweight blocks, then small class decisions, rather than weekly scale obsession.`,

      "why-it-worked": `Relative-strength success here combines technical efficiency, balanced three-lift development, frequent practice, athlete experience across a long meet history, and bodyweight discipline that keeps him competitive in lighter classes. Sport demands in IPF classic rewarded command precision; multi-fed raw scenes rewarded absolute class records at 90/100 kg.

Long-term adaptation across a decade-plus OpenPowerlifting record matters more than any single viral session. Bodyweight must be considered whenever absolute totals are compared — a lighter athlete producing a 1,000+ kg raw total is answering a different problem than a 140+ kg specialist chasing all-time absolute marks.

Balance across squat, bench and deadlift is part of the relative-strength story. Haack’s public meet cards are not “deadlift-only specialisation.” When one lift lags, interview comments about weak-point accessories and technical tweaks become relevant — still as principles, not as a secret template.`,

      "what-lifters-get-wrong": `Lifters get Haack wrong when they compare his totals to Colton Engelbrecht–style absolute marks without bodyweight; when they copy five training days immediately; when they max every session despite his public plateau warnings; and when they treat interview outlines as paid programmes.

They also fail by ignoring federation differences (IPF classic commands versus multi-fed raw) and by confusing gym livestream numbers with meet-dated results.

Another mistake is assuming moving up a weight class is free progress. Absolute totals may rise while relative standing falls — or the reverse. Choose the comparison frame (class record, DOTS/GLP, or absolute total) before declaring a programme successful.`,

      "risks-and-recovery": `Risks include elbow/shoulder stress from high bench frequency, quad/adductor stress from frequent squatting, and lumbar fatigue from weekly heavy deadlifting. Weight cuts and class changes add another recovery tax when used.

Modern controls: keep most secondary days truly secondary, autoregulate top sets, and choose bodyweight goals deliberately. If secondary-day quality collapses, the heavy days are too expensive — cut load or volume before adding a sixth training day. This is training-economy guidance, not medical advice.`,

      "verdict": `The Strongest verdict: Haack exemplifies elite strength at a lower bodyweight through frequency, balance and technical efficiency. Use bodyweight-aware comparisons. Borrow principles. Do not invent a permanent programme from interviews. Meet-dated, federation-labelled performances are the evidence; social clips are colour commentary.`,

      "modernised-application": `Modernise with 4–5 days of competition-lift practice, one heavy and one lighter exposure where recovered, and explicit bodyweight targets. Beginners need simpler three-day templates first.

A practical sequence for intermediates: establish a stable bodyweight range for 8–12 weeks; train squat/bench/deadlift with mostly submaximal top sets; add a second lighter bench day only after recovery is proven; peak toward one meet-dated total. See modernAdaptation. Related generic programmes are the safer on-ramp.`,

      "example-training-week": `Original modernised relative-strength illustration — not John Haack’s programme.`,

      sources: `OpenPowerlifting for meet-dated lifts; Men’s Health / Men’s Fitness / Fit University interviews for method themes.`,
    },
    {
      "athlete-and-era": [1, 2, 3],
      "documented-training-method": [1, 4, 5, 6],
      "training-structure": [4, 5],
      "volume-intensity-frequency": [4, 5, 6],
      "why-it-worked": [1, 2],
    },
  ),
  trainingStructure: {
    trainingDays: "Interview framing: ~5 days/week with Saturday heavy squat+bench start",
    exerciseFrequency:
      "Bench multiple times weekly; squat and deadlift with heavy + secondary exposures in public accounts",
    volumeDistribution: [
      { label: "Squat practice", share: 30 },
      { label: "Bench practice", share: 35 },
      { label: "Deadlift practice", share: 25 },
      { label: "Accessories", share: 10 },
    ],
    intensityDistribution: [
      { label: "Heavy primary days", share: 40 },
      { label: "Rep / secondary days", share: 40 },
      { label: "Light technique / blood-flow work", share: 20 },
    ],
    primaryMovements: ["Competition squat", "Competition bench press", "Competition deadlift"],
    accessoryWork: ["Close-grip or dumbbell pressing as weak-point work", "Upper-back and arm accessories on lighter days"],
    progressionApproach:
      "Improve meet-dated totals inside a chosen class; raise heavy singles carefully while keeping secondary days productive",
    recoveryStructure:
      "Heavy/rep/light contrasts; avoid chronic failed maxes; manage bodyweight intentionally",
  },
  whyItWorked: {
    specificity: "Nearly all hard work serves squat, bench and deadlift performance under the meet’s ruleset.",
    volume: "Secondary days add practice without requiring daily maximal loading.",
    intensity: "Designated heavy days raise force output; peaking concentrates quality singles.",
    technicalPractice: "High weekly frequency sharpens commands and positions.",
    athleteExperience: "Long OpenPowerlifting history from early USAPL/IPF through multi-fed raw records.",
    bodyweight: "Competing primarily in 83–100 kg ranges makes relative strength the correct comparison frame.",
    recovery: "Autoregulation and day-role clarity manage fatigue across five training days.",
    sportDemands: "Class records and classic world titles reward efficiency at constrained bodyweight.",
    longTermAdaptation: "Decade-scale progression beats short-term maxing culture.",
  },
  whatLiftersGetWrong: [
    "Comparing absolute totals to superheavyweights without bodyweight context",
    "Copying a five-day schedule before recovery capacity exists",
    "Maxing too often and failing reps chronically",
    "Treating interview outlines as a proprietary programme",
    "Mixing gym livestream numbers with meet-dated results",
  ],
  exampleWeek: {
    title: "Modernised relative-strength illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest example. Not John Haack’s programme. Scale loads to technical quality and recovery.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Heavy squat + heavy bench",
        notes: "Work to solid singles or doubles at RPE 7–8.5; optional light back-offs",
      },
      {
        dayLabel: "Day 2",
        focus: "Rest",
        notes: "Sleep and food",
      },
      {
        dayLabel: "Day 3",
        focus: "Heavy deadlift",
        notes: "One hard hinge exposure; accessories for weak points",
      },
      {
        dayLabel: "Day 4",
        focus: "Rep bench",
        notes: "Sets in a moderate rep range; keep away from failure",
      },
      {
        dayLabel: "Day 5",
        focus: "Rep squat",
        notes: "Technique-focused volume",
      },
      {
        dayLabel: "Day 6",
        focus: "Light bench / upper accessories",
        notes: "Speed or light technique; recovery priority",
      },
      {
        dayLabel: "Day 7",
        focus: "Rest",
        notes: "Deload when performance stalls",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep frequent competition-lift practice, heavy/rep contrasts and bodyweight-aware goal setting — discard elite loads and programme cosplay.",
    beginnerAdjustment:
      "3 days/week full-body or upper/lower; one exposure per main lift; no five-day elite schedules.",
    intermediateAdjustment:
      "4 days/week; add a second lighter bench or squat day; keep top sets submaximal.",
    advancedAdjustment:
      "Up to 5 days if recovered; autoregulate heavy singles; choose class/bodyweight deliberately; peak for meet-dated performances only.",
    recommendedFrequency: "3–5 days/week",
    recoveryControls: [
      "Do not fail grinders weekly",
      "Keep light days light",
      "Manage bodyweight changes slowly",
      "Deload every 3–6 hard weeks",
    ],
    progressionRules: [
      "Track meet-dated totals by class",
      "Improve secondary-day quality before adding load to heavy days",
      "Change only one variable at a time when peaking",
    ],
    whenToReduceVolume:
      "Falling bar speed, rising joint irritation, or missed reps accumulating on secondary days",
    whoShouldAvoid: [
      "Beginners",
      "Lifters with unmanaged upper-body tendinopathies",
      "Anyone ignoring bodyweight when setting total goals",
    ],
  },
  relatedProgrammes: [
    {
      slug: "dup-powerlifting-system",
      title: "Relative Strength Powerlifting",
      href: "/programs/dup-powerlifting-system",
      relationship:
        "Original The Strongest programme applying related frequency and relative-strength principles without athlete naming",
    },
  ],
  sources: [
    {
      title: "John Haack — OpenPowerlifting athlete results",
      publisher: "OpenPowerlifting",
      url: "https://www.openpowerlifting.org/u/johnhaack",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "competition-database",
      supports: ["athlete-and-era", "documented-training-method", "why-it-worked"],
    },
    {
      title: "John Haack (90KG) Sets Three All-Time World Records At The 2022 WRPF American Pro",
      publisher: "Fitness Volt",
      url: "https://fitnessvolt.com/john-haack-three-atwr-2022-wrpf-american-pro/",
      publicationDate: "2022-07-29",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era"],
    },
    {
      title: "John Haack — OpenIPF classic results mirror",
      publisher: "OpenIPF",
      url: "https://www.openipf.org/u/johnhaack",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "competition-database",
      supports: ["athlete-and-era"],
    },
    {
      title: "Powerlifter John Haack Shares Gym and Training Advice in Q&A",
      publisher: "Men's Health",
      url: "https://www.menshealth.com/fitness/a38736297/john-haack-powerlifting-interview/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: [
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
    {
      title: "Powerlifter John Haack shares his strength training regime",
      publisher: "Men's Fitness",
      url: "https://mensfitness.co.uk/features/strength-lessons-record-breaking-powerlifter-john-haack/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["documented-training-method", "training-structure"],
    },
    {
      title: "Q&A with IPF World Champion John Haack",
      publisher: "Fit University",
      url: "https://gofitu.com/qa-ipf-world-champion-john-haack/",
      publicationDate: "2016",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["documented-training-method", "what-lifters-get-wrong"],
    },
  ],
  seo: {
    title: "John Haack Elite Relative Strength Powerlifting Analysis",
    description:
      "Meet-dated independent analysis of John Haack’s relative-strength powerlifting — bodyweight context, frequency, fatigue management, and safer modern application.",
    canonicalPath: "/legendary-methods/john-haack-relative-strength",
    keywords: [
      "john haack powerlifting analysis",
      "relative strength powerlifting",
      "90kg raw total",
      "powerlifting frequency training",
    ],
  },
};
