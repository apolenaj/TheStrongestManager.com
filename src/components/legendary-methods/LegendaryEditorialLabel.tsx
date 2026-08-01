"use client";

import { useTranslations } from "next-intl";
import type { LegendaryEditorialLabelId } from "@/domain/legendary-methods/editorial-labels";
import { cn } from "@/design-system/utils/cn";

/**
 * Visible editorial label chip for documented / reconstructed / analysis layers.
 */
export function LegendaryEditorialLabel({
  id,
  className,
}: {
  id: LegendaryEditorialLabelId;
  className?: string;
}) {
  const t = useTranslations("LegendaryMethods.profile");
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-subtle)]",
        className,
      )}
      title={t(`editorialDescriptions.${id}`)}
    >
      {t(`editorialLabels.${id}`)}
    </span>
  );
}
