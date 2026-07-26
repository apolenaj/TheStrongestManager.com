export {
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABELS,
  SEARCH_HONESTY,
} from "@/domain/search/types";
export type {
  GlobalSearchResult,
  HighlightPart,
  SearchCategory,
  SearchGroup,
  SearchHit,
  SearchIndexItem,
} from "@/domain/search/types";
export {
  buildSearchIndex,
  getSearchIndex,
  resetSearchIndexCache,
} from "@/domain/search/index-builder";
export {
  categoryLabel,
  highlightMatches,
  searchGlobal,
} from "@/domain/search/query";
