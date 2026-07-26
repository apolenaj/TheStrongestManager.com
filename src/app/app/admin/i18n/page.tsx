import { ComingSoon } from "@/components/ui/ComingSoon";
import { I18nArchitecturePanel } from "@/components/i18n/I18nArchitecturePanel";
import { featureFlags } from "@/config/feature-flags";
import { t } from "@/domain/i18n";
import { requireAdmin } from "@/services/admin/require-admin";
import { getI18nArchitectureSnapshot } from "@/services/i18n";

export default async function AdminI18nPage() {
  await requireAdmin();

  if (!featureFlags.i18n) {
    return (
      <ComingSoon
        title={t("i18n.admin.flagOffTitle")}
        description={t("i18n.admin.flagOffDescription")}
        reason={t("i18n.admin.flagOffReason")}
      />
    );
  }

  const snapshot = getI18nArchitectureSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          {t("i18n.admin.title")}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {t("i18n.admin.subtitle")} Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <I18nArchitecturePanel snapshot={snapshot} />
    </div>
  );
}
