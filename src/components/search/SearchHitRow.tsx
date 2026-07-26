"use client";

import Link from "next/link";
import { highlightMatches, type SearchHit } from "@/domain/search";
import { Badge } from "@/design-system";
import { cn } from "@/design-system/utils/cn";

export function HighlightedText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  const parts = highlightMatches(text, query);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.match ? (
          <mark
            key={`${i}-${part.text}`}
            className="rounded-sm bg-[var(--color-accent-muted)] text-[var(--color-foreground)]"
          >
            {part.text}
          </mark>
        ) : (
          <span key={`${i}-${part.text}`}>{part.text}</span>
        ),
      )}
    </span>
  );
}

export function SearchHitRow({
  hit,
  query,
  active,
  onNavigate,
}: {
  hit: SearchHit;
  query: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={hit.href}
      onClick={onNavigate}
      className={cn(
        "block rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        active
          ? "bg-[var(--color-surface-elevated)]"
          : "hover:bg-[var(--color-surface-elevated)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <HighlightedText
          text={hit.title}
          query={query}
          className="font-medium text-[var(--color-foreground)]"
        />
        {hit.matchKind === "alias" && hit.matchedAlias ? (
          <Badge variant="info">Alias: {hit.matchedAlias}</Badge>
        ) : null}
      </div>
      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-muted)]">
        <HighlightedText text={hit.blurb} query={query} />
      </p>
    </Link>
  );
}
