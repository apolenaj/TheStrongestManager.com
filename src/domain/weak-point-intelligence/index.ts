export {
  WEAK_POINT_ENGINE_VERSION,
  WEAK_POINT_CATEGORIES,
  WEAK_POINT_CATEGORY_LABELS,
  WEAK_POINT_HONESTY,
} from "@/domain/weak-point-intelligence/constants";
export type { WeakPointCategory } from "@/domain/weak-point-intelligence/constants";
export type {
  WeakPointEvidenceItem,
  WeakPointFinding,
  WeakPointIntelligenceResult,
  WeakPointTechniqueSample,
  WeakPointLiftSample,
  WeakPointSignals,
} from "@/domain/weak-point-intelligence/types";
export { detectWeakPoints } from "@/domain/weak-point-intelligence/detect";
