import type { Metadata } from "next";
import { Suspense } from "react";
import { MobileSearchPageClient } from "@/components/search/MobileSearchPageClient";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search exercises, methods, articles, and academy content. Alias-aware; AI not required.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-[var(--color-muted)]">
          Loading search…
        </div>
      }
    >
      <MobileSearchPageClient />
    </Suspense>
  );
}
