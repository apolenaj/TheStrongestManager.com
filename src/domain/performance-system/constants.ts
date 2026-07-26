/**
 * Performance 2.0 — Core Web Vitals audit + measurable budgets (Prompt 152).
 */

export const PERFORMANCE_ENGINE_VERSION = "performance.v2" as const;

export const PERFORMANCE_HONESTY = [
  "Budgets target “good” Core Web Vitals thresholds (LCP, INP, CLS) plus TTFB for server rendering.",
  "Priority surfaces are Homepage, Dashboard, Exercise pages, and Technique analysis — not every admin console.",
  "MediaPipe pose / large video work stays client-lazy; budgets treat analysis tooling as deferred JS, not LCP.",
] as const;

/** Priority product surfaces for Performance 2.0. */
export const PERFORMANCE_SURFACES = [
  "homepage",
  "dashboard",
  "exercise_pages",
  "technique_analysis",
] as const;
export type PerformanceSurfaceId = (typeof PERFORMANCE_SURFACES)[number];

export type CwVMetricId = "LCP" | "INP" | "CLS" | "TTFB";

export type PerformanceBudget = {
  surface: PerformanceSurfaceId;
  label: string;
  pathPattern: string;
  /** Milliseconds unless noted. */
  budgets: {
    /** Largest Contentful Paint — good ≤ 2500ms */
    lcpMs: number;
    /** Interaction to Next Paint — good ≤ 200ms */
    inpMs: number;
    /** Cumulative Layout Shift — good ≤ 0.1 (unitless) */
    cls: number;
    /** Time to First Byte — server rendering budget */
    ttfbMs: number;
  };
  optimizations: readonly string[];
};

/**
 * Measurable performance budget (field targets).
 * Aligns with Chrome UX “good” CWV where applicable.
 */
export const PERFORMANCE_BUDGETS: readonly PerformanceBudget[] = [
  {
    surface: "homepage",
    label: "Homepage",
    pathPattern: "/",
    budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1, ttfbMs: 800 },
    optimizations: [
      "SSR / ISR marketing shell",
      "Below-fold sections dynamically imported",
      "Hero is CSS/typography — no heavy LCP image",
      "Static asset caching headers",
    ],
  },
  {
    surface: "dashboard",
    label: "Dashboard",
    pathPattern: "/app/dashboard",
    budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1, ttfbMs: 1000 },
    optimizations: [
      "Server-rendered RSC",
      "Parallel Prisma fetches",
      "Bounded relation takes / select projections",
      "No MediaPipe on dashboard",
    ],
  },
  {
    surface: "exercise_pages",
    label: "Exercise pages",
    pathPattern: "/exercises/*",
    budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1, ttfbMs: 800 },
    optimizations: [
      "generateStaticParams for priority catalog",
      "ISR revalidate window",
      "Catalog query caching",
      "JSON-LD without blocking client JS",
    ],
  },
  {
    surface: "technique_analysis",
    label: "Technique analysis",
    pathPattern: "/app/technique/*",
    budgets: { lcpMs: 3000, inpMs: 200, cls: 0.1, ttfbMs: 1200 },
    optimizations: [
      "Report SSR; pose runner dynamically imported (ssr:false)",
      "Video preload=metadata (not auto)",
      "MediaPipe WASM deferred until user runs analysis",
      "Signed media URLs — no public CDN cache of private video",
    ],
  },
] as const;

/** Chrome “good” thresholds used for pass/fail classification. */
export const CWV_GOOD_THRESHOLDS = {
  LCP: 2500,
  INP: 200,
  CLS: 0.1,
  TTFB: 800,
} as const;

export type OptimizationPillar =
  | "images"
  | "video"
  | "js"
  | "server_rendering"
  | "caching"
  | "database_queries";

export type OptimizationAction = {
  id: string;
  pillar: OptimizationPillar;
  title: string;
  detail: string;
  surfaces: readonly PerformanceSurfaceId[];
  status: "shipped" | "planned";
};
