import {
  buildPwaReadinessSnapshot,
  type PwaReadinessSnapshot,
} from "@/domain/pwa-readiness";

export function getPwaReadinessSnapshot(): PwaReadinessSnapshot {
  return buildPwaReadinessSnapshot();
}
