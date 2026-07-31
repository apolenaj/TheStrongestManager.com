import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { CourseDetail } from "@/components/academy/CourseDetail";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getCourseLearningView } from "@/services/academy/academy-service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = await getCourseLearningView({ userId: null, courseSlug: slug });
  return {
    title: view?.course.title ?? "Course",
    robots: { index: false, follow: false },
  };
}

export default async function AppAcademyCoursePage({ params }: PageProps) {
  return (
    <FeatureGate
      flag="appAcademy"
      title="Academy"
      description="In-app academy learning paths appear when this flag is enabled."
    >
      <AppAcademyCourseContent params={params} />
    </FeatureGate>
  );
}

async function AppAcademyCourseContent({ params }: PageProps) {
  const session = await requireSession();
  const { slug } = await params;
  const view = await getCourseLearningView({
    userId: session.user.id,
    courseSlug: slug,
  });
  if (!view) notFound();

  return (
    <AppPage
      eyebrow="Academy course"
      title={view.course.title}
      description="Modules, lessons, quizzes, and Certificate of Completion progress."
    >
      <CourseDetail
        view={view}
        basePath="/app/academy"
        signedIn
        academy20Enabled={featureFlags.academy20}
      />
    </AppPage>
  );
}
