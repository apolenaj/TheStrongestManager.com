import Link from "next/link";
import { Alert, ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  AI_FAILURE_KIND_TITLES,
  AI_FAILURE_MODES_HONESTY,
  CORE_APP_LINKS,
  type AiCapabilityStatus,
  type AiFailure,
  type AiFailureKind,
} from "@/domain/ai-failure-modes";

/**
 * Graceful AI failure UI — distinct from ComingSoon (unshipped module).
 * Core training tools remain linked; never fabricates recommendations.
 */
export function AiUnavailableState({
  failure,
  capabilityLabel,
  kind,
  title,
  message,
  showCoreLinks = true,
}: {
  failure?: AiFailure | null;
  capabilityLabel?: string;
  kind?: AiFailureKind;
  title?: string;
  message?: string;
  showCoreLinks?: boolean;
}) {
  if (!featureFlags.aiFailureModes) {
    return (
      <Alert tone="warning" title={title ?? "AI unavailable"}>
        {message ?? failure?.message ?? AI_FAILURE_MODES_HONESTY[0]}
      </Alert>
    );
  }

  const resolvedKind = failure?.kind ?? kind ?? "unavailable";
  const resolvedTitle =
    title ?? AI_FAILURE_KIND_TITLES[resolvedKind];
  const resolvedMessage =
    message ??
    failure?.message ??
    "AI is unavailable. Your training tools still work — nothing was invented.";

  return (
    <div className="flex flex-col items-start rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-[var(--space-6)] py-[var(--space-8)]">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
        AI unavailable
        {capabilityLabel ? ` · ${capabilityLabel}` : null}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-3xl">
        {resolvedTitle}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
        {resolvedMessage}
      </p>
      {failure?.detail ? (
        <p className="mt-3 text-xs text-[var(--color-subtle)]">{failure.detail}</p>
      ) : null}
      <p className="mt-4 max-w-2xl text-sm text-[var(--color-muted)]">
        {AI_FAILURE_MODES_HONESTY[2]}
      </p>
      {showCoreLinks ? (
        <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
          <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Still available
          </p>
          {CORE_APP_LINKS.map((link) => (
            <ButtonLink key={link.href} href={link.href} variant="secondary">
              {link.label}
            </ButtonLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Compact banner when AI runs in deterministic / degraded mode.
 */
export function AiDegradedBanner({
  status,
}: {
  status: AiCapabilityStatus;
}) {
  if (!featureFlags.aiFailureModes) return null;
  if (!status.usingDeterministicFallback || !status.failure) return null;

  return (
    <Alert tone="info" title={AI_FAILURE_KIND_TITLES.degraded}>
      <p>{status.failure.message}</p>
      <p className="mt-2 text-sm">
        Core tools stay online:{" "}
        {CORE_APP_LINKS.map((link, i) => (
          <span key={link.href}>
            {i > 0 ? " · " : null}
            <Link
              href={link.href}
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              {link.label}
            </Link>
          </span>
        ))}
        .
      </p>
    </Alert>
  );
}
