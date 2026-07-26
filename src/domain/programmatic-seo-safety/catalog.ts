/**
 * Allowlisted programmatic SEO pages (Prompt 165).
 * Curated only — never open generators.
 */

import type { ProgrammaticSeoTemplateId } from "@/domain/programmatic-seo-safety/constants";

export type ProgrammaticSeoSection = {
  heading: string;
  body: string;
};

export type ProgrammaticSeoInternalLink = {
  href: string;
  title: string;
  reason: string;
};

export type ProgrammaticSeoFaq = {
  question: string;
  answer: string;
};

export type ProgrammaticSeoPage = {
  slug: string;
  templateId: ProgrammaticSeoTemplateId;
  title: string;
  description: string;
  /** Unique editorial overview — must not be boilerplate-only. */
  overview: string;
  sections: ProgrammaticSeoSection[];
  internalLinks: ProgrammaticSeoInternalLink[];
  faqs: ProgrammaticSeoFaq[];
  /** Unique fingerprint string used for near-duplicate checks. */
  uniqueValueKey: string;
};

/**
 * Curated guide pages under `/guides/[slug]`.
 * Keep this list small and high-value.
 */
export const PROGRAMMATIC_SEO_PAGES: readonly ProgrammaticSeoPage[] = [
  {
    slug: "deadlift-variations",
    templateId: "deadlift_variations",
    title: "Deadlift variations that matter",
    description:
      "How conventional, sumo, Romanian, and related hinge variations differ in stance, range, and programming — without thin stub pages for every label.",
    overview:
      "Lifters often search for deadlift variations when they need a hinge that fits their sport, equipment, or recovery budget. The useful answer is not a thousand near-identical URLs — it is clear differences in stance, start position, and programming role, with links to full exercise pages that already carry setup, execution, and safety notes.",
    uniqueValueKey: "deadlift-variations:hinge-roles-v1",
    sections: [
      {
        heading: "Conventional vs sumo (competition-style floor pulls)",
        body: "Conventional and sumo both start from the floor and finish at lockout, but stance width and torso angle change leverage. Choose based on positions you can own and sport rules — not because a page claimed one is universally “better.” See the deadlift exercise page for setup and common mistakes.",
      },
      {
        heading: "Romanian deadlift as an accessory hinge",
        body: "The Romanian deadlift usually starts from standing and emphasizes a controlled hinge with soft knees. It is not a lighter conventional pull with different branding — range of motion and fatigue profile differ. Use it when you want posterior-chain work without repeated floor resets.",
      },
      {
        heading: "What we do not do",
        body: "We do not mint a separate indexable page for every variation label (deficit, block, snatch-grip, etc.) unless that lift has reviewed catalog content with unique coaching value. Labels can live as notes on the parent exercise until then.",
      },
    ],
    internalLinks: [
      {
        href: "/exercises/deadlift",
        title: "Deadlift",
        reason: "Primary floor-pull technique and safety notes.",
      },
      {
        href: "/exercises/romanian-deadlift",
        title: "Romanian deadlift",
        reason: "Accessory hinge with distinct start position.",
      },
      {
        href: "/compare/exercises/romanian-deadlift-vs-stiff-leg-deadlift",
        title: "RDL vs stiff-leg deadlift",
        reason: "Exercise comparison engine (Prompt 166).",
      },
      {
        href: "/learn/exercise-variations",
        title: "Exercise variations (learn pillar)",
        reason: "Cluster overview for variation strategy.",
      },
    ],
    faqs: [
      {
        question: "Is every deadlift variation a separate page?",
        answer:
          "No. Only curated guides and reviewed exercise catalog pages are indexed. Variation labels alone do not create URLs.",
      },
      {
        question: "Which variation should I use?",
        answer:
          "Match the hinge to your program and positions you can own. This guide explains differences; it does not diagnose injury or prescribe medical treatment.",
      },
    ],
  },
  {
    slug: "dup-vs-block-periodization",
    templateId: "method_comparison",
    title: "Daily undulating vs block periodization",
    description:
      "Qualitative comparison of DUP and block periodization — complexity, variation, and fit — without invented ranking scores.",
    overview:
      "Daily undulating periodization (DUP) varies stress across the week; block periodization concentrates emphasis across sequential blocks. Athletes comparing them need honest tradeoffs on complexity and fatigue management — the interactive /compare tool can explore more pairs, but only curated guides earn a dedicated indexed URL.",
    uniqueValueKey: "method-compare:dup-block-v1",
    sections: [
      {
        heading: "How stress is organized",
        body: "DUP typically rotates intensities or qualities within a microcycle. Block models often emphasize one quality for a period before shifting emphasis. Neither is universally superior; fit depends on sport calendar and coaching capacity.",
      },
      {
        heading: "Complexity and coaching demand",
        body: "DUP can feel flexible but requires clear session purposes. Block periodization can simplify a block’s focus while demanding thoughtful transitions between blocks. Use qualitative dimensions — not fake numeric scores — when comparing.",
      },
    ],
    internalLinks: [
      {
        href: "/methods/daily-undulating-periodization",
        title: "Daily undulating periodization",
        reason: "Method detail.",
      },
      {
        href: "/methods/block-periodization",
        title: "Block periodization",
        reason: "Method detail.",
      },
      {
        href: "/compare?methods=daily-undulating-periodization,block-periodization",
        title: "Interactive method compare",
        reason: "Side-by-side qualitative tool (canonical hub remains /compare).",
      },
    ],
    faqs: [
      {
        question: "Which periodization is better?",
        answer:
          "There is no universal winner. Compare purpose, complexity, and limitations for your context. We do not invent ranking scores.",
      },
    ],
  },
] as const;

export function getProgrammaticSeoPage(
  slug: string,
): ProgrammaticSeoPage | undefined {
  return PROGRAMMATIC_SEO_PAGES.find((p) => p.slug === slug);
}

export function allProgrammaticSeoSlugs(): string[] {
  return PROGRAMMATIC_SEO_PAGES.map((p) => p.slug);
}
