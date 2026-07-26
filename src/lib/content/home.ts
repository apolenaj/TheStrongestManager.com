export const homeCopy = {
  brand: "TheStrongestManager",
  heroLines: [
    "Upload a lift.",
    "See what needs work.",
    "Know what to change next.",
  ],
  heroSupport:
    "Profile, programming, technique review, recovery, and progress for strength athletes. Charts and scores appear only after you log real training.",
  ambition:
    "Built for lifters and coaches who want clearer decisions from the sessions they already train — not slogans or invented stats.",
  pillars: [
    {
      title: "Understand",
      body: "Keep goals, training history, technique notes, and recovery check-ins in one athlete profile before you change the plan.",
    },
    {
      title: "Train",
      body: "Run today’s session from an assigned program, log sets as you go, and keep the next workout concrete.",
    },
    {
      title: "Improve",
      body: "Use Progress and Today to answer one question: what should I do in the next session?",
    },
  ],
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
      question: "Is TheStrongestManager a workout generator?",
      answer:
        "No. It combines athlete profile, programming, workout logging, technique review, recovery check-ins, and progress charts. It does not spit out a random workout from a slogan.",
    },
    {
      question: "Can the product diagnose injuries?",
      answer:
        "No. It does not diagnose injury or disease. If you have pain, reduce load and consult a qualified clinician.",
    },
    {
      question: "How precise is technique analysis?",
      answer:
        "Deadlift movement analysis can run today when camera angle and pose data are suitable. Insights are labeled as observed, estimated, athlete-reported, or recommended. We do not invent exact strength-loss percentages or medical certainty.",
    },
    {
      question: "Is Mealnexio nutrition sync live?",
      answer:
        "Not yet. Nutrition shows connection status and empty targets until a real Mealnexio API adapter ships. We do not invent macros.",
    },
    {
      question: "How does pricing work?",
      answer:
        "Free, Pro, and Performance are listed on the pricing page with features and limits. Monthly is the default; annual is optional. Self-serve checkout opens only when Stripe is configured — list prices alone do not charge a card.",
    },
    {
      question: "Do you publish success rates or athlete counts?",
      answer:
        "Only from real production data. Until then we show product capabilities and empty states — not invented testimonials or statistics.",
    },
    {
      question: "Who is it for?",
      answer:
        "Powerlifting, bodybuilding, strongman, weightlifting, general strength, hybrid athletes, and coaches who want structured training tools — not lifestyle fitness fluff.",
    },
  ],
} as const;
