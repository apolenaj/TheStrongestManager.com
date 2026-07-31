/**
 * Homepage top-funnel copy (Phase 3 Part 1).
 * Brand + heroLines stay canonical for personalization anti-cloaking.
 */

export const homeCopy = {
  brand: "The Strongest",
  /** Canonical hero lines — never swapped by personalization. */
  heroLines: [
    "Build strength that",
    "survives the platform.",
  ],
  heroSupport:
    "Structured powerlifting coaching, technique feedback and evidence-led training tools for serious lifters who refuse to guess.",
  ambition:
    "No motivational posters. Precise planning, measurable progress, and discipline that transfers from logged sessions to better decisions.",
  ctaPrimary: "GET YOUR FREE STRENGTH AUDIT",
  ctaSecondary: "EXPLORE THE FREE TRAINING LIBRARY",
  trustRow: [
    "Evidence-led programming",
    "Individual progression",
    "Competition-focused coaching",
  ],
  goals: [
    {
      id: "stronger",
      title: "GET STRONGER",
      body: "Progressive loading, volume control, and next-session clarity from real logs.",
      href: "/goals/improve-deadlift",
      icon: "dumbbell",
    },
    {
      id: "technique",
      title: "FIX MY TECHNIQUE",
      body: "Upload a lift, get labeled feedback — observed vs estimated, never invented certainty.",
      href: "/technique-check",
      icon: "scan",
    },
    {
      id: "meet",
      title: "PREPARE FOR A MEET",
      body: "Peaking timelines, attempt strategy sketches, and IPF-aware competition context.",
      href: "/goals/powerlifting-program",
      icon: "flag",
    },
    {
      id: "learn",
      title: "LEARN FOR FREE",
      body: "Methods, academy paths, exercises, and guides — education without a paywall gate.",
      href: "/learn",
      icon: "book",
    },
  ],
  about: {
    eyebrow: "About",
    title: "A leader who measures performance under the bar and in operations",
    paragraphs: [
      "I have led large-scale retail and logistics operations where performance is not excused — throughput, precision, and the ability to decide under pressure are what count. I bring the same mental model to strength training: a clear objective, a controlled process, and hard feedback from reality.",
      "A deep IT background built the habit of designing systems, not moods. Data, periodization, and biomechanics are not decoration — they are the control layer. Management psychology completes the picture: discipline, composure, and accountability when the set is heavy or the decision is uncomfortable.",
      "Competitive powerlifting is held strictly to IPF standards. Depth, lockout, and platform rules are not details — they are a contract with the result. The Strongest connects these worlds into one operating system for strength and leadership.",
    ],
    closing:
      "Performance optimization is not motivation. It is management: plan, execute, measure, correct.",
  },
  pillars: [
    {
      id: "powerlifting",
      title: "The big three",
      body: "Squat, bench press, and deadlift as the foundation of strength. Technique, load, and progress driven by real sessions — not slogans.",
    },
    {
      id: "mental",
      title: "Mental resilience",
      body: "Discipline from hard sets transfers to business: composure under pressure, long-horizon consistency, and decisions without emotional noise.",
    },
    {
      id: "data",
      title: "Progress analytics",
      body: "Track volume, intensity, and trends only from data you actually log. No invented scores or fabricated success rates.",
    },
  ],
  approach: {
    eyebrow: "Training approach",
    title: "A professional strength system — not a fitness trend",
    description:
      "Built on periodization, biomechanics, and competitive powerlifting standards — with strict planning for every cycle.",
    items: [
      {
        id: "periodization",
        title: "Precise periodization",
        body: "Block and undulating structures: load, volume, and intensity are planned ahead and adjusted from work completed.",
        span: "lg:col-span-2",
      },
      {
        id: "biomechanics",
        title: "Biomechanics",
        body: "Technical feedback on the main lifts. Observed vs. estimated insights are always clearly labeled.",
        span: "lg:col-span-1",
      },
      {
        id: "ipf",
        title: "IPF standards",
        body: "Preparation respects IPF rules and standards — depth, lockout, equipment, and meet context where they matter.",
        span: "lg:col-span-1",
      },
      {
        id: "planning",
        title: "Strict planning",
        body: "Every week has a concrete intent. Today's session, deload, and peak are decisions from the plan — not accidents.",
        span: "lg:col-span-2",
      },
    ],
  },
  finalCta: {
    title: "Start building strength that holds under pressure.",
    body: "Create an account, set up your profile, and begin the first structured cycle. Data and recommendations arrive only from real training.",
  },
  intelligence: [
    {
      title: "Athlete profile",
      body: "Goals, training history, and reported readiness in one place.",
    },
    {
      title: "Labeled scores",
      body: "Scores state whether a value was observed, estimated, athlete-reported, or recommended.",
    },
    {
      title: "Next action",
      body: "Today and the dashboard point to the next useful step — usually the next workout.",
    },
  ],
  audiences: [
    "Powerlifting",
    "Bodybuilding",
    "Strongman",
    "Weightlifting",
    "General strength",
    "Hybrid athletes",
    "Coaches",
  ],
  faq: [
    {
      question: "Is The Strongest a random workout generator?",
      answer:
        "No. It combines athlete profile, programming, logging, technical feedback, and progress. It does not spit out a random workout from a slogan.",
    },
    {
      question: "Can the product diagnose injuries?",
      answer:
        "No. It does not diagnose injury or disease. If you have pain, reduce load and consult a qualified clinician.",
    },
    {
      question: "How precise is technique analysis?",
      answer:
        "Movement analysis runs when camera angle and pose data allow. Insights are labeled as observed, estimated, athlete-reported, or recommended.",
    },
    {
      question: "Is Mealnexio nutrition sync live?",
      answer:
        "Not yet. Nutrition shows connection status and empty targets until a real API adapter ships. We do not invent macros.",
    },
    {
      question: "How does pricing work?",
      answer:
        "Free, Pro, and Performance are listed on the Pricing page with features and limits.",
    },
    {
      question: "Do you publish success rates or athlete counts?",
      answer:
        "Only from real production data. Until then we show product capabilities and empty states — not invented testimonials.",
    },
    {
      question: "Who is it for?",
      answer:
        "Athletes and leaders who treat strength training as seriously as business performance — powerlifting, strength, and coaches.",
    },
  ],
} as const;
