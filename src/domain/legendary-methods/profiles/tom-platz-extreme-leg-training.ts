import {
  CONTENT_ACCESS_DATE,
  sectionsWithBodies,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Tom Platz — extreme leg training analysis (Prompt 5A).
 * Built from Platz’s publicly reported interviews/statements — not a copied workout table.
 */
export const TOM_PLATZ_EXTREME_LEG_TRAINING: LegendaryMethodProfile = {
  slug: "tom-platz-extreme-leg-training",
  status: "draft",
  athleteName: "Tom Platz",
  profileTitle: "Tom Platz — Analysis of Extreme Leg Training",
  shortTitle: "Extreme Leg Training",
  category: "bodybuilding",
  era: "Golden Era / early 1980s competitive bodybuilding",
  nationality: "American",
  sportLabel: "Bodybuilding",
  summary:
    "An independent analysis of Tom Platz’s publicly discussed leg-training philosophy: heavy loads for high repetitions, extreme psychological effort, and the critical difference between legendary one-off performances and repeatable programming.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Tom Platz. Viral squat sessions are not treated as a complete periodised programme. Modernised examples are original The Strongest Manager interpretations.",
  keyCharacteristics: [
    "High-repetition squatting with challenging loads",
    "Blending heavy days with higher-rep hypertrophy work",
    "Psychological chunking of extreme sets",
    "Very high local fatigue and recovery cost on legs",
    "Distinction between spectacle sets and weekly programming",
  ],
  bestFor: [
    "Advanced lifters with robust squat technique seeking hypertrophy emphasis",
    "Coaches studying effort psychology and rep-range blending",
  ],
  notRecommendedFor: [
    "Beginners or anyone with unstable squat patterning",
    "Lifters rehabbing knees, hips, or lumbar issues without clinical clearance",
    "Athletes who need frequent heavy singles for strength peaking",
  ],
  trainingDays: "Leg emphasis often described as infrequent relative to the brutality of sessions",
  quickProfile: {
    primaryGoal: "Quadriceps-dominant hypertrophy and extreme squat conditioning",
    typicalFrequency: "Hard leg sessions often spaced to allow substantial recovery (commonly discussed as low weekly frequency at peak brutality)",
    volumeLevel: "Extreme on squat-focused days; not necessarily high every day",
    intensityProfile: "Heavy relative loads performed for unusually high reps; high psychological intensity",
    recoveryDemand: "Extremely high for lower body",
    technicalDifficulty: "High under fatigue — upright squat bias and depth standards matter",
    bestSuitedFor: "Advanced bodybuilders with years of squat mileage",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 7,
      justification:
        "High-rep heavy squatting builds substantial strength-endurance and work capacity, though it is not a classical peaking method for 1RM.",
    },
    hypertrophyPotential: {
      value: 9,
      justification:
        "Combining challenging loads with high reps creates large mechanical and metabolic stimulus for quads when recovered.",
    },
    recoveryDemand: {
      value: 10,
      justification:
        "Famous sessions are recovery nightmares; repeating them weekly without adaptation and support is a common overreaching path.",
    },
    technicalDifficulty: {
      value: 8,
      justification:
        "Maintaining depth, bracing, and bar path for high reps under load is skilled work — breakdown multiplies risk.",
    },
    beginnerSuitability: {
      value: 1,
      justification:
        "Beginners should not chase 30–50 rep squat culture; they need technique and gradual loading.",
    },
    advancedSuitability: {
      value: 8,
      justification:
        "Advanced lifters can periodise high-rep squat blocks carefully, treating spectacle sets as rare exposures.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Evidence is primarily Platz’s own public interviews and widely reported first-person accounts of famous sets. Detailed permanent programmes are less consistently documented than highlight performances, so programming claims stay conservative.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodies(
    {
      "athlete-and-era": `Tom Platz became an emblem of lower-body development in late Golden Era and early 1980s bodybuilding — a period when stage legs were a competitive differentiator and hard training culture was celebrated in gyms and magazines. The relevant analytical frame is his leg-specialisation identity: extreme squat performances and a philosophy that treats high-repetition loading as central to muscular development.

This is not a full biography. The career stage that matters here is the competitive years and later public teaching in which Platz repeatedly explains how he thought about reps, load, and effort. Those statements are more reliable anchors than anonymous workout spreadsheets circulating online.

The era’s media ecosystem amplified singular performances. Magazines and later internet culture preferred the story of one impossible-looking set over the quieter truth of years of progressive squat practice, assistance work, and recovery discipline. That media bias still distorts how recreational lifters interpret “Platz training”: they remember the spectacle and forget the scaffolding.`,

      "documented-training-method": `Across reputable interview coverage, Platz has argued that bodybuilding growth depends on blending heavy loading with high repetitions rather than choosing one pole forever. In Generation Iron’s coverage of his remarks, he emphasises that reps matter enormously in bodybuilding, while still acknowledging heavy weights — framing the “secret” as eventually using heavy weights for a lot of reps, with a blend across days.

Separately, Platz has publicly described the mental strategy behind an extreme high-rep squat performance (widely reported as 405 lb for 50 reps): breaking the set into manageable chunks of five repetitions so the mind never has to hold “fifty” as a single object. Fitness Volt’s reporting quotes his account of a training partner counting milestones while he focused only on the next five.

Documented method themes, therefore: (1) high-rep squat culture with challenging loads, (2) psychological chunking for extreme efforts, (3) a preference for blending intensity and volume across training. What remains uncertain: any single permanent weekly template claiming exact set/rep charts for every accessory. Where blogs publish detailed “Platz leg day” tables, treat them as secondary reconstructions unless corroborated by Platz’s own framing.

Critical distinction: a filmed or storied one-off set is evidence of capacity and psychology — not automatic proof of a complete periodised programme. Intensity techniques associated with hard bodybuilding — forced reps, extended sets, partner-assisted finishes — appear in the cultural memory of Platz-style training, but they should be treated as advanced tools layered onto already competent squat mechanics, not as the starting curriculum.

Exercise execution is part of the method story as well. Depth standards, upright torso control under fatigue, and refusal to shorten the range when the set gets hard are repeatedly implied by how Platz discusses effort. Without those standards, “high-rep squatting” collapses into partials and ego loading.`,

      "training-structure": `Public discussion of Platz’s legs often implies a structure dominated by back squats as the cornerstone, with assistance via machines and isolation (hack squats, extensions, curls, calves) appearing in secondary summaries. Frequency of the most brutal sessions is commonly described as low relative to the damage done — hard legs may be spaced to allow repair.

Volume distribution on a hard day skews heavily toward squatting and quad-dominant work. Intensity is paradoxical to casual observers: loads look “heavy” yet reps climb into ranges many lifters reserve for light pump work. Progression, in Platz’s public framing, is less about a spreadsheet wave and more about accomplishing predetermined hard targets with full effort.

Recovery structure is the silent partner. If the hard squat day is truly extreme, the rest of the week must respect that cost. Lifters who copy the spectacle set and also run high-frequency heavy lower-body sport training often collide with reality.

A coaching-friendly way to map the structure without inventing a fake permanent programme is to think in layers: (1) a primary squat pattern practised with intentional effort, (2) secondary quad and hamstring machines that extend local stimulus without requiring another all-out free-weight war, (3) calves and isolation finishers as budget items, and (4) easy days that protect the next hard exposure. That layered reading is original analysis for modern programming — not a claim that Platz published this exact weekly map forever.`,

      "volume-intensity-frequency": `Independent analysis: Platz-style work is not “volume training” in the sense of easy high-rep circuits. It is high effort × challenging load × high reps, which is a different animal.

Frequency must fall as per-session brutality rises. A viral 50-rep set cannot be the Monday-and-Thursday default for most humans. A modern reading separates: (a) rare exposure sessions that build psychological and physiological reserve, (b) repeatable weekly hypertrophy work in challenging but sane rep ranges (for example, hard sets in the teens), and (c) technique practice at submaximal fatigue.

Conflicting reports about exact weekly frequencies exist in secondary media. This profile therefore prioritises Platz’s stated principles over any one blog’s timetable.

Volume should be counted as hard sets that meet a depth and effort standard, not as every warm-up or partial. Intensity techniques raise the cost of each set; adding them while also raising frequency is how many lifters overreach. The productive middle path for non-elites is usually: keep one lower-body session meaningfully hard, keep another moderate, and reserve true extreme high-rep tests for rare checkpoints rather than weekly identity.`,

      "why-it-worked": `Extreme leg development under this philosophy makes sense when specificity (quad-dominant aesthetics), mechanical tension at meaningful loads, metabolic stress from long sets, and enormous technical practice under fatigue combine — in an athlete with the experience and recovery to survive it. Bodyweight and stage goals favoured muscular legs over powerlifting squat peaking. Sport demands rewarded the look. Long-term adaptation came from years of progressive exposure, not from copying the famous set on week one.

Psychological effort is not fluff here: chunking and refusing to “leave a loser” are part of the documented method story and helped complete workloads that look impossible when viewed only as numbers.

Selection effects also matter. Athletes who could tolerate deep, high-rep squatting stayed in the conversation; those who could not disappeared from the highlight reels. That does not invalidate the method’s useful ideas — it explains why the public archive is biased toward survivors of extreme work. For modern lifters, the lesson is to borrow the psychology and progressive high-rep courage while refusing to treat outlier performances as normative dosing.`,

      "what-lifters-get-wrong": `Lifters get Platz wrong when they treat a legendary set as a weekly programme. They also fail when they chase high reps with loads they cannot control through full depth, or when they ignore that Platz himself has discussed blending heavy and higher-rep emphases rather than living at the extreme every session.

Avoid medical scare language; stay practical: if knees, hips, or back are complaining, reduce load, reps, or frequency before adding intensity techniques. Viral sessions are entertainment and inspiration — not auto-programming.

Additional failure modes: filming a personal “50-rep challenge” without safety pins or a competent spotter; stacking forced reps onto already failing technique; copying only the squat and neglecting posterior-chain balance; and assuming that because a session looked legendary on camera, it represented every week of an annual plan. Famous one-off sets and repeatable programming are different categories. Treat them that way.`,

      "risks-and-recovery": `Primary risks are technical breakdown deep in high-rep sets, knee and lumbar irritation, and systemic overreaching from repeating maximal-effort lower sessions too often. Recovery may require multiple easy days after a true Platz-inspired hard squat exposure.

Modern controls: cap effort most weeks, use spotters/safety pins, define depth standards before adding load, and keep extreme high-rep tests rare.

Recovery planning should be explicit. After a hard high-rep squat day, expect reduced jumping, sprinting, or maximal deadlift ambition for several days. Nutrition and sleep are not optional add-ons; they are what make the hard day productive rather than merely damaging. If performance on the next hard session is clearly worse for two consecutive weeks, cut volume or intensity before adding more inspirational brutality.`,

      "verdict": `The Strongest Manager verdict: Platz’s legacy teaches the power of hard, high-rep loading and mental chunking — and simultaneously teaches humility. Spectacular sets are not a syllabus. Programme the principle; quarantine the spectacle. Ordinary lifters should not copy elite highlight volume or effort exactly. Use challenging, repeatable squat work; keep extremes rare; and never confuse a viral session with a complete programme.`,

      "modernised-application": `Modernise by prescribing challenging-but-repeatable squat volumes, occasional high-rep emphasis blocks, and clear recovery spacing. Never present a reconstructed week as Platz’s exact routine. See modernAdaptation for dose rules.

A practical sequence for intermediates: establish consistent depth and bracing on back squat or a close variant; build hard sets in the 8–15 range with one to three reps in reserve; then, for short blocks, push selected top sets into higher reps at a reduced load while keeping weekly hard-set totals honest. Advanced lifters may schedule a rare high-rep exposure with full safety setup after accumulating months of competent volume. Beginners should learn the squat pattern first and ignore celebrity leg-day folklore. Related generic programmes on this site are better entry points than attempt-to-copy highlight reels.`,

      "example-training-week": `The example week is an original modernised illustration of hard/easy lower-body contrast — not a viral session clone. It shows how to keep one session meaningfully difficult while protecting recovery elsewhere. Adjust loads to technical quality. Do not treat any day as a transcript of Platz’s permanent programme.`,

      sources: `Sources emphasise Platz’s own public statements via reputable interview outlets and recognised bodybuilding media. Workout aggregators and unsourced “Platz routine” PDFs are secondary at best. Where a claim depends only on a blog chart, this profile leaves it out or marks it as unverified.`,
    },
    {
      "athlete-and-era": [1, 2],
      "documented-training-method": [1, 2, 3],
      "volume-intensity-frequency": [1, 3],
      "why-it-worked": [2],
    },
  ),
  trainingStructure: {
    trainingDays:
      "Hard leg emphasis days are the centrepiece; remaining days must respect residual fatigue",
    exerciseFrequency:
      "Brutal squat sessions often discussed as relatively infrequent; lighter technique or moderate hypertrophy work may fill gaps",
    volumeDistribution: [
      { label: "Back squat / primary squat work", share: 45 },
      { label: "Hack / press machine quad work", share: 20 },
      { label: "Extensions / curls", share: 20 },
      { label: "Calves / other", share: 15 },
    ],
    intensityDistribution: [
      { label: "Challenging load × high reps", share: 55 },
      { label: "Moderate hypertrophy accessories", share: 30 },
      { label: "Easy technique / recovery work", share: 15 },
    ],
    primaryMovements: ["Back squat", "Hack squat or leg press variations"],
    accessoryWork: ["Leg extensions", "Leg curls", "Calf raises"],
    progressionApproach:
      "Public framing emphasises accomplishing hard predetermined rep/load targets; blend heavy and higher-rep emphases across days",
    recoveryStructure:
      "Space extreme sessions; treat residual soreness and performance as governors",
  },
  whyItWorked: {
    specificity: "Training chased exceptional quadriceps development for physique competition.",
    volume: "High-rep squat sets created enormous cumulative work when loads stayed meaningful.",
    intensity: "Loads remained challenging rather than ‘light pump’ weights for many famous efforts.",
    technicalPractice: "Years of squat practice under fatigue refined a signature movement pattern.",
    athleteExperience: "Extreme sessions sat on top of a long base — not a novice experiment.",
    bodyweight: "Competitive physique bodyweights supported the training goal of muscular legs.",
    recovery: "Hard sessions imply large recovery investments between brutal exposures.",
    sportDemands: "Bodybuilding rewarded the visual outcome of that specialised work.",
    longTermAdaptation: "The famous sets were peaks of a long process, not the process itself.",
  },
  whatLiftersGetWrong: [
    "Turning a legendary one-off set into twice-weekly programming",
    "High reps with uncontrolled depth or collapsed bracing",
    "Ignoring Platz’s own comments about blending heavy and higher-rep emphases",
    "Copying accessories lists from unsourced blogs as gospel",
    "Underestimating recovery after true high-rep heavy squat sessions",
  ],
  exampleWeek: {
    title: "Modernised hard/easy lower-body contrast (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest Manager illustration. Not Tom Platz’s exact programme and not a recreation of any single viral session as weekly law.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Hard squat emphasis (challenging load, higher reps)",
        notes: "Example target zone: several quality sets in a hard but controlled high-rep range — stop before technical collapse",
      },
      {
        dayLabel: "Day 2",
        focus: "Upper body",
        notes: "Keep systemic fatigue manageable",
      },
      {
        dayLabel: "Day 3",
        focus: "Easy lower recovery / technique",
        notes: "Light hinge or bike; mobility; no ego loading",
      },
      {
        dayLabel: "Day 4",
        focus: "Upper body",
        notes: "Standard hypertrophy work",
      },
      {
        dayLabel: "Day 5",
        focus: "Moderate quad accessories",
        notes: "Extensions/press variations; leave reps in reserve",
      },
      {
        dayLabel: "Day 6–7",
        focus: "Rest or easy conditioning",
        notes: "If Day 1 was truly hard, do not add another maximal lower session this week",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Borrow Platz’s respect for hard, high-rep loading and mental chunking, while programming repeatable weekly work and quarantining spectacle sets.",
    beginnerAdjustment:
      "Learn squat depth and bracing with submaximal sets of 5–10; no 30+ rep tests.",
    intermediateAdjustment:
      "One weekly hard squat day in the 10–20 rep neighbourhood with controlled RPE; accessories moderate.",
    advancedAdjustment:
      "Short blocks with top sets in higher reps at challenging loads; use chunking psychologically; space hard days 7–14 days apart when brutality rises.",
    recommendedFrequency: "1 hard lower session weekly for most; advanced may add a light technique day",
    recoveryControls: [
      "Safety pins / competent spotting on hard days",
      "Stop sets when depth or bracing degrades",
      "Extra easy days after breakthrough high-rep efforts",
      "Monitor knee/hip symptoms and reduce dose early",
    ],
    progressionRules: [
      "Increase load only when all target reps are clean",
      "Progress rep targets before load when building high-rep capacity",
      "Keep extreme test days rare and planned",
    ],
    whenToReduceVolume:
      "Persistent knee pain, lumbar fatigue, or a second hard session that cannot recover before the next week",
    whoShouldAvoid: [
      "Beginners",
      "Lifters with unresolved lower-body injuries",
      "Athletes in a heavy strength peaking cycle",
    ],
  },
  relatedProgrammes: [
    {
      slug: "powerbuilding-hybrid",
      title: "Extreme Leg Development Block",
      href: "/programs/powerbuilding-hybrid",
      relationship:
        "Original The Strongest Manager programme applying related lower-body hypertrophy emphasis without athlete naming",
    },
  ],
  sources: [
    {
      title:
        "Tom Platz Shares his Secret to Bodybuilding: “The Reps are More Important Than the Heavy Weight”",
      publisher: "Generation Iron",
      url: "https://generationiron.com/tom-platz-secret-to-bodybuilding-reps-more-important-heavy-weight/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: [
        "documented-training-method",
        "volume-intensity-frequency",
        "athlete-and-era",
      ],
    },
    {
      title:
        "Tom Platz Discusses His Approach to Squatting 405 Lbs for 50 Reps",
      publisher: "Fitness Volt",
      url: "https://fitnessvolt.com/tom-platz-squat-approach/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["documented-training-method", "why-it-worked", "athlete-and-era"],
    },
    {
      title: "High repetitions with heavy weight are key for the muscles, says Tom Platz",
      publisher: "kulturistika.com",
      url: "https://www.kulturistika.com/en/magazine/fitness-espresso/high-repetitions-with-heavy-weight-are-key-for-the-muscles-says-tom-platz",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["documented-training-method", "volume-intensity-frequency"],
    },
    {
      title: "Arnold Schwarzenegger-era bodybuilding culture context (Encyclopedia)",
      publisher: "Simon & Schuster",
      author: "Arnold Schwarzenegger; Bill Dobbins",
      url: "https://www.simonandschuster.com/books/The-New-Encyclopedia-of-Modern-Bodybuilding/Arnold-Schwarzenegger/9780684857213",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "book",
      supports: ["athlete-and-era"],
    },
    {
      title: "Tom Platz Talks How He Managed to Squat 405 Lbs for 50 Reps",
      publisher: "Fitness and Power",
      url: "https://www.fitnessandpower.com/fitness-stories/tom-platz-405-lbs-for-50-reps",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["documented-training-method"],
    },
  ],
  seo: {
    title: "Tom Platz Extreme Leg Training Analysis | High-Rep Squats",
    description:
      "Independent analysis of Tom Platz’s extreme leg-training philosophy — high-rep heavy squats, effort psychology, recovery cost, and why viral sets are not a programme.",
    canonicalPath: "/legendary-methods/tom-platz-extreme-leg-training",
    keywords: [
      "tom platz leg training",
      "high rep squat training",
      "quadfather training analysis",
      "extreme leg hypertrophy",
    ],
  },
  updatedAt: CONTENT_ACCESS_DATE,
};
