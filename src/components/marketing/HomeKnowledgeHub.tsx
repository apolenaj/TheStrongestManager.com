"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3, Gauge } from "lucide-react";
import { knowledgeHubCopy } from "@/lib/content/home-value";
import { cn } from "@/design-system/utils/cn";

type CategoryId = (typeof knowledgeHubCopy.categories)[number]["id"];

export function HomeKnowledgeHub() {
  const [category, setCategory] = useState<CategoryId>("all");

  const resources = useMemo(() => {
    if (category === "all") return knowledgeHubCopy.resources;
    return knowledgeHubCopy.resources.filter((item) => item.category === category);
  }, [category]);

  return (
    <section
      id="knowledge-hub"
      aria-labelledby="home-knowledge-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {knowledgeHubCopy.eyebrow}
          </p>
          <h2
            id="home-knowledge-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3.1rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            {knowledgeHubCopy.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
            {knowledgeHubCopy.description}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Resource categories"
          className="mt-10 flex flex-wrap gap-2"
        >
          {knowledgeHubCopy.categories.map((item) => {
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "min-h-11 rounded-sm border px-4 text-sm font-medium transition-all duration-300",
                  active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-foreground)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <li key={resource.id}>
              <Link
                href={resource.href}
                className="group flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] hover:bg-[var(--color-surface-elevated)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)]">
                    <BookOpen className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-[var(--color-subtle)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-accent)]"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                  {resource.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
                  {resource.benefit}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-subtle)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    {resource.readingTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                    {resource.difficulty}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href="/learn"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-accent)] transition-colors duration-300 hover:text-[var(--color-accent-hover)]"
          >
            Browse the full training library
            <ArrowUpRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
