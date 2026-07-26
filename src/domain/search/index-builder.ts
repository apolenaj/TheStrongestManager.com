import { ACADEMY_COURSES } from "@/domain/academy/catalog";
import { PRIORITY_EXERCISES } from "@/domain/exercises/priority-seed";
import { listHistoryEras } from "@/domain/history";
import { getPublishedMethods } from "@/domain/methods/catalog";
import { SEO_TOPIC_CLUSTERS } from "@/domain/seo/clusters";
import type { SearchIndexItem } from "@/domain/search/types";

/**
 * Build the public search index from curated catalogs (client-safe, no DB).
 * Programs: none public yet — intentionally empty.
 */
export function buildSearchIndex(): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];

  for (const exercise of PRIORITY_EXERCISES) {
    items.push({
      id: `exercise:${exercise.slug}`,
      category: "exercises",
      title: exercise.name,
      href: `/exercises/${exercise.slug}`,
      aliases: exercise.aliases ?? [],
      keywords: [
        exercise.movementPattern,
        exercise.category,
        ...(exercise.primaryMuscles ?? []),
        exercise.description ?? "",
      ].filter(Boolean),
      blurb: exercise.description ?? "Exercise intelligence",
    });
  }

  for (const method of getPublishedMethods()) {
    items.push({
      id: `method:${method.slug}`,
      category: "methods",
      title: method.name,
      href: `/methods/${method.slug}`,
      aliases: method.aliases ?? [],
      keywords: [method.summary, ...method.categories],
      blurb: method.summary,
    });
  }

  for (const cluster of SEO_TOPIC_CLUSTERS) {
    items.push({
      id: `article:learn:${cluster.slug}`,
      category: "articles",
      title: cluster.title,
      href: `/learn/${cluster.slug}`,
      aliases: [cluster.clusterLabel],
      keywords: [cluster.description, cluster.overview.slice(0, 200)],
      blurb: cluster.description,
    });
  }

  for (const era of listHistoryEras()) {
    items.push({
      id: `article:history:${era.slug}`,
      category: "articles",
      title: era.title,
      href: `/history/${era.slug}`,
      aliases: [era.periodLabel],
      keywords: [era.teaser, era.periodLabel],
      blurb: era.teaser,
    });
  }

  for (const course of ACADEMY_COURSES.filter((c) => c.isPublished)) {
    items.push({
      id: `academy:${course.slug}`,
      category: "academy",
      title: course.title,
      href: `/academy/${course.slug}`,
      aliases: [],
      keywords: [course.summary, ...course.topics, course.audience],
      blurb: course.summary,
    });
  }

  // Public programs: none yet — keep category for UI honesty without fake hits.
  return items;
}

let cachedIndex: SearchIndexItem[] | null = null;

export function getSearchIndex(): SearchIndexItem[] {
  if (!cachedIndex) cachedIndex = buildSearchIndex();
  return cachedIndex;
}

/** Test helper — clear memoized index after catalog mocks. */
export function resetSearchIndexCache(): void {
  cachedIndex = null;
}
