"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, EmptyState, Input } from "@/design-system";
import {
  SEARCH_HONESTY,
  searchGlobal,
  type SearchHit,
} from "@/domain/search";
import { SearchHitRow } from "@/components/search/SearchHitRow";

export function SearchResultsPanel({
  query,
  onQueryChange,
  onNavigate,
  autoFocus,
  id,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onNavigate?: () => void;
  autoFocus?: boolean;
  id?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const result = useMemo(() => searchGlobal(query), [query]);
  const flatHits: SearchHit[] = useMemo(
    () => result.groups.flatMap((g) => g.hits),
    [result.groups],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function selectHit(hit: SearchHit) {
    onNavigate?.();
    router.push(hit.href);
  }

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id ?? inputId} className="sr-only">
        Search
      </label>
      <Input
        ref={inputRef}
        id={id ?? inputId}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search exercises, methods, articles, academy…"
        className="min-h-12"
        autoComplete="off"
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, Math.max(0, flatHits.length - 1)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
          } else if (e.key === "Enter" && flatHits[activeIndex]) {
            e.preventDefault();
            selectHit(flatHits[activeIndex]!);
          }
        }}
      />

      <p className="text-xs text-[var(--color-muted)]">{SEARCH_HONESTY[0]}</p>

      {!query.trim() ? (
        <EmptyState
          title="Start typing"
          description="Try RDL, periodization, Deadlift Specialist, or powerlifting. Aliases resolve to canonical titles."
        />
      ) : result.total === 0 ? (
        <div className="space-y-3">
          <EmptyState
            title="No matches"
            description="Try another term or alias. Public programs are not indexed yet."
          />
          {result.groups.some((g) => g.category === "programs") ? (
            <Alert tone="info" title="Programs">
              {SEARCH_HONESTY[1]}
            </Alert>
          ) : null}
        </div>
      ) : (
        <div className="max-h-[min(60vh,28rem)] space-y-4 overflow-y-auto pr-1">
          {result.groups.map((group) => (
            <section key={group.category}>
              <h3 className="sticky top-0 z-[1] bg-[var(--color-surface)] pb-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
                {group.label}
                {group.hits.length === 0 ? " — none public yet" : ""}
              </h3>
              {group.hits.length === 0 ? (
                <p className="px-3 py-2 text-sm text-[var(--color-muted)]">
                  {SEARCH_HONESTY[1]}
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {group.hits.map((hit) => {
                    const flatIndex = flatHits.findIndex((h) => h.id === hit.id);
                    return (
                      <li key={hit.id}>
                        <SearchHitRow
                          hit={hit}
                          query={query}
                          active={flatIndex === activeIndex}
                          onNavigate={onNavigate}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
