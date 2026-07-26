import { featureFlags } from "@/config/feature-flags";
import {
  buildOnSiteEducationSnapshot,
  getEducationTopic,
  resolveEducationTopicId,
  type EducationTopic,
  type OnSiteEducationSnapshot,
} from "@/domain/on-site-education";

export function getOnSiteEducationSnapshot(): OnSiteEducationSnapshot {
  return buildOnSiteEducationSnapshot();
}

export function isOnSiteEducationEnabled(): boolean {
  return featureFlags.onSiteEducation;
}

export function resolveEducationTopic(
  metricKey: string,
): EducationTopic | null {
  if (!featureFlags.onSiteEducation) return null;
  const id = resolveEducationTopicId(metricKey);
  if (!id) return null;
  return getEducationTopic(id);
}
