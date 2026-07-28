import {
  CONTENT_ACCESS_DATE,
  sectionsWithBodies,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Colton Engelbrecht — elite superheavyweight / absolute-strength powerlifting analysis (Prompt 5C).
 * Competition claims are meet-dated via OpenPowerlifting and reputable meet reporting.
 * Training claims stay at interview-supported principle level — not a proprietary programme.
 */
export const COLTON_ENGELBRECHT_SUPERHEAVYWEIGHT: LegendaryMethodProfile = {
  slug: "colton-engelbrecht-superheavyweight-powerlifting",
  status: "draft",
  athleteName: "Colton Engelbrecht",
  profileTitle: "Colton Engelbrecht — Elite Superheavyweight Powerlifting Analysis",
  shortTitle: "Elite Superheavyweight Powerlifting",
  category: "powerlifting",
  era: "Contemporary raw/wraps powerlifting (active 2019–present; landmark totals 2025–2026)",
  nationality: "South African",
  sportLabel: "Powerlifting",
  summary:
    "An independent analysis of Colton Engelbrecht’s publicly documented absolute-strength powerlifting: meet-dated squat, bench and deadlift performances, bodyweight and recovery implications, technical specialisation, and the hard line between confirmed competition lifts, exhibition/strapped sessions, gym footage, and unverified programming claims. Not a reproduction of any private coaching system.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Colton Engelbrecht. Competition figures cite recognised databases and meet reporting. Gym lifts and social-media sessions are labelled separately and are not treated as full programmes. This page does not speculate about drug use, medical status, or private coaching systems, and does not reproduce proprietary programmes.",
  keyCharacteristics: [
    "Absolute-strength development across squat, bench and deadlift in full meets",
    "High competition totals at bodyweights far below classic unlimited superheavyweights",
    "Interview-supported use of higher-rep foundation blocks before peaking",
    "Clear equipment and rules distinctions (raw sleeves vs wraps; strapped exhibitions)",
    "Extreme recovery demands that ordinary lifters must scale",
  ],
  bestFor: [
    "Intermediate-plus powerlifters studying absolute-strength total building",
    "Coaches analysing how meet-dated evidence differs from viral training clips",
    "Advanced athletes who need safer principles for long peaking cycles",
  ],
  notRecommendedFor: [
    "Beginners still learning competition commands",
    "Lifters copying elite absolute loads from footage",
    "Anyone treating social-media sessions as a complete programme",
  ],
  trainingDays:
    "Interview framing has described a weekday lift focus (e.g. separate squat/bench/deadlift emphasis days); treat as athlete-reported structure, not a published proprietary plan",
  quickProfile: {
    primaryGoal: "Maximise raw or wraps full-meet total with elite absolute strength",
    typicalFrequency:
      "Public interview accounts describe dedicated weekly emphasis days per main lift; exact long-term templates are not fully published",
    volumeLevel: "High foundational volume in higher-rep blocks; intensity rises into peaking",
    intensityProfile: "Competition peaking toward heavy singles; foundation work includes challenging higher-rep sets",
    recoveryDemand: "Very high at elite absolute loads and contest bodyweights",
    technicalDifficulty: "High — competition commands plus sumo/conventional technical consistency under fatigue",
    bestSuitedFor: "Advanced powerlifters with coaching and recovery capacity",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 10,
      justification:
        "Meet-dated performances place him among the highest absolute totals and deadlifts in raw powerlifting history.",
    },
    hypertrophyPotential: {
      value: 6,
      justification:
        "Higher-rep foundation blocks can grow tissue, but the public outcome focus is competition total, not physique programming.",
    },
    recoveryDemand: {
      value: 9,
      justification:
        "Elite absolute loads and long peaking cycles create recovery costs recreational lifters cannot safely match.",
    },
    technicalDifficulty: {
      value: 8,
      justification:
        "Requires stable competition technique across three lifts plus careful equipment/rules literacy.",
    },
    beginnerSuitability: {
      value: 1,
      justification:
        "Beginners need pattern mastery and modest loads; elite absolute-strength cosplay is counterproductive.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced lifters can borrow periodised foundation-to-peak logic and meet-prep discipline without copying loads.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Competition lifts are high-confidence via OpenPowerlifting and contemporaneous meet reporting. Training-method detail relies on public interviews/podcasts and must be treated as principle-level athlete claims — not a complete proprietary programme. Social-media sessions are lower evidence for programming.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodies(
    {
      "athlete-and-era": `Colton Engelbrecht is an active South African powerlifter whose public career, as catalogued on OpenPowerlifting, runs from 2019 onward under federations including WPC-SA, ProRaw and WRPF. The analytical frame for this profile is absolute-strength total building — not biography, and not speculation about private medical or pharmacological context.

Two meet-dated anchors define the current public conversation. On 29 March 2025, at WPC-SA Clash of the Titans (South Africa), OpenPowerlifting records a wraps performance in the 125 kg / 275 lb class at 120.4 kg bodyweight: squat 470 kg, bench 260 kg, deadlift 470 kg, total 1,200 kg. Reputable meet reporting framed that total as a landmark all-time raw-with-wraps absolute mark.

On 11 July 2026, at the WRPF Nikolai Kagansky Memorial Cup (Moscow), OpenPowerlifting records a raw (sleeves) full-power result in the 140 kg / 308 lb class at 125.3 kg bodyweight: squat 455 kg, bench 277.5 kg, deadlift 492.5 kg, total 1,225 kg (DOTS 693.75 on the database display). The same date also lists separate deadlift-only / exhibition-style entries — including strapped work — which must not be collapsed into the full-meet raw total.

That separation is the first educational rule: competition lifts in a full meet, single-lift entries, strapped exhibitions, and gym footage are different evidence classes.`,

      "documented-training-method": `Fact (competition): the lifts above are database-backed meet performances with federation, date, equipment and bodyweight.

Fact (interview-level training themes): in public long-form conversation (including Mark Bell’s Power Project after the 1,200 kg wraps total), Engelbrecht has described building foundations with higher-rep blocks on the main lifts, using accessories mainly for extra stimulus/mind-muscle connection rather than as the primary strength drivers, and organising training across dedicated weekday emphases (bench, squat, back, shoulders, deadlift in the account discussed on that podcast). He has also discussed sumo deadlift technical priorities such as staying “stacked” and limiting energy leaks through the hips.

Analysis (labelled): those themes support a classical absolute-strength reading — accumulate quality work on the competition lifts, build a high-rep foundation, then peak — but they do not authorise reprinting a weekly spreadsheet as “Colton’s programme.” Coach relationships mentioned in interviews are acknowledged only as existing public context; private programming details are out of scope.

Not documented as a complete public programme: exact set/week prescriptions across mesocycles, proprietary periodisation files, or any claim that one Instagram session equals the plan. Gym PRs and social clips may illustrate capacity; they are not confirmed programming.`,

      "training-structure": `Publicly discussed structure emphasises specificity to squat, bench and deadlift with dedicated emphasis days, plus higher-rep foundation phases before heavier peaking. Volume distribution likely skews toward the competition lifts, with modest accessory budgets — consistent with interview comments that most productive work is done in the main-lift rep blocks.

Intensity distribution moves from challenging higher-rep sets toward singles as a meet approaches. Recovery structure is decisive at these absolute loads: sleep, food and spacing between stressful exposures matter more than adding novelty.

Equipment literacy belongs inside structure. Wraps squat totals (e.g. 29 March 2025) are not identical evidence to sleeves-raw totals (e.g. 11 July 2026). Strapped deadlift-only marks on the same weekend as a full meet are not interchangeable with the raw full-meet deadlift. Lifters who ignore those distinctions misread the sport.`,

      "volume-intensity-frequency": `Independent analysis: absolute-strength careers at this level typically tolerate high intensity only when volume and frequency are periodised. Interview themes of higher-rep foundations imply that hard singles are not the entire year.

Frequency of each main lift appears closer to specialised weekly emphasis than to ultra-high conjugate chaos — based on the weekday split described publicly — but exact long-term frequency waves remain incompletely published. Therefore this profile refuses invented weekly routines.

What ordinary lifters should take: keep most training submaximal, use higher-rep technique blocks to build positions, raise intensity near meets, and refuse to match elite absolute loads. What they should not take: viral heavy singles every week dressed up as “how Colton trains.”

A practical coaching translation: treat the year as foundation → strength → peak rather than as a continuous max-out calendar. If a lifter cannot recover from one hard squat day and one hard deadlift day in the same week, they are not ready to imitate elite absolute-strength density. Reduce hard sets first. Keep technique standards non-negotiable. Log equipment every time a “PR” is claimed so wraps, sleeves, straps and gym conditions never silently inflate the story.`,

      "why-it-worked": `Meet-dated success tracks specificity to the three lifts, progressive overload across years (OpenPowerlifting shows large total growth from early WPC-SA results in 2019–2021 into 2025–2026 landmarks), technical practice under fatigue, athlete experience, and bodyweights that — while not classic unlimited SHW — still support enormous absolute force relative to lighter classes.

Recovery resources and long runway between some major attempts (as discussed in public podcast/media framing around planned meet spacing) likely matter. Sport demands reward the total on meet day, not the most entertaining gym clip.

Long-term adaptation is the quiet truth: the landmark totals sit on years of recorded meets, not on a single viral cycle. Absolute-strength outliers also benefit from selection and leverage realities that recreational lifters cannot purchase with enthusiasm alone. The educational value is the process shape — foundation quality, peaking discipline, equipment literacy — not the fantasy that 1,200 kg totals are a template.`,

      "what-lifters-get-wrong": `Lifters get this wrong when they paste gym numbers next to meet totals without labels; when they ignore wraps versus sleeves; when they treat strapped exhibition pulls as raw full-meet deadlifts; and when they invent a weekly routine from one podcast anecdote.

They also fail by copying absolute loads at recreational recovery capacity, or by assuming higher-rep foundation work means “junk volume” without technical standards. Do not speculate about drugs or private coaching systems. Stay on documented lifts and principle-level interview claims.

A final common error is calling every heavy training clip “meet prep.” Meet prep is a dated plan toward a federation ruleset. Exhibition pulls, YOLO days and content sessions can coexist with a career — they are still not interchangeable evidence with OpenPowerlifting rows.`,

      "risks-and-recovery": `Risks concentrate in lumbar and knee tissues under absolute loading, elbow/shoulder stress from heavy benching, and systemic under-recovery when peaking is chronic. Bodyweight that supports elite totals also raises absolute joint forces.

Modern controls: submaximal top sets most weeks, planned deloads, equipment-appropriate expectations, and refusal to chase database numbers. If sleep, appetite or warm-up bar speed deteriorate for more than a week, cut intensity before adding another “world-record attempt” in the gym. This is training-economy guidance, not medical advice.`,

      "verdict": `The Strongest Manager verdict: Engelbrecht’s meet-dated totals are among the clearest modern demonstrations of absolute-strength powerlifting. Study the principles — specificity, foundation-to-peak logic, equipment literacy — and quarantine elite doses. Never present social-media sessions or interview fragments as his full proprietary programme. Compare totals only with federation, date, equipment and bodyweight attached.`,

      "modernised-application": `Modernise with a three-lift emphasis week, higher-rep technique blocks in early mesocycles, and a conservative peak. Beginners should not start here. Intermediates may run 3–4 days with one hard exposure per main lift weekly. Advanced lifters may lengthen peaking cycles and track meet-dated progress only.

Practically: pick one meet date, choose sleeves or wraps deliberately, build 8–16 weeks of submaximal quality work, then peak. Do not schedule exhibition maxes in the same microcycle as a full-meet simulation. Related generic programmes on this site are safer on-ramps than highlight cosplay. See modernAdaptation for dosing.`,

      "example-training-week": `The example week is an original modernised illustration for intermediate-to-advanced total building. It is not Colton Engelbrecht’s programme and not a path to 1,200+ kg totals.`,

      sources: `Primary competition evidence: OpenPowerlifting athlete page and contemporaneous meet reporting. Training themes: public interviews/podcasts. Unsourced routine blogs are not primary evidence.`,
    },
    {
      "athlete-and-era": [1, 2, 3],
      "documented-training-method": [1, 4, 5],
      "training-structure": [1, 4],
      "volume-intensity-frequency": [4, 5],
      "why-it-worked": [1, 2],
    },
  ),
  trainingStructure: {
    trainingDays:
      "Interview-reported weekday emphasis split across main lifts; exact proprietary calendars unpublished",
    exerciseFrequency:
      "Public accounts suggest dedicated weekly emphasis per squat/bench/deadlift rather than daily maxing",
    volumeDistribution: [
      { label: "Competition squat work", share: 30 },
      { label: "Competition bench work", share: 25 },
      { label: "Competition deadlift work", share: 30 },
      { label: "Accessories / other", share: 15 },
    ],
    intensityDistribution: [
      { label: "Foundation / higher-rep blocks", share: 40 },
      { label: "Strength / heavy work", share: 40 },
      { label: "Peak singles / meet week", share: 20 },
    ],
    primaryMovements: ["Competition squat", "Competition bench press", "Competition deadlift (often sumo in public footage/meets)"],
    accessoryWork: [
      "Local accessories as secondary stimulus (interview examples include leg curls/extensions)",
      "Upper-back support work as needed",
    ],
    progressionApproach:
      "Build foundation with higher-rep main-lift blocks, then raise intensity toward meet-dated singles",
    recoveryStructure:
      "Longer gaps between some major meets discussed publicly; sleep/food are non-negotiable at elite absolute loads",
  },
  whyItWorked: {
    specificity: "Training and peaking target the three competition lifts under stated equipment rules.",
    volume: "Higher-rep foundation blocks create positional and tissue capacity before peaking.",
    intensity: "Meet performances show willingness to take near-maximal attempts when prepared.",
    technicalPractice: "Years of meet practice refined commands and sumo/pulling consistency.",
    athleteExperience: "Documented meet history from 2019 onward shows progressive total growth.",
    bodyweight:
      "Contest bodyweights in the ~120–125+ kg range support absolute force without requiring classic unlimited SHW mass — still far above most recreational lifters.",
    recovery: "Elite recovery resources and planned meet spacing support high absolute stress.",
    sportDemands: "All-time total chasing rewards full-meet performance, not isolated gym theatre.",
    longTermAdaptation: "Landmark 2025–2026 totals sit on multi-year recorded progression.",
  },
  whatLiftersGetWrong: [
    "Collapsing gym lifts, strapped exhibitions and full-meet totals into one number",
    "Ignoring wraps versus sleeves equipment differences",
    "Inventing a weekly routine from a single interview anecdote",
    "Copying elite absolute loads at recreational recovery capacity",
    "Speculating about drugs, medical status or private coaching systems",
  ],
  exampleWeek: {
    title: "Modernised absolute-strength illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest Manager example for an intermediate-to-advanced powerlifter. Not Colton Engelbrecht’s programme. Scale all loads to technical quality.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Squat emphasis",
        notes: "Work up to hard sets at RPE 7–8; optional light technique volume",
      },
      {
        dayLabel: "Day 2",
        focus: "Bench emphasis",
        notes: "Competition-style bench + modest accessories",
      },
      {
        dayLabel: "Day 3",
        focus: "Rest or easy mobility",
        notes: "Protect sleep",
      },
      {
        dayLabel: "Day 4",
        focus: "Deadlift emphasis",
        notes: "Competition stance practice; stop when speed dies",
      },
      {
        dayLabel: "Day 5",
        focus: "Secondary upper / back",
        notes: "Rowing and light press variations; keep recoverable",
      },
      {
        dayLabel: "Day 6–7",
        focus: "Rest",
        notes: "Deload every 3–5 hard weeks",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep three-lift specificity, foundation-to-peak logic and equipment literacy — discard elite absolute loads and proprietary-programme myths.",
    beginnerAdjustment:
      "Full-body or upper/lower 3 days/week; learn commands; no maximal singles; build consistency for months.",
    intermediateAdjustment:
      "4 days/week with one hard exposure per main lift; higher-rep technique blocks early in cycles; RPE 7–8 top sets.",
    advancedAdjustment:
      "Longer mesocycles; careful peaking; track only meet-dated progress for ‘PR’ claims; never chase database absolute loads.",
    recommendedFrequency: "3–5 days/week depending on recovery",
    recoveryControls: [
      "Cap true maximal attempts",
      "Separate full-meet prep from exhibition ego pulls",
      "Deload when bar speed falls for 7–10 days",
      "Prioritise sleep and food before adding volume",
    ],
    progressionRules: [
      "Add load when technique stays clean across planned sets",
      "Raise intensity only after foundation blocks are owned",
      "Log equipment and federation with every meet claim",
    ],
    whenToReduceVolume:
      "Persistent strength drop, rising joint irritation, or poor sleep across two hard sessions",
    whoShouldAvoid: [
      "Beginners",
      "Lifters without recovery capacity for high absolute loading",
      "Anyone copying social-media maxes",
    ],
  },
  relatedProgrammes: [
    {
      slug: "block-periodisation",
      title: "Absolute Strength Total Builder",
      href: "/programs/block-periodisation",
      relationship:
        "Original The Strongest Manager programme applying related total-building and peaking principles without athlete naming",
    },
  ],
  sources: [
    {
      title: "Colton Engelbrecht — OpenPowerlifting athlete results",
      publisher: "OpenPowerlifting",
      url: "https://www.openpowerlifting.org/u/coltonengelbrecht",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "competition-database",
      supports: [
        "athlete-and-era",
        "documented-training-method",
        "training-structure",
        "why-it-worked",
      ],
    },
    {
      title: "Colton Engelbrecht Achieves All-Time Raw Powerlifting Total Record",
      publisher: "BarBend",
      url: "https://barbend.com/news/colton-engelbrecht-all-time-raw-powerlifting-total-record/",
      publicationDate: "2025-03-29",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "why-it-worked"],
    },
    {
      title: "Colton Engelbrecht Sets All-Time Heaviest Raw Total at 2026 Nikolai Kagansky Memorial Cup",
      publisher: "Fitness Volt",
      url: "https://fitnessvolt.com/colton-engelbrecht-all-time-heaviest-raw-total-2026-nikolai-kagansky-memorial-cup/",
      publicationDate: "2026-07-11",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "Mark Bell's Power Project — Colton Engelbrecht interview (high-rep foundations / weekly emphasis)",
      publisher: "Mark Bell's Power Project",
      url: "https://powerproject.live",
      publicationDate: "2025",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: [
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
    {
      title: "Colton Engelbrecht: World's Strongest Powerlifter at 25 (podcast feature)",
      publisher: "RP Strength",
      url: "https://rpstrength.com/blogs/podcasts/the-25-year-old-who-deadlifted-1-146-pounds-colton-engelbrechts-story",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["documented-training-method", "volume-intensity-frequency"],
    },
  ],
  seo: {
    title: "Colton Engelbrecht Elite Superheavyweight Powerlifting Analysis",
    description:
      "Meet-dated independent analysis of Colton Engelbrecht’s absolute-strength powerlifting — competition vs gym lifts, equipment literacy, recovery cost, and safer modern application.",
    canonicalPath: "/legendary-methods/colton-engelbrecht-superheavyweight-powerlifting",
    keywords: [
      "colton engelbrecht powerlifting analysis",
      "absolute strength total",
      "raw powerlifting records",
      "superheavyweight powerlifting training principles",
    ],
  },
};
