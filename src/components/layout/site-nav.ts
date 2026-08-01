import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  FileSearch,
  Flag,
  Flame,
  GraduationCap,
  LayoutGrid,
  Library,
  LineChart,
  Map,
  Shield,
  Target,
  Users,
  Wrench,
} from "lucide-react";

export type SiteNavLink = {
  href: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

export type SiteNavFeatured = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
};

export type SiteNavColumn = {
  id: string;
  label: string;
  links: readonly SiteNavLink[];
};

export type SiteNavCategory = {
  id: string;
  label: string;
  href?: string;
  /**
   * `mega` (default): wide dropdown panel.
   * `dropdown`: compact single-column list (e.g. athlete profiles).
   * `link`: top-level direct navigation (no submenu) — use for brand pillars.
   */
  presentation?: "mega" | "dropdown" | "link";
  /** Flat link list (used when `columns` is absent). */
  links: readonly SiteNavLink[];
  /** Optional mega-menu columns (e.g. Programs: By Method / By Goal). */
  columns?: readonly SiteNavColumn[];
  featured?: SiteNavFeatured;
};

/** Flatten columns + links for mobile accordions. */
export function siteNavCategoryLinks(
  category: SiteNavCategory,
): readonly SiteNavLink[] {
  if (category.columns?.length) {
    return category.columns.flatMap((column) => column.links);
  }
  return category.links;
}

/**
 * Public nav — order: Programs | Legendary Methods | Free Tools | Coaching | Results | Learn | About
 */
