import type { SeoTopicCluster } from "@/domain/seo/types";

/**
 * Core SEO topic clusters (Prompt 39).
 * Each pillar is a curated, meaningful page. Supporting pages are existing deep URLs only.
 */

export const SEO_TOPIC_CLUSTERS: SeoTopicCluster[] = [
  {
    slug: "exercise-technique",
    title: "Exercise technique",
    clusterLabel: "Exercise technique",
    description:
      "How to set up, execute, and brace major strength lifts without inventing medical claims.",
    overview:
      "Exercise technique content on TheStrongestManager focuses on coaching-practice cues you can apply in the gym: setup, bracing, bar path, and finish positions. We pair written guides with exercise intelligence pages and Academy modules — not thin keyword stubs. Technique scores and reports, when available in the app, are labelled by source and confidence.",
    sections: [
      {
        heading: "What “good technique” means here",
        body: "Technique is context-dependent: sport rules, leverages, injury history, and load all matter. Our public pages describe general coaching practice. They are not physical therapy, and they do not diagnose pain. When in doubt, reduce load and consult a qualified professional.",
      },
      {
        heading: "How we structure technique content",
        body: "Each priority exercise page covers setup, execution, breathing/bracing, common mistakes, and programming uses. Academy courses such as Deadlift Specialist go deeper on hinge mechanics and faults. App technique analysis is separate and never invents pose data.",
      },
    ],
    faqs: [
      {
        question: "Are technique pages medical advice?",
        answer:
          "No. They are coaching-practice education. Pain, injury, or rehab questions belong with licensed clinicians.",
      },
      {
        question: "Do you publish a page for every exercise variation?",
        answer:
          "No. We publish substantial exercise intelligence for curated lifts and link variations from those pages — we avoid thousands of thin AI pages.",
      },
    ],
    supportingPages: [
      {
        href: "/exercises",
        title: "Exercise library",
        reason: "Browse published exercise intelligence pages",
      },
      {
        href: "/exercises/back-squat",
        title: "Back squat",
        reason: "Foundational squat technique guide",
      },
      {
        href: "/academy/deadlift-specialist",
        title: "Deadlift Specialist (Academy)",
        reason: "Structured deadlift technique course",
      },
      {
        href: "/learn/technique-errors",
        title: "Technique errors cluster",
        reason: "Common faults and honest coaching responses",
      },
    ],
    relatedClusterSlugs: ["exercise-variations", "technique-errors", "powerlifting"],
  },
  {
    slug: "exercise-variations",
    title: "Exercise variations",
    clusterLabel: "Exercise variations",
    description:
      "When and why to use regressions, progressions, and related variations — without spam pages.",
    overview:
      "Variations exist to change stimulus, work around constraints, or increase specificity. This pillar explains how we think about variation selection and points to real exercise pages that declare related movements — instead of generating empty “variation” URLs for every keyword.",
    sections: [
      {
        heading: "Regressions and progressions",
        body: "A regression reduces complexity or load demand so the athlete can own positions. A progression increases demand or specificity. Both should have a purpose tied to the main lift or the athlete’s goal — not novelty for its own sake.",
      },
      {
        heading: "How this site represents variations",
        body: "Exercise intelligence records can link related exercises (regression, progression, variation). We only index pages with full coaching sections. Missing a variation page means it is not published yet — not that you should invent one.",
      },
    ],
    faqs: [
      {
        question: "Will every accessory get its own SEO page?",
        answer:
          "Only when the page has meaningful coaching content. Accessories may appear inside programming guides without a standalone thin URL.",
      },
    ],
    supportingPages: [
      {
        href: "/exercises",
        title: "Exercise library",
        reason: "Published lifts with relation links",
      },
      {
        href: "/learn/exercise-technique",
        title: "Exercise technique",
        reason: "Parent technique cluster",
      },
      {
        href: "/learn/programming",
        title: "Programming",
        reason: "When variations belong in a plan",
      },
    ],
    relatedClusterSlugs: ["exercise-technique", "programming", "bodybuilding"],
  },
  {
    slug: "training-methods",
    title: "Training methods",
    clusterLabel: "Training methods",
    description:
      "Periodization and programming systems with historical vs modern framing.",
    overview:
      "Training methods pages explain systems such as linear periodization, block periodization, and DUP with clear separation between historical origins and modern coaching interpretation. Comparative “best method” claims stay modest — context beats dogma.",
    sections: [
      {
        heading: "Pillar content lives on Methods",
        body: "The Methods catalog is the primary deep content for this cluster. Each method page covers principles, use cases, limitations, fatigue notes, and honesty about evidence. History eras link into methods without rewriting the same page twice.",
      },
      {
        heading: "Tools that help you choose",
        body: "Fit recommends approaches from transparent rules. Compare places two or three methods side by side qualitatively. Neither invents scientific superiority scores.",
      },
    ],
    faqs: [
      {
        question: "Is one periodization style proven best?",
        answer:
          "No single style is universally best. Research is mixed and highly context-dependent. We describe trade-offs instead of crowning a winner.",
      },
    ],
    supportingPages: [
      { href: "/methods", title: "Methods catalog", reason: "Full method knowledge base" },
      { href: "/history", title: "History of training", reason: "How methods evolved culturally" },
      {
        href: "/history/archive",
        title: "Historical Training Archive",
        reason: "Systems, coaches, and methods with three analytical lenses",
      },
      { href: "/fit", title: "What fits me?", reason: "Rule-based method fit tool" },
      { href: "/compare", title: "Compare methods", reason: "Qualitative 2–3 method compare" },
    ],
    relatedClusterSlugs: ["programming", "powerlifting", "performance"],
  },
  {
    slug: "powerlifting",
    title: "Powerlifting",
    clusterLabel: "Powerlifting",
    description:
      "Squat, bench, deadlift training culture, peaking sketches, and technique priorities.",
    overview:
      "Powerlifting content here covers the competition lifts, programming toward a meet, and technique priorities — framed as coaching practice. Federation rules differ; always check your rulebook for commands, depth, and equipment.",
    sections: [
      {
        heading: "The big three as skill and strength",
        body: "Powerlifting rewards both absolute strength and repeatable technique under commands. Public exercise pages for squat and related lifts, plus Academy powerlifting programming, give structured starting points — not guaranteed meet totals.",
      },
      {
        heading: "Peaking without magic",
        body: "Tapers usually reduce fatigue while keeping some intensity. Exact timing varies by athlete. Our Academy course on powerlifting programming treats peaking as an illustrative sketch, not a promise.",
      },
    ],
    faqs: [
      {
        question: "Do you sell meet attempt selection as science?",
        answer:
          "No. Attempt selection is coaching judgment under uncertainty. We do not fabricate certainty scores for opens or thirds.",
      },
    ],
    supportingPages: [
      { href: "/exercises/back-squat", title: "Back squat", reason: "Competition squat guide" },
      {
        href: "/academy/powerlifting-programming",
        title: "Powerlifting Programming",
        reason: "Academy course on weekly structure and peaking",
      },
      { href: "/methods", title: "Training methods", reason: "Periodization options for meet prep" },
      { href: "/learn/exercise-technique", title: "Exercise technique", reason: "Technique cluster" },
      {
        href: "/legendary-methods",
        title: "Legendary Methods",
        reason: "Independent analyses of elite powerlifting systems",
      },
    ],
    relatedClusterSlugs: ["exercise-technique", "programming", "strongman"],
  },
  {
    slug: "bodybuilding",
    title: "Bodybuilding",
    clusterLabel: "Bodybuilding",
    description:
      "Hypertrophy-oriented training themes, volume ideas, and physique goals — without fake steroid or “secret” claims.",
    overview:
      "Bodybuilding-oriented content emphasizes muscle stimulus, recovery, and sustainable volume. We do not publish medical protocols or exaggerate supplement claims. Exercise pages note physique sport relevance where appropriate; programming fundamentals cover progressive overload honestly.",
    sections: [
      {
        heading: "Volume as a tool, not a contest",
        body: "Hard sets per week matter more than collecting random exercises. Beginners often progress with modest volume and consistency. Advanced physiques may need more — and more recovery.",
      },
      {
        heading: "Where to go next on this site",
        body: "Use the exercise library for execution quality, Programming Fundamentals in Academy for overload basics, and Methods for structuring mesocycles. Nutrition targets may integrate with Mealnexio later — sync is never faked.",
      },
    ],
    faqs: [
      {
        question: "Do you claim a perfect hypertrophy rep range?",
        answer:
          "No. Multiple rep ranges can build muscle when sets are challenging and recoverable. We avoid one-size dogma.",
      },
    ],
    supportingPages: [
      { href: "/exercises", title: "Exercise library", reason: "Execution for hypertrophy work" },
      {
        href: "/academy/programming-fundamentals",
        title: "Programming Fundamentals",
        reason: "Volume, intensity, overload basics",
      },
      { href: "/methods", title: "Methods", reason: "Organizing hypertrophy phases" },
      {
        href: "/legendary-methods",
        title: "Legendary Methods",
        reason: "Independent analyses of Golden Era volume systems",
      },
    ],
    relatedClusterSlugs: ["programming", "exercise-variations", "performance"],
  },
  {
    slug: "strongman",
    title: "Strongman",
    clusterLabel: "Strongman",
    description:
      "Event-oriented strength, odd objects, and conditioning — general education, not contest rulebooks.",
    overview:
      "Strongman training blends maximal strength, odd-object skill, and event conditioning. Contests vary widely by federation and promoter. This pillar orients you to themes and points to overlapping strength methods and exercise patterns — without inventing event-specific thin pages for every implement.",
    sections: [
      {
        heading: "Overlap with barbell strength",
        body: "Squats, pulls, presses, and loaded carries transfer. Technique priorities still matter: bracing, foot pressure, and fatigue management. Use published exercise guides where they apply; event practice belongs under a coach or contest prep plan.",
      },
      {
        heading: "What we will not do",
        body: "We will not mass-generate “best yoke run cues” stubs for every keyword. When we publish strongman-specific deep guides, they will meet the same substance bar as Methods and History pages.",
      },
    ],
    faqs: [
      {
        question: "Are strongman rules covered here?",
        answer:
          "Only at a high level. Always verify commands and implement specs with your contest organizer.",
      },
    ],
    supportingPages: [
      { href: "/exercises", title: "Exercise library", reason: "Overlapping strength patterns" },
      { href: "/methods", title: "Training methods", reason: "Organizing strength blocks" },
      { href: "/learn/powerlifting", title: "Powerlifting", reason: "Maximal strength overlap" },
      { href: "/learn/performance", title: "Performance", reason: "Broader performance cluster" },
      {
        href: "/legendary-methods",
        title: "Legendary Methods",
        reason: "Independent analyses of strongman strength systems",
      },
    ],
    relatedClusterSlugs: ["powerlifting", "performance", "programming"],
  },
  {
    slug: "programming",
    title: "Programming",
    clusterLabel: "Programming",
    description:
      "Volume, intensity, progressive overload, and plan structure for strength sports.",
    overview:
      "Programming content teaches how to organize stress over time: hard sets, intensity tools (percent, RPE), deloads, and phase themes. Academy courses and Methods pages carry the depth; this pillar ties them together for searchers who start with “programming.”",
    sections: [
      {
        heading: "Principles before templates",
        body: "A copied spreadsheet is not a diagnosis of what you need. Start from goal, recovery, and training age. Progressive overload should match recovery — not ego.",
      },
      {
        heading: "Product connection",
        body: "Inside the app, adaptive suggestions are labelled separately from human coach decisions. Public Academy courses issue a Certificate of Completion only — not accredited certifications.",
      },
    ],
    faqs: [
      {
        question: "Do you auto-generate a unique program page per keyword?",
        answer:
          "No. Programming depth lives in Academy, Methods, and in-app plans — not thousands of thin “program for X” URLs.",
      },
    ],
    supportingPages: [
      {
        href: "/academy/programming-fundamentals",
        title: "Programming Fundamentals",
        reason: "Core Academy course",
      },
      {
        href: "/academy/powerlifting-programming",
        title: "Powerlifting Programming",
        reason: "Meet-oriented structure",
      },
      { href: "/methods", title: "Methods catalog", reason: "Periodization systems" },
      { href: "/fit", title: "Fit engine", reason: "Choose an approach transparently" },
      {
        href: "/legendary-methods",
        title: "Legendary Methods",
        reason: "Historical systems analysed for modern transfer",
      },
    ],
    relatedClusterSlugs: ["training-methods", "powerlifting", "performance"],
  },
  {
    slug: "technique-errors",
    title: "Technique errors",
    clusterLabel: "Technique errors",
    description:
      "Common lifting faults, honest causes, and coaching responses — without injury diagnosis.",
    overview:
      "Most “errors” are load, fatigue, mobility constraints, or unclear cues — not moral failures. This cluster frames faults as solvable coaching problems. We link to technique guides and Academy modules instead of fear-based thin pages.",
    sections: [
      {
        heading: "Observe before you label",
        body: "Film from the side when possible. Ask what the athlete felt. One ugly rep at a heavy single is not the same as a consistent pattern. Avoid inventing injury names from a single video.",
      },
      {
        heading: "App technique reports",
        body: "When movement analysis runs, scores and drills are gated by confidence and honesty contracts. System failures refund credits; we do not fake pose detection.",
      },
    ],
    faqs: [
      {
        question: "If I have pain, should I follow these pages?",
        answer:
          "Stop aggravating loading and seek appropriate clinical care. These pages do not replace diagnosis or rehab plans.",
      },
    ],
    supportingPages: [
      {
        href: "/learn/exercise-technique",
        title: "Exercise technique",
        reason: "Parent technique cluster",
      },
      {
        href: "/academy/deadlift-specialist",
        title: "Deadlift Specialist",
        reason: "Faults and lockout education",
      },
      { href: "/exercises", title: "Exercise library", reason: "Common mistakes sections per lift" },
    ],
    relatedClusterSlugs: ["exercise-technique", "powerlifting", "performance"],
  },
  {
    slug: "performance",
    title: "Performance",
    clusterLabel: "Performance",
    description:
      "Strength, readiness, progress, and what to do next — grounded in logged training.",
    overview:
      "Performance here means connecting training, technique, recovery, and progress without inventing readiness science. Public guides explain the approach; the app stays empty until you have data.",
    sections: [
      {
        heading: "Cross-domain thinking",
        body: "Insights combine training, recovery, nutrition status, and body metrics only when evidence exists. Confidence is stated. We do not invent wearable connections.",
      },
      {
        heading: "Measure what you train",
        body: "Progress analytics cover strength, volume, and consistency where logs exist. Scores declare their source. Marketing never claims guaranteed PRs.",
      },
    ],
    faqs: [
      {
        question: "Is TheStrongestManager a medical device?",
        answer:
          "No. It is a coaching and education product. It does not diagnose disease or prescribe treatment.",
      },
    ],
    supportingPages: [
      { href: "/features", title: "Features", reason: "Product capabilities overview" },
      { href: "/fit", title: "Fit", reason: "Choose a training approach" },
      { href: "/academy", title: "Academy", reason: "Structured education paths" },
      { href: "/pricing", title: "Pricing", reason: "Plans and limits" },
    ],
    relatedClusterSlugs: ["programming", "training-methods", "exercise-technique"],
  },
];
