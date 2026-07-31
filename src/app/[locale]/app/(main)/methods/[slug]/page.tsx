import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MethodDetailContent } from "@/components/methods/MethodDetailContent";
import {
  allMethodSlugs,
  getMethodDetail,
  getRelatedMethods,
} from "@/domain/methods";

type AppMethodDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allMethodSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: AppMethodDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const method = getMethodDetail(slug);
  return {
    title: method ? method.name : "Method",
    robots: { index: false, follow: false },
  };
}

export default async function AppMethodDetailPage({
  params,
}: AppMethodDetailPageProps) {
  const { slug } = await params;
  const method = getMethodDetail(slug);
  if (!method) notFound();
  const related = getRelatedMethods(method);

  return (
    <MethodDetailContent
      method={method}
      related={related}
      basePath="/app/methods"
    />
  );
}
