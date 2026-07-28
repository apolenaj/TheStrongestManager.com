import {
  CONTENT_ACCESS_DATE,
  LEGENDARY_PUBLISH_DATE,
  sectionsWithBodiesForSlug,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Arnold Schwarzenegger — Golden Era volume analysis (Prompt 5A).
 * Original editorial synthesis from public books/interviews — not a reprint of any routine.
 * Published after editorial content + historical documentation pass (Prompt premium publish).
 */
export const ARNOLD_SCHWARZENEGGER_GOLDEN_ERA_VOLUME: LegendaryMethodProfile = {
  slug: "arnold-schwarzenegger-golden-era-volume",
  status: "published",
  legalReviewStatus: "passed",
  publishedAt: LEGENDARY_PUBLISH_DATE,
  updatedAt: LEGENDARY_PUBLISH_DATE,
  athleteName: "Arnold Schwarzenegger",
  profileTitle: "Arnold Schwarzenegger — Analysis of Golden Era Volume",
  shortTitle: "Golden Era Volume",
  category: "bodybuilding",
  era: "Golden Era bodybuilding (late 1960s–1970s peak competition years)",
  nationality: "Austrian / American",
  sportLabel: "Bodybuilding",
  summary:
    "An independent analysis of high-frequency, high-volume Golden Era bodybuilding as documented in Arnold Schwarzenegger’s major published training texts and later instructional writing — focusing on principles, context, and recovery cost rather than treating any single template as a permanent ‘Arnold programme’.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Arnold Schwarzenegger. Descriptions synthesise publicly available publications; they do not reproduce copyrighted routines, tables, or book chapters. Modernised examples are original The Strongest Manager interpretations.",
  keyCharacteristics: [
    "High weekly training frequency for major muscle groups",
    "High set volume across multiple exercises per body part",
    "Antagonist and same-muscle supersets as intensity/density tools",
    "Progressive overload framed as continual drive in weight or work",
    "Competition-era context that ordinary lifters should not copy wholesale",
  ],
  bestFor: [
    "Intermediate-plus physique-focused lifters with strong recovery capacity",
    "Athletes exploring antagonist pairing and training density",
    "Coaches studying historical high-volume hypertrophy culture",
  ],
  notRecommendedFor: [
    "Beginners still learning basic squat, hinge, press, and pull patterns",
    "Lifters with unresolved joint pain or sleep/nutrition deficits",
    "Anyone seeking a minimal effective-dose strength programme",
  ],
  trainingDays: "Often described as near-daily training in competition phases; frequency varied by era and goal",
  quickProfile: {
    primaryGoal: "Muscular size, shape, and stage conditioning",
    typicalFrequency: "Major groups often trained ~2–3×/week in documented competition-era templates",
    volumeLevel: "Very high relative to modern ‘minimum effective dose’ hypertrophy",
    intensityProfile: "Moderate-to-heavy loads with high effort; frequent failure/near-failure reporting in popular accounts",
    recoveryDemand: "Very high — sleep, food, and schedule were part of the system",
    technicalDifficulty: "Moderate movement difficulty; high organisational and recovery difficulty",
    bestSuitedFor: "Advanced physique athletes with coaching/support and time",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 6,
      justification:
        "Builds substantial strength via compounds, but the primary target is hypertrophy and appearance rather than peaking maximal strength.",
    },
    hypertrophyPotential: {
      value: 9,
      justification:
        "Very high weekly set volumes and multi-exercise body-part coverage align with classical hypertrophy stimulus when recovery allows.",
    },
    recoveryDemand: {
      value: 9,
      justification:
        "High frequency plus high set counts create large systemic and local fatigue; poorly recovered lifters stall or regress quickly.",
    },
    technicalDifficulty: {
      value: 5,
      justification:
        "Movements are mostly standard bodybuilding patterns; difficulty is managing volume, effort, and exercise sequencing—not exotic skill lifts.",
    },
    beginnerSuitability: {
      value: 2,
      justification:
        "Beginners need pattern mastery and lower absolute volume; copying competition-era set counts is a common failure mode.",
    },
    advancedSuitability: {
      value: 8,
      justification:
        "Advanced physique athletes can selectively borrow density tools (antagonist supersets) and frequency ideas with dose control.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Primary evidence is athlete-authored or co-authored published books plus later instructional columns on official/reputable channels. Exact session logs vary by period; conflicting popular summaries exist, so claims about any single permanent routine are treated cautiously.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodiesForSlug(
    "arnold-schwarzenegger-golden-era-volume",
    {
      "athlete-and-era": `Arnold Schwarzenegger’s competitive bodybuilding rise sits inside what later writers call the Golden Era: a culture of high training density, physique aesthetics as the scoring criterion, and gyms that normalised long sessions. The relevant stage for this analysis is not celebrity biography — it is the period when his training ideas were formalised for a mass audience through major books, especially The New Encyclopedia of Modern Bodybuilding (with Bill Dobbins) and earlier autobiographical training narrative in Arnold: The Education of a Bodybuilder.

In that context, “volume” is not a single number. It is a package: how often a muscle is trained each week, how many exercises and sets appear in a session, how little rest is left between paired movements, and how close sets are taken to failure. Golden Era culture rewarded visible muscularity under stage lighting. That incentive structure pulled programmes toward frequent stimulation and high local fatigue, not toward the sparse templates popular in some modern strength sports.

It also mattered who was recovering. Competitive bodybuilders of that era often organised life around training, food, and sleep in ways recreational lifters cannot. Any honest analysis has to separate the published training ideas from the support systems around them.

Double-split claims belong in this era discussion as a contextual tactic, not as a timeless commandment. Training twice in one day appears in popular and published discussions of high-ambition phases when schedule and recovery support allowed denser weekly stimulus. That is different from asserting that every year of Arnold’s career ran the same double-day calendar. Ordinary lifters reading secondary charts often miss that distinction and treat a competition-phase density tool as a permanent identity.`,

      "documented-training-method": `Documented discussions of Arnold’s approach repeatedly emphasise high set volume for body parts, training major groups multiple times per week in competition-oriented templates, and heavy use of intensity techniques — especially supersets.

In later instructional writing attributed to Arnold (including FLEX/Muscle & Fitness columns and material hosted on schwarzenegger.com), supersets are defined as performing two exercises successively with little or no rest. A preferred pairing pattern is antagonist work: chest with back, biceps with triceps, quadriceps with hamstrings. The stated rationale is practical densification (more work per unit time) and a claimed neuromuscular priming effect when a pull is followed by a push (or vice versa). Same-muscle compound sets (two exercises for one body part back-to-back) are also described as a way to raise metabolic stress and time under tension.

Exercise selection in the published teaching tradition favours a blend of free-weight compounds and classical isolation finishers rather than novelty for its own sake. Progression is culturally framed as continual improvement — more load, more quality reps, or denser work — rather than as a modern percentage-based peaking wave. Differences between documented routines from different periods are expected: career phase, contest proximity, and publication edition all change the chart a reader finds.

Important uncertainty: popular internet “Arnold routines” often present one split as permanent. Published sources and secondary summaries describe more than one competition-era structure (including variations where major groups appear roughly twice weekly versus higher-frequency examples). Because those templates differ, this profile treats high frequency and high volume as the durable theme — not one immortal weekly timetable.

What is not claimed here: a verbatim reproduction of encyclopedia tables, set-by-set prescriptions, or any assertion that a blog PDF is “Arnold’s exact permanent programme.” Where secondary sites reprint detailed charts, they are treated as contested popularisations unless tied back to the books themselves.`,

      "training-structure": `Structurally, Golden Era volume training (as associated with Arnold’s published teaching) tends to organise the week around body-part coverage rather than a single full-body strength practice. Sessions often stack multiple exercises per muscle, then rotate through the body across consecutive training days.

Frequency is a first-class variable. Documented competition-oriented examples associated with the encyclopedia tradition describe major muscle groups appearing more than once per week. That raises both stimulus and recovery cost compared with once-weekly “bro split” stereotypes.

Volume distribution typically favours the showpiece upper-body musculature and legs with large absolute set counts, while calves, arms, and midsection receive dedicated high-repetition work in many popular accounts. Intensity distribution mixes heavier compound presses/rows/squats with higher-rep isolation finishers. Progression is framed culturally as continual improvement in load or work completed — not as a fixed percentage wave like modern powerlifting peaking models.

Recovery structure, in the books’ own framing, is not optional fluff: sleep, nutrition, and rest are presented as part of making extreme workloads productive. That is a critical teaching point for modern readers who copy the set counts and skip the recovery infrastructure.`,

      "volume-intensity-frequency": `From an independent coaching lens, the method’s signature is the product of three dials turned high at once: frequency × sets × effort.

Frequency multiplies practice opportunities and residual fatigue. High set volume multiplies local damage and metabolic stress. High effort (including failure-oriented culture in many accounts) multiplies the recovery bill further. Any one dial can be productive; all three together is an advanced strategy.

Ordinary lifters often misunderstand volume as “more exercises = more growth” without tracking weekly hard sets or performance. Golden Era templates can look like random exercise lists when stripped of progression rules. A better reading is: choose a manageable weekly set budget per muscle, distribute it across 2+ exposures if recovery allows, and use antagonist supersets to raise density without automatically adding rest-period fluff.

Conflicting information note: secondary websites disagree on exact weekly splits and set totals. Until a claim is pinned to a specific published edition and page context, treat numeric “Arnold did X sets of Y every Monday forever” statements as low confidence.`,

      "why-it-worked": `Why such workloads could produce outstanding physiques for a tiny population of athletes is multi-factorial. Specificity favoured posing-relevant hypertrophy and muscular detail. Volume and frequency provided repeated high-tension practice. Technical practice on the same families of presses, rows, squats, and isolation movements was enormous across years. Athlete experience and selection effects matter: people who thrived under the culture stayed visible. Bodyweight and stage goals differed from powerlifting totals. Recovery resources (time, food, pharmacology contexts discussed historically in the sport, coaching environments) were often far above recreational norms. Sport demands rewarded looking a certain way on a certain day — not preserving joints for a decade of maximal singles.

Long-term adaptation for Arnold personally is inseparable from decades of progressive exposure. Copying the end-stage workload without the ramp is the classic error.

A useful way to read the success story without myth-making is to treat Golden Era volume as a high-dose hypertrophy laboratory that happened to be culturally fashionable. Antagonist supersets raised work density. High frequency kept skills sharp. Isolation finishers chased shape after compounds had already done the heavy structural work. None of those tools is magic in isolation; the combination, sustained for years by athletes who could recover, is what magazines later romanticised.

For coaches, the transferable lesson is not “do more forever.” It is that density tools, multi-exposure scheduling, and deliberate exercise variety can expand the hypertrophy toolbox — provided weekly hard-set budgets remain honest and recovery constraints are treated as hard limits rather than optional lifestyle advice.`,

      "what-lifters-get-wrong": `Most lifters get Golden Era volume wrong by treating the highest reported templates as a personality test. They add supersets on day one, train close to failure on every set, sleep poorly, and call the method ineffective when they stall.

Other common mistakes: assuming one viral chart is the only authentic programme; ignoring that documented structures changed across career phases; using isolation volume before compounds are stable; and confusing “Arnold trained a lot” with “any high-rep pump work equals the method.”

Lifters also misread double-split claims. Training twice in a day can be a competition-phase density tactic for athletes with time, food, and recovery support — not a moral obligation for office workers. Another failure mode is copying exercise lists while ignoring progression: without tracking load, reps, or weekly hard sets, high volume becomes random fatigue.

This profile deliberately avoids medical diagnosis language. The practical warning is recovery economics: if performance, mood, and joint comfort are degrading week to week, volume is too high for your current constraints — regardless of whose name is on the PDF. Ordinary lifters should not copy the highest reported competition-era set counts exactly. Scale the principle; quarantine the celebrity dose.`,

      "risks-and-recovery": `Risk concentrates in tendons, lumbar tolerance under fatigue, and systemic under-recovery. High-frequency pressing and curling volumes can irritate elbows and shoulders when technique decays. Squatting and hinging under accumulated fatigue raise technical risk if ego loading replaces controlled reps.

Recovery demands scale with set counts and proximity to failure. Lifters without the ability to eat and sleep like a competitive bodybuilder should cut weekly hard sets first, not “try harder.” Deloads, exercise rotation, and capping failure sets are modern controls that preserve the useful ideas without importing the full historical dose.

A practical recovery checklist for anyone inspired by Golden Era density: protect seven-plus hours of sleep when possible, keep protein and total calories sufficient for the workload, schedule at least one easier week every four to six hard weeks, and stop adding exercises when the existing ones are already stalling. If antagonist supersets are used, rest between pairs still matters — density is a tool, not a race to collapse form.`,

      "verdict": `The Strongest Manager verdict: Golden Era volume training is historically important and still instructive for hypertrophy density and antagonist pairing — but it is a poor default for beginners and a dangerous cosplay target when copied at encyclopedia competition doses. Borrow principles; do not worship a single chart. Never treat any reconstructed week as Arnold’s permanent exact programme. The durable takeaways are multi-exposure frequency when recovered, antagonist densification used deliberately, and progression tracked honestly — not maximal set lists from contested secondary reprints.`,

      "modernised-application": `A modernised application keeps antagonist supersets, multi-exposure frequency where recovered, and progressive overload — while capping weekly hard sets, limiting failure, and protecting sleep. Beginners should not start here. Intermediates may run moderate volumes with one antagonist pairing block. Advanced physique athletes may push density in short mesocycles with planned deloads. See the structured modernAdaptation fields for dose guidance.

Practically, start by auditing current weekly hard sets per muscle, then decide whether frequency or density is the constraint you want to improve. Add one antagonist pairing (for example chest/back or biceps/triceps) for four weeks before expanding further. Keep most sets one to three reps in reserve. Treat any double-session day as an advanced, temporary experiment with reduced per-session volume — not as a lifestyle default. Related generic programmes on this site are the safer entry points when the goal is progressive overload without elite cosplay.`,

      "example-training-week": `See the labelled example week object. It is an original modernised illustration of frequency and antagonist density ideas — not a reprint of encyclopedia tables and not an athlete’s exact routine. Use it as a coaching sketch for intermediate densification, then adjust set counts to performance and recovery rather than to celebrity folklore.`,

      sources: `Primary references are listed in the numbered Sources section: athlete-authored/co-authored books and instructional pieces on reputable channels. Secondary workout aggregators are not treated as primary evidence for exact permanent programmes. Where popular charts conflict with published teaching, this profile prefers the books and official instructional columns and marks numeric permanence claims as uncertain.`,
    },
    {
      "athlete-and-era": [1, 2],
      "documented-training-method": [1, 3, 4, 5],
      "training-structure": [1, 2],
      "volume-intensity-frequency": [1, 3],
    },
  ),
  trainingStructure: {
    trainingDays:
      "Competition-oriented templates associated with published teaching often imply near-daily training with rotating body-part emphasis",
    exerciseFrequency:
      "Major muscle groups commonly appear ~2–3 times per week in documented high-frequency examples; exact splits vary by source/period",
    volumeDistribution: [
      { label: "Chest / back compounds & accessories", share: 28 },
      { label: "Legs (squat/press + isolation)", share: 24 },
      { label: "Shoulders & arms", share: 22 },
      { label: "Calves / midsection / other", share: 26 },
    ],
    intensityDistribution: [
      { label: "Primary compounds (heavier)", share: 35 },
      { label: "Secondary compounds", share: 30 },
      { label: "Isolation / density techniques", share: 35 },
    ],
    primaryMovements: [
      "Barbell and dumbbell presses",
      "Rows and pulldown/pull-up variations",
      "Squats and leg presses",
      "Overhead presses",
    ],
    accessoryWork: [
      "Flye / crossover patterns",
      "Leg extensions and curls",
      "Curl and extension variations",
      "Calf raises and midsection work",
    ],
    progressionApproach:
      "Published teaching emphasises continual improvement in load or completed work; not a single fixed percentage wave",
    recoveryStructure:
      "Sleep, nutrition, and rest are framed as enabling high volume — not optional add-ons",
  },
  whyItWorked: {
    specificity:
      "Training targeted muscular size and shape for physique competition judging, not a powerlifting total.",
    volume:
      "High weekly sets and multi-exercise coverage created large cumulative tension and metabolic stress when recovered.",
    intensity:
      "Loads were often substantial for bodybuilding, with cultural acceptance of very hard sets and density techniques.",
    technicalPractice:
      "Years of repeated practice on the same movement families refined execution under fatigue.",
    athleteExperience:
      "Long runway of progressive exposure before the highest reported workloads.",
    bodyweight:
      "Competitive bodyweights and stage conditioning goals differed from strength-sport weight-class strategies.",
    recovery:
      "Lifestyle support around training was typically far above recreational norms.",
    sportDemands:
      "Winning required looking a certain way on contest day; programmes chased that outcome.",
    longTermAdaptation:
      "Visible success reflected decades of adaptation and selection, not a two-week copy of a famous chart.",
  },
  whatLiftersGetWrong: [
    "Treating one popular PDF as the permanent exact Arnold programme",
    "Copying peak competition set counts without peak recovery capacity",
    "Adding supersets and failure work before technique is stable",
    "Ignoring that documented templates differ across periods and publications",
    "Confusing high fatigue with productive hypertrophy stimulus",
  ],
  exampleWeek: {
    title: "Modernised antagonist-density illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest Manager example showing how antagonist pairing and multi-exposure frequency can be dosed for an advanced physique lifter. Not Arnold Schwarzenegger’s exact programme and not a reprint of encyclopedia tables.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Chest / back antagonist density",
        notes: "Pair a press with a row pattern; keep 1–2 reps in reserve on most sets",
      },
      {
        dayLabel: "Day 2",
        focus: "Squat pattern + posterior chain accessories",
        notes: "Moderate hard sets; avoid turning every set into a failure contest",
      },
      {
        dayLabel: "Day 3",
        focus: "Shoulders / arms",
        notes: "Optional antagonist curl–extension supersets late in session",
      },
      {
        dayLabel: "Day 4",
        focus: "Rest or easy mobility",
        notes: "Protect sleep and food intake",
      },
      {
        dayLabel: "Day 5",
        focus: "Second upper exposure (lighter density)",
        notes: "Fewer hard sets than Day 1; emphasise quality",
      },
      {
        dayLabel: "Day 6",
        focus: "Second lower exposure",
        notes: "Hinge emphasis or reduced squat volume versus Day 2",
      },
      {
        dayLabel: "Day 7",
        focus: "Rest",
        notes: "Deload week every 4–6 weeks if performance stalls",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep the useful Golden Era ideas — multi-exposure frequency when recovered, antagonist supersets for density, progressive overload — while discarding the assumption that encyclopedia competition volumes are a universal prescription.",
    beginnerAdjustment:
      "Full-body or upper/lower 3–4 days/week; 6–10 hard sets per major muscle weekly; no failure-first culture; learn compounds before density tricks.",
    intermediateAdjustment:
      "Push-pull-legs or upper/lower with ~10–16 hard sets per muscle weekly; introduce antagonist supersets on isolation pairings only.",
    advancedAdjustment:
      "Short mesocycles with higher density and occasional near-failure finishers; track performance; planned deloads; never chase celebrity set counts for ego.",
    recommendedFrequency: "3–6 training days depending on recovery; major muscles 2×/week as a default modern target",
    recoveryControls: [
      "Cap weekly hard sets before adding more exercises",
      "Limit true failure sets to late isolation work",
      "Deload when bar speed or motivation falls for 7–10 days",
      "Prioritise sleep and protein before ‘more volume’",
    ],
    progressionRules: [
      "Add load when all target reps are hit with solid technique",
      "Add a set only after loads stall for 2–3 weeks",
      "Rotate pressing/rowing variations every 6–8 weeks if joints complain",
    ],
    whenToReduceVolume:
      "Persistent strength drop, rising resting fatigue, or joint irritation that does not settle with technique fixes",
    whoShouldAvoid: [
      "Beginners",
      "Lifters in a calorie deficit with poor sleep",
      "Athletes peaking maximal strength sports who need lower fatigue",
    ],
  },
  relatedProgrammes: [
    {
      slug: "powerbuilding-hybrid",
      title: "Golden Era High-Volume Hypertrophy",
      href: "/programs/powerbuilding-hybrid",
      relationship:
        "Original The Strongest Manager programme applying related hypertrophy-density principles without athlete naming",
    },
  ],
  sources: [
    {
      title: "The New Encyclopedia of Modern Bodybuilding",
      publisher: "Simon & Schuster",
      author: "Arnold Schwarzenegger; Bill Dobbins",
      url: "https://www.simonandschuster.com/books/The-New-Encyclopedia-of-Modern-Bodybuilding/Arnold-Schwarzenegger/9780684857213",
      publicationDate: "1999 (rev. ed. widely circulated; earlier editions exist)",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "book",
      supports: [
        "athlete-and-era",
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
    {
      title: "Arnold: The Education of a Bodybuilder",
      publisher: "Simon & Schuster",
      author: "Arnold Schwarzenegger; Douglas Kent Hall",
      url: "https://www.simonandschuster.com/books/Arnold/Arnold-Schwarzenegger/9780671797485",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "book",
      supports: ["athlete-and-era", "training-structure"],
    },
    {
      title: "Arnold Schwarzenegger: Super Intense (superset guidelines)",
      publisher: "Muscle & Fitness / FLEX Online",
      author: "Arnold Schwarzenegger",
      url: "https://www.muscleandfitness.com/flexonline/training/arnold-schwarzenegger-super-intense/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["documented-training-method", "volume-intensity-frequency"],
    },
    {
      title: "The Science of Advanced Bodybuilding Exercise Prescription",
      publisher: "schwarzenegger.com",
      url: "https://www.schwarzenegger.com/fitness/post/the-science-of-advanced-bodybuilding-exercise-prescription",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["documented-training-method"],
    },
    {
      title: "Arnold's Bodybuilding for Men",
      publisher: "Simon & Schuster",
      author: "Arnold Schwarzenegger; Bill Dobbins",
      url: "https://www.simonandschuster.com/books/Arnolds-Bodybuilding-for-Men/Arnold-Schwarzenegger/9780671531638",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "book",
      supports: ["documented-training-method"],
    },
  ],
  seo: {
    title: "Arnold Schwarzenegger Golden Era Volume Training Analysis",
    description:
      "Independent analysis of Golden Era high-volume bodybuilding principles associated with Arnold Schwarzenegger — frequency, supersets, recovery cost, and why not to copy peak competition workloads.",
    canonicalPath: "/legendary-methods/arnold-schwarzenegger-golden-era-volume",
    keywords: [
      "golden era volume training",
      "arnold schwarzenegger training analysis",
      "antagonist supersets",
      "high volume bodybuilding",
    ],
  },
};
