import {
  EDUCATION_TOPIC_IDS,
  ON_SITE_EDUCATION_ENGINE_VERSION,
  ON_SITE_EDUCATION_HONESTY,
  ON_SITE_EDUCATION_TRIGGER_LABEL,
} from "@/domain/on-site-education/constants";
import {
  allEducationTopics,
  getEducationTopic,
} from "@/domain/on-site-education/catalog";

export type OnSiteEducationQualityCheck = {
  id:
    | "prompt_topics"
    | "learn_why_label"
    | "on_site_links"
    | "catalog_depth";
  label: string;
  ok: boolean;
  detail: string;
};

export type OnSiteEducationQualityResult = {
  passed: boolean;
  checks: OnSiteEducationQualityCheck[];
};

export function evaluateOnSiteEducationQuality(): OnSiteEducationQualityResult {
  const topics = allEducationTopics();
  const required = ["rpe", "training_volume", "technique_confidence"] as const;
  const checks: OnSiteEducationQualityCheck[] = [
    {
      id: "prompt_topics",
      label: "RPE, volume, technique confidence present",
      ok: required.every((id) => getEducationTopic(id) != null),
      detail: required.join(", "),
    },
    {
      id: "learn_why_label",
      label: "Learn why trigger",
      ok: ON_SITE_EDUCATION_TRIGGER_LABEL === "Learn why",
      detail: ON_SITE_EDUCATION_TRIGGER_LABEL,
    },
    {
      id: "on_site_links",
      label: "Each topic has an in-app related link",
      ok: topics.every((t) =>
        t.relatedLinks.some((l) => l.surface === "app" && l.href.startsWith("/app/")),
      ),
      detail: `${topics.length} topics`,
    },
    {
      id: "catalog_depth",
      label: "Short why + in-context body",
      ok: topics.every(
        (t) =>
          t.shortWhy.trim().length >= 40 &&
          t.inContextExplanation.trim().length >= 80,
      ),
      detail: `${EDUCATION_TOPIC_IDS.length} catalogued`,
    },
  ];
  return { passed: checks.every((c) => c.ok), checks };
}

export type OnSiteEducationSnapshot = {
  engineVersion: typeof ON_SITE_EDUCATION_ENGINE_VERSION;
  generatedAt: string;
  honesty: readonly string[];
  triggerLabel: typeof ON_SITE_EDUCATION_TRIGGER_LABEL;
  topicCount: number;
  topicIds: readonly string[];
  quality: OnSiteEducationQualityResult;
};

export function buildOnSiteEducationSnapshot(): OnSiteEducationSnapshot {
  return {
    engineVersion: ON_SITE_EDUCATION_ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    honesty: ON_SITE_EDUCATION_HONESTY,
    triggerLabel: ON_SITE_EDUCATION_TRIGGER_LABEL,
    topicCount: EDUCATION_TOPIC_IDS.length,
    topicIds: EDUCATION_TOPIC_IDS,
    quality: evaluateOnSiteEducationQuality(),
  };
}
