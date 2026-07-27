import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  FileSearch,
  Flag,
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

export type SiteNavCategory = {
  id: string;
  label: string;
  href?: string;
  links: readonly SiteNavLink[];
  featured?: SiteNavFeatured;
};

/** Public mega-menu + mobile accordion structure (Phase 2). */
export const SITE_NAV_CATEGORIES: readonly SiteNavCategory[] = [
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
    id: "programs",
    label: "Programs",
    href: "/goals",
    links: [
      {
        href: "/goals",
        label: "Sport & goal landings",
        description: "Powerlifting, strongman, and more",
        icon: Target,
      },
      {
        href: "/programs/marketplace",
        label: "Program marketplace",
        description: "Browse listed training programs",
        icon: LayoutGrid,
      },
      {
        href: "/academy/powerlifting-programming",
        label: "Powerlifting programming",
        description: "Academy path for meet programming",
        icon: GraduationCap,
      },
      {
        href: "/features",
        label: "Product features",
        description: "What the platform actually includes",
        icon: LayoutGrid,
      },
    ],
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
