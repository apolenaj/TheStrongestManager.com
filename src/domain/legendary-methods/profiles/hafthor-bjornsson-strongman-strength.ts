import {
  CONTENT_ACCESS_DATE,
  sectionsWithBodies,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Hafþór Björnsson — strongman strength and athleticism analysis (Prompt 5B).
 * Time-sensitive claims are period-dated because his training goals change across career phases.
 */
export const HAFTHOR_BJORNSSON_STRONGMAN_STRENGTH: LegendaryMethodProfile = {
  slug: "hafthor-bjornsson-strongman-strength",
  status: "draft",
  athleteName: "Hafþór Björnsson",
  profileTitle: "Hafþór Björnsson — Strongman Strength and Athleticism Analysis",
  shortTitle: "Strongman Strength and Athleticism",
  category: "strongman",
  era: "Modern strongman and multi-phase strength career (WSM 2018; deadlift records 2020–2025; powerlifting interludes)",
  nationality: "Icelandic",
  sportLabel: "Strongman",
  summary:
    "An independent, period-dated analysis of Hafþór Björnsson’s publicly documented strength career across strongman dominance, specialised deadlift projects, bodyweight changes, and powerlifting-style interludes — emphasising maximal strength, event athleticism, recovery, and why strongman preparation is not identical to powerlifting peaking. Not a reproduction of any proprietary programme.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Hafþór Júlíus Björnsson. Because he remains active and training goals change, time-sensitive claims are tied to specific dates and periods. This page does not reproduce proprietary programmes or copyrighted plans. Modernised examples are original The Strongest Manager interpretations.",
  keyCharacteristics: [
    "Multi-event strongman athleticism alongside maximal strength expression",
    "Period-specific deadlift specialisation projects with dated milestones",
    "Squat and pressing support that shifts with sport goal (strongman vs powerlifting rules)",
    "Large bodyweight changes across career phases",
    "Recovery and conditioning demands that scale with absolute load and event density",
  ],
  bestFor: [
    "Intermediate-plus athletes studying strongman versus powerlifting preparation differences",
    "Coaches analysing how bodyweight and sport goal changes alter programming",
    "Advanced lifters seeking safer principles for strength-plus-athleticism hybrids",
  ],
  notRecommendedFor: [
    "Beginners",
    "Lifters copying elite absolute loads from record footage",
    "Anyone treating one career phase as his permanent training identity",
  ],
  trainingDays:
    "Varies by period: dense multi-event strongman weeks in contest seasons; more specialised pulling or powerlifting emphasis in targeted projects",
  quickProfile: {
    primaryGoal:
      "Period-dependent: multi-event strongman winning, maximal deadlift projects, or powerlifting-style totals",
    typicalFrequency:
      "High during strongman contest prep (events + strength); more lift-specific in specialised blocks",
    volumeLevel: "High systemic stress in strongman seasons; more concentrated in specialisation phases",
    intensityProfile: "Maximal and near-maximal efforts appear in peaking windows; event practice adds unique fatigue",
    recoveryDemand: "Very high at elite bodyweights and absolute loads",
    technicalDifficulty:
      "High — implements, deadlift peaking, and powerlifting command standards differ by phase",
    bestSuitedFor: "Advanced strength athletes with coaching and periodised recovery",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 10,
      justification:
        "Career includes WSM-level strength and multiple dated world-class deadlift performances under strongman norms.",
    },
    hypertrophyPotential: {
      value: 6,
      justification:
        "Large absolute loading can grow tissue, but public emphasis is performance outcomes across sports, not hypertrophy programming.",
    },
    recoveryDemand: {
      value: 9,
      justification:
        "Event density, maximal pulls, and large body-mass phases create extreme recovery requirements.",
    },
    technicalDifficulty: {
      value: 8,
      justification:
        "Strongman implements plus shifting rulesets (straps/suit vs raw powerlifting commands) raise skill and planning difficulty.",
    },
    beginnerSuitability: {
      value: 1,
      justification:
        "Beginners need general strength foundations; elite multi-phase careers are poor copy targets.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced athletes can borrow periodisation logic: match training to the sport goal of the current block, not to a highlight reel.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Competition results and major record attempts are well documented by official organisers and reputable outlets. Detailed proprietary week plans are not fully public; therefore exercise menus beyond high-level principles are treated as reconstructed coaching interpretation. Time-sensitive claims are period-dated.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodies(
    {
      "athlete-and-era": `Hafþór Júlíus Björnsson’s public strength career is best read as a sequence of periods, not as one frozen “Thor programme.”

Period A — multi-event strongman peak: In 2018 he won World’s Strongest Man (Philippines), adding to a résumé that already included major international titles in the Arnold Strongman Classic and Europe’s Strongest Man eras. That phase rewards broad athleticism: loading events, carries, pressing medleys, and static strength under fatigue.

Period B — specialised deadlift project (2020): On 2 May 2020, at Thor’s Power Gym in Kópavogur, Iceland, he deadlifted 501 kg in a Worlds Ultimate Strongman–associated record setting streamed publicly. Reputable outlets (BBC, Reuters) reported the lift; Guinness lists the 501 kg mark. Community debate followed because the attempt occurred outside a traditional contested strongman show during pandemic disruptions — a documentation distinction this profile keeps explicit.

Period C — bodyweight and sport-goal shifts (roughly 2020–2022): Public reporting around boxing-focused years and later returns describes substantially lower bodyweights than peak superheavy strongman size. On 3 December 2022, at Thor’s Christmas Powerlifting Meet (Thor’s Power Gym), reputable strength media reported a 970 kg total (squat 380 kg with wraps, bench 210 kg, deadlift 380 kg) at about 162 kg bodyweight — contrasting with earlier strongman-era bodyweights commonly discussed near or above ~195 kg in 2018-era comparisons.

Period D — renewed deadlift and strongman expression (2025): Official Giants Live reporting documents a 510 kg deadlift world record at the Mutant World Deadlift Championships on 6 September 2025 in Birmingham, inside a contested Giants Live show, with overall Strongman Open success the same day. Secondary reporting also notes an intervening 505 kg mark in July 2025; where used, that claim is treated as period-specific and media-supported, not as a permanent training prescription.

Because he remains active, any claim without a date is treated cautiously.`,

      "documented-training-method": `Documented versus reconstructed must stay sharp.

Documented outcomes by period: WSM 2018 title (official contest result); 501 kg deadlift on 2 May 2020 (streamed record attempt with public weighing/judging narrative, still debated as “competition WR” vs heaviest lift); December 2022 powerlifting-style total under reported raw/belt-focused constraints rather than strongman straps/suit norms; 510 kg on 6 September 2025 at Giants Live World Deadlift Championships (official organiser report).

Documented method themes at principle level: strongman preparation emphasises event practice plus maximal strength support; specialised deadlift blocks raise pulling specificity and peaking intent; powerlifting-style preparation emphasises squat/bench/deadlift commands, often without straps, and different fatigue distribution than a six-event strongman day.

Training footage and YouTube sessions show session flavour — absolute loads, implements, effort — but do not automatically disclose full periodisation, off-days, medical context, or a complete annual plan. Secondary “Thor routine” blogs are not primary evidence.

Independent interpretation: the durable coaching lesson is goal-periodisation. When the goal is WSM-style winning, conditioning and event skill rise. When the goal is a historic deadlift, pulling specificity and recovery around that peak rise. When the goal is a powerlifting total, squat and bench quality matter more, and equipment rules change what numbers mean. Do not collapse those periods into one fake permanent programme.`,

      "training-structure": `Strongman contest preparation (e.g. 2018 WSM window) typically structures the week around event practice, pressing and loading skill, and strength sessions that support those events. Squat and pressing variations appear as support for yoke, squat events, log/axle, and overall robustness — not necessarily as powerlifting command practice.

Deadlift specialisation structure (2020 and 2025 record windows) concentrates more stress into pulling practice, peaking logistics, and recovery around a dated attempt. Support work still exists, but the public identity of those blocks is the pull.

Powerlifting-style structure (illustrated by the 3 December 2022 meet reporting) redistributes emphasis toward squat, bench, and conventional deadlift under meet commands. Reputable coverage noted the contrast with strongman deadlift setups (suit/straps) and highlighted how bodyweight reduction changes absolute totals even when athleticism remains high.

Volume distribution therefore cannot be stated as one eternal pie chart. Intensity distribution likewise shifts: strongman seasons spread high-effort exposures across implements; specialised peaks tolerate fewer, heavier exposures; powerlifting peaks manage three lifts’ fatigue.

Conditioning is a first-class difference. Strongman winning requires repeated high-output efforts across a contest day. Pure powerlifting peaking often reduces non-specific conditioning to protect squat/bench/deadlift freshness. Mixing those templates blindly is a common coaching error.`,

      "volume-intensity-frequency": `Independent analysis by period:

In multi-event strongman blocks, frequency of hard exposures is high because events themselves are training. Intensity is often high but not always a single one-rep max; medleys and carries create unique metabolic and grip fatigue.

In deadlift specialisation blocks, deadlift frequency may look moderate while intensity climbs toward a peaking attempt. Support volume must fall enough to let the pull recover.

In powerlifting-style blocks, weekly squat/bench/deadlift frequency follows three-lift logic; absolute deadlift numbers under raw rules are not interchangeable with strapped strongman pulls.

Across all periods, elite absolute intensity is the wrong copy target. Ordinary lifters should borrow the scheduling idea — match frequency and intensity to the sport goal of the next 8–12 weeks — not the loads on highlight videos.`,

      "why-it-worked": `Success across phases tracks specificity to the goal of that phase, exceptional absolute strength, technical practice on the relevant implements or commands, athlete experience, and recovery resources. Bodyweight changes illustrate the trade: higher mass can support historic absolute pulls and loading events; lower mass can improve relative athleticism or combat-sport aims but changes total expectations.

The 2018 WSM win reflects broad strongman athleticism. The 2020 and 2025 deadlift milestones reflect specialised peaking and pulling identity under strongman equipment norms. The 2022 powerlifting meet illustrates transferable strength under different rules — and also shows that filmed readiness is fragile (illness and acute bodyweight drop were publicly discussed around that contest).

Long-term adaptation across a decade-plus career is the real programme. Highlight lifts are checkpoints, not the syllabus. For coaches, the useful synthesis is that athleticism and maximal strength can coexist across a career only if the athlete accepts phase trade-offs: when deadlift specialisation rises, some event freshness may fall; when bodyweight falls for another sport aim, absolute totals often fall even if skill remains high. Public career turns make those trade-offs visible; recreational lifters should plan them deliberately instead of chasing every highlight at once.`,

      "what-lifters-get-wrong": `Lifters get Hafþór wrong when they treat one period as permanent identity: copying only deadlift record loads while ignoring event athleticism, or copying strongman bodyweight while training like a raw powerlifter.

They also fail when they equate 501 kg (2 May 2020 gym record setting) with 510 kg (6 September 2025 Giants Live contest) without stating context; when they compare strapped strongman pulls to raw powerlifting deadlifts; and when they ignore that conditioning needs differ by sport goal.

Another failure mode is importing combat-sport or reduced-bodyweight phases into a maximal deadlift block without changing expectations. The December 2022 powerlifting meet reporting is a reminder that acute illness, bodyweight swings, and ruleset changes all alter outcomes — even for an elite athlete. Do not invent a single “Thor weekly routine.” If proprietary plans are not published, keep claims at principle level and date them.`,

      "risks-and-recovery": `Risks include lumbar and posterior-chain overload under maximal pulls, implement-specific joint stress, and systemic fatigue from contest-dense strongman weeks. Bodyweight swings and concurrent sport changes (including combat-sport phases discussed in public career narratives) alter recovery capacity.

Modern controls: pick one primary goal per block; reduce non-specific high-fatigue work near a peak; scale loads to technique; deload on schedule. Normal lifters should not copy elite absolute loads or peak contest bodyweights. After a hard deadlift peak or multi-event weekend, expect several easier days before the next maximal exposure. This is training-economy guidance, not medical advice.`,

      "verdict": `The Strongest Manager verdict: Hafþór’s career is a masterclass in period-specific strength identity — strongman athleticism, specialised deadlift peaking, and powerlifting-style interludes are related but not identical preparation problems. Date your claims. Borrow principles. Refuse highlight-load cosplay. Never present a reconstructed week as his exact permanent programme. The educational value is learning how goals, rulesets, and bodyweight change the weekly stress budget — not collecting record numbers for ego.`,

      "modernised-application": `Modernise by choosing a block goal (strongman events, deadlift peak, or powerlifting total), then aligning squat/press/hinge support, conditioning, and bodyweight expectations to that goal. Beginners need general strength first. Intermediates can run 8–12 week blocks with clear primary lifts and limited event or peak stress. Advanced athletes may specialise briefly, then return to broader athleticism.

A practical sequence: audit which qualities your next contest or test actually rewards; cut training that does not serve that test for 6–12 weeks; keep one or two support lifts; schedule a deload before the peak; then decide whether the next block should broaden athleticism again. See modernAdaptation for safer dosing. Related generic programmes on this site are the on-ramp — not record footage.`,

      "example-training-week": `The example week is an original modernised hybrid for an advanced intermediate pursuing strength-plus-athleticism. It is not Hafþór’s routine and not tied to any single record attempt.`,

      sources: `Sources prioritise official contest organisers (strongman.org, Giants Live), major news reporting for dated record attempts, and reputable strength media for the 2022 powerlifting meet. Unsourced routine aggregators are not primary evidence.`,
    },
    {
      "athlete-and-era": [1, 2, 3, 4, 5],
      "documented-training-method": [1, 2, 3, 4, 5],
      "training-structure": [1, 4, 5],
      "volume-intensity-frequency": [1, 4],
      "why-it-worked": [1, 2, 4],
    },
  ),
  trainingStructure: {
    trainingDays:
      "Period-dependent: multi-event strongman weeks in contest seasons; more specialised strength weeks in deadlift or powerlifting projects",
    exerciseFrequency:
      "Events and support lifts appear multiple times weekly in strongman prep; specialised peaks narrow emphasis",
    volumeDistribution: [
      { label: "Primary strength lifts (squat/press/hinge)", share: 35 },
      { label: "Event practice / implements (strongman phases)", share: 30 },
      { label: "Secondary strength support", share: 20 },
      { label: "Conditioning / recovery work", share: 15 },
    ],
    intensityDistribution: [
      { label: "Heavy strength exposures", share: 40 },
      { label: "Event-speed / skill efforts", share: 35 },
      { label: "Easy technique / recovery", share: 25 },
    ],
    primaryMovements: [
      "Deadlift variations appropriate to the block’s ruleset",
      "Squat pattern support",
      "Overhead / pressing support for strongman phases",
    ],
    accessoryWork: [
      "Upper-back and posterior-chain accessories",
      "Carry and loading variations in strongman blocks",
      "Bench-focused work in powerlifting-style blocks",
    ],
    progressionApproach:
      "Progress the qualities that win the next dated goal; change the menu when the sport goal changes",
    recoveryStructure:
      "Peak less often than social media implies; protect sleep and reduce non-specific fatigue before record or contest days",
  },
  whyItWorked: {
    specificity:
      "Each major success matched the demands of that period’s sport goal (WSM events, specialised deadlift, or powerlifting commands).",
    volume:
      "Contest seasons distribute hard work across events; specialised peaks concentrate quality exposures.",
    intensity:
      "Maximal efforts are used as checkpoints inside longer adaptation, not as daily identity.",
    technicalPractice:
      "Years of implement and barbell practice under fatigue built reliable skill at absolute loads.",
    athleteExperience:
      "A long international career created the runway for later specialisation projects.",
    bodyweight:
      "Higher mass phases supported historic absolute strength; lower mass phases changed totals and athletic trade-offs.",
    recovery:
      "Elite support, time, and planned peaks made extreme stress productive in short windows.",
    sportDemands:
      "Strongman winning and record deadlifts reward different weekly structures than a pure powerlifting total.",
    longTermAdaptation:
      "Career longevity and phase changes matter more than any single viral session.",
  },
  whatLiftersGetWrong: [
    "Treating one career phase as a permanent programme",
    "Copying record deadlift loads from footage",
    "Equating strapped strongman pulls with raw powerlifting deadlifts",
    "Ignoring conditioning differences between strongman and powerlifting prep",
    "Skipping dates on time-sensitive claims about an active athlete",
  ],
  exampleWeek: {
    title: "Modernised strength-plus-athleticism illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest Manager example for an advanced intermediate. Not Hafþór Björnsson’s programme and not a record-attempt template. Scale all loads to technical quality.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Heavy hinge + upper back",
        notes: "Deadlift variation at RPE 7–8; rows; stop before form breakdown",
      },
      {
        dayLabel: "Day 2",
        focus: "Press strength + easy carry",
        notes: "Overhead or bench emphasis depending on block goal; short farmer or suitcase carries",
      },
      {
        dayLabel: "Day 3",
        focus: "Rest or mobility",
        notes: "Protect sleep",
      },
      {
        dayLabel: "Day 4",
        focus: "Squat pattern + posterior accessories",
        notes: "Moderate intensity; keep recoverable volume",
      },
      {
        dayLabel: "Day 5",
        focus: "Event skill or speed pulls (advanced)",
        notes: "Low-volume implement practice or lighter speed deadlifts — not max attempts",
      },
      {
        dayLabel: "Day 6",
        focus: "Optional conditioning",
        notes: "Short hard intervals only if recovered; skip near a peak",
      },
      {
        dayLabel: "Day 7",
        focus: "Rest",
        notes: "Deload every 3–5 hard weeks",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Match training to a dated block goal — strongman athleticism, deadlift peak, or powerlifting total — and refuse to import elite absolute loads or bodyweight cosplay.",
    beginnerAdjustment:
      "Full-body strength 3 days/week; learn squat/hinge/press; no implement maxes; build work capacity slowly.",
    intermediateAdjustment:
      "4-day strength template with one optional event-skill day; keep top sets submaximal; 8–12 week goal blocks.",
    advancedAdjustment:
      "Short specialisation peaks with planned deloads; alternate broad athleticism phases and narrow strength phases; never chase documentary loads.",
    recommendedFrequency: "3–5 training days/week depending on recovery and sport schedule",
    recoveryControls: [
      "One primary goal per block",
      "Reduce non-specific conditioning near peaks",
      "Cap maximal attempts",
      "Track bodyweight changes as trade-offs, not moral scores",
    ],
    progressionRules: [
      "Progress the lifts/events that decide the next goal",
      "Change equipment expectations when rulesets change",
      "Deload when performance across two key sessions declines",
    ],
    whenToReduceVolume:
      "Persistent strength drop, rising joint irritation, poor sleep, or event skill collapsing under fatigue",
    whoShouldAvoid: [
      "Beginners",
      "Lifters without recovery capacity for high-fatigue training",
      "Anyone copying record attempt loads",
    ],
  },
  relatedProgrammes: [
    {
      slug: "conjugate-strength-system",
      title: "Strength and Athleticism Hybrid",
      href: "/programs/conjugate-strength-system",
      relationship:
        "Original The Strongest Manager programme applying related maximal strength and athletic support principles without athlete naming",
    },
  ],
  sources: [
    {
      title: "World's Strongest Man 2018 Final (Results)",
      publisher: "strongman.org",
      url: "https://strongman.org/news/worlds-strongest-man-2018-final-results",
      publicationDate: "2018",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "competition-database",
      supports: ["athlete-and-era", "documented-training-method", "why-it-worked"],
    },
    {
      title: "Hafthor Bjornsson: Game of Thrones actor breaks 501kg deadlift record",
      publisher: "BBC News",
      url: "https://www.bbc.com/news/world-europe-52512211",
      publicationDate: "2020-05-02",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "Heaviest deadlift (male)",
      publisher: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/world-records/heaviest-deadlift",
      publicationDate: "2020-05-02",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "competition-database",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "Thor takes Birmingham strength title & smashes deadlift record",
      publisher: "Giants Live",
      url: "https://giants-live.com/news/bjornsson-smashes-510kg-to-take-both-titles-in-birmingham/",
      publicationDate: "2025-09-06",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["athlete-and-era", "documented-training-method", "training-structure"],
    },
    {
      title: "Hafthor Björnsson Wins Powerlifting Return, Achieves 970-Kilogram Total",
      publisher: "Breaking Muscle",
      url: "https://breakingmuscle.com/hafthor-bjornsson-totals-970-kilograms-at-2022-thors-christmas-powerlifting-meet/",
      publicationDate: "2022-12-03",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: [
        "athlete-and-era",
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
    {
      title: "BREAKING: Hafthor Bjornsson Just Performed The Heaviest Deadlift Ever",
      publisher: "BarBend",
      url: "https://barbend.com/news/hafthor-bjornsson-501kg-deadlift-world-record/",
      publicationDate: "2020-05-02",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "what-lifters-get-wrong"],
    },
  ],
  seo: {
    title: "Hafþór Björnsson Strongman Strength and Athleticism Analysis",
    description:
      "Period-dated independent analysis of Hafþór Björnsson’s strongman, deadlift, and powerlifting-phase training principles — maximal strength, athleticism, bodyweight changes, and safer modern application.",
    canonicalPath: "/legendary-methods/hafthor-bjornsson-strongman-strength",
    keywords: [
      "hafthor bjornsson training analysis",
      "strongman strength and athleticism",
      "deadlift world record training principles",
      "strongman vs powerlifting preparation",
    ],
  },
};
