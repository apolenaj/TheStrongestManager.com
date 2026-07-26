import { relatedContentFromGraph } from "@/domain/exercise-relationship-graph";
import { SEO_TOPIC_CLUSTERS } from "@/domain/seo/clusters";
import type { SeoSupportingPage, SeoTopicCluster } from "@/domain/seo/types";

export function listSeoClusters(): SeoTopicCluster[] {
  return SEO_TOPIC_CLUSTERS.map(enrichClusterSupportingFromGraph);
}

export function getSeoClusterBySlug(slug: string): SeoTopicCluster | null {
  const cluster = SEO_TOPIC_CLUSTERS.find((c) => c.slug === slug) ?? null;
  return cluster ? enrichClusterSupportingFromGraph(cluster) : null;
}

export function allSeoClusterSlugs(): string[] {
  return SEO_TOPIC_CLUSTERS.map((c) => c.slug);
}

export function getRelatedClusters(
  cluster: SeoTopicCluster,
): SeoTopicCluster[] {
  return cluster.relatedClusterSlugs
    .map((slug) => getSeoClusterBySlug(slug))
    .filter((c): c is SeoTopicCluster => c != null);
}

/** Supporting hrefs that are safe to index (must start with / and not be empty). */
export function isIndexableSupportingHref(href: string): boolean {
  return href.startsWith("/") && href.length > 1 && !href.includes("?");
}

/**
 * Append graph-backed variation/method links for exercises already in the cluster.
 * Public URLs only — never /app stubs or invented pages.
 */
function enrichClusterSupportingFromGraph(
  cluster: SeoTopicCluster,
): SeoTopicCluster {
  const existing = new Set(cluster.supportingPages.map((p) => p.href));
  const extra: SeoSupportingPage[] = [];

  for (const page of cluster.supportingPages) {
    const match = page.href.match(/^\/exercises\/([^/?#]+)$/);
    if (!match?.[1]) continue;
    for (const link of relatedContentFromGraph(match[1])) {
      if (link.href.startsWith("/app/")) continue;
      if (link.href.includes("?")) continue;
      if (!isIndexableSupportingHref(link.href)) continue;
      if (
        link.relation !== "variation" &&
        link.relation !== "method" &&
        link.relation !== "technique_issue"
      ) {
        continue;
      }
      if (existing.has(link.href)) continue;
      existing.add(link.href);
      extra.push({
        href: link.href,
        title: link.title,
        reason: `Graph ${link.relation}: ${link.reason}`,
      });
      if (extra.length >= 8) break;
    }
    if (extra.length >= 8) break;
  }

  if (extra.length === 0) return cluster;
  return {
    ...cluster,
    supportingPages: [...cluster.supportingPages, ...extra],
  };
}
