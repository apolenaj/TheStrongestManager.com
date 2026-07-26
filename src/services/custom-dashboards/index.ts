import {
  buildCustomDashboardsSnapshot,
  type CustomDashboardsSnapshot,
} from "@/domain/custom-dashboards";

export function getCustomDashboardsSnapshot(): CustomDashboardsSnapshot {
  return buildCustomDashboardsSnapshot();
}
