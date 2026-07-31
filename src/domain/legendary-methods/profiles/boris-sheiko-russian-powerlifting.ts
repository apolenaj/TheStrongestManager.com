import {
  CONTENT_ACCESS_DATE,
  LEGENDARY_PUBLISH_DATE,
  sectionsWithBodiesForSlug,
} from "@/domain/legendary-methods/profiles/helpers";
import { sheikoVersusConjugateComparison } from "@/domain/legendary-methods/profiles/sheiko-vs-conjugate";
import { fromEnglishProfile } from "@/domain/legendary-methods/from-english";

/**
 * Boris Sheiko — Russian powerlifting systems analysis (Prompt 5D).
 * Principles from public books, seminars and reputable coverage — not a reprint of numbered templates.
 */
export const BORIS_SHEIKO_RUSSIAN_POWERLIFTING = fromEnglishProfile({
  slug: "boris-sheiko-russian-powerlifting",
  status: "published",
  legalReviewStatus: "passed",
  publishedAt: LEGENDARY_PUBLISH_DATE,
  updatedAt: LEGENDARY_PUBLISH_DATE,
  athleteName: "Boris Sheiko",
  profileTitle: "Boris Sheiko — Understanding Russian Powerlifting Systems",
  shortTitle: "Russian Powerlifting Systems",
  category: "training-system",
  era: "Russian / Soviet-influenced powerlifting coaching tradition (late 20th century–present English documentation)",
  nationality: "Russian",
  sportLabel: "Powerlifting",
  summary:
    "An independent educational analysis of powerlifting systems strongly associated with coach Boris Sheiko: high competition-lift frequency, submaximal volume, multi-exposure sessions, technical practice, block progression and fatigue management — plus why blindly copying a numbered internet template is not the same as understanding Sheiko principles. Includes a Sheiko vs Conjugate comparison. Not a reprint of copyrighted books or paid programmes.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Boris Sheiko. Descriptions synthesise publicly discussed principles from books, seminars and reputable publications. This page does not reproduce copyrighted book chapters, paid templates, or complete proprietary programmes. Numbered internet spreadsheets are treated as popularisations, not as official permanent programmes.",
  keyCharacteristics: [
    "High weekly frequency of competition squat, bench and deadlift",
    "Predominantly submaximal loading with high technical quality",
    "Multiple exposures to lifts within a week and often within sessions",
    "Block periodisation toward competition peaking",
    "Fatigue managed through intensity restraint and wave loading rather than constant maxing",
  ],
  bestFor: [
    "Intermediate-plus raw powerlifters who recover well from technical volume",
    "Coaches studying high-frequency submaximal total building",
    "Lifters who need more competition-lift practice, not more novelty",
  ],
  notRecommendedFor: [
    "Absolute beginners still learning commands",
    "Lifters with poor recovery who cannot tolerate high weekly lift counts",
    "Anyone treating a leaked numbered spreadsheet as a personalised coaching plan",
  ],
  trainingDays:
    "Public accounts commonly describe 3–4+ training days with competition lifts appearing multiple times weekly; exact calendars vary by athlete and block",
  quickProfile: {
    primaryGoal: "Raise the powerlifting total via technical volume and periodised peaking",
    typicalFrequency: "Competition lifts often trained several times per week in documented Sheiko-associated approaches",
    volumeLevel: "High cumulative tonnage at moderate average intensities",
    intensityProfile: "Mostly submaximal; heavy peaking work appears later in blocks",
    recoveryDemand: "High due to frequency and weekly tonnage — not due to daily max singles",
    technicalDifficulty: "Moderate movement difficulty; high organisational and discipline demand",
    bestSuitedFor: "Intermediate-to-advanced powerlifters with coaching or strong self-regulation",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 9,
      justification:
        "Highly specific competition-lift practice and structured peaking are strong tools for total development when recovery allows.",
    },
    hypertrophyPotential: {
      value: 6,
      justification:
        "High tonnage can grow tissue, but the system’s public identity is strength and technique for powerlifting, not physique programming.",
    },
    recoveryDemand: {
      value: 8,
      justification:
        "Frequent exposures and high weekly volume create substantial fatigue even when average intensity stays moderate.",
    },
    technicalDifficulty: {
      value: 6,
      justification:
        "Lifts are standard powerlifts; difficulty is executing high-quality volume and managing complex weekly plans.",
    },
    beginnerSuitability: {
      value: 3,
      justification:
        "Beginners benefit from technique focus but often cannot recover from full high-volume templates without simplification.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced raw lifters can use frequency, submaximal loading and block waves productively with dose control.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Primary anchors include Sheiko’s English-language book Powerlifting: Foundations and Methods, seminar reporting (e.g. Juggernaut), and long-standing reputable discussions of Russian high-frequency methods. Circulating numbered templates (#29–#32 etc.) are popularisations/examples and must not be treated as a single permanent official programme for every lifter.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodiesForSlug(
    "boris-sheiko-russian-powerlifting",
    {
      "athlete-and-era": `Boris Sheiko is a Russian powerlifting coach whose systems became globally influential as Western lifters sought explanations for Russian competitive success. The relevant frame is coaching methodology — not athlete biography. English-language access expanded through seminars, interviews and the book Powerlifting: Foundations and Methods (Sheiko with Mike Israetel and Derek Wilcox), which positions itself as a guide to programme-design principles rather than a single forever spreadsheet.

Historically, Western internet culture often met Sheiko first through numbered routines circulating online. Reputable explainers have noted that many of those sheets trace to example plans associated with book/material translations — useful as windows into volume and frequency, dangerous when treated as one-size-fits-all coaching. The educational task of this profile is to separate durable principles from template cargo-cult.

Sporting context matters: Russian national-team environments historically combined meticulous planning with athletes who already possessed high technical baselines. Recreational lifters importing the densest public examples without that context often confuse “famous” with “recoverable.”`,

      "documented-training-method": `Documented principles repeatedly associated with Sheiko’s teaching include:

1) High frequency of the competition lifts — squat, bench and deadlift appear often across the week so technique and specific strength accumulate.
2) Submaximal loading — much training stays below true maximal singles so reps stay clean; missing reps is framed as a programming/execution problem, not a badge of toughness.
3) High cumulative volume — weekly tonnage rises because moderate intensities allow more quality work.
4) Multiple exposures — lifts may appear more than once in a week and sometimes more than once in a session structure, increasing technical practice density.
5) Periodised blocks — preparatory phases emphasise volume; later phases raise intensity and cut volume toward competition (seminar accounts describe average intensities near ~70% across preparatory/competition windows when counting sets from ~50% upward).
6) Individualisation in true coaching — the published English book emphasises that leaked generic plans were often written for specific athletes; principles transfer better than blind copy-paste.

Fatigue management is therefore not an afterthought: submaximal restraint is what makes high frequency livable. Progression across blocks is the other half — volume and intensity trade places as the meet approaches rather than staying flat forever.

What this profile does not do: reprint copyrighted tables, paid templates, or complete proprietary programmes. Where popular sites discuss routines #29–#32, treat them as historical popularisations illustrating wave loading — not as “the official Sheiko programme forever.”`,

      "training-structure": `Structurally, Sheiko-associated weeks organise around competition-lift practice with accessories in supporting roles. Volume distribution favours squat/bench/deadlift tonnage. Intensity distribution keeps most sets in productive moderate zones, with heavier work appearing as blocks progress.

Progression across training blocks typically moves from higher volume / moderate intensity toward lower volume / higher intensity as a meet approaches. Fatigue management is built into that wave: hard weeks are followed by reduced weeks; peaking cuts frequency and volume (seminar reporting has described competition-phase weekly session counts tapering toward meet week).

Technical practice is the product: hundreds of quality competition-pattern reps across a mesocycle. That is the system’s signature advantage for lifters whose limiter is still position and consistency under fatigue. Lifters whose limiter is a rare weak range may still need special exercises — Sheiko systems can include assistance, but the public identity remains competition-lift density first.`,

      "volume-intensity-frequency": `Independent analysis: Sheiko systems turn the intensity dial down so the frequency and volume dials can turn up. That resolves a classic powerlifting tension — maxing often destroys the volume needed for technical mastery.

Compared with conjugate approaches, specificity to the exact competition lifts is higher and exercise rotation is lower. Fatigue is managed less by changing the lift every week and more by keeping loads honest and waving weekly stress.

Common misunderstanding: “Sheiko means endlessly copying one numbered PDF.” Analysis: principles can be applied with many calendars; a spreadsheet without recovery context is not coaching. Another misunderstanding: submaximal means easy. High weekly tonnage at 70–80% can be brutally hard.

Research on training frequency and volume in strength sports generally supports that more frequent practice of a lift can improve skill and strength when intensity is managed — which aligns with Sheiko’s public logic without requiring us to reprint any proprietary prescription table.

See also the structured Sheiko vs Conjugate comparison on this page for specificity, variation, frequency, intensity, volume, fatigue management, technical practice, beginner/advanced suitability and raw vs equipped application.`,

      "why-it-worked": `The approach worked for many coached athletes because specificity and technical practice volume are enormous, fatigue is controlled enough to allow that volume, and block progression creates a meet peak. Sport demands of classic/raw powerlifting reward repeatable competition commands — a natural fit for frequent submaximal practice.

Long-term adaptation comes from years of quality reps, not from one viral four-week sheet. Athlete selection and coaching environments in national-team contexts also mattered historically; recreational lifters must scale. When the method fails in the wild, the usual cause is dose mismatch — too much weekly tonnage for the lifter’s sleep, food and stress budget — not a mysterious flaw in “Russian magic.”`,

      "what-lifters-get-wrong": `Lifters get Sheiko wrong when they paste a numbered template without adjusting for recovery, when they skip the idea that plans were often athlete-specific, when they treat every moderate set as junk volume, and when they max out “to make it harder” and destroy the method’s logic.

They also confuse Sheiko principles with conjugate rotation, or assume high frequency requires daily failure. The difference between understanding the system and blindly copying a numbered template is the entire point of this profile. If you cannot explain why a week is hard or easy without reading a cell colour in a spreadsheet, you are copying formatting — not coaching.`,

      "risks-and-recovery": `Risks include overuse from high weekly lift counts, joint irritation when technique decays under fatigue, and under-eating relative to tonnage. Recovery demand is high even though intensity is moderate.

Modern controls: start with fewer weekly exposures, keep top sets clearly submaximal, wave volume, and deload when bar speed or motivation falls. Prefer cutting a session before adding a maximal single “to feel like training.” This is training-economy guidance, not medical advice.`,

      "verdict": `The Strongest verdict: Sheiko-associated Russian systems are among the clearest high-frequency, submaximal total-building frameworks in powerlifting education. Learn the principles. Scale the dose. Do not worship a numbered spreadsheet. Compare thoughtfully with conjugate tools rather than picking a tribe.`,

      "modernised-application": `Modernise by prescribing frequent competition-lift practice at RPE-capped loads, waving weekly volume, and peaking with reduced volume. Beginners need simplified three-day versions. Intermediates may run 3–4 days with multiple bench exposures. Advanced lifters may raise weekly tonnage carefully with planned easier weeks.

A practical sequence: audit current weekly hard sets on squat/bench/deadlift; add one extra quality exposure before raising intensity; keep misses near zero; schedule an easier week every three to four hard weeks; taper sessions before a meet. Original modernised examples on this page are The Strongest interpretations — not copyrighted tables. Related generic programmes are safer commercial on-ramps than leaked sheets.`,

      "example-training-week": `See the labelled original modernised example week. It illustrates frequency and submaximal quality — not a reprint of any Sheiko book table or numbered internet routine.`,

      sources: `Primary references prioritise Sheiko’s published English book, seminar reporting, and reputable strength-sport explainers. Unofficial spreadsheet mirrors are secondary popularisations.`,
    },
    {
      "athlete-and-era": [1, 2],
      "documented-training-method": [1, 2, 3],
      "training-structure": [1, 2],
      "volume-intensity-frequency": [2, 3, 4],
    },
  ),
  trainingStructure: {
    trainingDays: "Commonly 3–4+ days/week in public Sheiko-associated examples; athlete-specific plans vary",
    exerciseFrequency:
      "Squat, bench and deadlift often appear multiple times weekly; bench frequency is frequently highest",
    volumeDistribution: [
      { label: "Competition squat work", share: 30 },
      { label: "Competition bench work", share: 35 },
      { label: "Competition deadlift work", share: 25 },
      { label: "Accessories / other", share: 10 },
    ],
    intensityDistribution: [
      { label: "Submaximal quality volume", share: 70 },
      { label: "Heavier strength / peaking work", share: 25 },
      { label: "Easy technique / recovery", share: 5 },
    ],
    primaryMovements: ["Competition squat", "Competition bench press", "Competition deadlift"],
    accessoryWork: ["Targeted assistance for weak points as coaching dictates", "General physical preparedness as needed"],
    progressionApproach:
      "Raise then taper volume across blocks while average intensity trends upward toward the meet",
    recoveryStructure:
      "Wave hard and easier weeks; cut sessions/volume in peaking; keep most training submaximal",
  },
  whyItWorked: {
    specificity: "Training time concentrates on the lifts that are judged on meet day.",
    volume: "High weekly tonnage at manageable intensities builds technical and specific capacity.",
    intensity: "Submaximal restraint preserves quality; peaking phases express strength when it matters.",
    technicalPractice: "Frequent exposures create massive skill practice under recoverable fatigue.",
    athleteExperience: "National-team coaching contexts historically paired methods with skilled athletes.",
    bodyweight: "Applicable across classes; dose still scales with absolute loads and recovery.",
    recovery: "Intensity caps and weekly waves make high frequency survivable.",
    sportDemands: "Classic/raw powerlifting rewards repeatable competition technique.",
    longTermAdaptation: "Years of quality volume outperform short maxing streaks.",
  },
  whatLiftersGetWrong: [
    "Blindly copying a numbered internet template as a personalised plan",
    "Adding maximal singles that destroy the submaximal logic",
    "Ignoring recovery when weekly lift counts are high",
    "Assuming every Sheiko-labelled PDF is equally official or current",
    "Confusing Sheiko frequency with conjugate max-effort rotation",
  ],
  exampleWeek: {
    title: "Modernised high-frequency submaximal illustration (not a Sheiko table)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest example showing competition-lift frequency at submaximal effort. Not a reprint of Powerlifting: Foundations and Methods tables and not a numbered internet routine.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Squat + bench (quality volume)",
        notes: "Multiple moderate sets; stop with reps in reserve; pristine commands",
      },
      {
        dayLabel: "Day 2",
        focus: "Bench emphasis + light hinge",
        notes: "Second bench exposure; easy deadlift technique or RDLs",
      },
      {
        dayLabel: "Day 3",
        focus: "Rest or easy GPP",
        notes: "Walk, mobility; protect sleep",
      },
      {
        dayLabel: "Day 4",
        focus: "Squat + deadlift",
        notes: "Moderate intensity; avoid grinding singles",
      },
      {
        dayLabel: "Day 5",
        focus: "Bench + upper accessories",
        notes: "Third bench touch if recovered; otherwise technique only",
      },
      {
        dayLabel: "Day 6–7",
        focus: "Rest",
        notes: "Wave an easier week every 3–4 hard weeks",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep high competition-lift frequency and submaximal quality — discard the fantasy that one numbered spreadsheet is universal coaching.",
    beginnerAdjustment:
      "3 days/week; one exposure per main lift; learn commands; low weekly tonnage.",
    intermediateAdjustment:
      "3–4 days; add a second bench day; keep top sets ~RPE 6–8; wave volume weekly.",
    advancedAdjustment:
      "Higher weekly lift counts with planned easier weeks and a deliberate peak; never miss reps on purpose.",
    recommendedFrequency: "3–5 days/week depending on recovery",
    recoveryControls: [
      "Cap intensity so technique never collapses",
      "Wave hard/easy weeks",
      "Reduce exposures before adding load",
      "Deload when bar speed falls for a week",
    ],
    progressionRules: [
      "Add volume before intensity in early blocks",
      "Raise intensity and cut volume toward meets",
      "Change one variable at a time",
    ],
    whenToReduceVolume:
      "Missed reps, rising joint irritation, or persistent performance drop across two sessions",
    whoShouldAvoid: [
      "Beginners needing skill foundations first",
      "Lifters in severe deficits with poor sleep",
      "Anyone unwilling to track recovery",
    ],
  },
  systemComparison: sheikoVersusConjugateComparison(),
  relatedProgrammes: [
    {
      slug: "dup-powerlifting-system",
      title: "High-Frequency Total Builder",
      href: "/programs/dup-powerlifting-system",
      relationship:
        "Original The Strongest programme applying related frequency and submaximal volume principles without coach naming",
    },
  ],
  sources: [
    {
      title: "Powerlifting: Foundations and Methods",
      publisher: "Sheiko / co-authors Mike Israetel & Derek Wilcox",
      author: "Boris Sheiko; Mike Israetel; Derek Wilcox",
      url: "https://www.goodreads.com/book/show/54762905-powerlifting-foundations-and-methods",
      publicationDate: "2020",
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
      title: "What I Learned At The Russian Strength Seminar",
      publisher: "Juggernaut Training Systems",
      author: "Chad Wesley Smith / JTS seminar reporting",
      url: "https://www.jtsstrength.com/what-i-learned-at-the-russian-strength-seminar/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: [
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
    {
      title: "Sizing Up Sheiko: A Review of Routines #29, #30, #31, #32",
      publisher: "PowerliftingToWin",
      url: "https://www.powerliftingtowin.com/sheiko/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["what-lifters-get-wrong", "athlete-and-era"],
    },
    {
      title: "Sheiko Program Guide — how high-frequency submaximal training is commonly described",
      publisher: "Castiron Lift",
      url: "https://www.castiron-lift.com/blogs/news/sheiko-program-guide-powerlifting-usa-2026",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["documented-training-method", "volume-intensity-frequency"],
    },
    {
      title: "Sheiko Program by Boris Sheiko — Complete Guide (principle summary)",
      publisher: "LiftCodex",
      url: "https://liftcodex.com/programs/sheiko/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["documented-training-method", "volume-intensity-frequency"],
    },
  ],
  seo: {
    title: "Boris Sheiko Russian Powerlifting Systems Analysis",
    description:
      "Independent analysis of Sheiko-associated Russian powerlifting principles — frequency, submaximal volume, block peaking, template myths, and Sheiko vs Conjugate comparison.",
    canonicalPath: "/legendary-methods/boris-sheiko-russian-powerlifting",
    keywords: [
      "boris sheiko powerlifting",
      "russian powerlifting system",
      "high frequency submaximal training",
      "sheiko vs conjugate",
    ],
  },
});