export const SITE_NAV_CATEGORIES: readonly SiteNavCategory[] = [
  {
    id: "programs",
    label: "Programs",
    href: "/programs",
    links: [],
    columns: [
      {
        id: "by-method",
        label: "By Method",
        links: [
          {
            href: "/programs/linear-strength-builder",
            label: "Linear Strength Builder",
            description: "Volume-to-intensity progression",
            icon: LineChart,
          },
          {
            href: "/programs/dup-powerlifting-system",
            label: "DUP Powerlifting System",
            description: "Undulating SBD emphasis",
            icon: BarChart3,
          },
          {
            href: "/programs/block-periodisation",
            label: "Block Periodisation",
            description: "Concentrated training blocks",
            icon: LayoutGrid,
          },
          {
            href: "/programs/conjugate-strength-system",
            label: "Conjugate Strength System",
            description: "Max-effort / dynamic rotation",
            icon: Dumbbell,
          },
          {
            href: "/programs/high-frequency-sbd",
            label: "High-Frequency SBD",
            description: "Frequent competition-lift practice",
            icon: Target,
          },
          {
            href: "/programs/powerbuilding-hybrid",
            label: "Powerbuilding Hybrid",
            description: "Strength plus hypertrophy",
            icon: Wrench,
          },
        ],
      },
      {
        id: "by-goal",
        label: "By Goal",
        links: [
          {
            href: "/programs?goal=strength",
            label: "Build strength",
            description: "General strength systems",
            icon: Dumbbell,
          },
          {
            href: "/programs?goal=powerlifting",
            label: "Powerlifting",
            description: "SBD-focused cycles",
            icon: Flag,
          },
          {
            href: "/programs?category=bodybuilding",
            label: "Bodybuilding",
            description: "Aesthetics and muscle volume",
            icon: Target,
          },
          {
            href: "/programs?category=transformation",
            label: "Body transformation",
            description: "Aggressive fat loss and recomposition",
            icon: Flame,
          },
          {
            href: "/programs?category=strongman",
            label: "Strongman",
            description: "Raw static strength and events",
            icon: Award,
          },
          {
            href: "/programs?category=lift_specific",
            label: "Lift specific",
            description: "Specialize squat, bench, or pull",
            icon: Wrench,
          },
          {
            href: "/programs?goal=hypertrophy",
            label: "Hypertrophy",
            description: "Muscle-oriented hybrids",
            icon: LayoutGrid,
          },
          {
            href: "/programs?goal=competition_prep",
            label: "Competition prep",
            description: "Meet-oriented preparation",
            icon: Award,
          },
          {
            href: "/programs",
            label: "Browse all programs",
            description: "Full public catalog",
            icon: LayoutGrid,
          },
          {
            href: "/programs/complete-method-collection",
            label: "Complete Method Collection",
            description: "All six full paid systems",
            icon: Library,
          },
        ],
      },
    ],
    featured: {
      href: "/programs/find-my-program",
      eyebrow: "Featured",
      title: "Find My Program",
      description:
        "Answer a few honest questions and get a recommended system — no countdown timers, no fake scarcity.",
      cta: "FIND MY PROGRAM",
    },
  },
  {
    id: "legendary-methods",
    label: "Legendary Methods",
    href: "/legendary-methods",
    presentation: "dropdown",
    links: [
      {
        href: "/legendary-methods/arnold-schwarzenegger-golden-era-volume",
        label: "Arnold Schwarzenegger",
        description: "Golden Era volume",
      },
      {
        href: "/legendary-methods/tom-platz-extreme-leg-training",
        label: "Tom Platz",
        description: "Extreme leg training",
      },
      {
        href: "/legendary-methods/ronnie-coleman-heavy-high-volume-training",
        label: "Ronnie Coleman",
        description: "Heavy high-volume training",
      },
      {
        href: "/legendary-methods/eddie-hall-500kg-deadlift",
        label: "Eddie Hall",
        description: "500 kg deadlift method",
      },
      {
        href: "/legendary-methods/john-haack-relative-strength",
        label: "John Haack",
        description: "Relative strength",
      },
      {
        href: "/legendary-methods/boris-sheiko-russian-powerlifting",
        label: "Boris Sheiko",
        description: "Russian powerlifting system",
      },
      {
        href: "/legendary-methods",
        label: "View all analyses",
        description: "Full Legendary Methods library",
      },
    ],
  },
  {
    id: "tools",
    label: "Free Tools",
    href: "/tools",
    links: [
      {
        href: "/tools",
        label: "Calculator suite",
        description: "1RM, plates, DOTS, and related tools",
        icon: Wrench,
      },
      {
        href: "/program-audit",
        label: "Program audit",
        description: "Review a program from paste or CSV",
        icon: FileSearch,
      },
      {
        href: "/technique-check",
        label: "Technique check",
        description: "Upload a lift for movement feedback",
        icon: ClipboardCheck,
      },
      {
        href: "/athlete-assessment",
        label: "Athlete assessment",
        description: "Profile-driven readiness and goals",
        icon: Target,
      },
      {
        href: "/compare",
        label: "Method compare",
        description: "Compare training methods side by side",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "coaching",
    label: "Coaching",
    href: "/coaching",
    links: [
      {
        href: "/coaching/apply",
        label: "1:1 Coaching",
        description: "Premium coaching sales and application flow",
        icon: Users,
      },
      {
        href: "/coaching/match",
        label: "Coach matching",
        description: "Find coaches by focus, language, and style",
        icon: Map,
      },
      {
        href: "/goals/powerlifting-program",
        label: "Competition Prep",
        description: "Meet-oriented powerlifting preparation",
        icon: Flag,
      },
    ],
    featured: {
      href: "/program-audit",
      eyebrow: "Featured",
      title: "Strength Audit",
      description:
        "Paste a training block and get a structured audit of volume, intensity, and gaps — free to start.",
      cta: "GET YOUR FREE STRENGTH AUDIT",
    },
  },
  {
    id: "results",
    label: "Results",
    href: "/demo",
    links: [
      {
        href: "/demo",
        label: "Example dashboard",
        description: "Walk through product surfaces with demo data",
        icon: LineChart,
      },
      {
        href: "/features",
        label: "Capability overview",
        description: "Honest feature list — no invented stats",
        icon: LayoutGrid,
      },
      {
        href: "/verify/certificate",
        label: "Certificate verification",
        description: "Verify issued certificates by code",
        icon: Award,
      },
      {
        href: "/evidence",
        label: "Evidence base",
        description: "How we label sources and certainty",
        icon: Shield,
      },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    href: "/learn",
    links: [
      {
        href: "/learn",
        label: "Learning paths",
        description: "Structured strength education hubs",
        icon: BookOpen,
      },
      {
        href: "/methods",
        label: "Training methods",
        description: "Linear, conjugate, DUP, and more",
        icon: Library,
      },
      {
        href: "/legendary-methods",
        label: "Legendary Methods",
        description: "Independent analyses of famous training systems",
        icon: Award,
      },
      {
        href: "/academy",
        label: "Academy",
        description: "Courses for lifters and coaches",
        icon: GraduationCap,
      },
      {
        href: "/exercises",
        label: "Exercise library",
        description: "Technique and variation context",
        icon: Dumbbell,
      },
      {
        href: "/guides",
        label: "Guides",
        description: "Long-form training explainers",
        icon: Map,
      },
    ],
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    links: [
      {
        href: "/about",
        label: "About Josef",
        description: "Experience under the bar and in operations",
        icon: Users,
      },
      {
        href: "/#about-josef",
        label: "About preview",
        description: "Short founder preview on the homepage",
        icon: Users,
      },
      {
        href: "/trust",
        label: "Trust Center",
        description: "Privacy, safety, and product honesty",
        icon: Shield,
      },
      {
        href: "/pricing",
        label: "Pricing",
        description: "Plans, features, and limits",
        icon: BarChart3,
      },
      {
        href: "/affiliates",
        label: "Affiliates",
        description: "Partner program overview",
        icon: Flag,
      },
    ],
  },
] as const;

export const SITE_FOOTER_COLUMNS = [
  {
    title: "Coaching",
    links: [
      { href: "/coaching/apply", label: "1:1 Coaching" },
      { href: "/coaching/match", label: "Coach matching" },
      { href: "/goals/powerlifting-program", label: "Competition Prep" },
      { href: "/program-audit", label: "Strength Audit" },
    ],
  },
  {
    title: "Programs",
    links: [
      { href: "/programs", label: "Program catalog" },
      { href: "/programs/find-my-program", label: "Find my program" },
      { href: "/programs/complete-method-collection", label: "Method collection" },
      { href: "/programs/marketplace", label: "Creator marketplace" },
    ],
  },
  {
    title: "Free Tools",
    links: [
      { href: "/tools", label: "Calculators" },
      { href: "/program-audit", label: "Program audit" },
      { href: "/technique-check", label: "Technique check" },
      { href: "/athlete-assessment", label: "Athlete assessment" },
      { href: "/compare", label: "Method compare" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learn", label: "Learning paths" },
      { href: "/legendary-methods", label: "Legendary Methods" },
      { href: "/methods", label: "Methods" },
      { href: "/academy", label: "Academy" },
      { href: "/exercises", label: "Exercises" },
      { href: "/guides", label: "Guides" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust", label: "Trust Center" },
      { href: "/pricing", label: "Pricing" },
      { href: "/affiliates", label: "Affiliates" },
      { href: "/demo", label: "Demo" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
      { href: "/trust", label: "Trust Center" },
    ],
  },
] as const;

export const STRENGTH_AUDIT_HREF = "/program-audit";
export const STRENGTH_AUDIT_CTA = "GET YOUR FREE STRENGTH AUDIT";
