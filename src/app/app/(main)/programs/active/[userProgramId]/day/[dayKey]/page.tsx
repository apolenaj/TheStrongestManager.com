import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { CatalogWorkoutPlayer } from "@/components/catalog-workout/CatalogWorkoutPlayer";
import { requireSession } from "@/services/auth/session";
import { getCatalogWorkoutView } from "@/services/catalog-workout";

export const metadata: Metadata = {
  title: "Workout",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ userProgramId: string; dayKey: string }>;
};

export default async function CatalogWorkoutDayPage({ params }: PageProps) {
  const session = await requireSession();
  const { userProgramId, dayKey } = await params;
  const decodedDay = decodeURIComponent(dayKey);

  const result = await getCatalogWorkoutView({
    userId: session.user.id,
    userProgramId,
    dayKey: decodedDay,
  });

  if (!result.ok) {
    notFound();
  }

  return (
    <AppPage
      eyebrow="Workout execution"
      title={result.workout.dayLabel}
      description="Log actual loads and RPE. Suggested weights come from your training maxes — not AI."
    >
      <CatalogWorkoutPlayer workout={result.workout} />
    </AppPage>
  );
}
