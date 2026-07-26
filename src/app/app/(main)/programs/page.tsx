import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AdaptationsPanel } from "@/components/adaptive/AdaptationsPanel";
import { ButtonLink, EmptyState } from "@/design-system";
import { prisma } from "@/lib/db";
import { requireSession } from "@/services/auth/session";
import { listAdaptationsForUser } from "@/services/adaptive/adaptation-service";
import { normalizeMassUnit } from "@/services/units/convert";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Programs",
  robots: { index: false, follow: false },
};

export default async function ProgramsPage() {
  const session = await requireSession();
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      programs: {
        where: { kind: "athlete" },
        orderBy: { updatedAt: "desc" },
        take: 8,
      },
    },
  });

  if (!profile) {
    return (
      <AppPage
        eyebrow="Programming"
        title="Programs"
        description="Assigned programs and adaptive suggestions."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding to assign programs and review adaptations."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const adaptations = await listAdaptationsForUser(session.user.id);
  const pendingCount = adaptations.filter((a) => a.status === "pending").length;
  const units = normalizeMassUnit(profile.units);

  return (
    <AppPage
      eyebrow="Programming"
      title="Programs"
      description="Your assigned programs stay under your control. Adaptive suggestions never auto-apply."
      actions={
        <div className="flex flex-wrap gap-2">
          {featureFlags.programBuilder ? (
            <ButtonLink href="/app/program-builder" variant="secondary" size="lg">
              Program Builder 2.0
            </ButtonLink>
          ) : null}
          <ButtonLink href="/app/adaptations" variant="secondary" size="lg">
            All adaptations
            {pendingCount > 0 ? ` (${pendingCount})` : ""}
          </ButtonLink>
        </div>
      }
    >
      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-foreground)]">
            Assigned
          </h2>
          {profile.programs.length === 0 ? (
            <EmptyState
              title="No athlete programs yet"
              description="Assign a program template to your profile to train from Today and unlock adaptations."
            />
          ) : (
            <ul className="space-y-2">
              {profile.programs.map((program) => (
                <li
                  key={program.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] py-3 first:border-t-0"
                >
                  <div>
                    <p className="font-medium text-[var(--color-foreground)]">
                      {program.name}
                    </p>
                    <p className="text-sm text-[var(--color-subtle)]">
                      {program.status} · athlete copy
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                  <ButtonLink
                    href={`/app/program-review?programId=${encodeURIComponent(program.id)}`}
                    variant="secondary"
                    size="md"
                  >
                    AI review
                  </ButtonLink>
                  {featureFlags.programVersionControl ? (
                    <ButtonLink
                      href={`/app/programs/${program.id}/versions`}
                      variant="secondary"
                      size="md"
                    >
                      Versions
                    </ButtonLink>
                  ) : null}
                  <ButtonLink
                    href={`/app/programs/${program.id}`}
                    variant="secondary"
                    size="md"
                  >
                    Open
                  </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--color-foreground)]">
            Adaptive suggestions
          </h2>
          <AdaptationsPanel
            items={adaptations.filter(
              (a) => a.status === "pending" || a.status === "accepted" || a.status === "modified" || a.status === "declined",
            ).slice(0, 8)}
            units={units}
          />
        </section>
      </div>
    </AppPage>
  );
}
