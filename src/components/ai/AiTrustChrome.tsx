"use client";

import Link from "next/link";
import { featureFlags } from "@/config/feature-flags";
import { AthleteAiFeedbackControls } from "@/components/ai/AthleteAiFeedbackControls";
import { PRODUCT_TRUST_CERTAINTY_DISCLAIMER } from "@/domain/product-trust-audit";
import type { ModelFeedbackRelatedType } from "@/domain/model-feedback";

/**
 * Shared trust chrome for AI surfaces (Prompt 182).
 * Certainty disclaimer + optional challenge (feedback / correct link).
 */
export function AiTrustChrome({
  relatedType,
  relatedId,
  correctHref,
  correctLabel = "Correct source data",
  className,
}: {
  relatedType?: ModelFeedbackRelatedType;
  relatedId?: string;
  correctHref?: string;
  correctLabel?: string;
  className?: string;
}) {
  const showDisclaimer = featureFlags.productTrustAudit;
  const showFeedback =
    Boolean(relatedType && relatedId) && featureFlags.modelFeedback;

  if (!showDisclaimer && !showFeedback && !correctHref) return null;

  return (
    <div
      className={
        className ??
        "mt-3 space-y-2 border-t border-[var(--color-border)] pt-3"
      }
    >
      {showDisclaimer ? (
        <p className="text-xs text-[var(--color-muted)]">
          {PRODUCT_TRUST_CERTAINTY_DISCLAIMER}{" "}
          <Link
            href="/trust"
            className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Trust Center
          </Link>
        </p>
      ) : null}
      {correctHref ? (
        <p className="text-xs">
          <Link
            href={correctHref}
            className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            {correctLabel}
          </Link>
        </p>
      ) : null}
      {showFeedback && relatedType && relatedId ? (
        <AthleteAiFeedbackControls
          relatedType={relatedType}
          relatedId={relatedId}
        />
      ) : null}
    </div>
  );
}
