import type { I18nArchitectureSnapshot } from "@/domain/i18n";
import { LOCALE_DEFINITIONS, t } from "@/domain/i18n";

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function I18nArchitecturePanel({
  snapshot,
}: {
  snapshot: I18nArchitectureSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {t("i18n.admin.engine", "en", { version: snapshot.engineVersion })}
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.engineVersion}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {t("i18n.admin.defaultLocale", "en")}
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {LOCALE_DEFINITIONS[snapshot.defaultLocale].nativeName} (
            {snapshot.defaultLocale})
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {t("i18n.admin.englishKeys", "en")}
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.englishMessageCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {t("i18n.admin.terminology", "en")}
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.terminologyCount}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          {t("i18n.admin.readiness", "en")}
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Locale</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Dir</th>
                <th className="py-2 pr-4 font-medium">
                  {t("i18n.admin.coverage", "en")}
                </th>
                <th className="py-2 pr-4 font-medium">
                  {t("i18n.admin.termReviewed", "en")}
                </th>
                <th className="py-2 font-medium">
                  {t("i18n.admin.termPending", "en")}
                </th>
              </tr>
            </thead>
            <tbody>
              {snapshot.readiness.map((row) => {
                const def = LOCALE_DEFINITIONS[row.locale];
                return (
                  <tr
                    key={row.locale}
                    className="border-b border-[var(--color-border)]/60"
                  >
                    <td className="py-3 pr-4">
                      <span className="font-medium">{def.nativeName}</span>
                      <span className="ml-2 text-[var(--color-muted)]">
                        {row.locale} · {def.bcp47}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {row.status === "active"
                        ? t("locale.active", "en")
                        : t("locale.planned", "en")}
                    </td>
                    <td className="py-3 pr-4 uppercase">{row.textDirection}</td>
                    <td className="py-3 pr-4">{pct(row.messageCoverage)}</td>
                    <td className="py-3 pr-4">{row.terminologyReviewed}</td>
                    <td className="py-3">{row.terminologyPending}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-sm text-[var(--color-muted)]">
        {t("i18n.admin.noAutoTranslate", "en")}
      </p>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          {t("i18n.admin.honestyTitle", "en")}
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
