import {
  TIMELINE_EVENT_KINDS,
  TIMELINE_EVENT_KIND_LABELS,
  UNIVERSAL_TIMELINE_ENGINE_VERSION,
  UNIVERSAL_TIMELINE_HONESTY,
} from "@/domain/universal-timeline/constants";
import type { UniversalTimelineSnapshot } from "@/domain/universal-timeline/types";

export function buildUniversalTimelineSnapshot(
  generatedAt: string = new Date().toISOString(),
): UniversalTimelineSnapshot {
  return {
    engineVersion: UNIVERSAL_TIMELINE_ENGINE_VERSION,
    honesty: UNIVERSAL_TIMELINE_HONESTY,
    kinds: TIMELINE_EVENT_KINDS.map((id) => ({
      id,
      label: TIMELINE_EVENT_KIND_LABELS[id],
    })),
    docPath: "docs/UNIVERSAL_TIMELINE.md",
    generatedAt,
  };
}
