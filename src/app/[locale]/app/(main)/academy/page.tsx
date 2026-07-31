import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { StudentDashboard } from "@/components/academy/StudentDashboard";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getStudentDashboard } from "@/services/academy/academy-service";

export const metadata: Metadata = {
  title: "Academy",
  robots: { index: false, follow: false },
};

export default async function AppAcademyPage() {
  return (
    <FeatureGate
      flag="appAcademy"
      title="Academy"
      description="In-app academy learning paths appear when this flag is enabled."
    >
      <AppAcademyContent />
    </FeatureGate>
  );
}

async function AppAcademyContent() {
  const session = await requireSession();
  const dash = await getStudentDashboard(session.user.id);
  const academy20Enabled = featureFlags.academy20;

  return (
    <AppPage
      eyebrow="Academy"
      title="Student dashboard"
      description={
        academy20Enabled
          ? "Track learning paths, enrollments, quizzes, practical assignments, and Certificates of Completion."
          : "Track enrollments, lesson progress, quizzes, and Certificates of Completion."
      }
    >
      <StudentDashboard
        honesty={dash.honesty}
        honesty2={dash.honesty2}
        catalog={dash.catalog}
        enrollments={dash.enrollments}
        academy20Enabled={academy20Enabled}
        paths={dash.paths}
        pathProgress={dash.pathProgress}
      />
    </AppPage>
  );
}
