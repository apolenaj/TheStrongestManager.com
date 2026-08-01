import { getLocale } from "next-intl/server";
import { Alert, Badge } from "@/design-system";
import {
  formatMoneyCents,
  type CreditPackDefinition,
} from "@/domain/billing";
import type { CreditWalletView } from "@/services/billing/credit-service";

export async function TechniqueCreditsPanel({
  wallet,
}: {
  wallet: CreditWalletView;
}) {
  const locale = await getLocale();
  return (
    <section className="space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Analysis credits
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Period {wallet.periodKey}
            {wallet.unlimitedAnalyses
              ? " · unlimited on your plan"
              : ` · monthly allocation ${wallet.monthlyAllocation}`}
          </p>
        </div>
        <p className="font-[family-name:var(--font-display)] text-3xl tabular-nums text-[var(--color-foreground)]">
          {wallet.unlimitedAnalyses ? "∞" : wallet.balance}
        </p>
      </div>

      <Alert tone="info" title="Usage-based technique analysis">
        {wallet.honesty[0]} {wallet.honesty[1]}
      </Alert>

      {!wallet.unlimitedAnalyses ? (
        <CreditPacksList packs={wallet.packs} locale={locale} />
      ) : null}

      {wallet.recentTransactions.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-[var(--color-foreground)]">
            Recent credit activity
          </h3>
          <ul className="mt-2 space-y-2 text-sm">
            {wallet.recentTransactions.slice(0, 8).map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--color-border)] pt-2"
              >
                <span className="text-[var(--color-muted)]">
                  <Badge variant="neutral">{t.kind}</Badge> {t.reason}
                </span>
                <span className="tabular-nums text-[var(--color-foreground)]">
                  {t.delta > 0 ? `+${t.delta}` : t.delta} → {t.balanceAfter}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function CreditPacksList({
  packs,
  locale,
}: {
  packs: CreditPackDefinition[];
  locale: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-[var(--color-foreground)]">
        Optional credit packs
      </h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {packs.map((pack) => (
          <li key={pack.id}>
            <Badge variant="neutral">
              {pack.name} · {formatMoneyCents(pack.amountCents, "usd", locale)}
            </Badge>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Pack checkout uses the Stripe billing provider when configured — not
        charged from this panel yet.
      </p>
    </div>
  );
}
