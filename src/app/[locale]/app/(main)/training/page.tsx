import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { ButtonLink, EmptyState } from "@/design-system";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";

export const metadata: Metadata = {
  title: "Training",
  robots: { index: false, follow: false },
};

export default async function TrainingPage() {
  const session = await requireSession();
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return (
      <AppPage
        eyebrow="Training"
        title="Training"
        description="Live workout workspace."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before logging workouts."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const active = await prisma.trainingSession.findFirst({
    where: { athleteProfileId: profile.id, status: "in_progress" },
    orderBy: { startedAt: "desc" },
  });

  if (active) {
    redirect(`/app/training/${active.id}`);
  }

  const recent = await prisma.trainingSession.findMany({
    where: {
      athleteProfileId: profile.id,
      status: { in: ["completed", "skipped"] },
    },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: {
      id: true,
      workoutNameSnapshot: true,
      completedAt: true,
      status: true,
    },
  });

  return (
    <AppPage
      eyebrow="Training"
      title="Training"
      description="Start from Today when a session is assigned. Recent completed workouts stay listed here."
    >
      <div className="space-y-6">
        <EmptyState
          title="No workout in progress"
          description="Open Today to start your assigned session. This page resumes an active workout when one exists."
          action={<ButtonLink href="/app/today">Go to Today</ButtonLink>}
        />

        {recent.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-display text-xl text-[var(--color-foreground)]">
              Recent sessions
            </h2>
            <ul className="space-y-2">
              {recent.map((row) => (
                <li key={row.id}>
                  <ButtonLink
                    href={`/app/training/${row.id}`}
                    variant="secondary"
                    className="min-h-12 w-full justify-between"
                  >
                    <span>
                      {row.workoutNameSnapshot ?? "Session"} · {row.status}
                    </span>
                    <span className="text-[var(--color-subtle)]">
                      {row.completedAt
                        ? row.completedAt.toLocaleDateString()
                        : ""}
                    </span>
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AppPage>
  );
}
