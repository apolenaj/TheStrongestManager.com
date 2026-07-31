import {
  CONTENT_ACCESS_DATE,
  LEGENDARY_PUBLISH_DATE,
  sectionsWithBodiesForSlug,
} from "@/domain/legendary-methods/profiles/helpers";
import { conjugateVersusSheikoComparison } from "@/domain/legendary-methods/profiles/sheiko-vs-conjugate";
import { fromEnglishProfile } from "@/domain/legendary-methods/from-english";

/**
 * Louie Simmons — Conjugate Method analysis (Prompt 5D).
 * Principles from Westside/Simmons public writing — not a reprint of proprietary templates or logos.
 */
export const LOUIE_SIMMONS_CONJUGATE_METHOD = fromEnglishProfile({
  slug: "louie-simmons-conjugate-method",
  status: "published",
  legalReviewStatus: "passed",
  publishedAt: LEGENDARY_PUBLISH_DATE,
  updatedAt: LEGENDARY_PUBLISH_DATE,
  athleteName: "Louie Simmons",
  profileTitle: "Louie Simmons — Understanding the Conjugate Method",
  shortTitle: "The Conjugate Method",
  category: "training-system",
  era: "Westside Barbell conjugate tradition (late 20th century–2020s public method writing)",
  nationality: "American",
  sportLabel: "Powerlifting",
  summary:
    "An independent educational analysis of the conjugate method strongly associated with Louie Simmons and Westside Barbell culture: max-effort work, dynamic-effort work, repetition effort, rotating special exercises, accommodating resistance, weak-point development, historical equipped context, raw adaptations, and common internet misreadings that invent ‘official’ Westside methods from random templates. Includes a Sheiko vs Conjugate comparison. Not a reprint of copyrighted books, paid templates or Westside logos/graphics.",
  introductoryDisclaimer:
    "This profile is an independent educational analysis. It is not affiliated with, authorised by, sponsored by or endorsed by Louie Simmons, Westside Barbell, or related entities. No Westside Barbell logos or copyrighted graphics are used. Descriptions synthesise publicly available method articles and essays. This page does not reproduce copyrighted books, paid templates, or complete proprietary programmes. Not every modern ‘conjugate-inspired’ variation is an official Westside method.",
  keyCharacteristics: [
    "Concurrent development of absolute strength and speed-strength",
    "Max-effort work on rotating main exercises",
    "Dynamic-effort work with submaximal loads moved explosively",
    "Repetition-effort special exercises for hypertrophy and weak points",
    "Accommodating resistance (bands/chains) as a common tool — not mandatory cosplay",
  ],
  bestFor: [
    "Advanced lifters needing weak-point tools and concurrent strength qualities",
    "Coaches studying ME/DE/RE organisation",
    "Equipped or raw athletes willing to adapt rotation and GPP honestly",
  ],
  notRecommendedFor: [
    "Beginners who need stable competition-lift practice first",
    "Lifters maxing the same lift weekly and calling it conjugate",
    "Anyone treating random band Instagram workouts as official Westside programming",
  ],
  trainingDays:
    "Classic public framing often uses four main days: max-effort lower/upper and dynamic-effort lower/upper, plus accessories",
  quickProfile: {
    primaryGoal: "Raise absolute strength and rate of force development while attacking weak points",
    typicalFrequency: "Often four primary conjugate days weekly in public Westside-linked outlines",
    volumeLevel: "High in special/repetition work; main ME volume is relatively low but intense",
    intensityProfile: "Weekly near-max singles on rotating lifts + fast submaximal DE work",
    recoveryDemand: "High — extreme days require spacing and rotation discipline",
    technicalDifficulty: "High — exercise selection, accommodating resistance and autoregulation skill",
    bestSuitedFor: "Advanced lifters with coaching literacy",
    evidenceQuality: "moderate",
  },
  scores: {
    strengthPotential: {
      value: 9,
      justification:
        "Max-effort practice and weak-point special exercises are potent absolute-strength tools when rotation is respected.",
    },
    hypertrophyPotential: {
      value: 7,
      justification:
        "Repetition-effort accessories can drive substantial tissue growth supporting the total.",
    },
    recoveryDemand: {
      value: 9,
      justification:
        "Weekly maximal exposures plus high accessory volumes are systemically expensive.",
    },
    technicalDifficulty: {
      value: 8,
      justification:
        "Requires competent exercise rotation, setup standards and (when used) bands/chains literacy.",
    },
    beginnerSuitability: {
      value: 2,
      justification:
        "Beginners usually need stable patterns before ME rotation and accommodating resistance complexity.",
    },
    advancedSuitability: {
      value: 9,
      justification:
        "Advanced athletes can use concurrent ME/DE/RE and special exercises productively with honest recovery rules.",
    },
  },
  evidenceQuality: "moderate",
  evidenceQualityNote:
    "Primary public anchors include Westside Barbell method articles and Louie Simmons essays (including CrossFit Journal’s published Westside conjugate overview). Books such as The Westside Barbell Book of Methods are acknowledged as primary literature but are not reproduced here. Internet ‘conjugate’ templates vary widely; many are adaptations, not official Westside programmes.",
  lastReviewedAt: CONTENT_ACCESS_DATE,
  sections: sectionsWithBodiesForSlug(
    "louie-simmons-conjugate-method",
    {
      "athlete-and-era": `Louie Simmons (1947–2022) was the central public figure of Westside Barbell’s conjugate strength culture in Columbus, Ohio. The relevant analytical frame is the training system he synthesised and taught — not merchandise, logos or gym mythology.

Historically, conjugate ideas draw on Soviet special-exercise volume and Bulgarian-like frequent heavy exposures. Simmons’ public writing describes combining those streams into a weekly structure for powerlifting: train absolute strength and speed-strength concurrently, rotate maximal exercises to avoid accommodation, and attack weaknesses with special work. Westside’s competitive reputation was built heavily in equipped powerlifting; modern raw applications exist but must be labelled as adaptations when they diverge from classic club practice.

The internet era multiplied interpretations. Some are careful translations of public ME/DE/RE logic; others are novelty bar collections with no recovery plan. This profile stays with publicly documented method ideas and explicitly refuses to baptise every modern variation as official Westside doctrine.`,

      "documented-training-method": `Public Westside/Simmons method writing repeatedly describes three interlocking methods:

Maximal effort (ME): work up to a heavy top single (or day’s max) on a main lift that rotates frequently — different bars, box heights, specialty presses/pulls — so lifters can train near-maximal loads year-round without grinding the identical competition lift every week. Official Westside explainers stress that skipping rotation and maxing the same lift weekly is not conjugate.

Dynamic effort (DE): lift submaximal loads with maximal speed, often against bands or chains (accommodating resistance) so tension rises through the range. The target is rate of force development, not grinding.

Repetition effort (RE): higher-rep special exercises to build muscle and attack weak points after ME/DE main work.

Supporting ideas in public articles include roughly 72-hour spacing between extreme sessions, pendulum-style loading on DE waves, and constant weak-point diagnosis. Accommodating resistance is a documented tool — not a requirement that every garage gym must cosplay full band setups to “do conjugate.”

Weak-point development is the practical heart of the system: identify the muscle or range that fails the total, then choose special exercises that overload it. Without that diagnosis, rotation becomes entertainment.

What this profile does not do: reproduce copyrighted book chapters, paid templates, or claim every modern variation is official Westside method. No Westside logos or copyrighted graphics are used on this site for this analysis.`,

      "training-structure": `A commonly published weekly skeleton is ME lower, ME upper, DE lower, DE upper, with RE accessories attached to those days. Volume distribution skews toward special exercises; intensity distribution puts true near-max stress on ME days and speed emphasis on DE days.

Progression is less a single linear percentage wave than a conjugate of qualities: raise ME records on rotations, improve DE bar speed/loads across waves, and enlarge weak muscles via RE. Fatigue management depends on rotation and day roles. When those roles collapse into “max everything,” the system fails.

Equipped versus raw: supportive gear changes what special exercises and peaking look like. Raw lifters often need more direct competition-lift volume than classic equipped Westside templates imply. That is adaptation — say so. Treating every box squat with bands as automatically optimal for a raw beginner is a modern internet mistake.`,

      "volume-intensity-frequency": `Independent analysis: conjugate systems keep intensity high on ME days by changing the exercise, and keep speed qualities alive with DE. Volume lives mostly in accessories. Frequency of any single competition variation may be lower than Sheiko-style high-frequency competition practice, while frequency of hard lower/upper stress remains high.

Compared with Sheiko-associated systems, conjugate uses more variation, more near-max singles, and more special-exercise problem-solving. Sheiko uses more identical competition-lift practice at submaximal loads. Both can build totals; they solve different bottlenecks.

Common internet mistakes include using accommodating resistance without a speed target, collecting specialty bars without a weak-point rationale, and skipping RE work because it is less glamorous than ME singles.

See the structured Sheiko vs Conjugate comparison on this page for the required dimensions: specificity, variation, frequency, intensity, volume, fatigue management, technical practice, beginner/advanced suitability, and raw vs equipped application.`,

      "why-it-worked": `It worked in its historical context by preventing accommodation, training multiple strength qualities weekly, and relentlessly attacking individual weak points inside a hard training culture. Equipped success amplified results that special exercises and gear synergy supported.

Long-term careers were a stated goal in Simmons’ writing: rotation and special work can spare joints relative to forever maxing the same three lifts. Sport demands of multi-ply/equipped eras rewarded that toolbox; raw eras still borrow pieces with modifications. The method’s public longevity also comes from clear day roles — when those roles are respected, lifters can train hard for years without turning every Monday into the same failed contest squat.`,

      "what-lifters-get-wrong": `Lifters get conjugate wrong when they max the same squat every Monday, when they add bands without a DE plan, when they collect specialty bars as identity, and when they call any four-day split “Westside.”

They also fail by ignoring RE weak-point work, by under-recovering between ME days, and by assuming equipped Westside outcomes transfer unchanged to raw beginners. Not every modern internet variation is an official Westside method. If your programme never rotates the max-effort lift, it is not conjugate — regardless of how many chains are in the Instagram frame.`,

      "risks-and-recovery": `Risks include overreaching from weekly maxes, technical breakdown on novelty lifts, and joint stress from accommodating resistance misused. Recovery demand is high.

Modern controls: rotate ME lifts, keep DE truly fast, cap RE when sore, and increase direct competition practice for raw meet prep. If DE bar speed dies, reduce load before adding band tension. This is training-economy guidance, not medical advice.`,

      "verdict": `The Strongest verdict: Simmons’ conjugate synthesis remains one of the most influential concurrent strength systems in powerlifting education. Use ME/DE/RE with honest rotation. Adapt for raw lifting. Refuse logo cosplay and unofficial template worship. Compare with Sheiko tools instead of joining a culture war. Principles first; branding last.`,

      "modernised-application": `Modernise with four-day ME/DE roles, simple ME rotations, optional light accommodating resistance, and substantial RE for weak points. Beginners should not start here. Intermediates may use a simplified conjugate outline. Advanced lifters may expand special-exercise menus carefully.

A practical raw-friendly sequence: pick two lower and two upper ME variations to rotate; run DE without bands until bar speed is consistently fast; add RE for the actual weak point that shows up on meet attempts; increase competition-stance volume in the final weeks before a raw meet. Original examples are The Strongest interpretations — not Westside copyrighted programmes.`,

      "example-training-week": `See the labelled original modernised example. It illustrates ME/DE roles without reprinting proprietary Westside templates. Use it as a coaching sketch for day roles and recovery spacing, then adjust every load to technical quality. Do not treat any day as an official Westside session transcript.`,

      sources: `Primary references prioritise Westside Barbell public method articles and Louie Simmons essays (including the CrossFit Journal overview). Books such as The Westside Barbell Book of Methods are acknowledged as literature anchors without reproducing contents. Unofficial internet spreadsheets are adaptations unless explicitly published by Westside as such.`,
    },
    {
      "athlete-and-era": [1, 2],
      "documented-training-method": [1, 2, 3, 4],
      "training-structure": [1, 3],
      "volume-intensity-frequency": [1, 2, 5],
    },
  ),
  trainingStructure: {
    trainingDays: "Common public outline: four primary days (ME lower, ME upper, DE lower, DE upper)",
    exerciseFrequency:
      "Main ME lifts rotate weekly; DE uses repeated speed work with wave loading; accessories appear often",
    volumeDistribution: [
      { label: "Max-effort main work", share: 15 },
      { label: "Dynamic-effort main work", share: 20 },
      { label: "Repetition / special exercises", share: 50 },
      { label: "GPP / other", share: 15 },
    ],
    intensityDistribution: [
      { label: "Near-max ME singles", share: 35 },
      { label: "Fast submaximal DE work", share: 30 },
      { label: "Hypertrophy / RE accessories", share: 35 },
    ],
    primaryMovements: [
      "Rotating squat/deadlift ME variations",
      "Rotating bench ME variations",
      "Dynamic squat and bench against accommodating resistance when used",
    ],
    accessoryWork: [
      "Special exercises for lagging muscles/ranges",
      "Posterior-chain and upper-back RE work",
      "GPP as recovery and work-capacity support",
    ],
    progressionApproach:
      "Chase ME records on rotations, improve DE speed/load across waves, enlarge weak points via RE",
    recoveryStructure:
      "Space extreme days (~72 hours in public writing); rotate ME lifts; deload when bar speed and joints complain",
  },
  whyItWorked: {
    specificity: "Special exercises are chosen to transfer to the lifter’s competition weak points.",
    volume: "High accessory volumes build the tissues that support maximal attempts.",
    intensity: "Weekly ME exposures keep absolute strength high without identical-lift accommodation.",
    technicalPractice: "DE speed work and special lifts refine positions under varied constraints.",
    athleteExperience: "Westside culture paired methods with experienced equipped lifters and coaching feedback.",
    bodyweight: "Applicable across classes; absolute ME stress still scales with size and gear.",
    recovery: "Rotation and day roles manage fatigue better than chronic same-lift maxing.",
    sportDemands: "Equipped powerlifting historically rewarded the special-exercise toolbox; raw use needs adaptation.",
    longTermAdaptation: "Concurrent qualities and variation support longer training careers when dosed well.",
  },
  whatLiftersGetWrong: [
    "Maxing the same competition lift every week and calling it conjugate",
    "Using bands/chains without a clear dynamic-effort plan",
    "Ignoring repetition-effort weak-point work",
    "Treating every internet ‘conjugate’ template as official Westside method",
    "Copying equipped assumptions into raw beginner programming",
  ],
  exampleWeek: {
    title: "Modernised ME/DE illustration (not a Westside proprietary programme)",
    label: "original-modernised-example",
    disclaimer:
      "Original The Strongest example of conjugate day roles. Not a reprint of Westside books/templates and not an official Westside programme. No logos or copyrighted graphics.",
    days: [
      {
        dayLabel: "Day 1",
        focus: "Max-effort lower",
        notes: "Rotate squat/hinge variation weekly; work to a hard single; then RE accessories",
      },
      {
        dayLabel: "Day 2",
        focus: "Max-effort upper",
        notes: "Rotate press variation; hard single; triceps/upper-back RE",
      },
      {
        dayLabel: "Day 3",
        focus: "Rest or easy GPP",
        notes: "Protect the 72-hour idea between extreme days",
      },
      {
        dayLabel: "Day 4",
        focus: "Dynamic-effort lower",
        notes: "Fast submaximal squat sets; optional light bands/chains; posterior RE",
      },
      {
        dayLabel: "Day 5",
        focus: "Dynamic-effort upper",
        notes: "Fast bench work; accessories for weak points",
      },
      {
        dayLabel: "Day 6–7",
        focus: "Rest",
        notes: "Deload when ME performance and DE speed both stall",
      },
    ],
  },
  modernAdaptation: {
    summary:
      "Keep ME rotation, DE speed work and RE weak-point training — discard logo cosplay and unofficial template absolutism. Adapt volume of competition lifts upward for raw meet prep.",
    beginnerAdjustment:
      "3 days/week strength; no weekly max rotation; learn squat/bench/hinge first.",
    intermediateAdjustment:
      "Four-day ME/DE outline with simple variations; DE without bands first; modest RE.",
    advancedAdjustment:
      "Broader ME menu, optional accommodating resistance, targeted RE; more direct competition practice near raw meets.",
    recommendedFrequency: "3–4 hard days/week for most; advanced may add GPP carefully",
    recoveryControls: [
      "Rotate ME lifts weekly or biweekly",
      "Keep DE bar speed high — reduce load if grinding",
      "Space extreme days",
      "Cut RE when joints complain",
    ],
    progressionRules: [
      "Log ME variations and records separately",
      "Wave DE loads across short cycles",
      "Choose special exercises from diagnosed weak points, not novelty",
    ],
    whenToReduceVolume:
      "Falling ME performance, slow DE bar speed, or rising joint irritation for 7–10 days",
    whoShouldAvoid: [
      "Beginners",
      "Lifters who refuse to rotate max-effort lifts",
      "Anyone equating band photos with a complete method",
    ],
  },
  systemComparison: conjugateVersusSheikoComparison(),
  relatedProgrammes: [
    {
      slug: "conjugate-strength-system",
      title: "Concurrent Strength System",
      href: "/programs/conjugate-strength-system",
      relationship:
        "Original The Strongest programme applying related concurrent strength principles without Westside branding",
    },
  ],
  sources: [
    {
      title: "What the Conjugate Method Actually Is",
      publisher: "Westside Barbell",
      author: "Westside Barbell / Louie Simmons method tradition",
      url: "https://www.westside-barbell.com/a/blog/what-the-conjugate-method-actually-is",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: [
        "athlete-and-era",
        "documented-training-method",
        "training-structure",
        "volume-intensity-frequency",
      ],
    },
    {
      title: "The Conjugate Method (overview page)",
      publisher: "Westside Barbell",
      url: "https://www.westside-barbell.com/pages/conjugate-method",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["documented-training-method", "training-structure"],
    },
    {
      title: "The Westside Conjugate System",
      publisher: "CrossFit Journal",
      author: "Louie Simmons",
      url: "https://library.crossfit.com/free/pdf/CFJ_Simmons_Conjugate.pdf",
      publicationDate: "2011-06",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["athlete-and-era", "documented-training-method", "why-it-worked"],
    },
    {
      title: "Training Methods Part 2: Max Effort Day",
      publisher: "Westside Barbell",
      author: "Louie Simmons",
      url: "https://www.westside-barbell.com/a/blog/training-methods-part-2-max-effort-day",
      publicationDate: "2016-10-18",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "official-athlete-source",
      supports: ["documented-training-method", "what-lifters-get-wrong"],
    },
    {
      title: "What I Learned At The Russian Strength Seminar (Sheiko contrast context)",
      publisher: "Juggernaut Training Systems",
      url: "https://www.jtsstrength.com/what-i-learned-at-the-russian-strength-seminar/",
      accessDate: CONTENT_ACCESS_DATE,
      sourceType: "reputable-publication",
      supports: ["volume-intensity-frequency"],
    },
  ],
  seo: {
    title: "Louie Simmons Conjugate Method Analysis",
    description:
      "Independent analysis of Louie Simmons’ conjugate method — max effort, dynamic effort, special exercises, raw vs equipped context, internet myths, and Sheiko vs Conjugate comparison.",
    canonicalPath: "/legendary-methods/louie-simmons-conjugate-method",
    keywords: [
      "louie simmons conjugate method",
      "max effort dynamic effort",
      "westside barbell training principles",
      "sheiko vs conjugate",
    ],
  },
});
