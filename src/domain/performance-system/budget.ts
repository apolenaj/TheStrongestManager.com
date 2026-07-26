import {
  CWV_GOOD_THRESHOLDS,
  PERFORMANCE_BUDGETS,
  PERFORMANCE_ENGINE_VERSION,
  PERFORMANCE_HONESTY,
  PERFORMANCE_SURFACES,
  type CwVMetricId,
  type OptimizationAction,
  type PerformanceBudget,
  type PerformanceSurfaceId,
} from "@/domain/performance-system/constants";

export const PERFORMANCE_OPTIMIZATIONS: readonly OptimizationAction[] = [
  {
    id: "img.next_image",
    pillar: "images",
    title: "next/image pipeline",
    detail:
      "Configured Next image formats (AVIF/WebP) and remotePatterns; marketing hero avoids heavy bitmap LCP.",
    surfaces: ["homepage", "exercise_pages"],
    status: "shipped",
  },
  {
    id: "video.metadata_preload",
    pillar: "video",
    title: "Technique video preload=metadata",
    detail:
      "Analysis player loads metadata only until playback — reduces bandwidth competing with LCP.",
    surfaces: ["technique_analysis"],
    status: "shipped",
  },
  {
    id: "js.dynamic_home",
    pillar: "js",
    title: "Homepage below-fold code splitting",
    detail:
      "Home sections after the hero/pillars load via next/dynamic to shrink initial JS.",
    surfaces: ["homepage"],
    status: "shipped",
  },
  {
    id: "js.mediapipe_lazy",
    pillar: "js",
    title: "MediaPipe runner deferred",
    detail:
      "MovementAnalysisRunner is client-dynamic (ssr:false) so WASM is not on the critical path.",
    surfaces: ["technique_analysis"],
    status: "shipped",
  },
  {
    id: "ssr.priority_surfaces",
    pillar: "server_rendering",
    title: "RSC for priority routes",
    detail:
      "Homepage, dashboard, exercises, and technique reports render on the server first.",
    surfaces: [...PERFORMANCE_SURFACES],
    status: "shipped",
  },
  {
    id: "cache.isr_marketing",
    pillar: "caching",
    title: "ISR for marketing + exercises",
    detail:
      "Homepage and exercise detail use revalidate windows; static assets get long-cache headers.",
    surfaces: ["homepage", "exercise_pages"],
    status: "shipped",
  },
  {
    id: "db.dashboard_bounds",
    pillar: "database_queries",
    title: "Dashboard query bounds",
    detail:
      "Dashboard loads profile relations with take limits and parallel count query — no unbounded includes.",
    surfaces: ["dashboard"],
    status: "shipped",
  },
  {
    id: "db.exercise_catalog_cache",
    pillar: "database_queries",
    title: "Exercise catalog cache",
    detail:
      "Published exercise-by-slug reads use unstable_cache with a tagged revalidate window.",
    surfaces: ["exercise_pages"],
    status: "shipped",
  },
] as const;

export function budgetForSurface(
  surface: PerformanceSurfaceId,
): PerformanceBudget {
  return PERFORMANCE_BUDGETS.find((b) => b.surface === surface)!;
}

export function classifyMetric(
  metric: CwVMetricId,
  value: number,
): "good" | "needs_improvement" | "poor" {
  const good = CWV_GOOD_THRESHOLDS[metric];
  if (metric === "CLS") {
    if (value <= good) return "good";
    if (value <= 0.25) return "needs_improvement";
    return "poor";
  }
  if (value <= good) return "good";
  if (value <= good * 1.6) return "needs_improvement";
  return "poor";
}

export function matchSurfaceForPath(
  pathname: string,
): PerformanceSurfaceId | null {
  if (pathname === "/") return "homepage";
  if (pathname.startsWith("/app/dashboard")) return "dashboard";
  if (pathname.startsWith("/exercises")) return "exercise_pages";
  if (pathname.startsWith("/app/technique")) return "technique_analysis";
  return null;
}

export type PerformanceSystemSnapshot = {
  engineVersion: typeof PERFORMANCE_ENGINE_VERSION;
  budgets: readonly PerformanceBudget[];
  optimizations: readonly OptimizationAction[];
  thresholds: typeof CWV_GOOD_THRESHOLDS;
  honesty: readonly string[];
  generatedAt: string;
};

export function buildPerformanceSystemSnapshot(
  generatedAt: string = new Date().toISOString(),
): PerformanceSystemSnapshot {
  return {
    engineVersion: PERFORMANCE_ENGINE_VERSION,
    budgets: PERFORMANCE_BUDGETS,
    optimizations: PERFORMANCE_OPTIMIZATIONS,
    thresholds: CWV_GOOD_THRESHOLDS,
    honesty: PERFORMANCE_HONESTY,
    generatedAt,
  };
}
