"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  readRecentExercises,
  type RecentExerciseEntry,
} from "@/lib/exercises/recently-viewed";

export function RecentlyViewedExercises() {
  const [items, setItems] = useState<RecentExerciseEntry[]>([]);

  useEffect(() => {
    setItems(readRecentExercises());
  }, []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Exercises you open on this device appear here. Nothing is synced to a
        server.
      </p>
    );
  }

  return (
    <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <li key={item.slug} className="shrink-0">
          <Link
            href={`/exercises/${item.slug}`}
            className="inline-flex rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] hover:border-[var(--color-accent)]"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
