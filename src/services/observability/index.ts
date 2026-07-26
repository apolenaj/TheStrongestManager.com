/**
 * Production Observability service (Prompt 155).
 */

import {
  buildObservabilitySnapshot,
  type ObservabilitySnapshot,
} from "@/domain/observability";
import {
  listRecentObservabilityRecords,
  observabilityRingStats,
} from "@/services/observability/context";

export { obs } from "@/services/observability/logger";
export { withObservedApi } from "@/services/observability/api";
export {
  getCorrelationId,
  runWithObservabilityContext,
  listRecentObservabilityRecords,
  clearObservabilityRingForTests,
} from "@/services/observability/context";

export function getObservabilitySnapshot(): ObservabilitySnapshot & {
  recent: ReturnType<typeof listRecentObservabilityRecords>;
  ring: ReturnType<typeof observabilityRingStats>;
} {
  return {
    ...buildObservabilitySnapshot(),
    recent: listRecentObservabilityRecords().slice(-25).reverse(),
    ring: observabilityRingStats(),
  };
}
