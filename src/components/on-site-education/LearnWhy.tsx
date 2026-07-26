"use client";

import Link from "next/link";
import { featureFlags } from "@/config/feature-flags";
import {
  ON_SITE_EDUCATION_TRIGGER_LABEL,
  getEducationTopic,
  resolveEducationTopicId,
  type EducationTopicId,
} from "@/domain/on-site-education";

/**
 * Inline “Learn why” for dashboard metrics — expands in place (no modal/drawer).
 * Stop propagation so parent card Links still navigate when the rest of the card is clicked.
 */
export function LearnWhy({
  topicId,
  metricKey,
  className,
  compact = false,
}: {
  topicId?: EducationTopicId | string;
  /** Alternate: dashboard / progress series key. */
  metricKey?: string;
  className?: string;
  compact?: boolean;
}) {
  if (!featureFlags.onSiteEducation) return null;

  const resolvedId =
    (topicId ? resolveEducationTopicId(String(topicId)) ?? String(topicId) : null) ??
    (metricKey ? resolveEducationTopicId(metricKey) : null);
  if (!resolvedId) return null;

  const topic = getEducationTopic(resolvedId);
  if (!topic) return null;

  const appLinks = topic.relatedLinks.filter((l) => l.surface === "app");

  return (
    <details
      className={
        className ??
        "learn-why rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-panel)]/40 px-3 py-2"
      }
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <summary className="cursor-pointer list-none text-sm font-medium text-[var(--color-accent)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="text-[var(--color-muted)]">
            ▸
          </span>
          {ON_SITE_EDUCATION_TRIGGER_LABEL}
        </span>
      </summary>

      <div className="mt-3 grid gap-3 border-t border-[var(--color-border)] pt-3 text-sm">
        <p className="font-medium text-[var(--color-foreground)]">{topic.title}</p>
        <p className="text-[var(--color-muted)]">{topic.shortWhy}</p>
        {!compact ? (
          <p className="text-[var(--color-muted)] leading-relaxed">
            {topic.inContextExplanation}
          </p>
        ) : null}
        {appLinks.length > 0 ? (
          <ul className="flex flex-wrap gap-3 text-xs">
            {appLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
