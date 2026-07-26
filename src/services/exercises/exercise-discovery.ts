import { featureFlags } from "@/config/feature-flags";
import {
  filterExercises,
  findRelatedExercises,
  parseExerciseSearchParams,
  pickPopularExercises,
  type ExerciseSearchFilters,
} from "@/domain/exercises/search";
import { variationNeighborSlugs } from "@/domain/exercise-relationship-graph";
import {
  listPublishedExercises,
  type ExerciseListItem,
} from "@/services/exercises/exercise-catalog";

export type ExerciseDiscoveryResult = {
  filters: ExerciseSearchFilters;
  catalog: ExerciseListItem[];
  results: ExerciseListItem[];
  popular: ExerciseListItem[];
  related: ExerciseListItem[];
  /** True when related rail used explicit graph variation edges. */
  relatedFromGraph: boolean;
  resultCount: number;
  hasFilters: boolean;
};

export async function getExerciseDiscovery(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<ExerciseDiscoveryResult> {
  const filters = parseExerciseSearchParams(rawParams);
  const catalog = await listPublishedExercises();
  const results = filterExercises(catalog, filters);
  const popular = pickPopularExercises(catalog);
  const seed = results[0] ?? popular[0] ?? null;

  let related: ExerciseListItem[] = [];
  let relatedFromGraph = false;

  if (seed && featureFlags.exerciseRelationshipGraph) {
    const bySlug = new Map(catalog.map((e) => [e.slug, e]));
    const exclude = new Set(results.slice(0, 6).map((e) => e.slug));
    exclude.add(seed.slug);
    const graphRelated = variationNeighborSlugs(seed.slug)
      .map((slug) => bySlug.get(slug))
      .filter((e): e is ExerciseListItem => Boolean(e) && !exclude.has(e!.slug))
      .slice(0, 4);
    if (graphRelated.length > 0) {
      related = graphRelated;
      relatedFromGraph = true;
    }
  }

  if (related.length === 0) {
    related = findRelatedExercises(catalog, seed, {
      excludeSlugs: results.slice(0, 6).map((e) => e.slug),
      limit: 4,
    });
  }

  return {
    filters,
    catalog,
    results,
    popular,
    related,
    relatedFromGraph,
    resultCount: results.length,
    hasFilters: Boolean(
      filters.q ||
        filters.sport ||
        filters.equipment ||
        filters.movement ||
        filters.muscle ||
        filters.difficulty,
    ),
  };
}
