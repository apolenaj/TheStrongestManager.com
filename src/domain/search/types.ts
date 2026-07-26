/**
 * Global search types (Prompt 40).
 * Deterministic keyword/alias search — AI is never required for basic search.
 */

export const SEARCH_CATEGORIES = [
  "exercises",
  "methods",
  "articles",
  "academy",
  "programs",
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export const SEARCH_CATEGORY_LABELS: Record<SearchCategory, string> = {
  exercises: "Exercises",
  methods: "Methods",
  articles: "Articles",
  academy: "Academy",
  programs: "Programs",
};

export type SearchIndexItem = {
  id: string;
  category: SearchCategory;
  title: string;
  href: string;
  /** Primary aliases (e.g. RDL) — exact/alias hits rank higher */
  aliases: string[];
  /** Extra keywords (summary, topics) */
  keywords: string[];
  blurb: string;
};

export type SearchHit = SearchIndexItem & {
  score: number;
  /** Why it matched: title | alias | keyword */
  matchKind: "title" | "alias" | "keyword";
  matchedAlias?: string;
};

export type SearchGroup = {
  category: SearchCategory;
  label: string;
  hits: SearchHit[];
};

export type GlobalSearchResult = {
  query: string;
  groups: SearchGroup[];
  total: number;
  /** Honest note when programs category has no public inventory */
  notes: string[];
};

export const SEARCH_HONESTY = [
  "Basic search is deterministic keyword and alias matching — AI is not required.",
  "Public programs are not published yet, so the Programs group stays empty until they exist.",
] as const;

export type HighlightPart = {
  text: string;
  match: boolean;
};
