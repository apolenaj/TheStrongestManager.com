import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { MethodDetailContent } from "@/components/methods/MethodDetailContent";
import {
  JsonLdScript,
  methodDetailJsonLd,
} from "@/components/seo/JsonLdScript";
import {
  allMethodSlugs,
  getMethodDetail,
  getRelatedMethods,
} from "@/domain/methods";

type MethodDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allMethodSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: MethodDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const method = getMethodDetail(slug);
  if (!method) {
    return { title: "Method not found", robots: { index: false, follow: false } };
  }
  return {
    title: method.name,
    description: method.summary,
    alternates: { canonical: `/methods/${method.slug}` },
  };
}

export default async function MethodDetailPage({
  params,
}: MethodDetailPageProps) {
  const { slug } = await params;
  const method = getMethodDetail(slug);
  if (!method) notFound();
  const related = getRelatedMethods(method);

  return (
    <MarketingContainer>
      <JsonLdScript
        data={methodDetailJsonLd({
          name: method.name,
          summary: method.summary,
          slug: method.slug,
        })}
      />
      <MethodDetailContent
        method={method}
        related={related}
        basePath="/methods"
      />
    </MarketingContainer>
  );
}
