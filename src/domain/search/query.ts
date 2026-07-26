import { getSearchIndex } from "@/domain/search/index-builder";
import {
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABELS,
  SEARCH_HONESTY,
  type GlobalSearchResult,
  type HighlightPart,
  type SearchCategory,
  type SearchGroup,
  type SearchHit,
  type SearchIndexItem,
} from "@/domain/search/types";

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(/[\s/_,+.-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function scoreItem(
  item: SearchIndexItem,
  tokens: string[],
  rawQuery: string,
): SearchHit | null {
  if (tokens.length === 0) return null;

  const titleN = normalize(item.title);
  const aliasNorms = item.aliases.map((a) => ({
    raw: a,
    n: normalize(a),
  }));
  const keywordBlob = normalize(item.keywords.join(" "));
  const queryN = normalize(rawQuery);

  let score = 0;
  let matchKind: SearchHit["matchKind"] = "keyword";
  let matchedAlias: string | undefined;

  // Exact alias / short-code match (e.g. RDL)
  for (const alias of aliasNorms) {
    if (alias.n === queryN || tokens.every((t) => alias.n === t)) {
      score += 100;
      matchKind = "alias";
      matchedAlias = alias.raw;
      break;
    }
    if (tokens.some((t) => alias.n === t || alias.n.startsWith(t))) {
      score += 80;
      matchKind = "alias";
      matchedAlias = alias.raw;
    } else if (tokens.some((t) => t.length >= 2 && alias.n.includes(t))) {
      score += 50;
      if (matchKind === "keyword") {
        matchKind = "alias";
        matchedAlias = alias.raw;
      }
    }
  }

  if (titleN === queryN) {
    score += 90;
    matchKind = "title";
  } else if (titleN.startsWith(queryN) || tokens.every((t) => titleN.includes(t))) {
    score += 70;
    matchKind = "title";
  } else if (tokens.some((t) => titleN.includes(t))) {
    score += 40;
    if (matchKind === "keyword") matchKind = "title";
  }

  const keywordHits = tokens.filter((t) => keywordBlob.includes(t)).length;
  if (keywordHits > 0) {
    score += keywordHits * 8;
  }

  if (score <= 0) return null;

  // Prefer shorter titles slightly when scores tie later
  score += Math.max(0, 10 - Math.min(10, item.title.length / 8));

  return {
    ...item,
    score,
    matchKind,
    matchedAlias,
  };
}

export function searchGlobal(
  query: string,
  options?: { limitPerCategory?: number; limitTotal?: number },
): GlobalSearchResult {
  const limitPerCategory = options?.limitPerCategory ?? 6;
  const limitTotal = options?.limitTotal ?? 24;
  const q = query.trim();
  const tokens = tokenize(q);
  const notes = [...SEARCH_HONESTY];

  if (tokens.length === 0) {
    return { query: q, groups: [], total: 0, notes };
  }

  const hits = getSearchIndex()
    .map((item) => scoreItem(item, tokens, q))
    .filter((h): h is SearchHit => h != null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const groups: SearchGroup[] = [];

  for (const category of SEARCH_CATEGORIES) {
    const categoryHits = hits
      .filter((h) => h.category === category)
      .slice(0, limitPerCategory);
    if (category === "programs" && categoryHits.length === 0) {
      // Still surface empty programs group only when query looks program-related
      const programish = /program|template|mesocycle|workout plan/i.test(q);
      if (programish) {
        groups.push({
          category,
          label: SEARCH_CATEGORY_LABELS[category],
          hits: [],
        });
      }
      continue;
    }
    if (categoryHits.length === 0) continue;
    groups.push({
      category,
      label: SEARCH_CATEGORY_LABELS[category],
      hits: categoryHits,
    });
  }

  // Cap overall
  let remaining = limitTotal;
  const capped: SearchGroup[] = groups.map((g) => {
    const slice = g.hits.slice(0, remaining);
    remaining = Math.max(0, remaining - slice.length);
    return { ...g, hits: slice };
  }).filter((g) => g.category === "programs" || g.hits.length > 0);

  return {
    query: q,
    groups: capped,
    total: capped.reduce((n, g) => n + g.hits.length, 0),
    notes,
  };
}

/**
 * Split text into highlight parts for matching query tokens.
 * Case-insensitive; preserves original casing in output.
 */
export function highlightMatches(text: string, query: string): HighlightPart[] {
  const tokens = tokenize(query).filter((t) => t.length >= 1);
  if (tokens.length === 0 || !text) {
    return [{ text, match: false }];
  }

  // Build regex from unique tokens, longest first
  const unique = [...new Set(tokens)].sort((a, b) => b.length - a.length);
  const pattern = unique
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!pattern) return [{ text, match: false }];

  const re = new RegExp(`(${pattern})`, "gi");
  const parts: HighlightPart[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) != null) {
    if (match.index > last) {
      parts.push({ text: text.slice(last, match.index), match: false });
    }
    parts.push({ text: match[0], match: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ text: text.slice(last), match: false });
  }
  return parts.length > 0 ? parts : [{ text, match: false }];
}

export function categoryLabel(category: SearchCategory): string {
  return SEARCH_CATEGORY_LABELS[category];
}
