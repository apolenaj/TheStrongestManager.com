import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ToolsHub } from "@/components/calculator-suite/ToolsHub";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { featureFlags } from "@/config/feature-flags";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ToolsPage");
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: { canonical: "/tools" },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: "/tools",
    },
  };
}

export default async function ToolsHubPage() {
  if (!featureFlags.calculatorSuite) {
    const t = await getTranslations("ToolsPage");
    return (
      <MarketingContainer>
        <ComingSoon
          title={t("title")}
          description={t("subtitle")}
          reason="This surface ships behind NEXT_PUBLIC_FF_CALCULATOR_SUITE."
        />
      </MarketingContainer>
    );
  }

  return <ToolsHub />;
}
