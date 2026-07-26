/**
 * Allowlisted sport / goal landing pages (Prompt 167).
 */

import type { SportGoalLanding } from "@/domain/sport-goal-landings/constants";

/**
 * Curated high-quality landings only.
 * Examples from the prompt: Improve Deadlift, Build Bigger Chest,
 * Powerlifting Program, Strongman Training.
 */
export const SPORT_GOAL_LANDINGS: readonly SportGoalLanding[] = [
  {
    slug: "improve-deadlift",
    title: "Improve your deadlift",
    goalLabel: "Improve Deadlift",
    description:
      "A practical path to a stronger deadlift — technique review, programming context, and accessory hinges inside TheStrongestManager.",
    overview:
      "Improving a deadlift is rarely one cue and a motivational paragraph. You need an honest pull pattern, a place to log sessions, and accessories that match the hinge you actually train. This page points into the product features that support that work — deadlift technique pages, Romanian vs stiff-leg comparisons, today’s session logging, and technique uploads — instead of a keyword essay with no next step.",
    uniqueValueKey: "goal:improve-deadlift-v1",
    primaryCta: { href: "/signup", label: "Start free and log a pull" },
    sections: [
      {
        heading: "Own the pull before chasing load",
        body: "Use the deadlift exercise page for setup, execution, and common mistakes grounded in coaching practice. When camera angle is suitable, upload a set for technique review so feedback is tied to your video — not generic internet form tips.",
      },
      {
        heading: "Choose accessories that match the hinge",
        body: "Romanian and stiff-leg deadlifts are related hinges with different knee bend and fatigue. Compare them in the exercise comparison engine, then log them as separate exercises so Progress does not collapse distinct patterns into one number.",
      },
      {
        heading: "Program the week you will actually train",
        body: "Assign or follow a program, then run Today’s session so the next pull is concrete. Scores and charts appear after real training — we do not invent deadlift PRs for SEO.",
      },
    ],
    productLinks: [
      {
        href: "/exercises/deadlift",
        label: "Deadlift technique",
        reason: "Setup, execution, mistakes, and safety notes for the floor pull.",
        surface: "public",
      },
      {
        href: "/compare/exercises/romanian-deadlift-vs-stiff-leg-deadlift",
        label: "RDL vs stiff-leg",
        reason: "Pick the accessory hinge that matches your intent.",
        surface: "public",
      },
      {
        href: "/app/technique",
        label: "Technique uploads",
        reason: "Review a set with labeled observations — not medical certainty.",
        surface: "app",
      },
      {
        href: "/app/today",
        label: "Today’s workout",
        reason: "Log the next session instead of collecting unread tips.",
        surface: "app",
      },
      {
        href: "/guides/deadlift-variations",
        label: "Deadlift variations guide",
        reason: "When variation labels matter without thin stub URLs.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Will this page give me a custom deadlift program?",
        answer:
          "No. It routes you into programming and logging tools. Programs are assigned or built in-product — we do not invent a secret template from this landing.",
      },
      {
        question: "Can technique analysis diagnose injury?",
        answer:
          "No. Pain is a stop signal. Seek a qualified clinician for medical questions. Technique insights are labeled observed, estimated, or recommended.",
      },
    ],
  },
  {
    slug: "build-bigger-chest",
    title: "Build a bigger chest",
    goalLabel: "Build Bigger Chest",
    description:
      "Press variations, honest logging, and programming context for chest development — linked to real exercises and product features.",
    overview:
      "“Build a bigger chest” pages usually recycle the same three presses and a protein slogan. Here the goal is product-backed: compare horizontal press options you can actually open, log volume in Today, and keep technique honest on bench work — without inventing hypertrophy percentages or fake athlete results.",
    uniqueValueKey: "goal:build-bigger-chest-v1",
    primaryCta: { href: "/signup", label: "Start free and log presses" },
    sections: [
      {
        heading: "Press patterns that exist in the catalog",
        body: "Barbell bench, dumbbell bench, machine chest press, and push-ups are published exercises with coaching fields — not AI stubs. Pick the implements you have, then keep them distinct in the log so Progress reflects what you trained.",
      },
      {
        heading: "Volume only counts if you record it",
        body: "Use Today and Progress after real sessions. We do not show invented “optimal chest volume” charts for SEO. Empty states stay empty until you train.",
      },
      {
        heading: "Technique and shoulder position",
        body: "Heavy pressing benefits from positions you can own. Upload a set when you want technique feedback; stop for sharp pain and seek clinical care when needed — this product does not diagnose.",
      },
    ],
    productLinks: [
      {
        href: "/exercises/bench-press",
        label: "Bench press",
        reason: "Primary horizontal barbell press reference.",
        surface: "public",
      },
      {
        href: "/exercises/dumbbell-bench-press",
        label: "Dumbbell bench press",
        reason: "Independent loading when a barbell is not the right tool.",
        surface: "public",
      },
      {
        href: "/exercises/machine-chest-press",
        label: "Machine chest press",
        reason: "Stable press option for volume or equipment constraints.",
        surface: "public",
      },
      {
        href: "/app/today",
        label: "Today’s workout",
        reason: "Log pressing sessions you actually complete.",
        surface: "app",
      },
      {
        href: "/learn/bodybuilding",
        label: "Bodybuilding pillar",
        reason: "Broader physique training context without thin stubs.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "What is the best chest exercise?",
        answer:
          "There is no universal winner. Match presses to equipment and positions you can own. This landing links catalog pages — it does not invent a ranking score.",
      },
    ],
  },
  {
    slug: "powerlifting-program",
    title: "Powerlifting program",
    goalLabel: "Powerlifting Program",
    description:
      "How TheStrongestManager supports powerlifting training — squat, bench, deadlift, programming, and Powerlifting Mode — without a fake downloadable template.",
    overview:
      "Searching “powerlifting program” often yields PDF spam and affiliate spreadsheets. This landing explains how programming, the big three exercises, method context, and Powerlifting Mode connect inside the product. It does not pretend a single secret template lives behind a button.",
    uniqueValueKey: "goal:powerlifting-program-v1",
    primaryCta: { href: "/signup", label: "Create athlete profile" },
    sections: [
      {
        heading: "The lifts are real catalog pages",
        body: "Back squat, bench press, and deadlift carry setup, execution, and safety notes. Compare front vs back squat when upright torso demand matters. Use technique uploads when you want feedback on a competition-style set.",
      },
      {
        heading: "Programming lives in the app",
        body: "Assign or build programs, then run Today. Adaptive and weekly review features use logged sessions — not invented meet results. Academy powerlifting programming courses exist when you want structured learning.",
      },
      {
        heading: "Powerlifting Mode for competition context",
        body: "When enabled, Powerlifting Mode surfaces meet-oriented product context for athletes who compete or peaking toward a total. It does not replace a coach or invent attempt selections.",
      },
    ],
    productLinks: [
      {
        href: "/learn/powerlifting",
        label: "Powerlifting learn pillar",
        reason: "Topic overview with links to deep product pages.",
        surface: "public",
      },
      {
        href: "/exercises/back-squat",
        label: "Back squat",
        reason: "Primary squat reference for many powerlifters.",
        surface: "public",
      },
      {
        href: "/exercises/bench-press",
        label: "Bench press",
        reason: "Competition-style press technique page.",
        surface: "public",
      },
      {
        href: "/exercises/deadlift",
        label: "Deadlift",
        reason: "Floor pull reference for the total.",
        surface: "public",
      },
      {
        href: "/app/programs",
        label: "Programs",
        reason: "Assign or manage training programs you will actually run.",
        surface: "app",
      },
      {
        href: "/app/powerlifting",
        label: "Powerlifting Mode",
        reason: "Competition-oriented product surface when the flag is on.",
        surface: "app",
      },
      {
        href: "/academy/powerlifting-programming",
        label: "Powerlifting programming (Academy)",
        reason: "Structured learning — Certificate of Completion courses.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Can I download a free powerlifting spreadsheet here?",
        answer:
          "No. This page links into in-product programming and learning. We do not invent a viral template for search rankings.",
      },
    ],
  },
  {
    slug: "strongman-training",
    title: "Strongman training",
    goalLabel: "Strongman Training",
    description:
      "Strongman-oriented training in TheStrongestManager — event-aware product context, hinge/press strength, and honest logging without thin event stub pages.",
    overview:
      "Strongman training mixes gym strength with event skill. Mass SEO sites often mint a thin page per implement. We refuse that: this landing connects Strongman Mode, relevant strength exercises, methods, and session logging — while learn/strongman explains why we do not flood the sitemap with event stubs.",
    uniqueValueKey: "goal:strongman-training-v1",
    primaryCta: { href: "/signup", label: "Start free athlete profile" },
    sections: [
      {
        heading: "Strength bases that transfer",
        body: "Deadlifts, presses, and squats remain useful bases for many strongman athletes. Use catalog technique pages and technique uploads for gym lifts; event practice still belongs in your real training environment.",
      },
      {
        heading: "Strongman Mode without fake events",
        body: "Strongman Mode provides product context for multi-event athletes when enabled. We do not auto-generate hundreds of “atlas stone tip” URLs with no unique coaching value.",
      },
      {
        heading: "Log what you trained",
        body: "Today and Progress only reflect sessions you complete. That honesty matters more than a keyword landing promising contest-day miracles.",
      },
    ],
    productLinks: [
      {
        href: "/learn/strongman",
        label: "Strongman learn pillar",
        reason: "Honest cluster overview — no thin event factory.",
        surface: "public",
      },
      {
        href: "/app/strongman",
        label: "Strongman Mode",
        reason: "Product surface for strongman-oriented athletes.",
        surface: "app",
      },
      {
        href: "/exercises/deadlift",
        label: "Deadlift",
        reason: "Foundational pull strength many strongman athletes train.",
        surface: "public",
      },
      {
        href: "/exercises/overhead-press",
        label: "Overhead press",
        reason: "Vertical press strength relevant to many events.",
        surface: "public",
      },
      {
        href: "/app/today",
        label: "Today’s workout",
        reason: "Log gym sessions that support event practice.",
        surface: "app",
      },
      {
        href: "/methods",
        label: "Training methods",
        reason: "Programming approaches without invented rankings.",
        surface: "public",
      },
    ],
    faqs: [
      {
        question: "Where are atlas stone / yoke pages?",
        answer:
          "We do not ship thin per-event SEO stubs. Train events in practice; use this product for logging, programming context, and gym lift technique.",
      },
    ],
  },
] as const;

export function getSportGoalLanding(
  slug: string,
): SportGoalLanding | undefined {
  return SPORT_GOAL_LANDINGS.find((p) => p.slug === slug);
}

export function allSportGoalLandingSlugs(): string[] {
  return SPORT_GOAL_LANDINGS.map((p) => p.slug);
}
