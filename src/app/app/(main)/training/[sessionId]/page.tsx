import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkoutPlayer } from "@/components/workout/WorkoutPlayer";
import { requireSession } from "@/services/auth/session";
import { getAthleteTimezone } from "@/services/timezone-system";
import { getWorkoutSessionView } from "@/services/workout/workout-service";

export const metadata: Metadata = {
  title: "Workout",
  robots: { index: false, follow: false },
};

export default async function TrainingSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await requireSession();
  const [view, timeZone] = await Promise.all([
    getWorkoutSessionView(session.user.id, sessionId),
    getAthleteTimezone(session.user.id),
  ]);
  if (!view) notFound();

  return <WorkoutPlayer view={view} timeZone={timeZone} />;
}
