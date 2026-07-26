"use client";

import { useEffect } from "react";
import { ErrorState, ButtonLink } from "@/design-system";
import { reportClientError } from "@/components/observability/reportClientError";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      digest: error.digest,
      source: "app-error",
      route:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-16 sm:px-6">
      <ErrorState
        title="Something went wrong"
        description="This page failed to render. You can try again, or return home. No fake data was invented to cover the failure."
        action={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-background)]"
            >
              Try again
            </button>
            <ButtonLink href="/" variant="secondary">
              Home
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
