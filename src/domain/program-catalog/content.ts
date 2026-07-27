/**
 * Marketing copy for commercial program families (public detail pages).
 * Educational framing — no fake scarcity, countdowns, or invented outcomes.
 */

export type ProgramStructurePhase = {
  label: string;
  weeks: string;
  intent: string;
};

export type ProgramFamilyContent = {
  familyId: string;
  displayName: string;
  tagline: string;
  whoFor: string[];
  whoNot: string[];
  structure: ProgramStructurePhase[];
  comparisonRows: { feature: string; free: string; full: string }[];
  faq: { question: string; answer: string }[];
};

export const PROGRAM_FAMILY_CONTENT: Record<string, ProgramFamilyContent> = {
  "linear-strength-builder": {
    familyId: "linear-strength-builder",
    displayName: "Linear Strength Builder",
    tagline:
      "A clear volume-to-intensity path when you want measurable strength without unnecessary complexity.",
    whoFor: [
      "Beginners and early intermediates who prefer a simple progression story",
      "Lifters returning after a break who need structure without high variation",
      "Athletes who respond well to multi-week phases before changing emphasis",
    ],
    whoNot: [
      "Advanced lifters who already stall on long exclusive phases",
      "Athletes who need weekly undulation or high exercise rotation to stay healthy",
      "Anyone expecting a personalized coach plan from a template alone",
    ],
    structure: [
      {
        label: "Accumulation",
        weeks: "Weeks 1–4",
        intent: "Build work capacity with moderate intensity and clear progressive overload.",
      },
      {
        label: "Intensification",
        weeks: "Weeks 5–8",
        intent: "Raise relative intensity while trimming excess volume.",
      },
      {
        label: "Realization",
        weeks: "Weeks 9–12",
        intent: "Express strength with lower volume and heavier singles/doubles.",
      },
    ],
    comparisonRows: [
      { feature: "Duration", free: "4 weeks", full: "12 weeks" },
      { feature: "Phase coverage", free: "Accumulation only", full: "Full cycle through realization" },
      { feature: "Schedule options", free: "3-day / 4-day", full: "3-day / 4-day" },
      { feature: "Training max guidance", free: "Starter setup", full: "Full cycle progression rules" },
      { feature: "Price", free: "£0", full: "£49" },
    ],
    faq: [
      {
        question: "Is the free version the full program?",
        answer:
          "No. The free block is a 4-week starter so you can evaluate fit. The paid cycle continues through intensification and realization.",
      },
      {
        question: "Do I need a coach?",
        answer:
          "Templates are educational. They do not replace individualized coaching when you have injury constraints, meet peaking needs, or complex recovery issues.",
      },
      {
        question: "Will this guarantee a PR?",
        answer:
          "No. Outcomes depend on execution, recovery, sleep, and starting point. We do not invent success rates or promise results.",
      },
    ],
  },
  "dup-powerlifting-system": {
    familyId: "dup-powerlifting-system",
    displayName: "DUP Powerlifting System",
    tagline:
      "Weekly undulating squat, bench, and deadlift emphasis for lifters who progress with variation inside the microcycle.",
    whoFor: [
      "Intermediate powerlifters who train 3–4 days per week",
      "Lifters who stall on long linear phases and need within-week variety",
      "Athletes building toward meets without living only on heavy singles",
    ],
    whoNot: [
      "True beginners who still need a single simple progression model",
      "Lifters who cannot recover from frequent competition-lift exposure",
      "Anyone seeking a bodybuilding-only hypertrophy program",
    ],
    structure: [
      {
        label: "Foundation undulation",
        weeks: "Weeks 1–4",
        intent: "Establish hypertrophy / strength / intensity day roles.",
      },
      {
        label: "Load progression",
        weeks: "Weeks 5–10",
        intent: "Progress training maxes and tighten competition specificity.",
      },
      {
        label: "Peak window",
        weeks: "Weeks 11–14",
        intent: "Reduce fatigue and express competition lifts.",
      },
    ],
    comparisonRows: [
      { feature: "Duration", free: "4 weeks", full: "14 weeks" },
      { feature: "Undulating days", free: "Intro pattern", full: "Full meet-oriented cycle" },
      { feature: "Schedule options", free: "3-day / 4-day", full: "3-day / 4-day" },
      { feature: "Accessory structure", free: "Core set", full: "Full weak-point progression" },
      { feature: "Price", free: "£0", full: "£59" },
    ],
    faq: [
      {
        question: "What does DUP mean here?",
        answer:
          "Daily undulating periodization — intensity and volume targets change across sessions in the same week rather than locking one emphasis for many weeks.",
      },
      {
        question: "Can I run this without a meet date?",
        answer:
          "Yes. Treat the final weeks as a test window rather than a federation meet peak.",
      },
      {
        question: "Is this the same as the method encyclopedia entry?",
        answer:
          "It is built on DUP principles. The encyclopedia explains the method; this product is a concrete training cycle.",
      },
    ],
  },
  "block-periodisation": {
    familyId: "block-periodisation",
    displayName: "Block Periodisation",
    tagline:
      "Concentrated blocks that prioritize one quality at a time, then sequence residuals into performance.",
    whoFor: [
      "Intermediate to advanced lifters with a clear preparation window",
      "Athletes who benefit from focused overload rather than doing everything equally",
      "Lifters comfortable adjusting when residuals fade",
    ],
    whoNot: [
      "Novices who need simple progressive overload more than concentrated blocks",
      "Lifters with poor recovery who cannot tolerate accumulation loading",
      "Anyone who wants permanent high variety every session",
    ],
    structure: [
      {
        label: "Accumulation",
        weeks: "Weeks 1–4",
        intent: "Concentrated volume and work capacity on primary qualities.",
      },
      {
        label: "Transmutation",
        weeks: "Weeks 5–8",
        intent: "Shift toward competition lifts and higher intensity.",
      },
      {
        label: "Realization",
        weeks: "Weeks 9–12",
        intent: "Express performance with reduced volume and managed fatigue.",
      },
    ],
    comparisonRows: [
      { feature: "Duration", free: "4 weeks", full: "12 weeks" },
      { feature: "Block sequencing", free: "Accumulation sample", full: "Full 3-block sequence" },
      { feature: "Schedule options", free: "4-day / 5-day", full: "4-day / 5-day" },
      { feature: "Recovery demand", free: "High intro", full: "High — planned transitions" },
      { feature: "Price", free: "£0", full: "£59" },
    ],
    faq: [
      {
        question: "Why is recovery demand high?",
        answer:
          "Accumulation blocks concentrate stress by design. If sleep, stress, or joint health are unstable, choose a lower-demand system first.",
      },
      {
        question: "Is block periodisation always better?",
        answer:
          "No. Comparative research is context-dependent. Use blocks when you need concentration — not as marketing certainty.",
      },
    ],
  },
  "conjugate-strength-system": {
    familyId: "conjugate-strength-system",
    displayName: "Conjugate Strength System",
    tagline:
      "Max-effort and dynamic-effort rotation with special-exercise variation for advanced strength athletes.",
    whoFor: [
      "Advanced lifters who tolerate high neurological demand",
      "Powerlifters who need variation to keep competition lifts healthy",
      "Athletes with coaching literacy around special exercises",
    ],
    whoNot: [
      "Beginners who have not earned basic squat/bench/deadlift proficiency",
      "Lifters seeking a simple linear template",
      "Anyone who cannot recover from frequent heavy efforts",
    ],
    structure: [
      {
        label: "Establish ME / DE roles",
        weeks: "Weeks 1–4",
        intent: "Learn max-effort and dynamic-effort session structure.",
      },
      {
        label: "Special-exercise emphasis",
        weeks: "Weeks 5–12",
        intent: "Rotate variations while progressing absolute strength.",
      },
      {
        label: "Specificity block",
        weeks: "Weeks 13–16",
        intent: "Increase competition-lift specificity into a test window.",
      },
    ],
    comparisonRows: [
      { feature: "Duration", free: "4 weeks", full: "16 weeks" },
      { feature: "ME / DE structure", free: "Intro weeks", full: "Full conjugate cycle" },
      { feature: "Schedule options", free: "4-day", full: "4-day" },
      { feature: "Variation library", free: "Core set", full: "Expanded special exercises" },
      { feature: "Price", free: "£0", full: "£69" },
    ],
    faq: [
      {
        question: "Is this Westside?",
        answer:
          "It uses conjugate-style ME/DE logic. It is not a claim to any specific gym’s private programming or results.",
      },
      {
        question: "Can intermediates run it?",
        answer:
          "Only if recovery and technique are already solid. Most intermediates are better served by DUP or linear systems first.",
      },
    ],
  },
  "high-frequency-sbd": {
    familyId: "high-frequency-sbd",
    displayName: "High-Frequency SBD",
    tagline:
      "Frequent squat, bench, and deadlift exposures with deliberate fatigue management.",
    whoFor: [
      "Intermediate+ powerlifters who recover well from frequent practice",
      "Lifters who need more technique exposures on competition lifts",
      "Athletes who can protect sleep and joints under higher frequency",
    ],
    whoNot: [
      "Lifters with unresolved joint pain aggravated by frequent SBD work",
      "Beginners still learning basic positions",
      "Anyone with highly constrained recovery (shift work, high life stress) without adjusting volume",
    ],
    structure: [
      {
        label: "Frequency introduction",
        weeks: "Weeks 1–4",
        intent: "Raise exposure while keeping intensity moderate.",
      },
      {
        label: "Load density",
        weeks: "Weeks 5–8",
        intent: "Increase quality sets across the week with managed RPE.",
      },
      {
        label: "Performance focus",
        weeks: "Weeks 9–12",
        intent: "Keep frequency, raise specificity, trim junk volume.",
      },
    ],
    comparisonRows: [
      { feature: "Duration", free: "4 weeks", full: "12 weeks" },
      { feature: "Weekly exposures", free: "Intro frequency", full: "Full high-frequency plan" },
      { feature: "Schedule options", free: "4–6 day", full: "4–6 day" },
      { feature: "Fatigue management", free: "Starter rules", full: "Full autoregulation notes" },
      { feature: "Price", free: "£0", full: "£69" },
    ],
    faq: [
      {
        question: "Does high frequency mean maxing every day?",
        answer:
          "No. Frequency is about practice density. Most sessions stay well below failure with clear RPE caps.",
      },
      {
        question: "What if I only have three days?",
        answer:
          "Choose a 3-day system from the catalog instead. Forcing high frequency into too few days usually fails recovery.",
      },
    ],
  },
  "powerbuilding-hybrid": {
    familyId: "powerbuilding-hybrid",
    displayName: "Powerbuilding Hybrid",
    tagline:
      "Strength-primary main lifts with hypertrophy accessories for lifters who want both performance and muscle.",
    whoFor: [
      "Intermediates who care about strength and physique in the same block",
      "Lifters who want heavier compounds without pure bodybuilding volume",
      "Athletes with 4–5 training days and solid recovery",
    ],
    whoNot: [
      "Competitive powerlifters in a strict meet peak who need maximum specificity",
      "Bodybuilders seeking pure hypertrophy periodization",
      "Beginners who still need a single-focus strength foundation",
    ],
    structure: [
      {
        label: "Strength base",
        weeks: "Weeks 1–4",
        intent: "Establish main-lift progression with moderate accessory volume.",
      },
      {
        label: "Hybrid development",
        weeks: "Weeks 5–12",
        intent: "Progress compounds while expanding hypertrophy accessories.",
      },
      {
        label: "Expression",
        weeks: "Weeks 13–16",
        intent: "Test strength and consolidate physique work without junk mileage.",
      },
    ],
    comparisonRows: [
      { feature: "Duration", free: "4 weeks", full: "16 weeks" },
      { feature: "Main-lift focus", free: "Intro block", full: "Full strength + hypertrophy cycle" },
      { feature: "Schedule options", free: "4-day / 5-day", full: "4-day / 5-day" },
      { feature: "Accessory depth", free: "Core set", full: "Full accessory progressions" },
      { feature: "Price", free: "£0", full: "£59" },
    ],
    faq: [
      {
        question: "Will I get as strong as on a pure powerlifting plan?",
        answer:
          "Not necessarily. Hybrid plans trade some specificity for muscle-oriented accessories. Choose based on priority.",
      },
      {
        question: "Is the free month enough to judge fit?",
        answer:
          "It shows the session shape and recovery demand. The full cycle is where strength and hypertrophy progressions compound.",
      },
    ],
  },
  "complete-method-collection": {
    familyId: "complete-method-collection",
    displayName: "Complete Method Collection",
    tagline:
      "All six full paid program families in one launch bundle — switch systems as your goals change.",
    whoFor: [
      "Lifters who want multiple systems without buying each separately",
      "Coaches building a personal reference library of structured cycles",
      "Athletes who rotate methods across training years",
    ],
    whoNot: [
      "Someone who only needs one clear starter system right now",
      "Buyers expecting six simultaneous programs to run at once",
      "Anyone looking for personalized 1:1 coaching inside the bundle price",
    ],
    structure: [
      {
        label: "Choose a system",
        weeks: "Start",
        intent: "Pick one family that matches your current goal and schedule.",
      },
      {
        label: "Run a full cycle",
        weeks: "12–16 weeks",
        intent: "Complete one program before switching — avoid stacking systems.",
      },
      {
        label: "Rotate intentionally",
        weeks: "Later",
        intent: "Change families when goals, recovery, or meet calendars change.",
      },
    ],
    comparisonRows: [
      {
        feature: "Included programs",
        free: "Use individual free starters",
        full: "All 6 paid families",
      },
      {
        feature: "Launch price",
        free: "£0 per starter",
        full: "£199 bundle",
      },
      {
        feature: "Best for",
        free: "Testing one method",
        full: "Owning the full catalog",
      },
      {
        feature: "Simultaneous use",
        free: "One starter at a time",
        full: "Still one active cycle at a time",
      },
    ],
    faq: [
      {
        question: "Do I get the free starters too?",
        answer:
          "Free starters remain available on the catalog. The bundle unlocks the six full paid cycles.",
      },
      {
        question: "Is £199 a limited-time price?",
        answer:
          "This is the published launch price. We do not use countdown timers or fake scarcity on this page.",
      },
    ],
  },
};

export function getProgramFamilyContent(
  familyId: string | null | undefined,
): ProgramFamilyContent | null {
  if (!familyId) return null;
  return PROGRAM_FAMILY_CONTENT[familyId] ?? null;
}
