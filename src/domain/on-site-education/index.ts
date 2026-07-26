export {
  ON_SITE_EDUCATION_ENGINE_VERSION,
  ON_SITE_EDUCATION_TRIGGER_LABEL,
  ON_SITE_EDUCATION_HONESTY,
  EDUCATION_TOPIC_IDS,
} from "@/domain/on-site-education/constants";
export type {
  EducationTopicId,
  EducationTopic,
  EducationRelatedLink,
} from "@/domain/on-site-education/constants";

export {
  EDUCATION_TOPICS,
  getEducationTopic,
  resolveEducationTopicId,
  allEducationTopics,
} from "@/domain/on-site-education/catalog";

export {
  buildOnSiteEducationSnapshot,
  evaluateOnSiteEducationQuality,
  type OnSiteEducationSnapshot,
  type OnSiteEducationQualityResult,
} from "@/domain/on-site-education/snapshot";
