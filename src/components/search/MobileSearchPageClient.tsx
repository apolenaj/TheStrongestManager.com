"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { SearchResultsPanel } from "@/components/search/SearchResultsPanel";
import { ButtonLink } from "@/design-system";

export function MobileSearchPageClient() {
  const params = useSearchParams();
  const initial = useMemo(() => params.get("q")?.trim() ?? "", [params]);
  const [query, setQuery] = useState(initial);

  return (
    <MarketingContainer>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Search
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
            Find content
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Exercises, methods, articles, and academy — including aliases like
            RDL → Romanian Deadlift. Deterministic matching; AI is not required.
          </p>
        </div>
        <ButtonLink href="/" variant="secondary" size="sm">
          Home
        </ButtonLink>
      </div>
      <SearchResultsPanel
        query={query}
        onQueryChange={setQuery}
        autoFocus
        id="mobile-global-search"
      />
    </MarketingContainer>
  );
}
