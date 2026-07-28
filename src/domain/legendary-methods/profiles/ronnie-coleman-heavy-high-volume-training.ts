import {
  CONTENT_ACCESS_DATE,
  sectionsWithBodies,
} from "@/domain/legendary-methods/profiles/helpers";
import type { LegendaryMethodProfile } from "@/domain/legendary-methods/types";

/**
 * Ronnie Coleman — heavy high-volume bodybuilding analysis (Prompt 5A).
 * Synthesises reputable magazine reporting and widely recognised training footage context.
 */
export const RONNIE_COLEMAN_HEAVY_HIGH_VOLUME: LegendaryMethodProfile = {
  slug: "ronnie-coleman-heavy-high-volume-training",
  status: "draft",
  athleteName: "Ronnie Coleman",
  profileTitle: "Ronnie Coleman — Heavy High-Volume Training Analysis",
  shortTitle: "Heavy High-Volume Training",
  category: "bodybuilding",
  era: "Late 1990s–2000s Olympia dominance (Metroflex era)",
  nationality: "American",
  sportLabel: "Bodybuilding",
  summary:
    "An independent analysis of Ronnie Coleman’s publicly documented heavy high-volume bodybuilding: compound-first sessions, body-part split structure, progressive overload on the same basics, strength–hypertrophy overlap, recovery demands at elite absolute loads, and why training footage is not the same thing as a complete periodised programme. Ordinary lifters should study the principles and scale ruthlessly rather than copy filmed session doses.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Ronnie Coleman. Documentary footage and magazine features are treated as partial windows into training — not as full copyrighted programmes to reprint. Modernised examples are original The Strongest Manager interpretations.",
  keyCharacteristics: [
    "Heavy compound movements performed for relatively high reps",
    "Body-part split with high per-session volume",
    "Frequent practice of the same basic lifts across weeks",
    "Strength and hypertrophy trained as overlapping qualities",
    "Extreme absolute loads that ordinary lifters must scale",
  ],
  bestFor: [
    "Advanced physique athletes with strong compound technique",
    "Lifters studying how heavy loading can coexist with bodybuilding volume",
  ],
  notRecommendedFor: [
    "Beginners",
    "Lifters chasing ego maxes without hypertrophy intent",
    "Anyone unable to recover from high-fatigue compound sessions",
  ],
  trainingDays: "Commonly described as a multi-day body-part split across the week",
  quickProfile: {
    primaryGoal: "Maximum muscular size with exceptional absolute strength",
    typicalFrequency: "Body-part split; some muscles (notably back in popular accounts) hit with high weekly emphasis",
    volumeLevel: "Very high per session",
    intensityProfile: "Very heavy absolute loads for bodybuilding, often in double-digit reps",
    recoveryDemand: "Extremely high",
    technicalDifficulty: "High under fatigue due to load and effort",
    bestSuitedFor: "Advanced bodybuilders with years of progressive loading",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 9,
      justification:
        "Coleman is widely documented as exceptionally strong for a bodybuilder; heavy compounds for reps build serious force capacity.",
    },
    hypertrophyPotential: {
      value: 9,
      justification:
        "High per-session volumes on basic movements plus accessories create large hypertrophy stimulus when recovered.",
    },
    recoveryDemand: {
      value: 10,
      justification:
        "Heavy compounds plus high volumes create enormous systemic and joint stress; recovery capacity becomes the limiter.",
    },
    technicalDifficulty: {
      value: 7,
      justification:
        "Movements are basic, but executing them safely at Coleman-like relative efforts requires advanced skill and discipline.",
    },
    beginnerSuitability: {
      value: 1,
      justification:
        "Beginners copying documentary loads or volumes is one of the worst failure modes in popular bodybuilding.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced athletes can adopt compound-first bodybuilding with high effort — carefully dosed and scaled.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Strong qualitative evidence from FLEX/Muscle & Fitness reporting and widely recognised Metroflex-era training documentaries. Exact year-round periodisation details are incomplete in public sources; footage shows sessions, not necessarily the full annual plan.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodies(
    {
      "athlete-and-era": `Ronnie Coleman’s Olympia run (eight titles) sits in a late-1990s and 2000s bodybuilding landscape that prized extreme muscular size. Training culture around Metroflex Gym in Arlington, Texas, became part of the public story: hard compound lifting, competitive training partners, and cameras that captured sessions later circulated worldwide — including the widely known Cost of Redemption-era footage.

For analysis, the relevant stage is peak competitive training as portrayed in magazine features and documentary windows — not a full life story. The coaching environment and gym culture matter because they supported workloads and absolute loads that recreational lifters rarely match.

Media distribution changed the sport’s pedagogy. Once filmed sessions travelled globally, “how Ronnie trained” became a set of highlight clips rather than a coached annual plan. That shift is important for this profile: footage is evidence of session flavour and absolute strength expression, not a complete syllabus. Ordinary lifters watching those clips without periodisation context are the most common victims of misapplication.`,

      "documented-training-method": `Reputable magazine coverage (including Muscle & Fitness / FLEX Online features) describes Coleman’s approach as unusually strong for bodybuilding: heavy basic movements performed for relatively high repetitions (often discussed in the low-to-mid teens), built by progressing from lighter high-rep work toward heavier loads over time.

Popular and gym-associated accounts of the Metroflex years describe a classic bodybuilding split structure across the week, with brutal compound emphasis — squats, deadlifts, presses, rows — rather than novelty machines as the identity of the method. Some reporting notes variation strategies such as alternating barbell- versus dumbbell-dominant chest emphasis across the week, and distinguishing upper-back versus thickness-focused back sessions.

FLEX-era feature reporting also documented brutal shared training environments with other strong competitors, reinforcing that the method was as much culture and consistency as exercise selection.

Uncertainty remains deliberate: documentary clips prove what happened in filmed sessions; they do not automatically disclose warm-up strategies, off-season differences, medical context, or a complete periodised macrocycle. Secondary sites that publish full week charts should be treated cautiously unless tied to contemporary magazine documentation.

Strength and hypertrophy overlap is the intellectual core of the method as publicly told. Getting stronger on the same compounds week after week allowed heavier productive bodybuilding work. That is different from powerlifting peaking, where singles and opener strategy dominate. Coleman-style training, in the documented public frame, kept reps in a bodybuilding range while the loads looked like strength-sport numbers to everyone else.`,

      "training-structure": `Structurally, heavy high-volume bodybuilding here means a split week, large per-session set counts, and repeated exposure to the same compound families across months. Volume distribution leans into free-weight compounds first, with accessories filling the remaining fatigue budget. Intensity distribution is “heavy for bodybuilding,” not powerlifting singles — double-digit reps with loads that would be near-maximal for most gym lifters.

Progression appears, in public tellings, as relentless overload on the same basics: add weight when possible, keep showing up, keep the standard high. Recovery structure is the tax: when compounds are that heavy and sessions that long, sleep, food, and schedule become decisive.

Exercise repetition across training weeks is a feature, not a bug. The public identity of the approach is mastery and overload on a small menu of hard movements, not constant novelty. Lifters who chase a new machine every session while claiming to train “like the Metroflex years” have missed the point. The split provides body-part organisation; the compounds provide the stimulus; the accessories finish local work without replacing the basics.

Progressive overload, in this framing, is patient and stubborn: the same squat, hinge, press, and row families return often enough that small load or rep improvements accumulate. That is why the method looks repetitive on camera and still produced historic size. Without tracking those small wins, “heavy high volume” becomes theatre — long sessions that do not actually progress.`,

      "volume-intensity-frequency": `Independent analysis: Coleman-style training collides two qualities many programmes separate — high absolute intensity and high bodybuilding volume. That collision is productive for rare athletes and punitive for everyone else.

Frequency via a split can look moderate per muscle while still being systemically brutal because each day is a compound war. Lifters misread footage when they copy the top set load without the base that produced it, or when they assume every week of the year matched contest-prep intensity.

A modern reading keeps compounds central, keeps reps in productive hypertrophy ranges, and scales load to technical quality — not to a documentary screenshot.

Volume should be budgeted as weekly hard sets with a clear stop rule when technique collapses. Intensity should be challenging while leaving most working sets with a small reps-in-reserve buffer except on rare top sets. Frequency should respect systemic fatigue: if squat and deadlift days are both maximal efforts, something else in the week must become easier. Documented training footage and a complete periodised programme are not the same object; treat clips as flavour and magazine progression stories as the closer guide to long-term method.`,

      "why-it-worked": `It worked at the elite level through specificity to size, enormous mechanical tension, repeated technical practice on the same lifts, exceptional athlete experience and strength base, bodyweights that supported large absolute loading, recovery resources far beyond recreational norms, and sport demands that rewarded extreme muscularity. Long-term adaptation was the product of years of progressive exposure filmed only in snapshots.

Strength and hypertrophy overlapped: getting stronger on the basics enabled heavier productive hypertrophy work.

Competitive training partners and a hard gym culture also raised accountability. Public features repeatedly situate Coleman inside environments where heavy compounds were normal, not theatrical. That social context is part of why the method looks simple on paper and brutal in practice: the standard was high every session, for years, with support systems recreational lifters do not have.`,

      "what-lifters-get-wrong": `Lifters get Coleman wrong by ego-loading to documentary numbers, by treating a filmed leg day as a weekly obligation forever, and by ignoring that magazine features describe a progression story (lighter high reps building toward heavier high reps) rather than starting at the top.

Also wrong: assuming accessories do not matter, or that “heavy” means grinding ugly singles. The documented flavour is heavy compounds for hard, fairly high reps with high effort — scaled to the lifter.

Another common error is confusing highlight consistency with periodisation completeness. Seeing the same movements across many clips does not prove there was no off-season variation, injury management, or intensity cycling — it only proves which sessions were filmed and celebrated. Blindly copying elite volume and absolute loads is the failure mode this profile exists to prevent. Ordinary lifters should borrow compound-first progressive overload at honest loads, not costume the documentary.`,

      "risks-and-recovery": `Risks concentrate in spine, knees, shoulders, and cumulative joint wear under repeated heavy compounds. Recovery demand is extreme. Modern athletes should reduce loads, cap failure, rotate variations, and deload on schedule. This is not medical advice; it is training-economy advice.

Practical recovery controls include: keeping most sets technically crisp, alternating stance or implement variations across mesocycles when joints complain, scheduling easier weeks, and refusing to match filmed loads that require a strength base built over years. If sleep, appetite, or session quality are deteriorating, cut sets or load before adding another “heavy day” for social media.`,

      "verdict": `The Strongest Manager verdict: Coleman exemplifies compound-first, heavy high-volume bodybuilding at the absolute edge of human performance. Study the principles — basics, progressive overload, high effort — and refuse the costume drama of copying filmed loads. Documented footage is a window into sessions, not a full annual programme. Scale ruthlessly; keep status of this educational profile honest: principles first, celebrity dose last.`,

      "modernised-application": `Modernise with compound-centred splits, double-digit hard sets at challenging but technical loads, and ruthless recovery standards. See modernAdaptation for dosing.

A practical entry path: choose a body-part or upper/lower split you can recover from; pick one primary squat, hinge, press, and row pattern; progress load or reps across weeks while leaving reps in reserve on most sets; add accessories only after compounds are consistent. Advanced physique athletes may raise absolute intensity in short blocks with planned deloads. Beginners need pattern mastery and modest volume first. Related generic programmes on this site are the safer on-ramps when the goal is strength-plus-hypertrophy overlap without elite cosplay. Always prefer technical quality over matching any filmed absolute load.`,

      "example-training-week": `Original modernised split illustration — not a documentary transcript and not a reprinted magazine workout chart. Use it to see how compound emphasis and split structure can coexist at non-elite doses. Adjust every load to your technical ceiling.`,

      sources: `Sources prioritise Muscle & Fitness/FLEX reporting and recognised Metroflex-era documentary context. Unsourced blog routines are not primary evidence. Where only a secondary chart asserts a permanent week, this profile declines to treat that chart as authoritative.`,
    },
    {
      "athlete-and-era": [1, 2, 4],
      "documented-training-method": [1, 2, 3, 5],
      "training-structure": [2, 3],
      "volume-intensity-frequency": [1, 3],
    },
  ),
  trainingStructure: {
    trainingDays: "Multi-day body-part split across the week (exact day labels vary by account/year)",
    exerciseFrequency:
      "Each major group typically once or twice weekly depending on the split variant described; compounds repeat across mesocycles",
    volumeDistribution: [
      { label: "Primary free-weight compounds", share: 50 },
      { label: "Secondary compounds", share: 25 },
      { label: "Isolation accessories", share: 25 },
    ],
    intensityDistribution: [
      { label: "Heavy compounds for higher reps", share: 60 },
      { label: "Moderate accessories", share: 30 },
      { label: "Easy technique / warm-up work", share: 10 },
    ],
    primaryMovements: [
      "Squat variations",
      "Deadlift / heavy hinge work",
      "Bench and overhead presses",
      "Row and pulldown/pull-up variations",
    ],
    accessoryWork: [
      "Dumbbell presses and laterals",
      "Leg extensions / curls as fillers",
      "Arm isolation",
      "Rear-delts and upper-back detail work",
    ],
    progressionApproach:
      "Public accounts emphasise progressive overload on the same basic lifts over years — not novelty for its own sake",
    recoveryStructure:
      "High-fatigue days require strong sleep/nutrition support and willingness to back off when technique decays",
  },
  whyItWorked: {
    specificity: "Training targeted extreme muscular size for Olympia judging criteria.",
    volume: "Large per-session volumes on compounds and accessories accumulated huge weekly tension.",
    intensity: "Absolute loads were exceptional for bodybuilding, raising mechanical tension per rep.",
    technicalPractice: "Years of repeating the same basics under high effort built skill and tolerance.",
    athleteExperience: "Elite strength base and long runway preceded the famous filmed sessions.",
    bodyweight: "Heavy bodyweights supported large absolute loading on compounds.",
    recovery: "Lifestyle and training-partner culture supported brutal sessions more than recreational schedules do.",
    sportDemands: "The sport rewarded size and dominance on stage.",
    longTermAdaptation: "Documentaries show peaks of a long process, not the entire process.",
  },
  whatLiftersGetWrong: [
    "Copying documentary loads without the progressive base",
    "Confusing filmed sessions with a complete annual periodised plan",
    "Turning every set into an ugly grind",
    "Ignoring recovery while adding volume",
    "Treating accessories as optional after maximal compounds",
  ],
  exampleWeek: {
    title: "Modernised compound-first split illustration (not an athlete routine)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest Manager example inspired by publicly described split logic. Not Ronnie Coleman’s exact programme and not a transcript of documentary footage.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Chest emphasis — press compounds + accessories",
        notes: "Hard sets in a controlled hypertrophy rep range; leave technical reps in reserve",
      },
      {
        dayLabel: "Day 2",
        focus: "Back thickness / hinge-row emphasis",
        notes: "Prioritise rows and hinge patterns; manage lumbar fatigue",
      },
      {
        dayLabel: "Day 3",
        focus: "Shoulders",
        notes: "Press + lateral work; avoid turning press work into maximal singles",
      },
      {
        dayLabel: "Day 4",
        focus: "Legs — squat pattern + posterior accessories",
        notes: "Quality depth and bracing over load cosplay",
      },
      {
        dayLabel: "Day 5",
        focus: "Arms / weak-point accessories",
        notes: "Moderate volume; recover for compounds next week",
      },
      {
        dayLabel: "Day 6–7",
        focus: "Rest or easy conditioning",
        notes: "Deload loads 40–50% for a week if joint stress accumulates",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep compound-first bodybuilding, progressive overload, and hard training standards — while scaling loads to technique and protecting recovery.",
    beginnerAdjustment:
      "Full-body or upper/lower; learn squat/hinge/press/row; no maximal ego loading.",
    intermediateAdjustment:
      "4–5 day split; 10–16 hard sets per muscle weekly; compounds first; double-digit reps at RPE 7–9.",
    advancedAdjustment:
      "Higher per-session volumes in short blocks; alternate emphasis variations; planned deloads; never chase documentary numbers.",
    recommendedFrequency: "4–6 days/week split depending on recovery",
    recoveryControls: [
      "Stop sets before technical failure on heavy compounds",
      "Rotate stance/grip variations across mesocycles",
      "Schedule deloads every 4–6 hard weeks",
      "Track morning readiness and back off early",
    ],
    progressionRules: [
      "Add load when target reps are clean across prescribed sets",
      "Progress accessories after compounds are stable",
      "Reduce volume before reducing frequency when overreached",
    ],
    whenToReduceVolume:
      "Joint pain, bar-speed collapse across sessions, or sleep disruption lasting more than a few days",
    whoShouldAvoid: [
      "Beginners",
      "Lifters with unmanaged spine or knee injuries",
      "Anyone in an aggressive calorie deficit without recovery support",
    ],
  },
  relatedProgrammes: [
    {
      slug: "powerbuilding-hybrid",
      title: "Heavy High-Volume Bodybuilding",
      href: "/programs/powerbuilding-hybrid",
      relationship:
        "Original The Strongest Manager programme applying related compound-first hypertrophy principles without athlete naming",
    },
  ],
  sources: [
    {
      title: "Ronnie Coleman's Workout Strategy For Weight Lifting",
      publisher: "Muscle & Fitness / FLEX Online",
      url: "https://www.muscleandfitness.com/flexonline/training/ronnie-colemans-workout-strategy-for-weight-lifting/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: [
        "documented-training-method",
        "volume-intensity-frequency",
        "athlete-and-era",
      ],
    },
    {
      title: "December Cover Story – Ronnie Coleman’s Brutal Workouts!",
      publisher: "Muscle & Fitness / FLEX Online",
      author: "Greg Merritt",
      url: "https://www.muscleandfitness.com/flexonline/flex-news/december-cover-story-ronnie-colemans-brutal-workouts/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "Ronnie Coleman's Training Routine at MetroFlex Gym",
      publisher: "MetroFlex Gym",
      url: "https://metroflexgym.com/blog/ronnie-coleman-training-routine-metroflex",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["training-structure", "documented-training-method", "athlete-and-era"],
    },
    {
      title: "8X Mr. Olympia Ronnie Coleman's Memories at Metroflex Gym",
      publisher: "Muscle & Strength",
      url: "https://www.muscleandstrength.com/articles/ronnie-coleman-metroflex",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "interview",
      supports: ["athlete-and-era", "documented-training-method"],
    },
    {
      title: "The Cost of Redemption (widely recognised Ronnie Coleman training documentary)",
      publisher: "Documentary / Metroflex-era training footage (public cultural record)",
      url: "https://metroflexgym.com/blog/ronnie-coleman-training-routine-metroflex",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "archival-source",
      supports: ["athlete-and-era", "documented-training-method"],
      publicationDate: "2003-era filming commonly cited in secondary accounts",
    },
  ],
  seo: {
    title: "Ronnie Coleman Heavy High-Volume Training Analysis",
    description:
      "Independent analysis of Ronnie Coleman’s heavy high-volume bodybuilding — compound emphasis, split structure, strength–hypertrophy overlap, and why footage is not a full programme.",
    canonicalPath: "/legendary-methods/ronnie-coleman-heavy-high-volume-training",
    keywords: [
      "ronnie coleman training analysis",
      "heavy high volume bodybuilding",
      "metroflex training",
      "compound bodybuilding programme",
    ],
  },
  updatedAt: CONTENT_ACCESS_DATE,
};
