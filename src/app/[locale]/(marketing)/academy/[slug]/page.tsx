import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { CourseDetail } from "@/components/academy/CourseDetail";
import {
  JsonLdScript,
  academyCourseJsonLd,
} from "@/components/seo/JsonLdScript";
import { featureFlags } from "@/config/feature-flags";
import { allCourseSlugs } from "@/domain/academy";
import { getOptionalSession } from "@/services/auth/session";
import { getCourseLearningView } from "@/services/academy/academy-service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = await getCourseLearningView({ userId: null, courseSlug: slug });
  if (!view) {
    return { title: "Course not found", robots: { index: false, follow: false } };
  }
  return {
    title: view.course.title,
    description: view.course.summary,
    alternates: { canonical: `/academy/${view.course.slug}` },
  };
}

export default async function AcademyCoursePage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getOptionalSession();
  const view = await getCourseLearningView({
    userId: session?.user?.id ?? null,
    courseSlug: slug,
  });
  if (!view) notFound();

  return (
    <MarketingContainer>
      <JsonLdScript
        data={academyCourseJsonLd({
          title: view.course.title,
          summary: view.course.summary,
          slug: view.course.slug,
        })}
      />
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Course
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
          {view.course.title}
        </h1>
      </div>
      <CourseDetail
        view={view}
        basePath="/academy"
        signedIn={Boolean(session?.user)}
        academy20Enabled={featureFlags.academy20}
      />
    </MarketingContainer>
  );
}
