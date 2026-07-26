"use client";

import Link from "next/link";
import { featureFlags } from "@/config/feature-flags";
import {
  EXPLAINABLE_AI_TRIGGER_LABEL,
  type ExplainableInsightView,
} from "@/domain/explainable-ai";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { PRODUCT_TRUST_CERTAINTY_DISCLAIMER } from "@/domain/product-trust-audit";

/**
 * Shared “Why am I seeing this?” panel for AI insights.
 * Supporting data · Confidence · Missing information · Certainty (Prompt 182).
 */
export function WhyAmISeeingThis({
  view,
  className,
  defaultOpen = false,
}: {
  view: ExplainableInsightView;
  className?: string;
  defaultOpen?: boolean;
}) {
  if (!featureFlags.explainableAiUi) return null;

  const hasSupporting = view.supportingData.length > 0;
  const hasMissing = view.missingInformation.length > 0;
  const hasSummary = Boolean(view.summary?.trim());

  if (!hasSupporting && !hasMissing && !hasSummary && view.confidence === "none") {
    return null;
  }

  return (
    <details
      className={
        className ??
        "explainable-ai-why rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-panel)]/40 px-3 py-2"
      }
      open={defaultOpen || undefined}
    >
      <summary className="cursor-pointer list-none text-sm font-medium text-[var(--color-foreground)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="text-[var(--color-muted)]">
            ▸
          </span>
          {EXPLAINABLE_AI_TRIGGER_LABEL}
        </span>
      </summary>

      <div className="mt-3 grid gap-4 border-t border-[var(--color-border)] pt-3 text-sm">
        {hasSummary ? (
          <p className="text-[var(--color-muted)]">{view.summary}</p>
        ) : null}

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Why
          </h4>
          {hasSupporting ? (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[var(--color-muted)]">
              {view.supportingData.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[var(--color-muted)]">
              No supporting data for this insight yet.
            </p>
          )}
        </section>

        <section className="flex flex-wrap items-center gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Confidence
          </h4>
          <ConfidenceBadge confidence={view.confidence} prefix={null} />
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Missing information
          </h4>
          {hasMissing ? (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[var(--color-muted)]">
              {view.missingInformation.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[var(--color-muted)]">
              None flagged for this insight.
            </p>
          )}
        </section>

        {featureFlags.productTrustAudit ? (
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Certainty
            </h4>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              {PRODUCT_TRUST_CERTAINTY_DISCLAIMER}{" "}
              <Link
                href="/trust"
                className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                Trust Center
              </Link>
            </p>
          </section>
        ) : null}
      </div>
    </details>
  );
}
