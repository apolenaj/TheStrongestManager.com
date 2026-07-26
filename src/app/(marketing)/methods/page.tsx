import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { MethodsIndex } from "@/components/methods/MethodsIndex";
import { PageIntro } from "@/components/ui/PageIntro";
import { searchMethods } from "@/domain/methods";

export const metadata: Metadata = {
  title: "Training Methods",
  description:
    "Historical and modern training methods for powerlifting, bodybuilding, strongman, weightlifting, and general strength — with clear limits.",
  alternates: { canonical: "/methods" },
};

type MethodsPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function MethodsPage({ searchParams }: MethodsPageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";
  const methods = searchMethods({ q, category });

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Methods"
        title="Training Methods"
        description="Origins, use cases, and limitations for methods across powerlifting, bodybuilding, strongman, weightlifting, and general strength."
      />
      <div className="mt-8">
        <MethodsIndex
          methods={methods}
          basePath="/methods"
          q={q}
          category={category}
        />
      </div>
    </MarketingContainer>
  );
}
