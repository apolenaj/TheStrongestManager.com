/**
 * Homepage Phase 4 — value & proof content.
 * Links point at real public routes; no invented athlete outcomes.
 */

export const knowledgeHubCopy = {
  eyebrow: "Free knowledge hub",
  title: "The free strength library I wish I had when I started.",
  description:
    "Premium-quality explainers with reading time, difficulty, and a clear benefit — linked to real product pages.",
  categories: [
    { id: "all", label: "All" },
    { id: "methods", label: "Methods" },
    { id: "technique", label: "Technique" },
    { id: "programming", label: "Programming" },
    { id: "competition", label: "Competition" },
  ],
  resources: [
    {
      id: "linear",
      category: "methods",
      title: "Linear periodization",
      benefit: "Understand volume-to-intensity progression before you copy a template.",
      readingTime: "8 min",
      difficulty: "Intermediate",
      href: "/methods/linear-periodization",
    },
    {
      id: "conjugate",
      category: "methods",
      title: "Conjugate method",
      benefit: "See max effort / dynamic effort logic without Westside mythology.",
      readingTime: "10 min",
      difficulty: "Advanced",
      href: "/methods/conjugate",
    },
    {
      id: "dup",
      category: "methods",
      title: "Daily undulating periodization",
      benefit: "Learn how RPE-friendly undulation differs from classic linear phases.",
      readingTime: "7 min",
      difficulty: "Intermediate",
      href: "/methods/daily-undulating-periodization",
    },
    {
      id: "technique-path",
      category: "technique",
      title: "Exercise technique path",
      benefit: "Connect technique study to tools you can actually run in-product.",
      readingTime: "6 min",
      difficulty: "Beginner",
      href: "/learn/exercise-technique",
    },
    {
      id: "deadlift-guide",
      category: "technique",
      title: "Deadlift variations guide",
      benefit: "Map conventional, sumo, and Romanian work to training intent.",
      readingTime: "9 min",
      difficulty: "Intermediate",
      href: "/guides/deadlift-variations",
    },
    {
      id: "programming-academy",
      category: "programming",
      title: "Powerlifting programming academy",
      benefit: "Structured course path for meet-oriented programming literacy.",
      readingTime: "Course",
      difficulty: "Intermediate",
      href: "/academy/powerlifting-programming",
    },
    {
      id: "block",
      category: "programming",
      title: "Block periodization",
      benefit: "Concentrated blocks and residual effects — without Instagram shortcuts.",
      readingTime: "9 min",
      difficulty: "Advanced",
      href: "/methods/block-periodization",
    },
    {
      id: "meet-goal",
      category: "competition",
      title: "Powerlifting program landing",
      benefit: "How competition prep connects to real platform features.",
      readingTime: "5 min",
      difficulty: "Beginner",
      href: "/goals/powerlifting-program",
    },
  ],
} as const;

export const coachingProcessSteps = [
  {
    id: "01",
    title: "Assessment",
    body: "Capture goals, schedule, weak lifts, and constraints. No program before context.",
  },
  {
    id: "02",
    title: "Build",
    body: "Construct a block with clear intent — volume, intensity, and exercise selection.",
  },
  {
    id: "03",
    title: "Adjust",
    body: "Change the plan from logged sessions and labeled feedback — not vibes.",
  },
  {
    id: "04",
    title: "Perform",
    body: "Execute heavy days and meet timelines with standards that survive the platform.",
  },
] as const;

export const platformPreviewCopy = {
  eyebrow: "Athlete platform",
  title: "A training OS that shows what matters next",
  description:
    "UI preview of the athlete workspace layout. Sample chrome only — not live athlete data and not invented performance charts.",
  currentBlock: {
    label: "Current block",
    value: "Block 2 · Accumulation",
    detail: "Emphasis: squat volume · week 3 of 6",
  },
  readiness: {
    label: "Readiness",
    value: "Athlete-reported",
    detail: "Sleep · soreness · stress — only after check-in",
  },
  nextHeavy: {
    label: "Next heavy session",
    value: "Thursday · Squat priority",
    detail: "Planned top sets shown after you assign a program",
  },
} as const;

export const proofCopy = {
  eyebrow: "Proof & credibility",
  title: "Built in real training. Tested under real load.",
  description:
    "Case studies and testimonials publish only from verified athletes and measurable work. Until then, slots stay empty — we do not invent names or PRs.",
} as const;

/** Phase 5 — conversion */
export const aboutJosefCopy = {
  eyebrow: "About Josef",
  title: "Coaching built from experience, not theory alone.",
  preview:
    "Josef coaches at the intersection of competitive powerlifting and professional performance — IPF standards under the bar, systems thinking from operations and IT leadership. The work is practical: assess, build, adjust, perform.",
  bullets: [
    "Competitive powerlifting held to IPF rules and platform standards",
    "Professional performance shaped by retail, logistics, and IT systems work",
    "Management psychology applied to discipline under pressure — not motivational slogans",
  ],
  href: "/about",
  cta: "Read the full About page",
} as const;

export const coachingOptionsCopy = {
  eyebrow: "Coaching options",
  title: "Three clear ways to start",
  description:
    "Pick the level of support you need. No four-tier pricing maze — just free tools, the performance platform, or direct 1:1 coaching.",
  options: [
    {
      id: "free",
      title: "Free",
      summary: "Guides, calculators, and the strength library — start without a paywall.",
      includes: [
        "Training methods & learn paths",
        "Calculator suite",
        "Program audit & technique check entry points",
      ],
      href: "/signup",
      cta: "START FREE",
      featured: false,
    },
    {
      id: "platform",
      title: "Performance Platform",
      summary: "Data, templates, and the athlete workspace for structured progression.",
      includes: [
        "Athlete profile & session logging",
        "Programming and progress surfaces",
        "Demo workspace to explore before you commit",
      ],
      href: "/demo",
      cta: "EXPLORE THE PLATFORM",
      featured: true,
    },
    {
      id: "one-to-one",
      title: "1:1 Coaching",
      summary: "Direct individual support for lifters who need accountability and meet prep.",
      includes: [
        "Premium coaching application",
        "Competition-focused planning",
        "Human review where the product supports it",
      ],
      href: "/coaching/apply",
      cta: "APPLY FOR COACHING",
      featured: false,
    },
  ],
} as const;

export const finalCtaCopy = {
  title: "Stop guessing. Start building.",
  body: "Run a free strength audit, explore the library, or apply for coaching — every path leads to a real product surface.",
  primaryHref: "/program-audit",
  primaryCta: "GET YOUR FREE STRENGTH AUDIT",
  secondaryHref: "/signup",
  secondaryCta: "START FREE",
} as const;
