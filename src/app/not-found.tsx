import Link from "next/link";
import { ButtonLink } from "@/design-system";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
      <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-[var(--color-accent)]">
        404
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
        Page not found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        That URL is not part of {siteConfig.name}. It may have moved, or the link
        is outdated.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/search" variant="secondary">
          Search
        </ButtonLink>
        <Link
          href="/features"
          className="inline-flex min-h-11 items-center text-sm text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          Features
        </Link>
      </div>
    </div>
  );
}
