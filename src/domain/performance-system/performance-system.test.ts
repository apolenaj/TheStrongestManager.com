import { describe, expect, it } from "vitest";
import {
  PERFORMANCE_BUDGETS,
  PERFORMANCE_HONESTY,
  PERFORMANCE_OPTIMIZATIONS,
  PERFORMANCE_SURFACES,
  buildPerformanceSystemSnapshot,
  classifyMetric,
  matchSurfaceForPath,
} from "@/domain/performance-system";

describe("performance 2.0", () => {
  it("defines budgets for all priority surfaces", () => {
    expect(PERFORMANCE_SURFACES).toEqual([
      "homepage",
      "dashboard",
      "exercise_pages",
      "technique_analysis",
    ]);
    expect(PERFORMANCE_BUDGETS.map((b) => b.surface).sort()).toEqual(
      [...PERFORMANCE_SURFACES].sort(),
    );
    for (const b of PERFORMANCE_BUDGETS) {
      expect(b.budgets.lcpMs).toBeLessThanOrEqual(3000);
      expect(b.budgets.inpMs).toBeLessThanOrEqual(200);
      expect(b.budgets.cls).toBeLessThanOrEqual(0.1);
    }
  });

  it("covers optimization pillars images/video/js/ssr/caching/db", () => {
    const pillars = new Set(PERFORMANCE_OPTIMIZATIONS.map((o) => o.pillar));
    for (const p of [
      "images",
      "video",
      "js",
      "server_rendering",
      "caching",
      "database_queries",
    ] as const) {
      expect(pillars.has(p)).toBe(true);
    }
    expect(PERFORMANCE_OPTIMIZATIONS.every((o) => o.status === "shipped")).toBe(
      true,
    );
  });

  it("classifies CWV and matches paths", () => {
    expect(classifyMetric("LCP", 2000)).toBe("good");
    expect(classifyMetric("LCP", 3000)).toBe("needs_improvement");
    expect(classifyMetric("CLS", 0.05)).toBe("good");
    expect(matchSurfaceForPath("/")).toBe("homepage");
    expect(matchSurfaceForPath("/app/dashboard")).toBe("dashboard");
    expect(matchSurfaceForPath("/exercises/deadlift")).toBe("exercise_pages");
    expect(matchSurfaceForPath("/app/technique/abc")).toBe(
      "technique_analysis",
    );
    expect(PERFORMANCE_HONESTY.join(" ")).toMatch(/Core Web Vitals/i);
    const snap = buildPerformanceSystemSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.budgets).toHaveLength(4);
  });
});
