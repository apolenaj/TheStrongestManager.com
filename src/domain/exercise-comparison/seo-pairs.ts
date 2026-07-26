/**
 * Allowlisted SEO exercise comparison pairs (Prompt 166).
 */

export type ExerciseComparisonSeoPair = {
  /** URL slug under /compare/exercises/[slug] */
  slug: string;
  exerciseA: string;
  exerciseB: string;
  title: string;
  description: string;
  /** Unique editorial intro for SEO — not boilerplate. */
  overview: string;
  faqs: Array<{ question: string; answer: string }>;
};

/**
 * Curated indexed pairs only — never cartesian A×B.
 */
export const EXERCISE_COMPARISON_SEO_PAIRS: readonly ExerciseComparisonSeoPair[] =
  [
    {
      slug: "romanian-deadlift-vs-stiff-leg-deadlift",
      exerciseA: "romanian-deadlift",
      exerciseB: "stiff-leg-deadlift",
      title: "Romanian Deadlift vs Stiff-Leg Deadlift",
      description:
        "Purpose, technique, muscles, fatigue, programming, and who should choose RDL vs stiff-leg deadlift — qualitative comparison.",
      overview:
        "Romanian and stiff-leg deadlifts are both hip hinges, but they are not the same lift. The RDL keeps soft knees and usually starts from standing with a controlled hinge. The stiff-leg deadlift keeps knee bend minimal, increasing hamstring length demand when positions are owned. This page compares purpose, technique, muscles, fatigue, programming, and who should choose which — without inventing superiority scores.",
      faqs: [
        {
          question: "Are RDL and stiff-leg deadlift interchangeable?",
          answer:
            "No. Soft knees versus near-fixed knees change the pattern and fatigue. Log them separately and choose based on the stimulus you want.",
        },
        {
          question: "Which is safer?",
          answer:
            "Neither is universally safer. Depth and load must match positions you can own. Sharp pain is a stop signal — this is not medical advice.",
        },
      ],
    },
    {
      slug: "deadlift-vs-romanian-deadlift",
      exerciseA: "deadlift",
      exerciseB: "romanian-deadlift",
      title: "Deadlift vs Romanian Deadlift",
      description:
        "Floor deadlift versus Romanian deadlift — start position, fatigue, and programming roles.",
      overview:
        "The conventional deadlift starts from the floor and trains a full pull to lockout. The Romanian deadlift typically starts standing and trains a controlled hinge. Comparing them clarifies purpose, technique, muscles, fatigue, programming, and selection — without numeric ranking scores.",
      faqs: [
        {
          question: "Can RDLs replace deadlifts?",
          answer:
            "They train related hinges but different start positions. Use RDLs as accessories or technique work; keep floor pulls when you need the full pattern.",
        },
      ],
    },
    {
      slug: "back-squat-vs-front-squat",
      exerciseA: "back-squat",
      exerciseB: "front-squat",
      title: "Back Squat vs Front Squat",
      description:
        "Bar position, torso angle, fatigue, and who should choose back squat versus front squat.",
      overview:
        "Back and front squats share a bilateral squat pattern but differ in bar position and torso demand. This comparison covers purpose, technique, muscles, fatigue, programming, and selection guidance for athletes choosing between them.",
      faqs: [
        {
          question: "Which builds stronger legs?",
          answer:
            "Both can develop the squat pattern. Choice depends on sport, rack skill, and the positions you can own — not a universal winner.",
        },
      ],
    },
  ];

export function getExerciseComparisonSeoPair(
  slug: string,
): ExerciseComparisonSeoPair | undefined {
  return EXERCISE_COMPARISON_SEO_PAIRS.find((p) => p.slug === slug);
}

export function allExerciseComparisonSeoSlugs(): string[] {
  return EXERCISE_COMPARISON_SEO_PAIRS.map((p) => p.slug);
}

export function findSeoPairForExercises(
  a: string,
  b: string,
): ExerciseComparisonSeoPair | undefined {
  const set = new Set([a, b]);
  return EXERCISE_COMPARISON_SEO_PAIRS.find(
    (p) => set.has(p.exerciseA) && set.has(p.exerciseB) && a !== b,
  );
}
