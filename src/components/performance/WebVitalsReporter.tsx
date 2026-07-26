"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { onCLS, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import {
  classifyMetric,
  matchSurfaceForPath,
  type CwVMetricId,
} from "@/domain/performance-system";
import { featureFlags } from "@/config/feature-flags";
import { clientAllowsAnalytics } from "@/components/gdpr/cookie-client";

function report(metric: Metric) {
  if (!featureFlags.performanceSystem) return;
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const surface = matchSurfaceForPath(pathname);
  const id = metric.name as CwVMetricId;
  const rating =
    id === "LCP" || id === "INP" || id === "CLS" || id === "TTFB"
      ? classifyMetric(id, metric.value)
      : metric.rating;

  const payload = {
    name: metric.name,
    value: metric.value,
    rating,
    id: metric.id,
    navigationType: metric.navigationType,
    pathname,
    surface,
    at: new Date().toISOString(),
  };

  // Console adapter — same honesty as analytics (no PII). Swap for beacon later.
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[web-vitals]", payload);
  } else if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    if (featureFlags.gdprReadiness && !clientAllowsAnalytics()) {
      return;
    }
    try {
      navigator.sendBeacon(
        "/api/vitals",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
    } catch {
      // ignore beacon failures
    }
  }
}

/**
 * Reports Core Web Vitals for Performance 2.0 budgets.
 * Mount once in root or app shell.
 */
export function WebVitalsReporter() {
  const pathname = usePathname();

  useEffect(() => {
    if (!featureFlags.performanceSystem) return;
    onLCP(report);
    onINP(report);
    onCLS(report);
    onTTFB(report);
  }, [pathname]);

  return null;
}
