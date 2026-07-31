import { useTranslations } from "next-intl";
import { Alert } from "@/design-system";

type DisclaimerVariant = "short" | "complete" | "index";

/**
 * Reusable legal disclaimer for Legendary Training Methods.
 * Short near tops/CTAs; complete near sources and page footers.
 */
export function LegendaryMethodDisclaimer({
  variant = "complete",
  className,
}: {
  variant?: DisclaimerVariant;
  className?: string;
}) {
  const t = useTranslations("LegendaryMethods.disclaimer");

  if (variant === "short") {
    return (
      <p
        className={
          className ??
          "border border-white/10 bg-[var(--color-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--color-muted)]"
        }
        role="note"
      >
        {t("short")}
      </p>
    );
  }

  if (variant === "index") {
    return (
      <Alert tone="info" title={t("title")}>
        <ul className="space-y-2.5 text-sm">
          <li>{t("complete")}</li>
          <li>{t("lineVisuals")}</li>
          <li>{t("lineFacts")}</li>
          <li>{t("lineMedical")}</li>
        </ul>
      </Alert>
    );
  }

  return (
    <aside
      className={
        className ??
        "legendary-surface p-6 text-sm leading-relaxed text-[var(--color-muted)]"
      }
      aria-label={t("aria")}
    >
      <p className="font-medium text-[var(--color-foreground)]">{t("title")}</p>
      <p className="mt-2">{t("complete")}</p>
    </aside>
  );
}

export function LegendaryRelatedProgrammeDisclaimer() {
  const t = useTranslations("LegendaryMethods.disclaimer");

  return (
    <p className="mt-3 max-w-prose text-sm text-[var(--color-muted)]">
      {t("related")} {t("short")}
    </p>
  );
}
