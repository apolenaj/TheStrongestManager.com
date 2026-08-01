import { getLocale } from "next-intl/server";
import { ButtonLink } from "@/design-system";
import { HomeSection } from "@/components/marketing/HomeSection";
import {
  formatMoneyCents,
  listPublicPlans,
} from "@/domain/billing";

export async function HomePricingPreview() {
  const locale = await getLocale();
  const tiers = listPublicPlans().filter((p) => p.id !== "elite_coaching");
  const moSuffix = locale === "cs" ? "/měs." : "/mo";

  return (
    <HomeSection
      id="pricing"
      tone="surface"
      eyebrow="Pricing"
      title="Free, Pro, and Performance"
      description="Same catalog prices as the pricing page. Monthly is the default; annual is optional. Self-serve checkout turns on when Stripe is configured."
    >
      <ul className="grid gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <li
            key={tier.id}
            className="border-t border-[var(--color-border)] pt-5"
          >
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-foreground)]">
              {tier.name}
            </h3>
            <p className="mt-2 font-[family-name:var(--font-display)] text-lg tabular-nums text-[var(--color-foreground)]">
              {tier.monthly
                ? `${formatMoneyCents(tier.monthly.amountCents, "usd", locale)}${moSuffix}`
                : formatMoneyCents(0, "usd", locale)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              {tier.tagline}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <ButtonLink href="/pricing" variant="secondary">
          Compare plans and limits
        </ButtonLink>
      </div>
    </HomeSection>
  );
}
