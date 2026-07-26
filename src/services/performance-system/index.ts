/**
 * Performance 2.0 service — budget snapshot for admin.
 */

import {
  buildPerformanceSystemSnapshot,
  type PerformanceSystemSnapshot,
} from "@/domain/performance-system";

export function getPerformanceSystemSnapshot(): PerformanceSystemSnapshot {
  return buildPerformanceSystemSnapshot();
}
